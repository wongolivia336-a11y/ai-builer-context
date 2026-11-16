# 参与方式

欢迎一起完善声景漫游的体验、交互和代码。小步提交，先对齐体验目标，再扩展实现。

## 提交建议

1. 先在 GitHub Issues 描述问题、使用场景和希望的体验；视觉改动附参考图或草图。
2. Fork 仓库，基于 `main` 创建一个聚焦的分支，例如 `feat/bubble-detail`、`fix/roam-zoom` 或 `design/recording-flow`。
3. 本地运行 `npm install` 和 `npm run dev`，完成修改后执行 `npm run build`。
4. 提交 Pull Request 到本仓库的 `main`，写清目的、交互变化、验证结果；UI 修改附前后截图或短录屏。
5. 等维护者 review 和合并。仓库所有者可在 GitHub Collaborators 设置里给需要直接 push 的成员开权限。

## 提交内容注意事项

- 一次 PR 尽量只处理一个体验问题或一个功能闭环。
- 不要把 ARKit、GPS、ESP32、录音、声纹处理或吹泡泡模拟写成已经接入的真实能力。
- 不提交真实个人录音、未获授权的第三方声音、密钥、`.env`、`node_modules/` 或 `dist/`。
- 新增素材请确认来源和授权；必要时在 PR 中附来源说明。
- 涉及主流程的变更同时检查 README、`docs/product-context.md` 和 `docs/demo-scope.md` 是否仍然准确。
