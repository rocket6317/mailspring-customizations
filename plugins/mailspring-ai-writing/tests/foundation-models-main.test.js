'use strict';

const assert = require('node:assert/strict');
const { normalizeOutput } = require('../lib/foundation-models-main');

assert.equal(
  normalizeOutput('```\nEVENTUAL_RESULT:\nHe went to work yesterday.\n```'),
  'He went to work yesterday.'
);

assert.equal(
  normalizeOutput('EVENTUAL_RESPONSE:\nHello, my name is Arda.'),
  'Hello, my name is Arda.'
);

assert.equal(
  normalizeOutput('--- TRANSFORMED EMAIL TEXT ---\nCorrected text\n--- END EMAIL TEXT ---'),
  'Corrected text'
);

console.log('foundation-models-main tests passed');
