const scenes = [
  { id: 'canopy-rest', name: '树下的午后', base: '#18231b', accent: '#c9d6a8', image: '/zine/assets/scenes/01-canopy-rest.jpg' },
  { id: 'cloud-meadow', name: '云下草坡', base: '#456985', accent: '#b6cfbd', image: '/zine/assets/scenes/02-cloud-meadow.jpg' },
  { id: 'rolling-flowers', name: '起伏的花野', base: '#47642e', accent: '#f1c5a4', image: '/zine/assets/scenes/03-rolling-flowers.jpg' },
  { id: 'wildflower-hill', name: '山坡小花', base: '#5a773f', accent: '#dbe4c2', image: '/zine/assets/scenes/04-wildflower-hill.jpg' },
  { id: 'lambs-in-the-field', name: '草地上的羊', base: '#526848', accent: '#e5d9bc', image: '/zine/assets/scenes/05-lambs-in-the-field.jpg' },
  { id: 'clover-light', name: '四叶草透光', base: '#33652f', accent: '#d5e7a9', image: '/zine/assets/scenes/06-clover-light.jpg' },
  { id: 'star-tree', name: '星星树下', base: '#173421', accent: '#dce0ad', image: '/zine/assets/scenes/07-star-tree.jpg' },
  { id: 'misty-forest', name: '雾中森林', base: '#65746b', accent: '#e6e6dc', image: '/zine/assets/scenes/08-misty-forest.jpg' },
  { id: 'flower-pond', name: '花边水塘', base: '#406c62', accent: '#e1c6a1', image: '/zine/assets/scenes/09-flower-pond.jpg' },
  { id: 'apple-tree', name: '苹果树下', base: '#294b28', accent: '#d7cf99', image: '/zine/assets/scenes/10-apple-tree.jpg' },
]

export const BUBBLE_SCENES = scenes.map((scene) => ({
  ...scene,
  gradient: 'linear-gradient(145deg, ' + scene.base + ', ' + scene.accent + ')',
}))
