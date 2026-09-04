# Context-Key Focus Probe Design

## Problem

With `editor.accessibilitySupport` set to `off`, VS Code can keep returning the source editor as `AXFocusedUIElement` while keyboard input is actually in Chat. The stale element also reports `AXFocused = true`, and the macOS system-wide focused-element query returns `AXError.attributeUnsupported`. The native Accessibility classifier therefore cannot reliably distinguish source-editor focus from every VS Code input surface without enabling Screen Reader Optimized mode.

## Goal

Count time only while a saved local source editor has keyboard focus, pause in Chat and other VS Code surfaces, and keep Screen Reader Optimized mode off.

## Architecture

The native helper remains responsible for macOS Accessibility permission and detecting whether VS Code is the frontmost application. While trusted and VS Code is frontmost, it posts the reserved chord `cmd+ctrl+shift+alt+f20` every 250 milliseconds.

The extension contributes two mutually exclusive keybindings for that chord:

- `editorFocusTimer.focusProbeFocused` when `editorTextFocus` is true.
- `editorFocusTimer.focusProbeUnfocused` when `editorTextFocus` is false.

The extension registers both internal commands. Their handlers update the current focus state. Existing gates for VS Code window focus and saved local source-document eligibility remain in place.

The chord contains all four modifiers plus F20 to minimize collision risk. It inserts no text, and one of the two keybindings consumes it whenever the extension is enabled.

## Native Helper

Remove AX focused-element lookup, snapshots, and label classification. The helper loop becomes:

1. If Accessibility permission is absent, emit `permission-required` once per state transition.
2. If permission is present and VS Code is frontmost, post key-down and key-up events for the reserved chord.
3. Sleep for 250 milliseconds and repeat.

The helper continues to fail paused if it exits or cannot launch. Permission output remains compatible with the existing line protocol.

## Extension

Register the two internal probe commands before starting the helper. Each command updates `focusState` to `focused` or `unfocused`. Native `permission-required` output still overrides that state. The reset command and status item behavior remain unchanged.

The internal probe commands are not contributed to the Command Palette. Only their keybindings are declared in `package.json`.

## Failure Behavior

- Missing macOS Accessibility permission: paused with the existing permission tooltip.
- Helper launch or process failure: paused; existing restart behavior remains.
- VS Code not frontmost: paused by `vscode.window.state.focused` even if the last probe state was focused.
- Probe chord not dispatched: state remains at its previous value, but leaving VS Code still pauses through the window-focus gate.

## Validation

- Test the pure native decision for permission-required, idle, and probe actions.
- Test that both internal command IDs and mutually exclusive `editorTextFocus` keybindings are declared.
- Run all TypeScript and Swift tests.
- Package and install the VSIX.
- With Screen Reader Optimized mode off, verify the timer advances in `crawler.go`, pauses while typing in Chat, and resumes after returning to `crawler.go`.
