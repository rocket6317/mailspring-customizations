# Mailspring Customizations

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/M4M31NTEGN)

A collection of macOS-focused themes and plugins for
[Mailspring](https://www.getmailspring.com/). The packages improve the dark
interface, Drafts mailbox, on-device writing assistance, and access to
WhatsApp Web without modifying Mailspring itself.

## Contents

### Theme

- [`themes/icloud-minimal-dark`](themes/icloud-minimal-dark) - a compact dark
  theme inspired by Apple Mail and iCloud Mail, including readable email
  bodies, native-style traffic lights, and dark popout-window backing.

### Plugins

- [`plugins/mailspring-ai-writing`](plugins/mailspring-ai-writing) - private,
  on-device proofreading, rewriting, and reply creation with Apple Foundation
  Models, plus persistent native spellchecking.
- [`plugins/mailspring-draft-list-fix`](plugins/mailspring-draft-list-fix) -
  Inbox-style Drafts rows with previews and consistent keyboard deletion.
- [`plugins/mailspring-macos-conveniences`](plugins/mailspring-macos-conveniences) -
  native macOS behavior improvements, including direct menu-bar window restore.
- [`plugins/mailspring-whatsapp-web`](plugins/mailspring-whatsapp-web) - a
  persistent WhatsApp Web tab with notifications, unread counts, mailbox
  navigation, and a mail-sync shortcut.

Each package has its own README with detailed requirements, limitations, and
installation instructions.

## Installation

Clone or download this repository, then install only the packages you want.

For the theme:

1. In Mailspring, choose **Mailspring > Install New Theme...**.
2. Select `themes/icloud-minimal-dark`.
3. Activate **iCloud Minimal Dark** from **Mailspring > Change Theme...**.

For a plugin:

1. In Mailspring, choose **Developer > Install a Package Manually...**.
2. Select the relevant folder under `plugins`.
3. Fully quit and reopen Mailspring.

## Compatibility

The collection is developed and tested on macOS with Mailspring 1.23.0. The AI
Writing plugin additionally requires Apple silicon, Apple Intelligence, and a
macOS release that provides `/usr/bin/fm`.

Mailspring and Electron updates can change internal APIs. Review each package's
README before installing it on another version.

## Privacy And Security

- No credentials, API keys, email content, cookies, or account identifiers are
  included in this repository.
- AI Writing uses Apple's on-device Foundation Model and does not send draft
  text to an external AI provider.
- WhatsApp Web data remains in its isolated Mailspring/Electron partition. The
  partition and login state are not stored in this repository.
- The theme, Draft List Fix, and macOS Conveniences do not transmit data.

## Development

Run the available plugin tests from the repository root:

```bash
node --test plugins/mailspring-ai-writing/tests/*.test.js
node --test plugins/mailspring-draft-list-fix/tests/*.test.js
node --test plugins/mailspring-macos-conveniences/tests/*.test.js
```

## Excluded Work

Temporary experiments, rollback snapshots, Mailspring reference source, and
third-party packages are intentionally excluded. The former standalone dark
popout helper is also excluded because its functionality now lives in the
`icloud-minimal-dark` theme.

## Disclaimer

These packages are unofficial and are not affiliated with or endorsed by
Mailspring, Apple, WhatsApp, or Meta. Product and company names are trademarks
of their respective owners.

## License

Each package is distributed under the license included in its own folder.
