'use strict';

const assert = require('assert');
const { draftsForDeletion } = require('../lib/draft-targets');

const first = { id: 'first' };
const second = { id: 'second' };

assert.deepStrictEqual(
  draftsForDeletion({ selected: [first, second], focused: { id: 'focused' } }),
  [first, second],
  'explicit multi-selection takes precedence'
);

assert.deepStrictEqual(
  draftsForDeletion({ focused: first, keyboardCursor: second }),
  [first],
  'the clicked draft is used when there is no selection'
);

assert.deepStrictEqual(
  draftsForDeletion({ keyboardCursor: second }),
  [second],
  'the keyboard cursor is the final fallback'
);

assert.deepStrictEqual(draftsForDeletion({}), [], 'no focus produces no deletion target');

console.log('draft-targets tests passed');
