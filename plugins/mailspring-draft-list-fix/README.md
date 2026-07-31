# Mailspring Draft List Fix

A small Mailspring compatibility plugin that makes Drafts look and behave like the Inbox:

- hides the checkbox column in the Drafts list;
- deletes the normally focused/highlighted draft with the configured delete command;
- preserves Command-click and Shift-click multi-selection deletion;
- presents each draft as an Inbox-style row with recipient avatar, name, timestamp, subject, and snippet;
- keeps Mailspring's existing full-width Drafts mailbox and composer actions;
- limits its command handler to the Drafts list, so Inbox and composer behavior are unchanged.

## Install

Copy this folder to Mailspring's packages directory, then restart Mailspring:

```text
~/Library/Application Support/Mailspring/packages/mailspring-draft-list-fix
```

## Test

```bash
node tests/draft-targets.test.js
```

## License

MIT
