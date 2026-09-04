import AppKit
import ApplicationServices
import Foundation

enum ProbeState: String {
    case focused
    case unfocused
    case permissionRequired = "permission-required"
}

func stringAttribute(_ name: CFString, from element: AXUIElement) -> String? {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, name, &value) == .success else {
        return nil
    }
    return value as? String
}

func focusedElement(for application: NSRunningApplication) -> AXUIElement? {
    let appElement = AXUIElementCreateApplication(application.processIdentifier)
    _ = AXUIElementSetAttributeValue(
        appElement,
        "AXManualAccessibility" as CFString,
        kCFBooleanTrue
    )
    var value: CFTypeRef?
    if AXUIElementCopyAttributeValue(
        appElement,
        kAXFocusedUIElementAttribute as CFString,
        &value
    ) == .success, let value {
        return (value as! AXUIElement)
    }

    let systemElement = AXUIElementCreateSystemWide()
    guard AXUIElementCopyAttributeValue(
        systemElement,
        kAXFocusedUIElementAttribute as CFString,
        &value
    ) == .success, let value else {
        return nil
    }
    return (value as! AXUIElement)
}

func snapshot(of element: AXUIElement) -> AccessibilitySnapshot {
    let attributes: [CFString] = [
        kAXTitleAttribute as CFString,
        kAXDescriptionAttribute as CFString,
        kAXHelpAttribute as CFString,
        "AXDOMIdentifier" as CFString,
        "AXIdentifier" as CFString,
    ]
    return AccessibilitySnapshot(
        role: stringAttribute(kAXRoleAttribute as CFString, from: element) ?? "",
        labels: attributes.compactMap { stringAttribute($0, from: element) }
    )
}

func currentState() -> ProbeState {
    guard let application = NSWorkspace.shared.frontmostApplication,
          application.bundleIdentifier == "com.microsoft.VSCode",
          let element = focusedElement(for: application)
    else {
        return .unfocused
    }

    let currentSnapshot = snapshot(of: element)
    return FocusClassifier.isSourceEditor(currentSnapshot) ? .focused : .unfocused
}

func emit(_ state: ProbeState, previous: inout ProbeState?) {
    guard state != previous else { return }
    print(state.rawValue)
    fflush(stdout)
    previous = state
}

let prompt = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
_ = AXIsProcessTrustedWithOptions(prompt)

var previousState: ProbeState?
while true {
    if AXIsProcessTrusted() {
        emit(currentState(), previous: &previousState)
        Thread.sleep(forTimeInterval: 0.25)
    } else {
        emit(.permissionRequired, previous: &previousState)
        Thread.sleep(forTimeInterval: 1.0)
    }
}
