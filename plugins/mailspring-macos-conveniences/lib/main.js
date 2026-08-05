'use strict';

const path = require('path');
const { createPullToSync } = require('./pull-to-sync');
const { createTrayBehavior } = require('./tray-behavior');

let trayBehavior = null;
let pullToSync = null;

function syncMailNow() {
  if (AppEnv.mailsyncBridge && AppEnv.mailsyncBridge.sendSyncMailNow) {
    AppEnv.mailsyncBridge.sendSyncMailNow();
    return;
  }

  AppEnv.commands.dispatch(document.body, 'window:sync-mail-now');
}

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
  pullToSync = createPullToSync({ root: document, sync: syncMailNow });
}

function deactivate() {
  if (trayBehavior) trayBehavior.deactivate();
  if (pullToSync) pullToSync.deactivate();
  trayBehavior = null;
  pullToSync = null;
}

module.exports = { activate, deactivate };
