'use strict';

const { execFile } = require('child_process');

const FM_PATH = '/usr/bin/fm';
const MAX_INPUT_LENGTH = 20000;
const TIMEOUT_MS = 60000;
const RESPONSE_ENVELOPE = /^(?:EVENTUAL|FINAL)_(?:RESULT|RESPONSE):[ \t]*(?:\r?\n)?/i;

const ACTIONS = {
  proofread:
    'You proofread email text. Correct only grammar, spelling, and punctuation. Preserve wording, meaning, tone, formatting, greetings, and signatures. Never add new content.',
  rewrite:
    'You rewrite email text for clarity and natural flow. Preserve meaning, formatting, greetings, and signatures. Never add unrelated content.',
  professional:
    'You rewrite email text in a professional, polished tone. Preserve meaning and existing formatting. Do not add a subject, greeting, signature, placeholders, or new information unless already present.',
  friendly:
    'You rewrite email text in a warm, friendly tone. Preserve meaning and existing formatting. Do not add a subject, greeting, signature, placeholders, or new information unless already present.',
  concise:
    'You make email text concise while preserving all important information and existing formatting. Do not add a subject, greeting, signature, placeholders, or new information.',
  reply:
    'You create a clear, natural email reply based on the provided source email. Return only the reply body.',
};

function normalizeOutput(stdout) {
  let output = String(stdout || '').trim();
  const fenced = output.match(/^```(?:text|markdown)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i);

  if (fenced && RESPONSE_ENVELOPE.test(fenced[1].trim())) {
    output = fenced[1].trim();
  }

  return output
    .replace(RESPONSE_ENVELOPE, '')
    .replace(/^--- (?:END )?(?:TRANSFORMED )?(?:EMAIL TEXT|SOURCE EMAIL) ---\s*$/gim, '')
    .trim();
}

function run(action, text) {
  if (!ACTIONS[action]) return Promise.reject(new Error('Unknown AI writing action.'));

  const input = String(text || '').trim();
  if (!input) return Promise.reject(new Error('Select text or write an email first.'));
  if (input.length > MAX_INPUT_LENGTH) {
    return Promise.reject(new Error('The selected text is too long. Please use a shorter selection.'));
  }

  return new Promise((resolve, reject) => {
    const prompt =
      action === 'reply'
        ? `Write a reply to this source email:\n\n--- SOURCE EMAIL ---\n${input}\n--- END SOURCE EMAIL ---`
        : `Transform only this email text according to the instructions:\n\n--- EMAIL TEXT ---\n${input}\n--- END EMAIL TEXT ---`;

    execFile(
      FM_PATH,
      [
        'respond',
        '--model',
        'system',
        '--no-stream',
        '--greedy',
        '--instructions',
        `${ACTIONS[action]} Return only the resulting email text without commentary, labels, or quotation marks.`,
        prompt,
      ],
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          const detail = String(stderr || error.message || '').trim();
          reject(new Error(detail || 'Apple Foundation Models could not generate a response.'));
          return;
        }

        const output = normalizeOutput(stdout);
        if (!output) {
          reject(new Error('Apple Foundation Models returned an empty response.'));
          return;
        }
        if (action !== 'reply' && output.length > Math.max(input.length * 3, input.length + 500)) {
          reject(
            new Error(
              'Apple Intelligence added too much new content. Try selecting a smaller passage or choose Rewrite.'
            )
          );
          return;
        }
        resolve(output);
      }
    );
  });
}

module.exports = { run, normalizeOutput };
