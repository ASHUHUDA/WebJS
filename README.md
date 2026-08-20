# WebJS

WebJS 是 ASHUHUDA 维护的多 userscript 仓库。每个脚本使用编号目录独立保存源码、测试、文档、许可和可安装产物。

## 脚本索引

| 编号 | 脚本 | 版本 | 支持平台 | 安装 | 源码 |
| --- | --- | --- | --- | --- | --- |
| 01 | 云盘重命名助手 | 2.0.0 | 115网盘、123云盘、阿里云盘、百度网盘、移动云盘、天翼云盘、夸克云盘、UC网盘 | [安装 userscript](https://raw.githubusercontent.com/ASHUHUDA/WebJS/main/01-%E4%BA%91%E7%9B%98%E9%87%8D%E5%91%BD%E5%90%8D/dist/cloud-drive-renamer.user.js) | [01-云盘重命名](./01-云盘重命名/) |

## 许可与来源

根目录 [LICENSE](./LICENSE) 适用于 ASHUHUDA 在仓库级新增的原创内容。脚本子目录存在独立许可时，以子目录许可为准。

“云盘重命名助手”基于 [a1mersnow/drive-rename](https://github.com/a1mersnow/drive-rename) `1.4.9` 继续开发；上游 MIT 许可和版权声明保留在脚本目录的 [LICENSE](./01-云盘重命名/LICENSE) 中。

## 仓库约定

- 新脚本使用 `NN-中文短名` 目录。
- 可安装产物提交到各脚本的 `dist/`，源码不以 dist 为人工维护入口。
- Node.js 固定为 22，pnpm 固定为 9.15.4。
- 问题与建议统一提交到 [Issues](https://github.com/ASHUHUDA/WebJS/issues)。
