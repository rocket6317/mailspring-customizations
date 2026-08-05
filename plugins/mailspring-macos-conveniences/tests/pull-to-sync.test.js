'use strict';

const assert = require('assert');
const { createPullToSync, pullDistance } = require('../lib/pull-to-sync');

function makeHarness() {
  const listeners = new Map();
  const timers = new Map();
  let nextTimer = 1;
  let syncCount = 0;
  let time = 10000;
  const viewport = { scrollTop: 0, clientHeight: 500 };
  const root = {
    addEventListener(event, listener) {
      listeners.set(event, listener);
    },
    removeEventListener(event, listener) {
      if (listeners.get(event) === listener) listeners.delete(event);
    },
  };

  const behavior = createPullToSync({
    root,
    sync: () => {
      syncCount += 1;
    },
    findViewport: target => (target === 'thread-list' ? viewport : null),
    now: () => time,
    setTimer: callback => {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimer: id => timers.delete(id),
  });

  return {
    behavior,
    listeners,
    viewport,
    syncCount: () => syncCount,
    advance(ms) {
      time += ms;
    },
    endGesture() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks[callbacks.length - 1]();
    },
    wheel(deltaY, target = 'thread-list') {
      listeners.get('wheel')({ deltaY, deltaMode: 0, target });
    },
  };
}

{
  const harness = makeHarness();
  harness.wheel(-40);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 0);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 1);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 1, 'one pull must only sync once');

  harness.behavior.deactivate();
  assert.strictEqual(harness.listeners.size, 0);
}

{
  const harness = makeHarness();
  harness.viewport.scrollTop = 50;
  harness.wheel(-40);
  harness.viewport.scrollTop = 0;
  harness.wheel(-40);
  harness.wheel(-40);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 0, 'reaching the top must not sync mid-gesture');

  harness.endGesture();
  harness.wheel(-40);
  harness.wheel(-40);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 1);
}

{
  const harness = makeHarness();
  harness.wheel(-40);
  harness.wheel(-40);
  harness.wheel(-40);
  harness.endGesture();
  harness.advance(2100);
  harness.wheel(-40);
  harness.wheel(-40);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 2, 'a later pull must sync again');
}

assert.strictEqual(pullDistance({ deltaY: -3, deltaMode: 1 }, {}), 48);
assert.strictEqual(pullDistance({ deltaY: -1, deltaMode: 2 }, { clientHeight: 500 }), 500);

console.log('pull-to-sync tests passed');
