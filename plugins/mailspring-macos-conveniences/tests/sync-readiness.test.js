'use strict';

const assert = require('assert');
const { createSyncReadiness } = require('../lib/sync-readiness');

let time = 1000;
let syncing = true;
let listener = null;
let unsubscribed = false;
const store = {
  isSyncing: () => syncing,
  listen(callback) {
    listener = callback;
    return () => {
      unsubscribed = true;
    };
  },
};

const readiness = createSyncReadiness({
  syncStore: store,
  settleDelay: 10000,
  now: () => time,
});

assert.strictEqual(readiness.isReady(), false, 'startup sync blocks manual sync');
syncing = false;
listener();
time += 9999;
assert.strictEqual(readiness.isReady(), false, 'settling period remains blocked');
time += 1;
assert.strictEqual(readiness.isReady(), true, 'manual sync becomes available after settling');

syncing = true;
listener();
assert.strictEqual(readiness.isReady(), false, 'a later active sync blocks immediately');
syncing = false;
listener();
time += 10000;
assert.strictEqual(readiness.isReady(), true, 'later sync receives the same settling period');

readiness.deactivate();
assert.strictEqual(unsubscribed, true);

console.log('sync readiness tests passed');
