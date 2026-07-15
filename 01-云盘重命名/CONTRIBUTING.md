# 参与开发

## 准备环境

使用 Node.js 22 和仓库声明的 pnpm 9.15.4：

```powershell
corepack.cmd pnpm install --frozen-lockfile
corepack.cmd pnpm run dev
```

开发首页通过 mock Provider 展示界面，不需要登录真实网盘。

## 修改 Provider

Provider 位于 `src/providers/`。新增或修改平台适配前，需要确认：

- 入口容器和显示 URL。
- 文件列表触发时机及串行分页退出条件。
- API、认证来源、请求头和重命名并发/延时。
- 宿主重渲染后入口仍唯一。

不得在源码、测试或日志中保存真实 token、Cookie 或用户文件名。

## 提交前验证

按 [README](./README.md#本地开发) 的完整验证顺序执行。真实平台抽查是额外的人工验证，不能替代 mock、单元和构建产物回归测试。
