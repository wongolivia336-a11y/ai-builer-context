# GPS 式地点泡泡 AR 技术调研

调研日期：2026-11-19  
范围：为 Soundscape 的“附近回声 + 摄像头捕捉泡泡”原型选择定位与 AR 锚点路线。本文记录官方平台能力及建议，不代表 GPS AR 已接入。

## 结论

把“找到附近声音”和“把泡泡稳定放进真实场景”作为两层能力：

1. **附近发现：GPS / Geolocation。** 用坐标计算附近回声、距离和大致方向；把定位精度作为 UI 状态。工程推断：GPS 的精度圈可能大于相邻泡泡间距，所以不要仅凭 GPS 把泡泡画成稳定的实体空间锚点。
2. **场景锚定：平台 AR 地理锚点。** iOS 用 ARKit 地理追踪与 `ARGeoAnchor`；Android 用 ARCore Geospatial API。它们会结合设备传感器、GPS 与视觉定位信息。覆盖或设备检查失败时，回退到附近列表/雷达式界面。

对于现有 Vite/React 网页，适合先做“真实定位的附近发现 + 摄像头交互演示”；据 W3C Geolocation 接口定义作出的实现判断：浏览器地理定位只提供设备坐标，不会自动让网页中的泡泡固定在真实地点。现有网页里的泡泡锚点仍是屏幕坐标演示，不能作为 GPS AR 验收。

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
- 摄像头中的泡泡继续明确作为“AR 交互预览”显示。未接入 AR 地理追踪前，不宣称泡泡已锁定到真实墙面、地面或 GPS 点。

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

当前示例声音泡泡的数据没有经纬度字段，因此网页还不能按真实距离筛选或排序这些泡泡。取景画面里的泡泡仍是屏幕坐标的视觉演示，文案已明确标记；此版本不会把 GPS 读数误当作稳定的空间锚点。要完成“附近回声”，下一步需给可发布回声定义经纬度与分享精度策略；要将泡泡固定在现实街景中，则需接入 ARKit Geo Tracking / ARCore Geospatial 原生会话。

视觉识别方案也核对过：MindAR 官方项目面向图片目标与人脸追踪，适合“对准海报/印刷图像出现泡泡”的固定图像锚点；它不能替代开放街区的语义识别或地理锚定，所以这轮先不把它加进网页漫游链路。若后续展览点位能放置专属图像标记，再单独评估 MindAR 图片锚点。

### p5.brush 进度条

漫游 loading 的胶囊进度条现用 p5.brush standalone 构建绘制纹理液面与轻微起伏，并在不支持 WebGL2 时回退到 Canvas 2D 液体绘制。该 standalone 构建不依赖 p5.js，但要求浏览器支持 WebGL2；其代码按 MIT 许可随仓库提供，见 `src/vendor/p5-brush/LICENSE.md`。

- [p5.brush standalone 文档](https://github.com/acamposuribe/p5.brush/blob/main/docs/standalone.md)
- [MindAR 官方项目](https://github.com/hiukim/mind-ar-js)