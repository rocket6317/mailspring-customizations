# macOS Conveniences for Mailspring

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/M4M31NTEGN)

A lightweight Mailspring plugin for native macOS behavior improvements that do
not belong to a mail service, theme, or integration plugin.

## Features

- Left-click Mailspring's menu-bar icon to restore and focus the main window
  immediately.
- Right-click the menu-bar icon to retain the standard Open Inbox, New Message,
  Preferences, and Quit menu.
- Restore Mailspring's normal automatic tray menu if the plugin is disabled.
- Pull down while the email list is already at the top to reveal a native-style
  refresh indicator, then release to sync new mail.
- Prevent pull-to-sync from overlapping startup or an active folder sync.
- Leave non-macOS platforms unchanged.

## Pull To Sync

Open a mailbox, scroll to the top of the email list, then pull down and release
when the indicator says **Release to sync**. The list and indicator animate with
the gesture.

While Mailspring is starting, already syncing, or finishing a recent sync, the
indicator says **Finishing sync…** and does not start another request. This avoids
overlapping scans and stale folder-progress displays.

## Installation

1. Download or clone the `mailspring-customizations` repository.
2. In Mailspring, choose **Developer > Install a Package Manually...**.
3. Select the `plugins/mailspring-macos-conveniences` folder.
4. Fully quit and reopen Mailspring.

## Compatibility

Tested with Mailspring 1.23.0 on macOS. The plugin uses Mailspring's existing
Electron tray object and may need adjustment after Mailspring or Electron
updates.

## Privacy

The plugin does not read email, account, or message data. It does not make
network requests or transmit analytics.

## Test

```bash
node --test tests/*.test.js
```

## License

MIT. See [LICENSE](LICENSE).
