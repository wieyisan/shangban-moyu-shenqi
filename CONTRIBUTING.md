# Contributing / 参与贡献

English and Chinese issues and pull requests are welcome. 欢迎中英文反馈和贡献。

1. Fork the repository and create a branch. Fork 仓库后新建开发分支。
2. Use Node.js 22+ and pnpm 11.19.0; install with `pnpm install --frozen-lockfile`.
3. Run `pnpm test`. For UI changes, run `pnpm test:desktop` in a graphical desktop session.
4. Describe the problem, final behavior, and validation. 说明问题、修改后的行为和验证方式。

Keep external websites sandboxed and do not expose the app's IPC bridge to them. Preserve transparent-window recovery paths, including mouse access and the system tray. Add translations for both UI languages when changing labels.

不要提交书籍、登录数据、令牌、`.env`、`node_modules`、测试缓存或安装包。Do not commit personal books, login data, tokens, environment files, dependencies, test caches, or build archives. Release binaries belong in GitHub Releases.

Please use a short, original or public-domain sample when reporting parser bugs. 报告解析问题请使用简短的原创或公版样例。

Contributions are distributed under this repository's MIT license. 贡献按本仓库 MIT 许可证发布。
