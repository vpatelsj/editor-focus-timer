import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseFocusState } from '../helperProtocol.js';

describe('parseFocusState', () => {
  it('parses every protocol state with surrounding whitespace', () => {
    assert.equal(parseFocusState(' focused\n'), 'focused');
    assert.equal(parseFocusState('unfocused\r\n'), 'unfocused');
    assert.equal(parseFocusState('permission-required'), 'permission-required');
  });

  it('rejects malformed or empty output', () => {
    assert.equal(parseFocusState(''), undefined);
    assert.equal(parseFocusState('editor'), undefined);
    assert.equal(parseFocusState('{"focused":true}'), undefined);
  });
});
