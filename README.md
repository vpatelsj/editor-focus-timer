# Editor Focus Timer

A local VS Code status-bar timer for focused source-editor time on macOS.

The timer starts automatically, includes quiet thinking time, pauses outside a saved local source editor, and resets when the extension host restarts. It stores and sends nothing.

## Accessibility Permission

The bundled helper needs macOS Accessibility permission to distinguish the source editor from Copilot Chat, the terminal, and other VS Code surfaces. When the status tooltip requests permission, open **System Settings > Privacy & Security > Accessibility**, enable the prompted helper, then reload VS Code.

## Build And Install

```bash
npm install
npm test
npm run package
npx @vscode/vsce package --out editor-focus-timer-0.0.1.vsix
code --install-extension editor-focus-timer-0.0.1.vsix --force
```
