# 上班摸鱼神器 · Office Escape

[English](README.en.md) | 简体中文

一个开源的透明桌面阅读器：把 TXT、EPUB、PDF 和网页放进小窗，用鼠标就能移动、设置和隐藏。支持 **Windows / macOS**，界面可随时切换 **中文 / English**。

![中文界面](docs/images/home-zh.png)

## 下载

前往 **[Releases 下载发布版](https://github.com/wieyisan/shangban-moyu-shenqi/releases/latest)**。

| 平台 | 文件 | 启动方式 |
| --- | --- | --- |
| Windows 10 / 11 x64 | `OfficeEscape-1.3.0-Windows-x64.zip` | 完整解压，双击 `OfficeEscape.exe` |
| macOS Apple 芯片 | `OfficeEscape-1.3.0-macOS-arm64.zip` | 解压，打开 `OfficeEscape.app` |

免安装，无需 Node.js。请保留压缩包内全部文件。Windows 测试包未商业签名；Mac 使用 ad-hoc 签名，未 Apple 公证。Mac 已通过桌面回归测试，Windows 尚未真机完整验收。

- [Windows 中文使用说明](docs/Windows使用说明.md)
- [English user guide](docs/USER_GUIDE.en.md)
- [测试范围与已知限制](VALIDATION.md)

## 能做什么

- **透明阅读**：背景透明、文字颜色与字号可调，支持置顶。
- **鼠标浮栏**：移到窗口上沿出现「拖动 / 设置 / 展开 / 隐藏」；移回正文约 0.4 秒后收起。
- **Word 贴合**：一键切换为只显示正文的 460 × 300 小窗，不会修改下层文档。
- **随时隐藏**：鼠标移出自动隐藏、托盘恢复、可自定义老板键。
- **本地阅读**：TXT / EPUB 目录、章节跳转和进度保存，PDF 内置阅读器。
- **轻量浏览**：网址访问、前进后退、收藏、登录会话保存。
- **双语界面**：右上角选择「中文」或「English」，语言设置自动保存。

## 鼠标操作优先

1. 导入书籍，打开「阅读设置」→「Word 贴合：只留正文」。
2. 把鼠标移到窗口顶部约 28px 区域，浮栏自动出现。
3. 按住「拖动」移动窗口，点击「设置」修改配置。
4. 移回正文，浮栏自动消失，恢复无边框透明阅读。

右键正文和系统托盘也能唤回设置，不必记住快捷键。

| 备用快捷键 | 操作 |
| --- | --- |
| `Alt+Z` | 隐藏 / 恢复窗口 |
| `Alt+R` | 显示 / 收起阅读工具栏 |
| `Alt+X` | 完全退出 |
| `Esc` | 本地透明阅读中切换工具栏 |

Mac 上 Alt 对应 Option。若窗口太淡或找不到，请在托盘菜单选择「恢复不透明窗口」。

## 格式与限制

- TXT 支持 UTF-8、带 BOM 的 UTF-16、GB18030，按常见中英文章节标题分章。
- EPUB 按 spine 顺序提取纯文字；不保留复杂排版和插图，不支持 DRM。
- PDF 使用 Chromium 阅读器；不支持应用层阅读进度保存、文本背景去除和自动滚动。
- 暂不支持 MOBI / AZW3。单文件上限 50 MB，EPUB 解压后上限 100 MB。
- 网页画布、iframe、DRM 媒体和独立登录弹窗可能不兼容；不保证所有网站透明化或自动滚动有效。
- 语言切换只翻译软件界面，不翻译用户书籍或第三方网页。

## 本地数据与隐私

书籍副本、进度、设置和收藏保存在 Electron userData 下，不上传到云端。Windows 默认数据目录为 `%APPDATA%\qingyu-reader`；保留旧目录名以兼容早期版本。

访问网站时，网站按其自身规则处理网络请求和登录信息。应用默认拒绝摄像头、麦克风和位置等网站权限。删除书架条目不会删除原始文件。

## 开发

需要 Node.js 22+ 和 pnpm 11.19.0：

```sh
git clone https://github.com/wieyisan/shangban-moyu-shenqi.git
cd shangban-moyu-shenqi
pnpm install --frozen-lockfile
pnpm start
```

```sh
pnpm test           # 核心解析与网址校验
pnpm test:desktop   # 需要图形桌面环境
pnpm dist:win       # Windows x64 ZIP
pnpm dist:mac       # macOS Apple 芯片 ZIP
```

产物位于 `release/`。GitHub Actions 提供自动测试和双平台打包。

## 贡献

欢迎通过 [Issues](https://github.com/wieyisan/shangban-moyu-shenqi/issues) 反馈。请提供系统版本、应用版本和复现步骤；不要上传私密文档、账号凭据或受版权限制的整本书。开发规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 致谢与许可证

最初参考墨鱼阅读的公开功能，后续参考 Thief、Reader 的透明阅读交互与 Electron 官方窗口文档。实现独立编写，不包含这些产品的源码或图标。具体参考见 [RESEARCH.md](RESEARCH.md)。

采用 **[MIT License](LICENSE)**。依赖组件保留各自的许可证。此项目原名「轻屿 / Qingyu」，旧的数据目录和应用 ID 保留以兼容升级。
