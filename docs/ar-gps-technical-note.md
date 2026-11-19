# GPS 式地点泡泡 AR 技术调研

调研日期：2026-11-19  
范围：为 Soundscape 的“附近回声 + 摄像头捕捉泡泡”原型选择定位与 AR 锚点路线。本文记录官方平台能力及建议，不代表 GPS AR 已接入。

## 结论

把“找到附近声音”和“把泡泡稳定放进真实场景”作为两层能力：

1. **附近发现：GPS / Geolocation。** 用坐标计算附近回声、距离和大致方向；把定位精度作为 UI 状态。工程推断：GPS 的精度圈可能大于相邻泡泡间距，所以不要仅凭 GPS 把泡泡画成稳定的实体空间锚点。
2. **场景锚定：平台 AR 地理锚点。** iOS 用 ARKit 地理追踪与 `ARGeoAnchor`；Android 用 ARCore Geospatial API。它们会结合设备传感器、GPS 与视觉定位信息。覆盖或设备检查失败时，回退到附近列表/雷达式界面。

对于现有 Vite/React 网页，浏览器地理定位只提供设备坐标，不会自动让网页中的泡泡固定到真实地点。更新后的网页原型另加入了 Android WebXR 平面追踪：在兼容设备上可以将泡泡放进现实表面并保持会话内空间锚定；这不等于 GPS 地理锚点。

## 平台路线

### iOS：ARKit Geo Tracking

- `ARGeoTrackingConfiguration` 创建指定经纬度和可选海拔的 `ARGeoAnchor`，将地理坐标映射到 ARKit 的本地空间。
- 启动前检查设备支持与当前位置覆盖；覆盖取决于 Apple 的定位影像，不能假设所有公园、校园或步行小路都可用。
- Apple 文档注明该能力面向室外，需要网络下载定位影像；影像主要来自公共街道和可驾车到达的路线，封闭区域或仅行人可达地点可能没有覆盖。
- 所以在 iPhone 展示场地要预先跑一次 availability 检查，并准备不依赖空间锚定的附近声音列表作为降级体验。

### Android：ARCore Geospatial API

- Geospatial API 使用设备传感器、GPS 和 Google VPS 计算地理姿态，可用 WGS84 坐标创建地理锚点；Terrain 锚点适合“贴近地面”的内容。
- 运行时需确认设备/会话支持，并在依赖 VPS 的场地检查 VPS availability。Google 文档说明，在 VPS 不可用但户外 GPS 条件良好时，仍可尝试地理定位；实际体验需在目标设备和场地测量。
- iOS 与 Android 的定位影像覆盖不同，应分别检查，不能因为一端可用就假定另一端也可用。

## 建议的实现顺序

### 1. 近期网页原型

- 用户点“开启漫游”后再请求定位权限，明确说明定位用于发现附近回声。
- 获取坐标与 `accuracy`，用 WGS84 球面距离排序附近泡泡；把精度显示成可理解的状态，例如“定位较准 / 正在寻找更准的位置”。
- 用精度半径筛选可确认的近场目标；阈值做成可调参数，在真实场地测试后再定。
- WebXR 兼容设备用 hit-test 做会话内的真实平面放置；不兼容设备显示相机/照片预览并明确降级。两者都不把 GPS 读数说成稳定的场景锚点。
- 实际 GPS 泡泡仍需要声音数据包含坐标，并需定义分享半径、精度与过期规则。
  
### 2. iPhone 竖向切片

1. 在目标展示地点检查 ARKit Geo Tracking 可用性。
2. 成功时启动 AR 会话，放置 2–3 个测试 `ARGeoAnchor`；为地面目标使用经现场确认的高度/地面策略。
3. 将泡泡的选择、放大、捕捉光流和 Liquid Glass 评论卡接到锚点状态。
4. 用“定位中 / 场地不支持 / 网络不可用 / 可捕捉”表达真实会话状态；不可用时回到附近回声列表，不显示假锁定效果。

### 3. Android 或双端

用 ARCore Geospatial 做同一批测试点，并分别核对设备支持与 VPS 状态。若产品要同时面向 iOS/Android，保留统一的回声数据和交互层，但地理锚点、覆盖检查与降级状态需由各平台原生实现负责。

## 数据与隐私边界

- 只在用户主动进入漫游时请求位置；附近发现所需的坐标应尽量只在设备端用于筛选。
- 发布声音时单独说明是否附加地点；提供不公开精确坐标的选择。精确地点可能暴露录音者的常去地点，应允许撤回或删除。
- 保存经纬度的精度、分享半径和过期策略要在服务端与产品规则确定后再实现，本轮不假设现有网页数据结构就是最终协议。

## 验收检查

- 目标机型、系统版本、网络和展示地点均列入现场检查表。
- 先验证地理追踪 availability/VPS availability，再验证泡泡是否稳定跟随锚点；不能只看摄像头是否成功打开。
- 在不支持或精度不足时，仍能看到附近回声、距离和评论；泡泡捕捉流程要有清楚的降级反馈。
- 分别记录定位误差、锚点抖动、首次定位耗时、重新定位耗时和耗电情况。

## 官方资料

