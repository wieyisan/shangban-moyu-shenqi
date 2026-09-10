# 验证范围 / Validation scope

2026-09-10 · v1.3.0 · macOS ARM64 · Electron 42.11.3

## 已通过 / Passed

- 核心测试 4 项：URL 校验、文本编码与章节识别、EPUB spine 顺序和脚本剥离、文件去重。Four core tests cover URL validation, text encoding and chapters, EPUB spine order and script removal, and deduplication.
- 桌面测试：书架、TXT 导入、章节、进度恢复、字号、置顶、收藏、隔离的网页视图、隐藏和恢复。Desktop tests cover the library, TXT import, chapters, progress restoration, typography, always-on-top, bookmarks, isolated web browsing, and hide/restore.
- EPUB/PDF 导入和阅读。EPUB and PDF import and viewing.
- 透明测试：无原生阴影、边缘 alpha 为零、滚动往返像素一致、清空正文后无残留像素、鼠标移出隐藏和移回恢复。Transparency tests check native shadow state, zero-alpha borders, identical pixels after a scroll round trip, no pixels after clearing text, and pointer-leave hide/re-entry restoration.
- 鼠标浮栏：顶部悬停、点击设置、原生窗口位移、自动收起、正文位置不变。Mouse toolbar tests cover hover, settings, native window movement, auto-collapse, and stable text layout.
- 中英文界面、示例章节切换、设置语言保存和重启恢复。Chinese/English UI, localized sample chapters, saved language, and persistence across relaunch.

## 限制 / Limits

Windows 10/11 x64 ZIP 从 macOS 交叉打包，尚未在 Windows 真机验收。macOS 测试不代表 Windows 的透明合成、托盘、DPI、多显示器和全局快捷键已通过验收。

The Windows x64 ZIP is cross-built on macOS and has not been tested on a physical Windows device. macOS results do not establish Windows compositor, tray, DPI, multi-monitor, or global-shortcut compatibility.

鼠标拖动测试向 DOM 处理器注入确定的屏幕坐标，并模拟 pointer capture；验证原生位移为 60 × 40px。透明截图不包含 WindowServer 阴影，因此另外检查原生 hasShadow 状态。第三方网站登录和 DRM 兼容性未逐站验证。

Drag tests inject deterministic screen coordinates into DOM handlers and simulate pointer capture, verifying a native 60 × 40px movement. Transparent captures exclude WindowServer shadows, so native hasShadow state is checked separately. Third-party login and DRM compatibility is not exhaustively tested.

Windows 未签名；macOS 为 ad-hoc 签名，未 Apple 公证。Windows builds are unsigned; macOS builds are ad-hoc signed and not notarized.

## 复现 / Reproduce

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm test:desktop
```

桌面测试需要图形桌面会话，使用临时数据目录和本地 HTTP 测试页。测试截图写入被 Git 忽略的 artifacts/；README 截图使用原创示例，不包含用户书籍。

Desktop tests require a graphical session and use temporary data directories and a local HTTP fixture. Test captures go into the git-ignored artifacts/ directory. README screenshots contain the original demo, not personal books.
