import Testing
@testable import EditorFocusProbe

@Suite("Focus classifier")
struct FocusClassifierTests {
    @Test("accepts Monaco editor text areas")
    func acceptsMonacoEditorTextAreas() {
        #expect(FocusClassifier.isSourceEditor(.init(
            role: "AXTextArea",
            labels: ["crawler.go, editor, group 1"]
        )))
        #expect(FocusClassifier.isSourceEditor(.init(
            role: "AXTextArea",
            labels: ["editor content"]
        )))
    }

    @Test("rejects non-editor VS Code surfaces")
    func rejectsNonEditorVSCodeSurfaces() {
        for label in ["Chat Input", "Terminal 1", "Search", "Settings", "Notebook Cell"] {
            #expect(!FocusClassifier.isSourceEditor(.init(
                role: "AXTextArea",
                labels: [label]
            )))
        }
    }

    @Test("rejects text fields and unidentified text areas")
    func rejectsTextFieldsAndUnidentifiedTextAreas() {
        #expect(!FocusClassifier.isSourceEditor(.init(
            role: "AXTextField",
            labels: ["crawler.go, editor, group 1"]
        )))
        #expect(!FocusClassifier.isSourceEditor(.init(
            role: "AXTextArea",
            labels: ["text area"]
        )))
    }
}
