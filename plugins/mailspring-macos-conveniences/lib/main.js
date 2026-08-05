'use strict';

const path = require('path');
const { createPullToSync } = require('./pull-to-sync');
const { createPullToSyncIndicator } = require('./pull-to-sync-indicator');
const { createSyncReadiness } = require('./sync-readiness');
const { createTrayBehavior } = require('./tray-behavior');

let trayBehavior = null;
let pullToSync = null;
let pullToSyncIndicator = null;
let syncReadiness = null;

function syncMailNow() {
  if (AppEnv.mailsyncBridge && AppEnv.mailsyncBridge.sendSyncMailNow) {
    AppEnv.mailsyncBridge.sendSyncMailNow();
    return;
  }

  AppEnv.commands.dispatch(document.body, 'window:sync-mail-now');
}

function activate() {
  if (process.platform !== 'darwin') return;

  const { FolderSyncProgressStore } = require('mailspring-exports');

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
  syncReadiness = createSyncReadiness({ syncStore: FolderSyncProgressStore });
  pullToSyncIndicator = createPullToSyncIndicator({ root: document });
  pullToSync = createPullToSync({
    root: document,
    sync: syncMailNow,
    canSync: () => syncReadiness.isReady(),
    onPull: pullToSyncIndicator ? pullToSyncIndicator.onPull : undefined,
    onReset: pullToSyncIndicator ? pullToSyncIndicator.onReset : undefined,
    onSync: pullToSyncIndicator ? pullToSyncIndicator.onSync : undefined,
  });
}

function deactivate() {
  if (trayBehavior) trayBehavior.deactivate();
  if (pullToSync) pullToSync.deactivate();
  if (pullToSyncIndicator) pullToSyncIndicator.deactivate();
  if (syncReadiness) syncReadiness.deactivate();
  trayBehavior = null;
  pullToSync = null;
  pullToSyncIndicator = null;
  syncReadiness = null;
}

module.exports = { activate, deactivate };
