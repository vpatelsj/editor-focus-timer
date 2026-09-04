# Timer Reset Design

## Goal

Allow the user to reset the current editor-focus session without reloading VS Code.

## Behavior

- Clicking the status-bar timer immediately resets elapsed time to `00:00:00`.
- Resetting while the editor is focused keeps the timer eligible to continue counting.
- The interval before the reset is discarded so no pre-reset time is added afterward.
- The same action is available as `Editor Focus Timer: Reset` in the Command Palette.
- The status tooltip identifies the timer as clickable for reset.

## Implementation

Add a `reset()` operation to `SessionTimer` that clears accumulated time and its previous sample while retaining the current counting state. Register an extension command, attach it to the status-bar item's `command`, and invoke `reset()` from the command handler.

Declare the command in `package.json` so it appears in the Command Palette.

## Validation

- Unit test that reset clears accumulated elapsed time.
- Unit test that reset excludes the pre-reset interval and counting resumes on subsequent samples.
- Run lint, TypeScript tests, native tests, package the VSIX, install it, and restart the extension helper if needed.
