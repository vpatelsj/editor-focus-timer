# Timer Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the status-bar timer clickable so it immediately resets the current session to `00:00:00` and continues counting focused editor time.

**Architecture:** Add reset semantics to the deterministic `SessionTimer`, then expose them through one registered VS Code command attached to the status item. Declare the command in the extension manifest so it is also available from the Command Palette.

**Tech Stack:** TypeScript 6, VS Code Extension API, Node test runner, Swift native helper unchanged.

## Global Constraints

- Clicking resets immediately without confirmation.
- Reset discards all elapsed and unsampled pre-reset time.
- A focused timer remains eligible to count after reset.
- The existing editor-only focus gates remain unchanged.

---

### Task 1: Session Timer Reset Semantics

**Files:**
- Modify: `src/timer.ts`
- Test: `src/test/timer.test.ts`

**Interfaces:**
- Consumes: existing `SessionTimer.sample(nowMs: number, shouldCount: boolean): void`
- Produces: `SessionTimer.reset(): void`

- [ ] **Step 1: Write the failing reset test**

Add this test inside `describe('SessionTimer')`:

```typescript
it('resets elapsed time and excludes the pre-reset interval', () => {
  const timer = new SessionTimer();

  timer.sample(1_000, true);
  timer.sample(1_500, true);
  timer.reset();

  assert.equal(timer.elapsedMs, 0);
  assert.equal(timer.isCounting, true);

  timer.sample(2_000, true);
  assert.equal(timer.elapsedMs, 0);
  timer.sample(2_250, true);
  assert.equal(timer.elapsedMs, 250);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm run compile && node --test --test-name-pattern='resets elapsed' out/test/timer.test.js`

Expected: compilation fails because `SessionTimer.reset` does not exist.

- [ ] **Step 3: Implement minimal reset behavior**

Add to `SessionTimer`:

```typescript
reset(): void {
  this.totalMs = 0;
  this.previousSampleMs = undefined;
}
```

Do not change `counting`; this preserves whether the current editor state is eligible while preventing the unsampled pre-reset interval from being added.

- [ ] **Step 4: Verify GREEN**

Run: `npm run compile && node --test --test-name-pattern='resets elapsed' out/test/timer.test.js`

Expected: the reset test passes.

---

### Task 2: Clickable Reset Command

**Files:**
- Modify: `src/extension.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `SessionTimer.reset(): void`
- Produces: VS Code command `editorFocusTimer.reset`

- [ ] **Step 1: Declare the Command Palette contribution**

Add to `package.json`:

```json
"contributes": {
  "commands": [
    {
      "command": "editorFocusTimer.reset",
      "title": "Reset",
      "category": "Editor Focus Timer"
    }
  ]
}
```

- [ ] **Step 2: Register and attach the command**

In `activate`, register the command and assign it to the status item:

```typescript
const resetCommand = vscode.commands.registerCommand(
  'editorFocusTimer.reset',
  () => timer.reset(),
);
status.command = 'editorFocusTimer.reset';
```

Add `resetCommand` to `context.subscriptions`.

- [ ] **Step 3: Make click behavior discoverable**

Append ` Click to reset.` to both normal tooltip variants while preserving the Accessibility permission message.

- [ ] **Step 4: Run complete validation**

Run: `npm test`

Expected: lint passes, 14 TypeScript tests pass, and 3 native tests pass.

- [ ] **Step 5: Package and install**

Run: `npx --yes vsce package --allow-missing-repository --out editor-focus-timer-0.0.1.vsix`

Approve the known missing-license prompt, then run:

`code --install-extension editor-focus-timer-0.0.1.vsix --force`

Reload the extension host or VS Code so the new TypeScript command registration is activated. Confirm clicking the timer displays `00:00:00` and counting resumes in a focused source editor.
