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
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  let focusState: FocusState = 'unfocused';

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
          ? 'Editor Focus Timer is counting focused source-editor time.'
          : 'Editor Focus Timer is paused.';
    status.show();
  }, sampleIntervalMs);

  context.subscriptions.push(
    status,
    probe,
    new vscode.Disposable(() => clearInterval(interval)),
  );
}

export function deactivate(): void {}