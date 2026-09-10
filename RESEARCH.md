# 1.1.0 透明阅读修复：参考依据

查询日期：2026-09-10。星数来自当次 GitHub API 返回，后续可能变化。参考公开行为和平台 API，未复制第三方阅读器源码。

| 项目 | 当次星数 | 采用的思路 |
| --- | ---: | --- |
| [cteamx/Thief](https://github.com/cteamx/Thief) | 6,118 | 桌面阅读窗口无边框、透明、无原生阴影；工具控制与正文呈现分离 |
| [binbyu/Reader](https://github.com/binbyu/Reader) | 5,079 | 背景全透明与字体可读性分离；隐藏边框，保留纯阅读内容 |

Thief 的 [src/main/index.js](https://github.com/cteamx/Thief/blob/master/src/main/index.js) 中，desktopWindow 构造明确设置 `frame: false`、`transparent: true`、`hasShadow: false`（当次文件 363–375 行）。这是本次原生窗口修复的直接参考。旧仓库 Thief-Book 已迁移，未误把旧仓库的 66 星作为当前项目热度。

Reader 的 [README](https://github.com/binbyu/Reader#readme) 在 v1.7.0.0 更新记录中明确描述：支持窗口背景全透明而字体不透明，并要求隐藏边框或全屏模式。Reader 使用 Win32 实现，不将其视为 macOS 技术兼容性证明。

## 残影判断

用户截图中的淡色旧文字轮廓，与透明窗口原生阴影缓存没有随正文及时更新的现象吻合。原版本 BrowserWindow 未设置 hasShadow，默认为 true。

- [Electron：invalidateShadow / setHasShadow](https://www.electronjs.org/docs/latest/api/base-window#wininvalidateshadow-macos) 明确记录透明窗口在 macOS 上可能留下视觉残影。
- [Electron issue #21173](https://github.com/electron/electron/issues/21173) 描述透明无边框窗口内容更新后残留旧文字轮廓的案例。
- [Apple NSWindow.hasShadow](https://developer.apple.com/documentation/appkit/nswindow/hasshadow) 说明该属性控制原生阴影。

因此直接禁用原生阴影，避免生成旧字形阴影；不靠循环刷新、不周期性重建窗口，也不全局关闭 GPU 加速。

## 对应改动

1. 窗口创建及恢复时确保原生阴影关闭。
2. 透明模式移除应用外边框、圆角、分隔线；纯正文状态收起全部工具栏、标题、章节装饰、进度条、滚动条。
3. 增加 Word 贴合预设：460×300 小窗、16px 深灰正文、100% 内容不透明度、背景透明、置顶。
4. Esc / Alt+R 切换工具栏；右键菜单与系统托盘也可恢复。顶部 10px 透明区域保留拖动功能。
5. 鼠标移出调用原生 hide，移回通过保留的窗口坐标检测并 showInactive，不抢 Word 键盘焦点。手动恢复给出短暂宽限，方便移回窗口。
6. 增加像素级回归：透明边缘、滚动往返画面一致、清空正文后 alpha 全零；另验证原生窗口隐藏和恢复状态。

测试图像能检查应用渲染像素，不能单独证明所有 macOS 桌面合成情境。原生阴影关闭同时有 API 状态验证；仍建议在用户的 Word 和多显示器环境中复测连续滚动。
