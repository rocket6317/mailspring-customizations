'use strict';

const fs = require('fs');
const path = require('path');

const WINDOW_BACKGROUND_COLOR = '#141416';

let emailFrameStyles = null;
let previousWindowBackground = null;

function currentWindow() {
  const window = AppEnv.getCurrentWindow();
  return window && !window.isDestroyed() ? window : null;
}

function applyWindowBackground() {
  const window = currentWindow();
  if (!window) return;

  if (typeof window.getBackgroundColor === 'function') {
    previousWindowBackground = window.getBackgroundColor();
  }
  window.setBackgroundColor(WINDOW_BACKGROUND_COLOR);
}

function restoreWindowBackground() {
  const window = currentWindow();
  if (window && previousWindowBackground) {
    window.setBackgroundColor(previousWindowBackground);
  }
  previousWindowBackground = null;
}

module.exports = {
  activate() {
    applyWindowBackground();

    const sourcePath = path.join(__dirname, '..', 'styles', 'email-frame.less');
    const compiledPath = path.join(__dirname, '..', 'styles', 'email-frame.css');
    const content = fs.readFileSync(compiledPath, 'utf8');

    emailFrameStyles = AppEnv.styles.addStyleSheet(content, {
      sourcePath,
      priority: 1,
    });
  },

  deactivate() {
    restoreWindowBackground();

    if (emailFrameStyles) {
      emailFrameStyles.dispose();
      emailFrameStyles = null;
    }
  },

  WINDOW_BACKGROUND_COLOR,
};
