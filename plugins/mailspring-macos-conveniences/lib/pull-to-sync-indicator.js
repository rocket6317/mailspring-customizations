'use strict';

const MAX_OFFSET = 44;
const SETTLE_DELAY = 200;
const SYNC_DISPLAY_TIME = 900;

function createPullToSyncIndicator({ root, setTimer = setTimeout, clearTimer = clearTimeout }) {
  if (!root || !root.body || typeof root.createElement !== 'function') return null;

  const host = root.createElement('div');
  const indicator = root.createElement('div');
  const icon = root.createElement('span');
  const label = root.createElement('span');

  host.className = 'pull-to-sync-indicator-host';
  indicator.className = 'pull-to-sync-indicator';
  icon.className = 'pull-to-sync-icon';
  label.className = 'pull-to-sync-label';
  label.textContent = 'Pull to sync';
  indicator.appendChild(icon);
  indicator.appendChild(label);
  host.appendChild(indicator);
  root.body.appendChild(host);

  let activeList = null;
  let hideTimer = null;

  const clearHideTimer = () => {
    if (hideTimer !== null) clearTimer(hideTimer);
    hideTimer = null;
  };

  const updateBounds = () => {
    if (!activeList) return;
    const rect = activeList.getBoundingClientRect();
    host.style.left = `${rect.left}px`;
    host.style.top = `${rect.top}px`;
    host.style.width = `${rect.width}px`;
  };

  const listForViewport = viewport =>
    viewport && typeof viewport.closest === 'function' ? viewport.closest('.thread-list') : null;

  const useList = viewport => {
    const list = listForViewport(viewport);
    if (!list) return null;

    if (activeList && activeList !== list) {
      activeList.classList.remove('pull-to-sync-list', 'pull-to-sync-settling');
      activeList.style.removeProperty('--pull-to-sync-offset');
    }
    activeList = list;
    activeList.classList.add('pull-to-sync-list');
    updateBounds();
    return activeList;
  };

  const finishReset = () => {
    if (activeList) {
      activeList.classList.remove('pull-to-sync-list', 'pull-to-sync-settling');
      activeList.style.removeProperty('--pull-to-sync-offset');
    }
    activeList = null;
    host.className = 'pull-to-sync-indicator-host';
    host.style.removeProperty('--pull-to-sync-offset');
    host.style.removeProperty('--pull-to-sync-progress');
    host.style.removeProperty('--pull-to-sync-rotation');
    hideTimer = null;
  };

  const reset = () => {
    clearHideTimer();
    if (activeList) {
      activeList.classList.add('pull-to-sync-settling');
      activeList.style.setProperty('--pull-to-sync-offset', '0px');
    }
    host.className = 'pull-to-sync-indicator-host is-visible is-settling';
    host.style.setProperty('--pull-to-sync-offset', '0px');
    hideTimer = setTimer(finishReset, SETTLE_DELAY);
  };

  const onPull = ({ viewport, progress, ready, available = true }) => {
    const list = useList(viewport);
    if (!list) return;

    clearHideTimer();
    const offset = Math.round(progress * MAX_OFFSET);
    list.classList.remove('pull-to-sync-settling');
    list.style.setProperty('--pull-to-sync-offset', `${offset}px`);
    host.className = `pull-to-sync-indicator-host is-visible is-ready-${ready}`;
    host.style.setProperty('--pull-to-sync-offset', `${offset}px`);
    host.style.setProperty('--pull-to-sync-progress', String(progress));
    host.style.setProperty('--pull-to-sync-rotation', `${Math.round(progress * 240)}deg`);
    label.textContent = available
      ? ready
        ? 'Release to sync'
        : 'Pull to sync'
      : 'Finishing sync…';
  };

  const onSync = ({ viewport }) => {
    const list = useList(viewport);
    if (!list) return;

    clearHideTimer();
    list.classList.add('pull-to-sync-settling');
    list.style.setProperty('--pull-to-sync-offset', `${MAX_OFFSET}px`);
    host.className = 'pull-to-sync-indicator-host is-visible is-syncing';
    host.style.setProperty('--pull-to-sync-offset', `${MAX_OFFSET}px`);
    host.style.setProperty('--pull-to-sync-progress', '1');
    host.style.setProperty('--pull-to-sync-rotation', '240deg');
    label.textContent = 'Syncing…';
    hideTimer = setTimer(reset, SYNC_DISPLAY_TIME);
  };

  const view = root.defaultView;
  if (view) view.addEventListener('resize', updateBounds);

  return {
    onPull,
    onReset: reset,
    onSync,
    deactivate() {
      clearHideTimer();
      finishReset();
      if (view) view.removeEventListener('resize', updateBounds);
      host.remove();
    },
  };
}

module.exports = { createPullToSyncIndicator };
