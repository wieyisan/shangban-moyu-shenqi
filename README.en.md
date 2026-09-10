# Office Escape · 上班摸鱼神器

English | [简体中文](README.md)

An open-source transparent desktop reader for **Windows and macOS**. Read TXT, EPUB, PDF, or websites in a small overlay. Move, configure, and hide it with your mouse. Includes **English and Simplified Chinese UI**.

![English interface](docs/images/home-en.png)

## Download

Get a build from **[Releases](https://github.com/wieyisan/shangban-moyu-shenqi/releases/latest)**.

| Platform | Download | Run |
| --- | --- | --- |
| Windows 10 / 11 x64 | `OfficeEscape-1.3.0-Windows-x64.zip` | Extract everything; open `OfficeEscape.exe` |
| macOS Apple Silicon | `OfficeEscape-1.3.0-macOS-arm64.zip` | Extract and open `OfficeEscape.app` |

No Node.js installation is needed to use a release. Keep all bundled files together. Windows builds are unsigned; macOS builds are ad-hoc signed and not notarized. Desktop regression tests have passed on macOS; the Windows build has not yet undergone complete physical-device testing.

[English user guide](docs/USER_GUIDE.en.md) · [中文 Windows 指南](docs/Windows使用说明.md) · [Validation scope](VALIDATION.md)

## Features

- **Transparent reading:** remove the background, adjust text and opacity, and keep the window on top.
- **Mouse toolbar:** hover near the top edge for Drag, Settings, Expand, and Hide. It disappears about 0.4 seconds after you move away.
- **Text-only overlay:** a compact 460 × 300 reading window that blends over a document without editing it.
- **Quick hiding:** hide on pointer leave, restore from the tray, and customize global shortcuts.
- **Local books:** chapter navigation and saved progress for TXT/EPUB; a built-in PDF viewer.
- **Web browsing:** addresses, back/forward navigation, bookmarks, and persistent login sessions.
- **Bilingual interface:** choose English or 中文 in the top-right language menu. Your preference is saved.

## Mouse-first workflow

1. Import and open a TXT or EPUB book.
2. Open Reading settings and choose **Text-only overlay**.
3. Hover over the top 28 pixels of the window to reveal the toolbar.
4. Hold **Drag** to move the window, or choose **Settings** to adjust it.
5. Move back to the text; the toolbar disappears without leaving a permanent border or handle.

Right-click and the system tray are additional recovery paths. Keyboard shortcuts are optional:

| Shortcut | Action |
| --- | --- |
| `Alt+Z` | Hide / restore window |
| `Alt+R` | Toggle reading controls |
| `Alt+X` | Quit |
| `Esc` | Toggle controls in focused, local transparent reading |

On macOS, Alt means Option. If you lose the window, use **Restore an opaque window** from its tray menu.

## Format support and limitations

- TXT: UTF-8, BOM-marked UTF-16, and GB18030; common English and Chinese chapter headings.
- EPUB: plain text in spine order, without original illustrations or complex layout. No DRM support.
- PDF: Chromium's built-in viewer. No application-level reading progress, background removal, or automatic scrolling.
- No MOBI/AZW3 support. Files are limited to 50 MB; extracted EPUB content to 100 MB.
- Canvas, iframes, DRM media, and separate login popups may not work as expected. Website transparency and scrolling are best-effort.
- Changing language translates the application UI, not your books or third-party websites.

## Privacy and local storage

Book copies, progress, settings, and bookmarks remain in Electron's local userData directory. They are not uploaded to a cloud service. Windows uses `%APPDATA%\qingyu-reader`; this legacy directory is retained for existing users.

Websites receive normal browser requests and handle login information under their own policies. Camera, microphone, location, and similar website permissions are denied by default. Removing a book from the library leaves the original file intact.

## Development

Use Node.js 22+ and pnpm 11.19.0:

```sh
git clone https://github.com/wieyisan/shangban-moyu-shenqi.git
cd shangban-moyu-shenqi
pnpm install --frozen-lockfile
pnpm start
```

```sh
pnpm test           # Core parsing and URL validation
pnpm test:desktop   # Requires a graphical desktop session
pnpm dist:win       # Windows x64 ZIP
pnpm dist:mac       # macOS Apple Silicon ZIP
```

Builds appear in `release/`. GitHub Actions provides tests and builds for both platforms.

## Contributing

Please open an [issue](https://github.com/wieyisan/shangban-moyu-shenqi/issues) with your OS, app version, and reproduction steps. Do not attach private documents, credentials, or entire copyrighted books. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits and license

The original feature brief drew on MoyuRead's public features. Later transparency work referenced Thief, Reader, and Electron documentation. This is an independent implementation; their source code and artwork are not bundled. See [RESEARCH.md](RESEARCH.md).

Licensed under the **[MIT License](LICENSE)**. Dependencies retain their own licenses. Earlier versions were called Qingyu; the legacy app ID and data-directory name remain for upgrade compatibility.
