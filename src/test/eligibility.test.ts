import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isEligibleDocument } from '../eligibility.js';

const source = {
  documentScheme: 'file',
  workspaceScheme: 'file',
  languageId: 'go',
  isUntitled: false,
};

describe('isEligibleDocument', () => {
  it('accepts a saved local source file in a local workspace', () => {
    assert.equal(isEligibleDocument(source), true);
  });

  for (const languageId of ['markdown', 'plaintext', 'log', 'search-result']) {
    it(`rejects ${languageId}`, () => {
      assert.equal(isEligibleDocument({ ...source, languageId }), false);
    });
  }

  it('rejects untitled, remote, external, and notebook documents', () => {
    assert.equal(isEligibleDocument({ ...source, isUntitled: true }), false);
    assert.equal(
      isEligibleDocument({ ...source, documentScheme: 'vscode-remote' }),
      false,
    );
    assert.equal(
      isEligibleDocument({ ...source, workspaceScheme: undefined }),
      false,
    );
    assert.equal(
      isEligibleDocument({ ...source, documentScheme: 'vscode-notebook-cell' }),
      false,
    );
  });

  it('rejects a missing active document', () => {
    assert.equal(isEligibleDocument(undefined), false);
  });
});
