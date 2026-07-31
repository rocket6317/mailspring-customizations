'use strict';

function uniqueDrafts(drafts) {
  const seen = new Set();
  return drafts.filter(draft => {
    if (!draft || !draft.id || seen.has(draft.id)) return false;
    seen.add(draft.id);
    return true;
  });
}

function draftsForDeletion({ selected = [], focused = null, keyboardCursor = null }) {
  if (selected.length > 0) return uniqueDrafts(selected);
  return uniqueDrafts([focused || keyboardCursor]);
}

module.exports = { draftsForDeletion };
