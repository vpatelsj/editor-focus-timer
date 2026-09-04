import Testing
@testable import EditorFocusProbe

@Suite("Probe action")
struct ProbeActionTests {
    @Test("requires permission when accessibility is untrusted")
    func requiresPermission() {
        #expect(probeAction(
            isTrusted: false,
            frontmostBundleIdentifier: "com.microsoft.VSCode"
        ) == .permissionRequired)
    }

    @Test("sends the reserved chord only while VS Code is frontmost")
    func probesOnlyFrontmostVSCode() {
        #expect(probeAction(
            isTrusted: true,
            frontmostBundleIdentifier: "com.microsoft.VSCode"
        ) == .sendChord)
        #expect(probeAction(
            isTrusted: true,
            frontmostBundleIdentifier: "com.apple.Terminal"
        ) == .idle)
        #expect(probeAction(
            isTrusted: true,
            frontmostBundleIdentifier: nil
        ) == .idle)
    }
}