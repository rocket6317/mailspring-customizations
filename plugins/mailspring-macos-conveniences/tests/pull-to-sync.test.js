'use strict';

const assert = require('assert');
const { createPullToSync, pullDistance } = require('../lib/pull-to-sync');

function makeHarness({ canSync = () => true } = {}) {
  const listeners = new Map();
  const timers = new Map();
  let nextTimer = 1;
  let syncCount = 0;
  const pullStates = [];
  let resetCount = 0;
  let syncingCount = 0;
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
    onPull: state => pullStates.push(state),
    onReset: () => {
      resetCount += 1;
    },
    onSync: () => {
      syncingCount += 1;
    },
    canSync,
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
    pullStates,
    resetCount: () => resetCount,
    syncingCount: () => syncingCount,
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
  let available = false;
  const harness = makeHarness({ canSync: () => available });
  harness.wheel(-40);
  harness.wheel(-40);
  harness.wheel(-40);
  assert.strictEqual(harness.pullStates.at(-1).available, false);
  harness.endGesture();
  assert.strictEqual(harness.syncCount(), 0, 'an active sync blocks pull-to-sync');

  available = true;
  harness.wheel(-40);
  harness.wheel(-40);
  harness.wheel(-40);
  available = false;
  harness.endGesture();
  assert.strictEqual(harness.syncCount(), 0, 'readiness is checked again on release');
}

{
  const harness = makeHarness();
  harness.wheel(-40);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 0);
  harness.wheel(-40);
  assert.strictEqual(harness.syncCount(), 0, 'sync waits for release');
  assert.strictEqual(harness.pullStates.at(-1).ready, true);
  harness.endGesture();
  assert.strictEqual(harness.syncCount(), 1);
  assert.strictEqual(harness.syncingCount(), 1);
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
  harness.endGesture();
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
  harness.endGesture();
  assert.strictEqual(harness.syncCount(), 2, 'a later pull must sync again');
}

{
  const harness = makeHarness();
  harness.wheel(-40);
  harness.wheel(10);
  assert.strictEqual(harness.syncCount(), 0);
  assert.strictEqual(harness.resetCount(), 1, 'reversing the pull cancels the gesture');
}

assert.strictEqual(pullDistance({ deltaY: -3, deltaMode: 1 }, {}), 48);
assert.strictEqual(pullDistance({ deltaY: -1, deltaMode: 2 }, { clientHeight: 500 }), 500);

console.log('pull-to-sync tests passed');
