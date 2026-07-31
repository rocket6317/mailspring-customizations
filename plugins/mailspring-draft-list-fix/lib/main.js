'use strict';

const path = require('path');
const {
  Actions,
  ComponentRegistry,
  FocusedContentStore,
  WorkspaceStore,
} = require('mailspring-exports');
const { draftsForDeletion } = require('./draft-targets');
const createInboxStyleDraftList = require('./inbox-style-draft-list');

const DELETE_COMMANDS = [
  'core:delete-item',
  'core:gmail-remove-from-view',
  'core:remove-from-view',
];

let observer = null;
let originalDraftList = null;
let inboxStyleDraftList = null;
const attachedLists = new Map();

function loadDraftListStore() {
  const resourcePath = AppEnv.getLoadSettings().resourcePath;
  const modulePath = path.join(
    resourcePath,
    'internal_packages',
    'draft-list',
    'lib',
    'draft-list-store.js'
  );
  const loaded = require(modulePath);
  return loaded.default || loaded;
}

function installInboxStyleDraftList(draftListStore) {
  originalDraftList = ComponentRegistry.findComponentByName('DraftList');
  if (!originalDraftList) throw new Error('The built-in DraftList component is unavailable.');

  inboxStyleDraftList = createInboxStyleDraftList(draftListStore);
  ComponentRegistry.unregister(originalDraftList);
  try {
    ComponentRegistry.register(inboxStyleDraftList, {
      location: WorkspaceStore.Location.DraftList,
    });
  } catch (error) {
    ComponentRegistry.register(originalDraftList, {
      location: WorkspaceStore.Location.DraftList,
    });
    originalDraftList = null;
    inboxStyleDraftList = null;
    throw error;
  }
}

function restoreOriginalDraftList() {
  if (inboxStyleDraftList) ComponentRegistry.unregister(inboxStyleDraftList);
  if (originalDraftList) {
    ComponentRegistry.register(originalDraftList, {
      location: WorkspaceStore.Location.DraftList,
    });
  }
  originalDraftList = null;
  inboxStyleDraftList = null;
}

function targetsForCurrentDraftList() {
  const dataSource = loadDraftListStore().dataSource();
  return draftsForDeletion({
    selected: dataSource.selection.items(),
    focused: FocusedContentStore.focused('draft'),
    keyboardCursor: FocusedContentStore.keyboardCursor('draft'),
  });
}

function onDeleteDraft(event) {
  const drafts = targetsForCurrentDraftList();
  if (drafts.length === 0) return;

  event.preventDefault();
  event.stopPropagation();

  for (const draft of drafts) Actions.destroyDraft(draft);
  loadDraftListStore().dataSource().selection.clear();
}

function attachList(list) {
  if (attachedLists.has(list)) return;
  for (const command of DELETE_COMMANDS) list.addEventListener(command, onDeleteDraft);
  attachedLists.set(list, true);
}

function detachList(list) {
  for (const command of DELETE_COMMANDS) list.removeEventListener(command, onDeleteDraft);
  attachedLists.delete(list);
}

function scanForDraftLists() {
  document.querySelectorAll('.draft-list').forEach(attachList);
  for (const list of attachedLists.keys()) {
    if (!document.documentElement.contains(list)) detachList(list);
  }
}

module.exports = {
  activate() {
    const draftListStore = loadDraftListStore();
    installInboxStyleDraftList(draftListStore);
    scanForDraftLists();
    observer = new MutationObserver(scanForDraftLists);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  },

  deactivate() {
    if (observer) observer.disconnect();
    observer = null;
    for (const list of Array.from(attachedLists.keys())) detachList(list);
    restoreOriginalDraftList();
  },
};
