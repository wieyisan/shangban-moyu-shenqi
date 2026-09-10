# Office Escape — User Guide

Version 1.3.0 · English | [Windows 中文](Windows使用说明.md)

## Start

Windows: extract the complete Windows x64 ZIP and open OfficeEscape.exe. Do not run it inside the archive or move only the executable.

macOS Apple Silicon: extract the macOS arm64 ZIP and open OfficeEscape.app. You may move it to Applications. The app is ad-hoc signed, not notarized; review any macOS security prompt for the build you obtained.

Select **English** in the top-right language menu. The selected language survives restarts. Use the sample reader to explore the controls before importing a book.

## Transparent reading with the mouse

1. Import and open a TXT or EPUB book.
2. Open **Reading settings → Text-only overlay**.
3. The window becomes a 460 × 300, always-on-top overlay with 16px dark-gray text.
4. Hover near the top edge to reveal the floating toolbar.
5. Hold **Drag** and move the mouse to move the whole window. Choose **Settings** to change its appearance.
6. Move back to the text. After about 0.4 seconds, the toolbar disappears completely.

**Expand** reveals the full controls; it does not necessarily restore the original window size. **Hide** hides the entire window. The floating toolbar's **×** only dismisses that toolbar. The main window's **×** hides the app to its tray instead of quitting.

Settings remain open until you close the panel. Right-click reading content for another way to open settings. Websites and PDFs also reserve a small transparent strip at the top for mouse access; their native view moves down while the toolbar is open.

The overlay never inserts text into Word or edits the underlying document. PDF pages and complex website backgrounds may remain opaque; TXT and EPUB give the cleanest result.

## Appearance

- **Transparent mode:** removes the app background. Collapse the controls to show only reading text.
- **Window opacity:** 100% is clearest; lower values fade the entire window, including its text.
- **Font size / Page zoom:** changes local text size or website zoom.
- **Text color:** choose a color that works against the underlying window.
- **Always on top:** keeps the reader above other applications.
- **Auto-scroll:** 0 means off. PDFs and some websites do not support this feature.
- **Hide page images:** also hides video and canvas elements when supported.

## Hide and recover

Enable **Hide when pointer leaves** to hide the entire native window when the pointer exits its bounds. Move back to the same screen area to restore it without explicitly taking keyboard focus from the underlying app. Then hover at the top edge to reveal the toolbar.

This setting resets to off on the next launch, so the app is easy to find. Hiding attempts to pause active HTML audio/video and resume it when restored.

If the window is lost or too faint, open the system tray menu and choose **Restore an opaque window**. On Windows, the tray icon may be inside the hidden-icons arrow next to the clock. Use **Quit** there to exit completely.

Optional shortcuts: Alt+Z hides/restores, Alt+R toggles controls, Alt+X quits. On Mac, use Option instead of Alt. Esc toggles controls in focused local transparent reading. Alt+Z and Alt+X can be customized; Alt+R is reserved.

## Books and data

TXT and EPUB save chapter and scroll position automatically. EPUB is text-only, with no original illustrations or DRM support. PDFs use the built-in viewer's own controls and do not save application-level reading progress.

Import limit: 50 MB per file, 100 MB extracted EPUB. MOBI and AZW3 are not supported.

Books, progress, bookmarks, settings, and browser sessions are local. Windows stores app data under `%APPDATA%\qingyu-reader`. Removing a library entry preserves the source file.

## Troubleshooting

No floating toolbar: make sure you are in transparent reading, then hover over the reader's top edge, not the underlying document's edge. Alternatively right-click or use the tray.

Cannot drag: reveal the toolbar first and hold **Drag**. Dragging the text itself selects text.

Website does not behave normally: try disabling transparency or use your regular browser. Some login popups and protected media are incompatible with embedded browsing.

Missing files at launch: extract the full ZIP again and keep its folder structure intact.

Windows publishing is unsigned and has not yet received complete device testing. Enterprise-managed devices may restrict software execution; follow your organization's policy.
