import Foundation

struct AccessibilitySnapshot {
    let role: String
    let labels: [String]
}

enum FocusClassifier {
    private static let editorMarkers = ["editor content", ", editor,"]
    private static let excludedMarkers = [
        "chat", "terminal", "search", "settings", "notebook", "panel", "sidebar",
    ]

    static func isSourceEditor(_ snapshot: AccessibilitySnapshot) -> Bool {
        guard snapshot.role == "AXTextArea" else { return false }

        let text = snapshot.labels.joined(separator: " ").lowercased()
        guard !excludedMarkers.contains(where: text.contains) else { return false }
        return editorMarkers.contains(where: text.contains)
    }
}
