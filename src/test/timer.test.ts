import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatElapsed, SessionTimer } from '../timer.js';

describe('SessionTimer', () => {
  it('counts only intervals whose preceding sample was countable', () => {
    const timer = new SessionTimer();

    timer.sample(1_000, true);
    timer.sample(1_250, true);
    timer.sample(1_500, false);
    timer.sample(2_000, false);

    assert.equal(timer.elapsedMs, 500);
    assert.equal(timer.isCounting, false);
  });

  it('resumes without counting the paused gap', () => {
    const timer = new SessionTimer();

    timer.sample(0, true);
    timer.sample(250, false);
    timer.sample(2_000, true);
    timer.sample(2_500, true);

    assert.equal(timer.elapsedMs, 750);
  });

  it('ignores backward clock movement', () => {
    const timer = new SessionTimer();

    timer.sample(1_000, true);
    timer.sample(900, true);
    timer.sample(1_100, true);

    assert.equal(timer.elapsedMs, 200);
  });
});

describe('formatElapsed', () => {
  it('formats elapsed milliseconds as HH:MM:SS', () => {
    assert.equal(formatElapsed(0), '00:00:00');
    assert.equal(formatElapsed(3_661_999), '01:01:01');
    assert.equal(formatElapsed(360_000_000), '100:00:00');
  });
});
