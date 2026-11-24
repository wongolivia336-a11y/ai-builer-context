const MEDIA_ROOT = '/making-of/media';

export const MAKING_OF_STAGES = [
  { id: 'THEME', label: '泡泡 × 声音', shortLabel: '泡泡', slots: 6, band: [-1.43, -0.87] },
  { id: 'FIELD', label: '户外收集', shortLabel: '户外', slots: 9, band: [-0.82, -0.32] },
  { id: 'FORM', label: '造型探索', shortLabel: '造型', slots: 11, band: [-0.27, 0.27] },
  { id: 'ODDITY', label: '怪趣与 IP', shortLabel: '怪趣', slots: 9, band: [0.32, 0.82] },
  { id: 'DELIVERY', label: '物料与收敛', shortLabel: '交付', slots: 6, band: [0.87, 1.43] },
];

const image = ({ id, stage, file, title, note, role = 'artifact', alt = title, source = '用户提供的项目过程素材', credit = 'MEMO Garden 项目资料' }) => {
  const src = `${MEDIA_ROOT}/${file}`;
  return { id, stage, kind: 'image', src, poster: src, title, note, role, alt, source, credit, sortOrder: 0 };
};

const video = ({ id, stage, file, poster, title, note, alt = title, source = '用户提供的视频原件', credit = 'MEMO Garden 项目资料' }) => ({
  id,
  stage,
  kind: 'video',
  src: `${MEDIA_ROOT}/${file}`,
  poster: `${MEDIA_ROOT}/${poster}`,
  title,
  note,
  role: 'artifact',
  alt,
  source,
  credit,
  sortOrder: 0,
});

