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
- Leave non-macOS platforms unchanged.

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
