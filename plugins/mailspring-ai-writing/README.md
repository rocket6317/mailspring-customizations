# AI Writing for Mailspring

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/M4M31NTEGN)

Private, on-device email writing assistance powered by Apple Foundation Models.

## Features

- Proofread
- Rewrite clearly
- Make professional
- Make friendly
- Make concise
- Create reply
- Always-on native spellchecking while typing, with local dictionary suggestions
- Preview and edit results before replacing draft text
- Uses selected text when available, otherwise the whole draft
- Deterministic generation and safeguards against suspiciously expanded rewrites

## Privacy

The plugin uses the on-device Apple Foundation Model through macOS's built-in
`fm` command. Email text is not sent to an external AI provider. The plugin
never sends email automatically and never changes draft text before you click
**Replace**.

Native spelling checks also remain on-device. Misspellings are underlined and
can be corrected from Mailspring's right-click menu; the plugin does not apply
automatic replacements.

## Requirements

- Apple silicon Mac with Apple Intelligence enabled
- macOS 27 or newer with `/usr/bin/fm`

## Usage

1. Write or select text in a Mailspring composer.
2. Click the sparkle icon in the composer action bar.
3. Choose an action.
4. Review the generated result and click **Replace**.

## Installation

1. Download or clone the `mailspring-customizations` repository.
2. In Mailspring, choose **Developer > Install a Package Manually**.
3. Select the `plugins/mailspring-ai-writing` folder.
4. Restart Mailspring.

## Limitations

- Apple Foundation Models may occasionally produce unexpected text. Always
  review the preview before clicking **Replace**.
- Availability depends on Apple Intelligence and the system model being ready.

## License

MIT
