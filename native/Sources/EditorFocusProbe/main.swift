import AppKit
import ApplicationServices
import Foundation

enum ProbeState: String {
    case focused
    case unfocused
    case permissionRequired = "permission-required"
}

func postFocusProbe() {
    guard let keyDown = CGEvent(
        keyboardEventSource: nil,
        virtualKey: 0x5A,
        keyDown: true
    ), let keyUp = CGEvent(
        keyboardEventSource: nil,
        virtualKey: 0x5A,
        keyDown: false
    ) else {
        return
    }

    let flags: CGEventFlags = [
        .maskCommand,
        .maskControl,
        .maskAlternate,
        .maskShift,
    ]
    keyDown.flags = flags
    keyUp.flags = flags
    keyDown.post(tap: .cghidEventTap)
    keyUp.post(tap: .cghidEventTap)
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
    let action = probeAction(
        isTrusted: AXIsProcessTrusted(),
        frontmostBundleIdentifier: NSWorkspace.shared.frontmostApplication?.bundleIdentifier
    )
    switch action {
    case .permissionRequired:
        emit(.permissionRequired, previous: &previousState)
    case .idle:
        emit(.unfocused, previous: &previousState)
    case .sendChord:
        postFocusProbe()
    }
    Thread.sleep(forTimeInterval: action == .permissionRequired ? 1.0 : 0.25)
}
