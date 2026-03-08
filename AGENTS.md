# Repository Guidelines

## 项目结构与模块组织
本仓库是一个基于 TypeScript 的命令行实时分析工具。核心代码位于 `src/`：`src/index.ts` 是入口，`src/settings.ts` 管理运行配置；`src/cli/` 负责终端界面组件；`src/data/` 处理 Binance、Polymarket 与记录逻辑；`src/poly-client/` 和 `src/poly-event/` 封装市场接入；`src/lib/` 放通用工具。界面截图存放在 `screenshots/`。编译输出默认写入 `dist/`，打包产物写入 `release/`，不要手动提交这两个目录。

## 构建、测试与开发命令
- `yarn ci`：按锁文件安装依赖，适合 CI 和首次校验环境。
- `yarn dev`：使用 `tsx` 直接运行 `src/index.ts`，用于本地开发。
- `yarn build`：执行 `tsc`，将源码编译到 `dist/`。
- `yarn start`：运行已编译的 `dist/index.js`。
- `yarn lint`：运行 ESLint 检查整个仓库。
- `npx pkg .`：按 `package.json` 中的 `pkg` 配置生成可执行文件。

## 代码风格与命名约定
遵循 `.editorconfig`：UTF-8、LF、2 空格缩进、文件末尾保留换行。Prettier 配置要求保留分号、使用双引号、尾随逗号，并将行宽控制在 100 字符内。优先使用 `camelCase` 命名变量与函数，类型、类和组件使用 `PascalCase`，工具文件采用短横线命名，如 `safe-parse.ts`。提交前至少运行 `yarn lint` 与 `yarn build`。

## 测试指南
当前仓库未配置独立测试框架，也没有 `tests/` 目录。提交功能修改时，至少执行 `yarn lint` 和 `yarn build` 作为基本验证；若新增复杂逻辑，优先在对应模块旁增加轻量、可复现的验证代码，并在 PR 描述中写明手动验证步骤，例如“连接 BTC 5 分钟市场并观察 CLI 更新”。

## 提交与 Pull Request 规范
最近提交以简短、单一目的的说明为主，如 `ignore dist`、`add screenshot`、`document about price to beat limition`。建议继续使用这种风格：一句话说明一次改动，使用祈使语气，避免混入无关修改。PR 应包含：变更摘要、影响模块、验证命令、相关 issue；若修改 CLI 展示或市场配置，附上截图或示例输出，并注明是否涉及 `src/settings.ts` 的默认值调整。

## 配置与安全提示
本项目连接外部市场与交易流，仅用于研究分析，不应在代码中硬编码密钥、令牌或私有端点。修改市场、周期或快照行为时，请集中更新 `src/settings.ts`，并在说明中明确默认值变化，避免影响他人复现。
