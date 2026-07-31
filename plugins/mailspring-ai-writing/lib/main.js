'use strict';

const path = require('path');
const { Actions, ComponentRegistry, React } = require('mailspring-exports');
const { Menu } = require('mailspring-component-kit');

const ACTIONS = [
  { key: 'proofread', label: 'Proofread' },
  { key: 'rewrite', label: 'Rewrite clearly' },
  { key: 'professional', label: 'Make professional' },
  { key: 'friendly', label: 'Make friendly' },
  { key: 'concise', label: 'Make concise' },
  { key: 'reply', label: 'Create reply' },
];

const COMPOSER_EDITOR_SELECTOR = '.RichEditor-content [contenteditable]';
let spellcheckObserver = null;
let spellcheckFrame = null;

function enableNativeSpellcheck() {
  spellcheckFrame = null;
  if (!AppEnv.config.get('core.composing.spellcheck')) return;

  document.querySelectorAll(COMPOSER_EDITOR_SELECTOR).forEach(editor => {
    if (editor.spellcheck !== true || editor.getAttribute('spellcheck') !== 'true') {
      editor.spellcheck = true;
      editor.setAttribute('spellcheck', 'true');
    }
  });
}

function scheduleNativeSpellcheck(event) {
  if (event && event.target && !event.target.closest('.RichEditor-content')) return;
  if (spellcheckFrame === null) {
    spellcheckFrame = window.requestAnimationFrame(enableNativeSpellcheck);
  }
}

function startNativeSpellcheck() {
  scheduleNativeSpellcheck();
  document.addEventListener('keydown', scheduleNativeSpellcheck, true);
  document.addEventListener('input', scheduleNativeSpellcheck, true);
  spellcheckObserver = new MutationObserver(scheduleNativeSpellcheck);
  spellcheckObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['spellcheck'],
    childList: true,
    subtree: true,
  });
}

function stopNativeSpellcheck() {
  document.removeEventListener('keydown', scheduleNativeSpellcheck, true);
  document.removeEventListener('input', scheduleNativeSpellcheck, true);
  if (spellcheckObserver) spellcheckObserver.disconnect();
  spellcheckObserver = null;
  if (spellcheckFrame !== null) window.cancelAnimationFrame(spellcheckFrame);
  spellcheckFrame = null;
}

function foundationModels() {
  const remotePath = path.join(
    AppEnv.getLoadSettings().resourcePath,
    'node_modules',
    '@electron',
    'remote'
  );
  return require(remotePath).require(path.join(__dirname, 'foundation-models-main.js'));
}

function editorContext(session) {
  const editor = session._mountedEditor;
  if (!editor) return null;

  const selection = editor.value.selection;
  const selected = selection && !selection.isCollapsed;
  return {
    editor,
    selection,
    selected,
    text: selected ? editor.value.fragment.text : editor.value.document.text,
  };
}

function replaceEditorText(context, text) {
  const editor = context.editor;
  if (context.selected) {
    editor.select(context.selection).delete().insertText(text).focus();
  } else {
    editor.moveToRangeOfDocument().delete().insertText(text).focus();
  }
}

class AIWritingPopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = { action: null, loading: false, result: '', error: '' };
  }

  componentDidMount() {
    this.mounted = true;
    document.addEventListener('mousedown', this.onDocumentMouseDown, true);
  }

  componentWillUnmount() {
    this.mounted = false;
    document.removeEventListener('mousedown', this.onDocumentMouseDown, true);
  }

  onDocumentMouseDown = event => {
    if (this.root && !this.root.contains(event.target)) Actions.closePopover();
  };

  runAction = action => {
    this.setState({ action, loading: true, result: '', error: '' });
    foundationModels()
      .run(action, this.props.context.text)
      .then(result => {
        if (this.mounted) this.setState({ loading: false, result });
      })
      .catch(error => {
        if (this.mounted) this.setState({ loading: false, error: error.message || String(error) });
      });
  };

  apply = () => {
    replaceEditorText(this.props.context, this.state.result);
    Actions.closePopover();
  };

  renderActionMenu() {
    return React.createElement(Menu, {
      className: 'ai-writing-menu',
      items: ACTIONS,
      itemKey: item => item.key,
      itemContent: item => item.label,
      onSelect: item => this.runAction(item.key),
    });
  }

  renderResult() {
    return React.createElement(
      'div',
      { className: 'ai-writing-result' },
      React.createElement('div', { className: 'ai-writing-heading' }, 'AI Writing Preview'),
      React.createElement('textarea', {
        value: this.state.result,
        onChange: event => this.setState({ result: event.target.value }),
        autoFocus: true,
      }),
      React.createElement(
        'div',
        { className: 'ai-writing-actions' },
        React.createElement(
          'button',
          { className: 'btn', onClick: () => this.setState({ action: null, result: '' }) },
          'Back'
        ),
        React.createElement(
          'button',
          { className: 'btn btn-emphasis', disabled: !this.state.result.trim(), onClick: this.apply },
          'Replace'
        )
      )
    );
  }

  render() {
    let content;
    if (this.state.loading) {
      content = React.createElement(
        'div',
        { className: 'ai-writing-status' },
        'Apple Intelligence is writing...'
      );
    } else if (this.state.error) {
      content = React.createElement(
        'div',
        { className: 'ai-writing-error' },
        React.createElement('div', null, this.state.error),
        React.createElement(
          'button',
          { className: 'btn', onClick: () => this.setState({ action: null, error: '' }) },
          'Back'
        )
      );
    } else {
      content = this.state.result ? this.renderResult() : this.renderActionMenu();
    }

    return React.createElement(
      'div',
      {
        className: 'ai-writing-popover',
        ref: root => {
          this.root = root;
        },
      },
      content
    );
  }
}

class AIWritingButton extends React.Component {
  open = () => {
    const context = editorContext(this.props.session);
    if (!context || !context.text.trim()) {
      AppEnv.showErrorDialog('Select text or write an email before using AI Writing.');
      return;
    }

    const originRect = this.button.getBoundingClientRect();
    Actions.openPopover(React.createElement(AIWritingPopover, { context }), {
      originRect,
      direction: 'up',
    });
  };

  render() {
    if (this.props.draft.plaintext) return React.createElement('span', null);

    return React.createElement(
      'button',
      {
        className: 'btn btn-toolbar ai-writing-button',
        ref: button => {
          this.button = button;
        },
        onClick: this.open,
        title: 'AI Writing',
        'aria-label': 'AI Writing',
        tabIndex: -1,
      },
      React.createElement('span', { className: 'ai-writing-icon', 'aria-hidden': 'true' })
    );
  }
}

AIWritingButton.displayName = 'AIWritingButton';
AIWritingButton.containerRequired = false;

function activate() {
  ComponentRegistry.register(AIWritingButton, { role: 'Composer:ActionButton' });
  startNativeSpellcheck();
}

function deactivate() {
  stopNativeSpellcheck();
  ComponentRegistry.unregister(AIWritingButton);
}

module.exports = { activate, deactivate };
