# 制作过程球形画廊交互执行计划

**目标：**完善 MEMO Garden 制作过程页的滚轮分层选择、球体自转、素材随机展示、视频兼容性、手账文案和按钮统一。

**设计依据：**[`docs/superpowers/specs/2026-11-24-making-of-gallery-interaction-design.md`](../specs/2026-11-24-making-of-gallery-interaction-design.md)

## 修改范围

- `src/components/making-of/MakingOfPage.jsx`
- `src/components/making-of/MakingOfPage.css`
- `src/components/making-of/media.js`
- `public/making-of/media/` 中新增或转换后的项目素材
- `docs/demo-scope.md` 若项目素材说明需要同步

不修改其他功能或页面，不提交、不推送。

## 步骤

1. 读取并确认六段附件视频的编码及浏览器解码能力；若 HEVC 无法解码，将画廊引用的 HEVC 编码视频转为 H.264、`yuv420p`、fast-start MP4，保留同内容封面；将缺失视频和补充照片加入素材目录与索引。
2. 修改画廊状态：初始化阶段素材随机顺序；不重复填充空位；球体自转；球内滚轮逐步选择阶段并施加轻惯性；同步高亮阶段和球面素材，减少其他阶段的颜色与亮度；阶段按钮切换时清除旧素材详情。
3. 修改媒体交互：播放时展示浏览器原生控件；捕获 `play()`、`error` 和不支持格式状态并显示；保持播放状态随焦点离开而释放。
4. 替换左侧标题和文案为小志已有日记文字；制作页按钮复用 `.zine-glass-button`，整理滚轮、自转和拖拽提示，维持小屏布局与减少动态效果支持。
5. 验证本地预览中的阶段滚轮、自动旋转、素材随机及分页、补充视频播放、视频错误提示和页面构建；复查变更仅落在允许范围。

## 验收记录

- 每项验证记录真实命令或浏览器观察结果，不以代码静态检查代替媒体播放检查。
- 交付列出文件、视频编码原因与处理结果、交互行为、构建/验证结果和本地预览入口。
