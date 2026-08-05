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

  const endGesture = () => {
    gesture = null;
    if (resetTimer !== null) clearTimer(resetTimer);
    resetTimer = null;
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
        triggered: false,
      };
    }
    scheduleGestureEnd();

    if (!gesture.startedAtTop || viewport.scrollTop > 1 || event.deltaY >= 0) return;

    gesture.distance += Math.min(MAX_EVENT_DISTANCE, pullDistance(event, viewport));
    if (
      !gesture.triggered &&
      gesture.distance >= threshold &&
      now() - lastSyncAt >= cooldown
    ) {
      gesture.triggered = true;
      lastSyncAt = now();
      sync();
    }
  };

  root.addEventListener('wheel', onWheel, { capture: true, passive: true });

  return {
    deactivate() {
      root.removeEventListener('wheel', onWheel, true);
      endGesture();
    },
    onWheel,
  };
}

module.exports = {
  createPullToSync,
  findThreadListViewport,
  pullDistance,
};
