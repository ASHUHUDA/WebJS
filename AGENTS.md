# WebJS 项目协作说明

## 目标与成功标准

- 维护一个编号目录组织的多 userscript 仓库。
- 每个脚本都能从源码复现提交的 `.user.js` / `.meta.js`，并通过其声明的验证命令。
- 不破坏已支持站点的 API、认证、分页、请求头、并发和延时契约。

## 可改与禁改范围

- 可改：脚本源码、局部测试、文档、构建配置、对应 dist 和根级自动化。
- 默认禁改：网盘 API URL、认证令牌来源、请求签名、分页协议、Provider 容器选择器和 match 域名。
- 需要改禁改项时，先说明平台证据、兼容风险和回滚方法并获得确认。
- `.omx/`、依赖目录、测试截图和临时日志不得提交。

## 目录与命名

- 脚本目录：`NN-中文短名`，编号两位并按加入顺序递增。
- 每个脚本至少包含 `README.md`、`LICENSE`、源码、测试和 `dist/`。
- userscript 产物使用稳定英文文件名；源码文件遵循脚本自身的 TypeScript/Vue 约定。
- 文件超过 700 行时先评估拆分，避免继续堆叠职责。

## 验证命令

在 `01-云盘重命名` 中执行：

```powershell
corepack.cmd pnpm install --frozen-lockfile
corepack.cmd pnpm run lint
corepack.cmd pnpm run typecheck
corepack.cmd pnpm test
corepack.cmd pnpm run test:e2e
corepack.cmd pnpm run build
corepack.cmd pnpm run test:dist
node --check dist/cloud-drive-renamer.user.js
node --check dist/cloud-drive-renamer.meta.js
```

## 业务术语

- Provider：单个云盘平台的容器发现、文件列表和重命名适配器。
- 入口目标：插入宿主工具栏、仅承载入口按钮的 DOM 节点。
- 工作区：挂在 `body` 下的公共控制/预览弹层。
- 完整目录冲突：目标名与任一当前目录条目名称相同，包括未选条目和互换名称。
- dist 回归：对最终 userscript metadata、依赖、隔离和体积做的构建后检查。

## 风险操作

- 真实网盘重命名、API 调试、生产配置、权限、密钥、远端推送、标签和 Release 都需明确授权。
- 禁止提交 token、Cookie、API Key、`.env` 或真实用户文件列表。
- 回滚已推送变更使用 `git revert`，不改写共享分支历史。

## 交付偏好

- 优先最小改动并保留上游归属；不要手工修补 dist 代替修改源码。
- 功能变更先跑最小验证，再跑完整链路和代码审查。
- 每次可发布脚本更新必须同步更新版本号、根 README、脚本 README、dist metadata/user.js 和对应测试。
- 关键行为变化同步更新本文件、根 README 和脚本 README；使用绝对日期记录版本事实。
- 本地开发可使用 mock Provider；六个平台真人验证必须明确标为人工抽查，不能用 mock 结果替代。
