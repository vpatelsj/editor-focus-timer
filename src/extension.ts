import * as path from 'node:path';
import * as vscode from 'vscode';
import { type DocumentSnapshot, isEligibleDocument } from './eligibility.js';
import { FocusProbe } from './focusProbe.js';
import type { FocusState } from './helperProtocol.js';
import { formatElapsed, SessionTimer } from './timer.js';

const sampleIntervalMs = 250;

function activeDocumentSnapshot(): DocumentSnapshot | undefined {
  const document = vscode.window.activeTextEditor?.document;
  if (!document) {
    return undefined;
  }

  return {
    documentScheme: document.uri.scheme,
    workspaceScheme: vscode.workspace.getWorkspaceFolder(document.uri)?.uri.scheme,
    languageId: document.languageId,
    isUntitled: document.isUntitled,
  };
}

export function activate(context: vscode.ExtensionContext): void {
  const timer = new SessionTimer();
  let focusState: FocusState = 'unfocused';
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  const resetCommand = vscode.commands.registerCommand(
    'editorFocusTimer.reset',
    () => timer.reset(),
  );
  const focusedCommand = vscode.commands.registerCommand(
    'editorFocusTimer.focusProbeFocused',
    () => {
      focusState = 'focused';
    },
  );
  const unfocusedCommand = vscode.commands.registerCommand(
    'editorFocusTimer.focusProbeUnfocused',
    () => {
      focusState = 'unfocused';
    },
  );
  status.command = 'editorFocusTimer.reset';

  const probe = new FocusProbe(
    path.join(context.extensionPath, 'dist', 'native', 'editor-focus-probe'),
  );
  probe.start((state) => {
    focusState = state;
  });

  const interval = setInterval(() => {
    const shouldCount =
      focusState === 'focused' &&
      vscode.window.state.focused &&
      isEligibleDocument(activeDocumentSnapshot());

    timer.sample(performance.now(), shouldCount);
    status.text = `$(clock) ${formatElapsed(timer.elapsedMs)}`;
    status.tooltip =
      focusState === 'permission-required'
        ? 'Editor Focus Timer is paused: grant Accessibility permission in System Settings.'
        : timer.isCounting
          ? 'Editor Focus Timer is counting focused source-editor time. Click to reset.'
          : 'Editor Focus Timer is paused. Click to reset.';
    status.show();
  }, sampleIntervalMs);

  context.subscriptions.push(
    status,
    resetCommand,
    focusedCommand,
    unfocusedCommand,
    probe,
    new vscode.Disposable(() => clearInterval(interval)),
  );
}

export function deactivate(): void {}