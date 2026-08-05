'use strict';

const DEFAULT_THRESHOLD = 120;
const DEFAULT_COOLDOWN = 2000;
const DEFAULT_GESTURE_END_DELAY = 220;
const MAX_EVENT_DISTANCE = 40;

function findThreadListViewport(target) {
  const element = target && target.nodeType === 3 ? target.parentElement : target;
  if (!element || typeof element.closest !== 'function') return null;

  const threadList = element.closest('.thread-list');
  return threadList ? threadList.querySelector('.scroll-region-content') : null;
}

function pullDistance(event, viewport) {
  const distance = Math.max(0, -Number(event.deltaY || 0));
  if (event.deltaMode === 1) return distance * 16;
  if (event.deltaMode === 2) return distance * Math.max(1, viewport.clientHeight || 1);
  return distance;
}

function createPullToSync({
  root,
  sync,
  threshold = DEFAULT_THRESHOLD,
  cooldown = DEFAULT_COOLDOWN,
  gestureEndDelay = DEFAULT_GESTURE_END_DELAY,
  findViewport = findThreadListViewport,
  onPull = () => {},
  onReset = () => {},
  onSync = () => {},
  canSync = () => true,
  now = Date.now,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  if (!root || typeof root.addEventListener !== 'function' || typeof sync !== 'function') {
    return null;
  }

  let gesture = null;
  let resetTimer = null;
  let lastSyncAt = -Infinity;

  const clearGesture = () => {
    gesture = null;
    if (resetTimer !== null) clearTimer(resetTimer);
    resetTimer = null;
  };

  const endGesture = (syncIfReady = true) => {
    const finishedGesture = gesture;
    clearGesture();

    if (syncIfReady && finishedGesture && finishedGesture.ready && canSync()) {
      lastSyncAt = now();
      sync();
      onSync({ viewport: finishedGesture.viewport });
      return;
    }

    if (finishedGesture) onReset({ viewport: finishedGesture.viewport });
  };

  const scheduleGestureEnd = () => {
    if (resetTimer !== null) clearTimer(resetTimer);
    resetTimer = setTimer(endGesture, gestureEndDelay);
  };

  const onWheel = event => {
    const viewport = findViewport(event.target);
    if (!viewport) {
      endGesture();
      return;
    }

    if (!gesture) {
      gesture = {
        startedAtTop: viewport.scrollTop <= 1,
        distance: 0,
        ready: false,
        viewport,
      };
    }
    scheduleGestureEnd();

    if (!gesture.startedAtTop || viewport.scrollTop > 1) return;
    if (event.deltaY >= 0) {
      endGesture(false);
      return;
    }

    gesture.distance += Math.min(MAX_EVENT_DISTANCE, pullDistance(event, viewport));
    const available = canSync();
    gesture.ready =
      gesture.distance >= threshold && now() - lastSyncAt >= cooldown && available;
    onPull({
      viewport,
      distance: gesture.distance,
      progress: Math.min(1, gesture.distance / threshold),
      ready: gesture.ready,
      available,
    });
  };

  root.addEventListener('wheel', onWheel, { capture: true, passive: true });

  return {
    deactivate() {
      root.removeEventListener('wheel', onWheel, true);
      endGesture(false);
    },
    onWheel,
  };
}

module.exports = {
  createPullToSync,
  findThreadListViewport,
  pullDistance,
};
