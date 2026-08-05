'use strict';

const DEFAULT_SETTLE_DELAY = 10000;

function createSyncReadiness({
  syncStore,
  settleDelay = DEFAULT_SETTLE_DELAY,
  now = Date.now,
}) {
  if (!syncStore || typeof syncStore.isSyncing !== 'function') {
    return { isReady: () => true, deactivate: () => {} };
  }

  let wasSyncing = Boolean(syncStore.isSyncing());
  let readyAt = wasSyncing ? Infinity : now() + settleDelay;

  const onStoreChange = () => {
    const syncing = Boolean(syncStore.isSyncing());
    if (syncing) {
      wasSyncing = true;
      readyAt = Infinity;
    } else if (wasSyncing) {
      wasSyncing = false;
      readyAt = now() + settleDelay;
    }
  };

  const unsubscribe =
    typeof syncStore.listen === 'function' ? syncStore.listen(onStoreChange) : null;

  return {
    isReady() {
      return !syncStore.isSyncing() && now() >= readyAt;
    },
    deactivate() {
      if (typeof unsubscribe === 'function') unsubscribe();
    },
  };
}

module.exports = { createSyncReadiness };
