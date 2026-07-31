'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const mainSource = fs.readFileSync(path.join(__dirname, '..', 'lib', 'main.js'), 'utf8');

assert.doesNotMatch(mainSource, /draft\.plaintext/);
assert.match(mainSource, /className: 'btn btn-toolbar ai-writing-button'/);
assert.match(mainSource, /'aria-label': 'AI Writing'/);

console.log('composer button tests passed');
