# 泡泡与动效开源参考

这些仓库作为交互、材质和物理表现的研究参考；本 Demo 使用自己的轻量实现，没有直接复制其源代码。

| 项目 | 授权 / 实现 | 可借鉴点 | 与本 Demo 的关系 |
| --- | --- | --- | --- |
| [basmilius/sparkle](https://github.com/basmilius/sparkle) | MIT；Canvas 气泡动效 | 气泡上浮、点击破裂的反馈时机 | 可参考交互节奏。仓库当前要求 Node.js 23+，本项目最低 Node 20.19，因此不直接安装。 |
| [jeromeetienne/threex.bubble](https://github.com/jeromeetienne/threex.bubble) | MIT；Three.js Fresnel 泡泡材质扩展 | Fresnel 边缘高光、透明球面的空间感 | 作为 3D 材质灵感；其代码年代较早，需适配当前 Three.js。 |
| [ozlphrt/bubble-project](https://github.com/ozlphrt/bubble-project) | MIT；粒子与泡沫模拟 | 泡沫之间的聚合、表面张力感 | 物理范围较大，适合作为未来真实吹泡泡特效的研究，不适合首页交互泡泡。 |
| [pjt222/soap_bubble_simulation](https://github.com/pjt222/soap_bubble_simulation) | MIT；Rust + wgpu 薄膜干涉模拟 | 肥皂膜颜色随薄膜厚度变化 | 研究级模拟，当前 Web 原型不引入 Rust/wgpu。 |
| [GSAP 官方文档](https://gsap.com/docs/v3/GSAP/) | GSAP 3 动画 API | Timeline 连续动效、弹层与气泡反馈 | 当前网页交互使用 GSAP 3.15.1。 |

## 当前采用

- DOM 泡泡用 CSS 薄虹彩边缘、透明内层高光和 GSAP 挤压/破裂/回弹组合，保持移动端轻量和按钮可访问性。
- 装置展示直接使用本次提供的 STL 外形，Three.js 负责 PBR 材质、环境反射、设备冒泡动画和轨道控制。材质分区根据网格壳体推定，仍是概念演示效果。
- GSAP 时间线负责连续破裂和弹层动效；Gallery 类型筛选采用轻量布局更新。

新增第三方代码前，需再次核实版本、Node 支持范围、许可证和维护状态，并在仓库中记录来源。