- [Apple ARGeoTrackingConfiguration](https://developer.apple.com/documentation/ARKit/ARGeoTrackingConfiguration)
- [Apple：Tracking geographic locations in AR](https://developer.apple.com/documentation/arkit/tracking-geographic-locations-in-ar)
- [Apple ARGeoAnchor](https://developer.apple.com/documentation/arkit/argeoanchor)
- [Google：Build location-based AR experiences with the ARCore Geospatial API](https://developers.google.com/ar/develop/geospatial)
- [Google：Check VPS availability](https://developers.google.com/ar/develop/c/geospatial/check-vps-availability)
- [W3C Geolocation specification](https://www.w3.org/TR/geolocation/)

W3C Geolocation 定义的 `accuracy` 是以米为单位的 68% 置信精度值，并且获取位置需要用户明确授权。它适合做附近筛选和质量提示；是否足以满足某个泡泡的空间锚定，需要结合目标点间距与现场定位实测判断。


## 网页原型已接入的定位能力

本轮网页端在用户进入漫游页时请求浏览器定位，并用高精度 watch 获取一次位置读数；精度达到 60 米以内即停止持续监听，超时 15 秒也会结束监听。界面显示浏览器报告的精度，并覆盖未授权、不可用、精度较粗等状态。坐标只保留在当前页面内存中，不写入本地存储，也不上传。

当前示例声音泡泡的数据没有经纬度字段，因此网页还不能按真实距离筛选或排序这些泡泡。WebXR 平面锚定仅在当前 AR 会话内定位，不能把泡泡固定到录音时的 GPS 地点；完成“附近回声”仍需给可发布声音定义经纬度与分享精度策略，跨旅程地理复现需接入 ARKit Geo Tracking / ARCore Geospatial。

视觉识别方案也核对过：MindAR 官方项目面向图片目标与人脸追踪，适合“对准海报/印刷图像出现泡泡”的固定图像锚点；它不能替代开放街区的语义识别或地理锚定，所以这轮先不把它加进网页漫游链路。若后续展览点位能放置专属图像标记，再单独评估 MindAR 图片锚点。

### p5.brush 进度条

漫游 loading 的胶囊进度条现用 p5.brush standalone 构建绘制纹理液面与轻微起伏，并在不支持 WebGL2 时回退到 Canvas 2D 液体绘制。该 standalone 构建不依赖 p5.js，但要求浏览器支持 WebGL2；其代码按 MIT 许可随仓库提供，见 `src/vendor/p5-brush/LICENSE.md`。

- [p5.brush standalone 文档](https://github.com/acamposuribe/p5.brush/blob/main/docs/standalone.md)
- [MindAR 官方项目](https://github.com/hiukim/mind-ar-js)

## WebXR 平面 AR 原型实现（2026-11-19 更新）

本轮已在浏览器漫游页加入设备能力探测和空间 AR 入口。支持 immersive AR 的 Android Chrome/ARCore 设备会请求 `hit-test`，用户移动手机扫描真实环境，准星命中地面、桌面或墙面后轻点放置泡泡组。泡泡以 Three.js 虹彩 Fresnel 材质、异形挤出贴纸轮廓和轻量轨道构成；支持的会话会尝试创建 WebXR Anchor，并按锚点姿态持续更新。轻点泡泡触发捕捉，长按显示留言，缩放按钮调整泡泡组大小。

这条路线不需要海报或图片标记，也不把 GPS 坐标直接当作相机空间坐标。浏览器 GPS 仍只用于附近发现状态；示例回声还没有真实经纬度，因此当前网页不能按地理位置复现公共泡泡。浏览器不支持 WebXR AR 时保留相机预览并显示明确说明；iOS 地理空间体验需要后续原生 ARKit 工程。空间贴纸与触摸特效属于渲染动画，真正的平面命中与跟踪依赖设备/浏览器运行时。

### 设备与技术边界

- Google 的 WebXR Android 路径需要 immersive AR 会话与 hit-test；本原型按该接口请求会话和表面命中。参见 [Google WebXR AR 指南](https://developers.google.com/ar/develop/webxr/hello-webxr) 与 [WebXR hit-test 说明](https://github.com/immersive-web/hit-test/blob/main/hit-testing-explainer.md)。
- WebXR 兼容性依赖 Android 设备、Chrome、ARCore 服务与安全上下文；此原型没有现场 Android 设备验证，因此仓库能力标注为已实现代码路径，物理设备验收仍待完成。
- 当前 iPhone 网页端不保证提供稳定的 immersive WebXR AR；本原型会按运行时能力检测并降级为相机预览。GPS 点位空间复现应采用原生 ARKit Geo Tracking，且需检查目标场地是否覆盖；Android 原生 GPS 锚点可评估 ARCore Geospatial / VPS。
- WebXR 平面锚定只保证会话内的本地空间定位语义；它不会让声音在之后的旅程中自动固定到同一个 GPS 坐标。
- 当前泡泡数据只有示例标题、声音类型和距离展示值，没有实际坐标。附近发现与场景锚定仍应按两层系统开发：GPS/VPS/Geo Tracking 决定“附近哪些声音”，WebXR hit-test 决定“泡泡贴在眼前哪片表面”。

官方资料：[Google WebXR AR](https://developers.google.com/ar/develop/webxr/hello-webxr)、[Google WebXR 与 ARCore 比较](https://developers.google.com/ar/develop/webxr/arcore-comparison)、[Immersive Web hit-test](https://github.com/immersive-web/hit-test/blob/main/hit-testing-explainer.md)、[Apple ARGeoTrackingConfiguration](https://developer.apple.com/documentation/arkit/argeotrackingconfiguration)、[Apple 地理位置 AR](https://developer.apple.com/documentation/arkit/tracking-geographic-locations-in-ar)。
