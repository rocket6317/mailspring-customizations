'use strict';

const path = require('path');
const { createTrayBehavior } = require('./tray-behavior');

let trayBehavior = null;

function activate() {
  if (process.platform !== 'darwin') return;

  const remotePath = path.join(
    AppEnv.getLoadSettings().resourcePath,
    'node_modules',
    '@electron',
    'remote'
  );
  const remote = require(remotePath);
  const application = remote.getGlobal('application');
  const trayManager = application && application.systemTrayManager;

  trayBehavior = createTrayBehavior({
    platform: process.platform,
    tray: trayManager && trayManager._tray,
    Menu: remote.Menu,
    application,
    showWindow: () => AppEnv.displayWindow(),
  });
}

function deactivate() {
  if (trayBehavior) trayBehavior.deactivate();
  trayBehavior = null;
}

module.exports = { activate, deactivate };