const items = [
  // The 20 V4 archive items keep the exact stage and role distinctions from the handoff manifest.
  image({ id: 'v4-theme-earring', stage: 'THEME', file: '01_theme_bubble-earring.webp', title: 'Bubble as intimate sonic object', note: '把泡泡作为可佩戴、带有声音联想的日常符号。', role: 'reference', alt: '泡泡主题的可佩戴物件灵感图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-theme-bath', stage: 'THEME', file: '01_theme_bath-box.webp', title: 'Bath bubble narrative', note: '参考泡泡如何成为带有感官叙事的微型体验。', role: 'reference', alt: '以泡泡营造感官体验的灵感图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-theme-radio', stage: 'THEME', file: '01_theme_translucent-radio.webp', title: 'Transparent pink device', note: '探索透明粉色外壳、柔和按键与 Y2K 电子产品气质。', role: 'exploration', alt: '透明粉色电子装置的形态探索', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-theme-blob', stage: 'THEME', file: '01_theme_soft-blob.webp', title: 'Bubble blob handheld', note: '探索软胶、液态感外壳的形态语言。', role: 'exploration', alt: '软胶泡泡形态的手持装置探索', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),

  image({ id: 'v4-field-gun', stage: 'FIELD', file: '02_field_bubble-gun.webp', title: 'Bubble launcher gesture', note: '参考实体泡泡的发射动作与清晰的方向感。', role: 'reference', alt: '泡泡发射器的握持与使用参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-field-carry', stage: 'FIELD', file: '02_field_wearable-carry.webp', title: 'Wearable carrying scenario', note: '参考外出采集时，装置如何随身携带。', role: 'reference', alt: '户外随身携带装置的场景参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-field-bike', stage: 'FIELD', file: '02_field_bike-scenario.webp', title: 'Street mobility scenario', note: '参考骑行、步行与城市移动中的使用情境。', role: 'reference', alt: '街道骑行场景参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-field-y2k', stage: 'FIELD', file: '02_field_y2k-model.webp', title: 'Playful Y2K campaign mood', note: '参考彩色、轻盈并带有 AR 游戏感的影像气质。', role: 'reference', alt: 'Y2K 风格的户外影像参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),

  image({ id: 'v4-form-grid', stage: 'FORM', file: '03_form_form-grid.webp', title: 'Bubble machine sketches', note: '围绕出泡结构与玩具感机身展开形态发散。', role: 'exploration', alt: '泡泡装置的多种造型探索图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-form-blue', stage: 'FORM', file: '03_form_blue-device.webp', title: 'Transparent blue handheld', note: '探索透明外壳中的相机、扬声器与按键组合。', role: 'exploration', alt: '透明蓝色手持装置的概念探索', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-form-white', stage: 'FORM', file: '03_form_white-grid.webp', title: 'Minimal hardware variants', note: '参考产品比例、旋钮和按键层级的收敛方式。', role: 'reference', alt: '简洁硬件形态参考图组', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-form-retro', stage: 'FORM', file: '03_form_retro-grid.webp', title: 'Retro gadget moodboard', note: '参考可爱设备的比例、屏幕、旋钮与便携感。', role: 'reference', alt: '复古小型电子设备灵感图组', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),

  image({ id: 'v4-oddity-helmet', stage: 'ODDITY', file: '04_oddity_helmet-editorial.webp', title: 'Odd inventor editorial', note: '参考手作、怪趣与表演感并存的造型气质。', role: 'reference', alt: '怪趣发明家造型灵感图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-oddity-maywa', stage: 'ODDITY', file: '04_oddity_maywa-single.webp', title: 'Maywa Denki performer', note: '参考昭和玩具感与表演性装置角色。', role: 'reference', alt: 'Maywa Denki 表演者参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-oddity-box', stage: 'ODDITY', file: '04_oddity_box-head.webp', title: 'Stage prop machine-head', note: '参考低保真、带有舞台感的怪趣表达。', role: 'reference', alt: '机器头部舞台装置参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-oddity-group', stage: 'ODDITY', file: '04_oddity_maywa-group.webp', title: 'Maywa Denki ensemble', note: '参考玩具乐器、群体形象与世界观搭建。', role: 'reference', alt: 'Maywa Denki 表演组合参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),

  image({ id: 'v4-delivery-projector', stage: 'DELIVERY', file: '05_delivery_projector-printer.webp', title: 'Ambient storytelling artifact', note: '参考把记忆痕迹呈现在日常空间中的方式。', role: 'reference', alt: '家居场景中的投影与打印装置参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-delivery-zine', stage: 'DELIVERY', file: '05_delivery_zine-shelf.webp', title: 'Private shelf / zine tone', note: '参考私密、日记式的小志氛围。', role: 'reference', alt: '小志与书架氛围参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-delivery-accessory', stage: 'DELIVERY', file: '05_delivery_clear-accessory.webp', title: 'Accessory / attachment detail', note: '参考透明小型硬件与配件细节。', role: 'reference', alt: '透明小型配件参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),
  image({ id: 'v4-delivery-otamatone', stage: 'DELIVERY', file: '05_delivery_otamatone.webp', title: 'Playable character object', note: '参考亲和、古怪并带有角色感的物件表达。', role: 'reference', alt: '可演奏角色物件参考图', source: 'memo_v4_full.zip · media-manifest.json', credit: 'V4 交接包' }),

  // Project artifacts and explorations are identified separately from the V4 reference archive.
  image({ id: 'sketch-first-device', stage: 'THEME', file: '9100e2f00928bed02e0bd428094efe0c.webp', title: '纸上的第一版装置', note: '手绘草图记录了喇叭、机身与握持部分的初步关系。', alt: '方格纸上的手绘手持装置草图' }),

  image({ id: 'field-prototype-test', stage: 'FIELD', file: '2a9f07086594af673bc3a1cf8714cb68.webp', title: '手持原型试用', note: '团队成员手持原型，观察实际握持与出泡方向。', alt: '团队成员在工作台旁试用手持原型' }),
  image({ id: 'field-demo', stage: 'FIELD', file: '3bfac8c5f200a322bd74e6e39c15b82d.webp', title: '原型现场演示', note: '在交流现场举起装置，检查外形和使用动作。', alt: '团队成员在交流现场演示装置' }),
  image({ id: 'field-assembly', stage: 'FIELD', file: '73fcacee7a444c316038ae87937c9272.webp', title: '双手协作调试', note: '团队成员共同检查原型的握持与装配位置。', alt: '两位团队成员协作调试手持装置' }),
  image({ id: 'field-spray-booth', stage: 'FIELD', file: '4df658756360badb3f6bf4dbe4406dc0.webp', title: '出泡动作观察', note: '原型在工作台旁进行操作观察，画面记录手部动作与出泡位置。', alt: '团队成员在工作台旁观察装置的出泡动作' }),
  image({ id: 'field-test-two', stage: 'FIELD', file: 'c8c8f73dc7a6c378527772cc6f2c2567.webp', title: '原型握持检查', note: '对照装置尺寸检查握持姿势与按键可达性。', alt: '团队成员手持装置进行检查' }),
  video({ id: 'field-device-demo-clip', stage: 'FIELD', file: '4d0011a6bf1624e86f1ab3d5c496392e.mp4', poster: '4d0011a6bf1624e86f1ab3d5c496392e.webp', title: '手持原型演示片段', note: '短片记录装置在手中的握持与操作。', alt: '团队成员手持装置进行演示的视频' }),

  image({ id: 'form-parts-layout', stage: 'FORM', file: '034a317141d5c33def7dc8c0e7e96c02.webp', title: '打样零件摆放', note: '打印后的机身和外壳零件拆开展示，方便核对接口关系。', alt: '桌面上摆放的青色与粉色 3D 打印零件' }),
  image({ id: 'form-printed-parts', stage: 'FORM', file: '138155857058e308c8dad4063b4a38a0.webp', title: '3D 打印件检查', note: '将打印件放在工作台上，对照尺寸与组合位置。', alt: '工作台上的粉色与青色 3D 打印件' }),
  image({ id: 'form-small-detail', stage: 'FORM', file: '14dc4817fa6cd4b2e114d241c8b779ae.webp', title: '零件尺寸对照', note: '用尺规检查连接部件的大小与装配余量。', alt: '橙色打印件与尺规的尺寸对照照片' }),
  image({ id: 'form-logo-model', stage: 'FORM', file: '1d78124d05d96e26cce7ec437d40c3f7.webp', title: '字标三维建模', note: '在建模软件中处理字标的立体造型。', alt: '三维建模软件中的金属风格字标' }),
  image({ id: 'form-surface-test', stage: 'FORM', file: '2d10dbe7ad4986bfeeddda762f2eeedd.webp', title: '表面处理试验', note: '对外壳部件进行喷涂与颜色观察。', alt: '喷涂空间中悬挂的黄色外壳部件' }),
  image({ id: 'form-cad-structure', stage: 'FORM', file: '419322ef566e80119b15aae3d18c36ae.webp', title: '结构模型检查', note: '建模视图用于检查机身、支架与出泡部件之间的关系。', alt: '青色与橙色装置结构的三维模型' }),
  image({ id: 'form-color-components', stage: 'FORM', file: '4888c181d209b4afa2c999c694cd7d25.webp', title: '彩色零件组合', note: '将不同颜色的打样件摆在一起，比较组合效果。', alt: '桌面上的黄色与青色打样部件' }),
  image({ id: 'form-maya-model', stage: 'FORM', file: '5e5f16b823a00393ee8d425af732d948.webp', title: '建模软件中的结构稿', note: '在三维软件里检查主机、喇叭与透明部件的结构。', alt: '建模软件中的设备结构视图' }),
  image({ id: 'form-printed-shells', stage: 'FORM', file: '8f803c176f5597e9067a809a92e62e2c.webp', title: '外壳打样件', note: '不同颜色的外壳打印件并排摆放，供装配与外观检查。', alt: '桌面上的粉色和青色设备外壳打印件' }),
  image({ id: 'form-assembly-pieces', stage: 'FORM', file: '89b971d2dd0937653368de9bd81038b9.webp', title: '外壳与支架零件', note: '拆分后的外壳和支架零件用于检查结构配合。', alt: '竖向排列的粉色、青色和橙色零件' }),
  image({ id: 'form-holding-test', stage: 'FORM', file: '9e4d62eee4edbc344e0d5e8e88a7f92e.webp', title: '手持出泡测试', note: '在实际握持中检查结构稳定与出泡方向。', alt: '团队成员握持黄色与青色装置进行试用' }),
  image({ id: 'form-electronics-layout', stage: 'FORM', file: 'abf12d75e9f692ab2f8099f70917ab46.webp', title: '内部结构拆解', note: '工作台上的外壳、导线与内部部件记录了装配过程。', alt: '工作台上拆开的青色机身与内部电子零件' }),
  image({ id: 'form-white-prototype', stage: 'FORM', file: 'c38b8c3bf43da23252aeaa66e2137ac7.webp', title: '白色结构打样', note: '手持白色打印件，检查机身与支撑结构的连接。', alt: '手持白色 3D 打印结构件' }),
  image({ id: 'form-parts-workbench', stage: 'FORM', file: 'c626e5670bed23c9b22c27022ae2792f.webp', title: '零件与外壳对照', note: '粉色、青色和橙色部件在工作台上进行组合核对。', alt: '工作台上的彩色打印零件和外壳' }),
  image({ id: 'form-module-layout', stage: 'FORM', file: 'df3fe1ff9965c10177d60451bd6a4fef.webp', title: '模块摆放与连接', note: '将机身、喇叭和连接件拆开展示，检查装配顺序。', alt: '桌面上的设备外壳、喇叭与连接零件' }),
  image({ id: 'form-team-assembly', stage: 'FORM', file: 'e10579ce4b9dfa36ff4a8de5ae29e72d.webp', title: '装配协作记录', note: '团队成员一起试装原型并确认零件位置。', alt: '两位团队成员协作装配青色与粉色原型' }),
  image({ id: 'form-cad-render', stage: 'FORM', file: 'ff71b40dc4f392fd44581343e9ba5c1b.webp', title: '扬声器与手机结构模型', note: '三维结构视图展示喇叭、机身与手机的相对位置。', alt: '三维建模软件中的扬声器和手机装置结构' }),
  video({ id: 'form-prototype-assembly-clip', stage: 'FORM', file: '2edf71ce48136a62f8b474a759591866.mp4', poster: '2edf71ce48136a62f8b474a759591866.webp', title: '样机零件拼装', note: '短片记录外壳零件的拼装过程。', alt: '手持并拼装 3D 打印外壳的视频' }),
  video({ id: 'form-surface-clip-one', stage: 'FORM', file: '725253d300fb6c90a161289603f50cf8.mp4', poster: '725253d300fb6c90a161289603f50cf8.webp', title: '外壳喷涂过程', note: '短片记录喷涂空间里的部件处理。', alt: '喷涂工作台上处理黄色外壳部件的视频' }),
  video({ id: 'form-surface-clip-two', stage: 'FORM', file: 'ab0b14727bdcde811224198f1a8d084c.mp4', poster: 'ab0b14727bdcde811224198f1a8d084c.webp', title: '喷涂效果观察', note: '从另一个角度记录表面处理时的部件状态。', alt: '喷涂作业中查看外壳颜色的视频' }),

  image({ id: 'oddity-render-phone', stage: 'ODDITY', file: '99f3692052969ac0922410116f875c5d.webp', title: '手持外设造型探索', note: '概念渲染用于讨论手机、握把和出声部件的组合，非实物样机。', role: 'exploration', alt: '手机与粉青色手持外设的概念渲染', source: '用户提供的概念探索图', credit: '概念渲染' }),
  image({ id: 'oddity-render-device', stage: 'ODDITY', file: 'dc91deee402ea67147e2fed37b3ad1a6.webp', title: '喇叭外形概念稿', note: '概念渲染探索了大喇叭、圆形尾部与机身的比例，尚非最终规格。', role: 'exploration', alt: '粉青色手持喇叭装置的概念渲染', source: '用户提供的概念探索图', credit: '概念渲染' }),
  image({ id: 'oddity-render-detail-board', stage: 'ODDITY', file: '5c98ad3512da684c3fc990f0d2650a96.webp', title: '色彩与细节设想', note: '外观板汇总颜色、材质与结构想法；图中尺寸和参数仅为视觉示意。', role: 'exploration', alt: '粉色与青色装置的概念设计板', source: '用户提供的概念探索图', credit: '概念渲染' }),

  image({ id: 'delivery-conference', stage: 'DELIVERY', file: '03c28979054e908960752bc44a174793.webp', title: '项目交流现场', note: '活动现场的观众与展陈记录。', alt: '项目活动现场观众照片' }),
  image({ id: 'delivery-presentation-screen', stage: 'DELIVERY', file: '3ddd8206f7f87a6de7e373d82868b9ec.webp', title: '方案汇报画面', note: '现场投影展示阶段性方案页面。', alt: '观众席前的方案汇报投影画面' }),
  image({ id: 'delivery-stage', stage: 'DELIVERY', file: '410f7c7e93387cf422d1f01c153d2da4.webp', title: '项目发布与展示', note: '展示活动中的大屏与现场记录。', alt: '活动现场的大屏和观众' }),
  image({ id: 'delivery-modeling-deck', stage: 'DELIVERY', file: '66d0684da35b4d4715a2e964fa78666b.webp', title: '界面方案汇报', note: '投影页并列展示移动端界面方案。', alt: '展示移动端应用界面的投影页' }),
  image({ id: 'delivery-app-overview', stage: 'DELIVERY', file: '675a0c3a6fa00a8e125848930785e290.webp', title: '声景漫游界面', note: '网页与手机端界面原型的并列展示。', alt: '网页与手机端声景漫游界面原型截图' }),
  image({ id: 'delivery-zine-screen', stage: 'DELIVERY', file: 'c1fe2f82d41b2069cbd26cae4d0421de.webp', title: '小志交互页面', note: '页面记录小志封面、翻页与声音入口的视觉安排。', alt: 'MEMO Garden 小志页面原型截图' }),
  image({ id: 'delivery-zine-page', stage: 'DELIVERY', file: 'c8cd8130d4494d472e18accfaa096469.webp', title: '小志封面动效', note: '浏览器原型中的封面与泡泡视觉。', alt: '浏览器中的 MEMO Garden 小志封面' }),
  image({ id: 'delivery-zine-inside', stage: 'DELIVERY', file: 'cbb3368a59f22b44163999f5629287c0.webp', title: '小志内页翻阅', note: '内页把记忆照片、文字与翻页交互组合在一起。', alt: '浏览器中的小志内页与翻页状态' }),
  image({ id: 'delivery-booth', stage: 'DELIVERY', file: 'd0727a3f38fa75ae308a74466a225e7e.webp', title: '活动展陈记录', note: '项目展台和现场屏幕的照片记录。', alt: '活动展台与项目屏幕' }),
  image({ id: 'delivery-projector', stage: 'DELIVERY', file: 'd6b45af68ded0d7d5f5e1d3c034141fe.webp', title: '现场演示记录', note: '从观众席记录项目内容在现场的展示。', alt: '观众席前的项目展示屏幕' }),
  video({ id: 'delivery-marker-clip', stage: 'DELIVERY', file: '69da3b9d9b7d97915b880cb6fb20ed18.mp4', poster: '69da3b9d9b7d97915b880cb6fb20ed18.webp', title: '标记图案界面记录', note: '短片记录电脑上的标记图案与识别页面。', alt: '电脑屏幕上显示标记图案页面的视频' }),
  video({ id: 'delivery-zine-turn-clip', stage: 'DELIVERY', file: '334e0f3a13b45411aecd6faa2314fdd0.mp4', poster: '334e0f3a13b45411aecd6faa2314fdd0.webp', title: '小志翻页原型', note: '短片记录浏览器中小志的翻页交互。', alt: '浏览器中的小志翻页交互视频' }),
  video({ id: 'delivery-team-review-one', stage: 'DELIVERY', file: '15180f4e51488f74910d7b848cf8a75f.mp4', poster: '15180f4e51488f74910d7b848cf8a75f.webp', title: '方案交流片段', note: '团队成员在现场围绕装置交流。', alt: '团队成员围绕装置讨论的视频' }),
  video({ id: 'delivery-team-review-two', stage: 'DELIVERY', file: '99894aef8ab6619ca2b6acd302547436.mp4', poster: '99894aef8ab6619ca2b6acd302547436.webp', title: '原型讨论片段', note: '另一段现场交流记录。', alt: '团队在体验空间交流的视频' }),
  video({ id: 'delivery-team-review-three', stage: 'DELIVERY', file: '353c1769731b754dd355e0e1f93d4d61.mp4', poster: '353c1769731b754dd355e0e1f93d4d61.webp', title: '团队讨论记录', note: '短片记录团队在体验空间中的讨论。', alt: '团队成员在座椅间讨论的视频' }),
  video({ id: 'delivery-team-review-four', stage: 'DELIVERY', file: 'edd343989b014b1c059a10f06278293a.mp4', poster: 'edd343989b014b1c059a10f06278293a.webp', title: '交流现场另一视角', note: '从另一处记录团队讨论与演示现场。', alt: '体验空间中团队交流的视频' }),
  video({ id: 'delivery-event-clip-one', stage: 'DELIVERY', file: '0f94320a079a1bd53c9493feab1e1898.mp4', poster: '0f94320a079a1bd53c9493feab1e1898.webp', title: '共创营现场', note: '短片记录现场交流与活动空间。', alt: '共创营活动空间中的交流视频' }),
  video({ id: 'delivery-event-clip-two', stage: 'DELIVERY', file: '40965c6f5c598213edfee69a7fc841c6.mp4', poster: '40965c6f5c598213edfee69a7fc841c6.webp', title: '项目汇报现场片段', note: '短片记录现场展示和讨论。', alt: '项目汇报现场的视频' }),
  video({ id: 'delivery-page-motion', stage: 'DELIVERY', file: '793e5734a6cb85f72a44c19bdd81d2b0.mp4', poster: '793e5734a6cb85f72a44c19bdd81d2b0.webp', title: '声景页面动效', note: '短片记录气泡与页面视觉的动态预览。', alt: '声景页面中泡泡视觉动效的视频' }),
];

export const MAKING_OF_MEDIA = items.map((item, index) => ({ ...item, sortOrder: index + 1 }));

export const MAKING_OF_ROLE_LABELS = {
  reference: '灵感参考',
  exploration: '概念探索',
  artifact: '过程记录',
};
