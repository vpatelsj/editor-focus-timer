enum ProbeAction {
    case permissionRequired
    case idle
    case sendChord
}

func probeAction(
    isTrusted: Bool,
    frontmostBundleIdentifier: String?
) -> ProbeAction {
    guard isTrusted else { return .permissionRequired }
    guard frontmostBundleIdentifier == "com.microsoft.VSCode" else { return .idle }
    return .sendChord
}