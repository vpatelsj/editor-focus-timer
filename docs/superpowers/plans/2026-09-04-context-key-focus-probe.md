# Context-Key Focus Probe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stale macOS AX element classification with an exact VS Code `editorTextFocus` probe while Screen Reader Optimized mode remains off.

**Architecture:** The native helper posts a reserved `cmd+ctrl+shift+alt+f20` chord while VS Code is frontmost. Two mutually exclusive VS Code keybindings route that chord to internal extension commands that set focused or unfocused state.

**Tech Stack:** Swift 5.9/AppKit/ApplicationServices/CoreGraphics, TypeScript 6, VS Code Extension API, Swift Testing, Node test runner.

## Global Constraints

- Keep `editor.accessibilitySupport` set to `off`.
- Preserve Accessibility permission reporting and fail-paused process behavior.
- Preserve saved-local-source, window-focus, and reset behavior.
- Do not expose internal probe commands in the Command Palette.

---

### Task 1: Native Probe Decision

**Files:**
- Create: `native/Sources/EditorFocusProbe/ProbeAction.swift`
- Delete: `native/Sources/EditorFocusProbe/FocusClassifier.swift`
- Create: `native/Tests/EditorFocusProbeTests/ProbeActionTests.swift`
- Delete: `native/Tests/EditorFocusProbeTests/FocusClassifierTests.swift`

**Interfaces:**
- Produces: `probeAction(isTrusted:frontmostBundleIdentifier:) -> ProbeAction`

- [ ] Write tests asserting untrusted maps to `permissionRequired`, trusted VS Code maps to `sendChord`, and trusted non-VS-Code maps to `idle`.
- [ ] Run `swift test --package-path native` and verify failure because `ProbeAction` is absent.
- [ ] Add `ProbeAction` and `probeAction` with only those three branches.
- [ ] Run `swift test --package-path native` and verify all native tests pass.

### Task 2: Native Chord Posting

**Files:**
- Modify: `native/Sources/EditorFocusProbe/main.swift`

**Interfaces:**
- Consumes: `ProbeAction`
- Produces: HID key-down/key-up events for key code `0x5A` with command, control, option, and shift flags.

- [ ] Remove AX element lookup, snapshot extraction, and classifier calls.
- [ ] Add `postFocusProbe()` using `CGEvent` and `.cghidEventTap`.
- [ ] Drive the loop from `probeAction`: emit `permission-required`, emit `unfocused` while idle, or post the chord.
- [ ] Run `swift test --package-path native` and `swift build -c release --package-path native`.

### Task 3: VS Code Context Routing

**Files:**
- Create: `src/test/manifest.test.ts`
- Modify: `package.json`
- Modify: `src/extension.ts`

**Interfaces:**
- Produces: internal commands `editorFocusTimer.focusProbeFocused` and `editorFocusTimer.focusProbeUnfocused`.

- [ ] Add a manifest test asserting the reserved chord has two keybindings with `editorTextFocus` and `!editorTextFocus` conditions.
- [ ] Run `npm run compile && node --test --test-name-pattern='focus probe keybindings' out/test/manifest.test.js` and verify failure.
- [ ] Add the two keybindings to `package.json`.
- [ ] Register both commands in `activate`, updating `focusState` to `focused` and `unfocused`, and dispose them through `context.subscriptions`.
- [ ] Run `npm test` and verify all TypeScript and native tests pass.

### Task 4: Install and Live Verification

**Files:**
- Generated/ignored: `editor-focus-timer-0.0.1.vsix`, `dist/`, `out/`

- [ ] Package with `npx --yes vsce package --allow-missing-repository --out editor-focus-timer-0.0.1.vsix`.
- [ ] Install with `code --install-extension editor-focus-timer-0.0.1.vsix --force`.
- [ ] Reload the VS Code window so keybindings and commands register.
- [ ] Verify timer advances in `crawler.go`, pauses during a live Chat typing sample, and resumes in `crawler.go`.
- [ ] Commit and push the implementation after live verification.
