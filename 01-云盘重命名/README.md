# 云盘重命名助手

云盘重命名助手是在网页端批量预览并重命名当前云盘目录条目的 userscript。当前 WebJS 版本为 `2.0.0`，支持 123云盘、阿里云盘、百度网盘、移动云盘、天翼云盘和夸克云盘。

## 安装

1. 安装支持 userscript 的浏览器管理器，例如 Tampermonkey 或 Violentmonkey。
2. 打开 [cloud-drive-renamer.user.js](https://raw.githubusercontent.com/ASHUHUDA/WebJS/main/01-%E4%BA%91%E7%9B%98%E9%87%8D%E5%91%BD/dist/cloud-drive-renamer.user.js)。
3. 在管理器确认安装。后续更新通过体积更小的 `cloud-drive-renamer.meta.js` 检查。

部分 Chrome 环境可能要求在“扩展程序 -> 管理扩展程序”中启用开发者模式。

## 使用

进入受支持云盘的文件目录后，点击宿主工具栏中的“重命名”入口。桌面端工作区显示左侧控制和右侧预览；窄于 900px 时使用“控制 / 预览”分段切换。

运行前必须处理列表错误、正则错误、危险名称和名称冲突。任务运行时模式、输入、选择和关闭操作会锁定，防止批次目标发生变化。

### 剧集模式

剧集模式从文件名提取季和集数，并生成 `剧名.S01E001.ext` 形式的名称。可以设置：

- 是否包含字幕文件。
- 剧名和季。
- 集数偏移及集数位数。
- 集数前后辅助文本，用于排除分辨率、编码版本等无关数字。

### 正则模式

“查找表达式”支持两种写法：

```text
draft
/draft/gi
```

替换规则使用 JavaScript `String.prototype.replace` 语义，支持空替换、`$1` 等编号捕获组、`$<name>` 命名捕获组和合法 flags。斜杠表达式中的转义斜杠与字符类可正常解析。非法表达式会显示错误，不会生成空名称。

最终名称不能是空白、`.`、`..`，也不能包含 `/`、`\`、空字符或换行。冲突检查覆盖选中条目间的重复目标，以及当前完整目录中已存在的占用者。

## 本地开发

环境要求：Node.js 22、pnpm 9.15.4。

```powershell
corepack.cmd pnpm install --frozen-lockfile
corepack.cmd pnpm run dev
```

开发页使用 mock Provider 和示例文件，不访问真实网盘 API。可用查询参数查看状态：

- `?state=loading`
- `?state=error`
- `?state=conflict`

完整验证：

```powershell
corepack.cmd pnpm run lint
corepack.cmd pnpm run typecheck
corepack.cmd pnpm test
corepack.cmd pnpm run test:e2e
corepack.cmd pnpm run build
corepack.cmd pnpm run test:dist
node --check dist/cloud-drive-renamer.user.js
node --check dist/cloud-drive-renamer.meta.js
```

## 2.0.0 变更

- 将旧 dist 中的正则、名称校验、完整目录冲突、预览失效和运行快照修复回迁到 TypeScript 源码。
- 应用只挂载一次；工具栏仅保留入口目标，工作区固定在视口层。
- 增加桌面双栏和窄屏分段视图、关闭按钮、运行锁定与列表错误状态。
- UnoCSS 改用 `vue-scoped` 隔离，移除全局 reset、WebFonts、dayjs 和冗余动画。
- 更新检查改用 GitHub Raw `.meta.js`，并增加 Vitest、Provider DOM、Playwright 和 dist 回归测试。
- 增加六个平台最终 user.js 启动回归，防止开发 mock 掩盖 Provider 解析或产物注入问题。

## 来源与许可

本项目基于 [a1mersnow/drive-rename](https://github.com/a1mersnow/drive-rename) `1.4.4` 继续开发。上游作者为 a1mersnow，上游代码采用 MIT License；原版权和完整许可文本保留在本目录 [LICENSE](./LICENSE) 中。

2026-07-15 起的 WebJS 维护与新增内容由 ASHUHUDA 提供。使用本目录代码时，以本目录 MIT 许可和保留的上游版权声明为准。
