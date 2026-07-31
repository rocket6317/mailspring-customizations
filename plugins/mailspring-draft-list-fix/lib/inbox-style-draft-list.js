'use strict';

const {
  Actions,
  React,
  Utils,
  localized,
} = require('mailspring-exports');
const {
  ContactProfilePhoto,
  EmptyListState,
  FluxContainer,
  FocusContainer,
  InjectedComponentSet,
  ListTabular,
  MultiselectList,
} = require('mailspring-component-kit');

const ITEM_HEIGHT = 80;

function contactsForDraft(draft) {
  return [...(draft.to || []), ...(draft.cc || []), ...(draft.bcc || [])];
}

function recipientText(draft) {
  const contacts = contactsForDraft(draft);
  if (contacts.length === 0) return localized('(No Recipients)');
  return contacts.map(contact => contact.displayName({ includeAccountLabel: false })).join(', ');
}

function subjectText(draft) {
  const subject = Utils.extractTextFromHtml(draft.subject || '').trim();
  return subject || localized('(No Subject)');
}

function snippetText(draft) {
  if (!draft.body) return '';
  try {
    return Utils.extractTextFromHtml(draft.body, { maxLength: 500 })
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300);
  } catch (error) {
    return '';
  }
}

function DraftAvatar({ draft }) {
  const contact = contactsForDraft(draft)[0];
  if (!contact) {
    return React.createElement('div', { className: 'draft-avatar draft-avatar-empty' }, '?');
  }
  return React.createElement(
    'div',
    { className: 'draft-avatar' },
    React.createElement(ContactProfilePhoto, { contact, loading: false })
  );
}

function DraftRow({ draft }) {
  const recipients = recipientText(draft);
  const subject = subjectText(draft);
  const snippet = snippetText(draft);
  const attachment = draft.files && draft.files.length > 0
    ? React.createElement('div', { className: 'thread-icon thread-icon-attachment' })
    : null;

  return React.createElement(
    'div',
    { className: 'draft-inbox-row' },
    React.createElement(DraftAvatar, { draft }),
    React.createElement(
      'div',
      { className: 'draft-inbox-content' },
      React.createElement(
        'div',
        { className: 'draft-inbox-header' },
        React.createElement(
          'div',
          { className: `participants${contactsForDraft(draft).length ? '' : ' no-recipients'}` },
          recipients
        ),
        React.createElement('span', { className: 'draft-inbox-spacer' }),
        React.createElement(InjectedComponentSet, {
          inline: true,
          containersRequired: false,
          matching: { role: 'DraftList:DraftStatus' },
          className: 'draft-inbox-status',
          exposedProps: { draft },
        })
      ),
      React.createElement('div', { className: 'subject', dir: 'auto' }, subject),
      React.createElement(
        'div',
        { className: 'snippet-and-labels' },
        React.createElement('div', { className: 'snippet', dir: 'auto' }, snippet || '\u00a0'),
        attachment
      )
    )
  );
}

const ItemColumn = new ListTabular.Column({
  name: 'Item',
  flex: 1,
  resolver: draft => React.createElement(DraftRow, { draft }),
});

module.exports = function createInboxStyleDraftList(draftListStore) {
  class InboxStyleDraftList extends React.Component {
    static displayName = 'InboxStyleDraftList';

    itemPropsProvider = draft => ({ className: draft.uploadTaskId ? 'sending' : '' });

    onDoubleClick = draft => {
      if (!draft.uploadTaskId) Actions.composePopoutDraft(draft.headerMessageId);
    };

    ariaLabel = draft => [recipientText(draft), subjectText(draft), snippetText(draft)]
      .filter(Boolean)
      .join(', ');

    render() {
      return React.createElement(
        FluxContainer,
        {
          stores: [draftListStore],
          getStateFromStores: () => ({ dataSource: draftListStore.dataSource() }),
        },
        React.createElement(
          FocusContainer,
          { collection: 'draft' },
          React.createElement(MultiselectList, {
            className: 'draft-list draft-list-inbox-style',
            columns: [ItemColumn],
            onDoubleClick: this.onDoubleClick,
            EmptyComponent: EmptyListState,
            itemPropsProvider: this.itemPropsProvider,
            itemHeight: ITEM_HEIGHT,
            ariaLabel: localized('Drafts'),
            ariaLabelForItem: this.ariaLabel,
          })
        )
      );
    }
  }

  return InboxStyleDraftList;
};
