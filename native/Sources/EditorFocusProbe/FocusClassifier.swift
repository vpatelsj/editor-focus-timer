import Foundation

struct AccessibilitySnapshot {
    let role: String
    let labels: [String]
}

enum FocusClassifier {
    private static let editorMarkers = [
        "editor content",
        ", editor,",
        "the editor is not accessible at this time",
    ]
    private static let sourceFilename = try! NSRegularExpression(
        pattern: #"^[^/\n]+\.[A-Za-z0-9][A-Za-z0-9.+_-]*$"#
    )
    private static let excludedMarkers = [
        "chat", "terminal", "search", "settings", "notebook", "panel", "sidebar",
    ]

    static func isSourceEditor(_ snapshot: AccessibilitySnapshot) -> Bool {
        guard snapshot.role == "AXTextArea" else { return false }

        let text = snapshot.labels.joined(separator: " ").lowercased()
        guard !excludedMarkers.contains(where: text.contains) else { return false }
        return editorMarkers.contains(where: text.contains) || snapshot.labels.contains(where: isSourceFilename)
    }

    private static func isSourceFilename(_ label: String) -> Bool {
        let range = NSRange(label.startIndex..., in: label)
        return sourceFilename.firstMatch(in: label, range: range) != nil
    }
}
