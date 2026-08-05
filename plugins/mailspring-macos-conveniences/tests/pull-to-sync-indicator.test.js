'use strict';

const assert = require('assert');
const { createPullToSyncIndicator } = require('../lib/pull-to-sync-indicator');

function makeElement() {
  const classes = new Set();
  const styles = new Map();
  return {
    children: [],
    className: '',
    parent: null,
    textContent: '',
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
    },
    style: {
      setProperty: (name, value) => styles.set(name, value),
      removeProperty: name => styles.delete(name),
      getPropertyValue: name => styles.get(name) || '',
      set left(value) {
        styles.set('left', value);
      },
      set top(value) {
        styles.set('top', value);
      },
      set width(value) {
        styles.set('width', value);
      },
    },
    appendChild(child) {
      child.parent = this;
      this.children.push(child);
    },
    remove() {
      if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
    },
  };
}

const body = makeElement();
const listeners = new Map();
const timers = new Map();
let nextTimer = 1;
const root = {
  body,
  createElement: makeElement,
  defaultView: {
    addEventListener: (event, listener) => listeners.set(event, listener),
    removeEventListener: (event, listener) => {
      if (listeners.get(event) === listener) listeners.delete(event);
    },
  },
};
const list = makeElement();
list.getBoundingClientRect = () => ({ left: 380, top: 80, width: 500 });
const viewport = { closest: selector => (selector === '.thread-list' ? list : null) };

const indicator = createPullToSyncIndicator({
  root,
  setTimer: callback => {
    const id = nextTimer++;
    timers.set(id, callback);
    return id;
  },
  clearTimer: id => timers.delete(id),
});
const host = body.children[0];
const label = host.children[0].children[1];

indicator.onPull({ viewport, progress: 0.5, ready: false });
assert.strictEqual(label.textContent, 'Pull to sync');
assert.strictEqual(list.style.getPropertyValue('--pull-to-sync-offset'), '22px');
assert.strictEqual(host.style.getPropertyValue('--pull-to-sync-rotation'), '120deg');

indicator.onPull({ viewport, progress: 1, ready: true });
assert.strictEqual(label.textContent, 'Release to sync');
assert.match(host.className, /is-ready-true/);

indicator.onSync({ viewport });
assert.strictEqual(label.textContent, 'Syncing…');
assert.match(host.className, /is-syncing/);

indicator.deactivate();
assert.strictEqual(body.children.length, 0);
assert.strictEqual(list.classList.contains('pull-to-sync-list'), false);
assert.strictEqual(listeners.size, 0);

console.log('pull-to-sync indicator tests passed');
