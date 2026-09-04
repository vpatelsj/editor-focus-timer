import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

interface Keybinding {
  command: string;
  key: string;
  when: string;
}

interface ExtensionManifest {
  contributes?: {
    keybindings?: Keybinding[];
  };
}

describe('extension manifest', () => {
  it('routes focus probe keybindings using editorTextFocus', () => {
    const manifest = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as ExtensionManifest;

    assert.deepEqual(manifest.contributes?.keybindings, [
      {
        command: 'editorFocusTimer.focusProbeFocused',
        key: 'cmd+ctrl+shift+alt+f20',
        when: 'editorTextFocus',
      },
      {
        command: 'editorFocusTimer.focusProbeUnfocused',
        key: 'cmd+ctrl+shift+alt+f20',
        when: '!editorTextFocus',
      },
    ]);
  });
});