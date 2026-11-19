import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import deviceModelPartOneUrl from './assets/soundscape-device.stl.gz.part-1?url';
import deviceModelPartTwoUrl from './assets/soundscape-device.stl.gz.part-2?url';

const CMF = {
  teal: 0x38b4a5,
  pink: 0xe7a6bf,
  yellow: 0xffb52e,
  clear: 0x8aada9,
  metal: 0xc7d0d2,
  dark: 0x20343d,
};

function makePartMaterial(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: options.metalness ?? 0.04,
    roughness: options.roughness ?? 0.34,
    clearcoat: options.clearcoat ?? 0.25,
    clearcoatRoughness: 0.36,
    side: THREE.DoubleSide,
  });
}

function materialForPart(rank, part) {
  const longThinHorn = part.size[0] < 18 && part.size[2] > 130;
  if (longThinHorn) return rank < 2 ? 1 : 0;
  if (rank === 2 || rank === 8) return 0;
  if (rank === 6 || rank === 7 || rank === 19) return 2;
  if (rank === 4 || rank === 9 || rank === 10) return 3;
  if ((rank >= 11 && part.triangles < 1800) || (rank >= 13 && rank <= 16)) return 4;
  if (rank >= 17 && part.triangles < 500) return 5;
  return 0;
}

function prepareModelGeometry(source, rawCenter) {
  source.deleteAttribute('normal');
  const geometry = mergeVertices(source, 0.001);
  const position = geometry.getAttribute('position').array;
  const index = geometry.index.array;
  const vertexCount = position.length / 3;
  const parents = new Uint32Array(vertexCount);
  const ranks = new Uint8Array(vertexCount);
  for (let i = 0; i < vertexCount; i += 1) parents[i] = i;

  const find = (value) => {
    let root = value;
    while (parents[root] !== root) root = parents[root];
    while (parents[value] !== value) {
      const next = parents[value];
      parents[value] = root;
      value = next;
    }
    return root;
  };
  const join = (a, b) => {
    let rootA = find(a);
    let rootB = find(b);
    if (rootA === rootB) return;
    if (ranks[rootA] < ranks[rootB]) [rootA, rootB] = [rootB, rootA];
    parents[rootB] = rootA;
    if (ranks[rootA] === ranks[rootB]) ranks[rootA] += 1;
  };

  for (let i = 0; i < index.length; i += 3) {
    join(index[i], index[i + 1]);
    join(index[i + 1], index[i + 2]);
  }

  const parts = new Map();
  for (let i = 0; i < index.length; i += 3) {
    const root = find(index[i]);
    let part = parts.get(root);
    if (!part) {
      part = { root, triangles: 0, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
      parts.set(root, part);
    }
    part.triangles += 1;
    for (let j = 0; j < 3; j += 1) {
      const offset = index[i + j] * 3;
      for (let axis = 0; axis < 3; axis += 1) {
        part.min[axis] = Math.min(part.min[axis], position[offset + axis]);
        part.max[axis] = Math.max(part.max[axis], position[offset + axis]);
      }
    }
  }

  const rankedParts = [...parts.values()].sort((a, b) => b.triangles - a.triangles);
  const materialByRoot = new Map(rankedParts.map((part, rank) => {
    part.size = part.min.map((value, axis) => part.max[axis] - value);
    return [part.root, materialForPart(rank, part)];
  }));

  const materialForTriangle = (offset) => materialByRoot.get(find(index[offset]));
  const counts = new Uint32Array(6);
  for (let i = 0; i < index.length; i += 3) counts[materialForTriangle(i)] += 3;
  const buckets = Array.from(counts, (count) => new Uint32Array(count));
  const cursors = new Uint32Array(6);
  for (let i = 0; i < index.length; i += 3) {
    const material = materialForTriangle(i);
    const cursor = cursors[material];
    buckets[material][cursor] = index[i];
    buckets[material][cursor + 1] = index[i + 1];
    buckets[material][cursor + 2] = index[i + 2];
    cursors[material] += 3;
  }

  const orderedIndices = new Uint32Array(index.length);
  let start = 0;
  geometry.clearGroups();
  buckets.forEach((bucket, material) => {
    if (!bucket.length) return;
    orderedIndices.set(bucket, start);
    geometry.addGroup(start, bucket.length, material);
    start += bucket.length;
  });
  geometry.setIndex(new THREE.BufferAttribute(orderedIndices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function createSoapBubbles(parent, outlet) {
  const bubbles = [];
  const bubbleColors = [0xffcada, 0xc3f1e8, 0xd8cbff, 0xffe4a8];
  const emitter = new THREE.Group();
  emitter.position.copy(outlet);
  parent.add(emitter);

  const radii = [0.32, 0.4, 0.48, 0.36];
  for (let i = 0; i < radii.length; i += 1) {
    const material = new THREE.MeshPhysicalMaterial({
      color: bubbleColors[i],
      emissive: bubbleColors[i],
      emissiveIntensity: 0.14,
      roughness: 0.045,
      metalness: 0.015,
      transmission: 0.4,
      thickness: 0.58,
      ior: 1.33,
      iridescence: 1,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [160, 620],
      transparent: true,
      opacity: 0,
      clearcoat: 1,
      depthWrite: false,
    });
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(radii[i], 32, 24), material);
    bubble.position.set((i - 1.5) * 0.14, (i - 1.5) * 0.19, i * 0.09);
    emitter.add(bubble);
    gsap.to(bubble.position, {
      x: `+=${-0.72 - i * 0.08}`,
      y: `+=${0.38 + (i % 3) * 0.13}`,
      z: `+=${0.18 + (i % 2) * 0.12}`,
      duration: 4.2 + i * 0.34,
      delay: i * -0.92,
      repeat: -1,
      ease: 'sine.inOut',
      yoyo: true,
    });
    gsap.to(bubble.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 2.8 + i * 0.22,
      delay: i * -0.52,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    bubbles.push({ mesh: bubble, material });
  }
  return bubbles;
}

function createGripHand(parent) {
  const hand = new THREE.Group();
  hand.name = 'Virtual hand holding the EchoCaster grip';
  hand.position.set(0.68, -0.88, -0.16);
  hand.rotation.z = -0.08;

  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xd4a095,
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.42,
  });
  const sleeve = new THREE.MeshPhysicalMaterial({
    color: 0xe9eee9,
    roughness: 0.68,
    metalness: 0,
    clearcoat: 0.06,
  });
  const nail = new THREE.MeshPhysicalMaterial({
    color: 0xf0c3bb,
    roughness: 0.34,
    clearcoat: 0.18,
  });
  const geometries = [];
  const materials = [skin, sleeve, nail];
  const addEllipsoid = (position, scale, material) => {
    const geometry = new THREE.SphereGeometry(1, 24, 18);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hand.add(mesh);
    return mesh;
  };
  const addFingerSegment = (start, end, radius) => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const geometry = new THREE.CapsuleGeometry(radius, Math.max(0.015, direction.length() - radius * 2), 5, 12);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, skin);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hand.add(mesh);
  };

  const forearmGeometry = new THREE.CapsuleGeometry(0.15, 0.47, 8, 18);
  geometries.push(forearmGeometry);
  const forearm = new THREE.Mesh(forearmGeometry, sleeve);
  forearm.position.set(-0.08, -0.55, -0.02);
  forearm.rotation.z = -0.12;
  forearm.castShadow = true;
  hand.add(forearm);

  addEllipsoid([-0.02, -0.02, 0.02], [0.34, 0.4, 0.19], skin);

  const fingerRows = [0.19, 0.05, -0.09, -0.23];
  fingerRows.forEach((row, index) => {
    const radius = index === 3 ? 0.074 : 0.078;
    const joints = [
      [-0.16, row, 0.1],
      [0.07, row + 0.025, 0.16],
      [0.25, row - 0.015, -0.015],
      [0.14, row - 0.055, -0.27],
    ];
    for (let i = 0; i < joints.length - 1; i += 1) addFingerSegment(joints[i], joints[i + 1], radius);
    joints.slice(1, -1).forEach((joint) => addEllipsoid(joint, [radius, radius, radius], skin));
    addEllipsoid([0.13, row - 0.07, -0.23], [0.042, 0.052, 0.018], nail);
  });

  const thumbJoints = [
    [-0.23, 0.16, 0.02],
    [-0.38, 0.05, 0.08],
    [-0.34, -0.08, -0.08],
    [-0.13, -0.06, -0.23],
  ];
  for (let i = 0; i < thumbJoints.length - 1; i += 1) addFingerSegment(thumbJoints[i], thumbJoints[i + 1], 0.095 - i * 0.008);
  addEllipsoid([-0.34, -0.08, -0.08], [0.095, 0.095, 0.095], skin);
  addEllipsoid([-0.12, -0.06, -0.18], [0.049, 0.062, 0.018], nail);

  parent.add(hand);
  return { hand, geometries, materials };
}

function buildDevice(scene, sourceGeometry) {
  sourceGeometry.computeBoundingBox();
  const rawBox = sourceGeometry.boundingBox.clone();
  const rawCenter = rawBox.getCenter(new THREE.Vector3());
  const rawSize = rawBox.getSize(new THREE.Vector3());
  const scale = 2.52 / rawSize.y;
  const geometry = prepareModelGeometry(sourceGeometry, rawCenter);
  sourceGeometry.dispose();
  geometry.translate(-rawCenter.x, -rawCenter.y, -rawCenter.z);
  geometry.scale(scale, scale, scale);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const materials = [
    makePartMaterial(CMF.teal, { roughness: 0.36, clearcoat: 0.24 }),
    makePartMaterial(CMF.pink, { roughness: 0.38, clearcoat: 0.28 }),
    makePartMaterial(CMF.yellow, { roughness: 0.31, clearcoat: 0.34 }),
    new THREE.MeshPhysicalMaterial({
      color: CMF.clear,
      roughness: 0.12,
      metalness: 0,
      transmission: 0.68,
      thickness: 1.1,
      ior: 1.38,
      clearcoat: 1,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    makePartMaterial(CMF.metal, { metalness: 0.76, roughness: 0.24, clearcoat: 0.58 }),
    makePartMaterial(CMF.dark, { metalness: 0.18, roughness: 0.3, clearcoat: 0.4 }),
  ];

  const phoneCradle = new THREE.Group();
  // The screen sits on the opposite side of the model so the cradle stays
  // vertical and faces the restored front view.
  phoneCradle.position.set(0.8, 0.05, -0.1);
  const phoneFrameGeometry = new RoundedBoxGeometry(0.98, 1.82, 0.085, 5, 0.11);
  phoneFrameGeometry.rotateY(Math.PI / 2);
  const phoneFrame = new THREE.Mesh(phoneFrameGeometry, makePartMaterial(CMF.teal, { roughness: 0.25, clearcoat: 0.55 }));
  phoneFrame.castShadow = true;
  phoneFrame.receiveShadow = true;
  phoneCradle.add(phoneFrame);

  const phoneScreenGeometry = new RoundedBoxGeometry(0.87, 1.68, 0.022, 5, 0.075);
  phoneScreenGeometry.rotateY(Math.PI / 2);
  const phoneScreen = new THREE.Mesh(phoneScreenGeometry, new THREE.MeshPhysicalMaterial({
    color: 0x18242c,
    metalness: 0.16,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
    side: THREE.DoubleSide,
  }));
  phoneScreen.position.x = -0.054;
  phoneCradle.add(phoneScreen);

  const phoneNotch = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.024, 0.012, 4, 0.012),
    new THREE.MeshBasicMaterial({ color: 0x52616b })
  );
  phoneNotch.geometry.rotateY(Math.PI / 2);
  phoneNotch.position.set(-0.068, 0.78, -0.1);
  phoneCradle.add(phoneNotch);

  const group = new THREE.Group();
  const orient = new THREE.Group();
  // The phone cradle stays portrait while the horn points to the right.
  // Reverse the source orientation so the horn reads toward the right; the
  // phone screen is mounted on the opposite local face to remain camera-facing.
  orient.rotation.y = -Math.PI / 2;
  group.add(orient);
  const body = new THREE.Mesh(geometry, materials);
  body.castShadow = true;
  body.receiveShadow = true;
  orient.add(body);
  orient.add(phoneCradle);
  scene.add(group);

  const hand = createGripHand(group);
  const bubbles = createSoapBubbles(group, new THREE.Vector3(0.05, 0.92, 0.36));
  const float = gsap.to(group.position, { y: 0.045, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  const turn = gsap.to(group.rotation, { y: -0.12, duration: 4.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  group.rotation.y = 0.12;
  return {
    group,
    geometry,
    materials,
    bubbles,
    float,
    turn,
    hand,
    auxiliaryGeometries: [phoneFrameGeometry, phoneScreenGeometry, phoneNotch.geometry],
    auxiliaryMaterials: [phoneFrame.material, phoneScreen.material, phoneNotch.material],
    handGeometries: hand.geometries,
    handMaterials: hand.materials,
  };
}

function DeviceCanvas({ playing }) {
  const mountRef = useRef(null);
  const deviceRef = useRef(null);
  const playingRef = useRef(playing);
  const [modelStatus, setModelStatus] = useState('loading');

  useEffect(() => {
    playingRef.current = playing;
    deviceRef.current?.bubbles.forEach(({ material }, index) => {
      gsap.to(material, { opacity: playing ? 0.96 : 0, duration: 0.34, delay: playing ? index * 0.07 : 0, ease: 'power2.out' });
    });
  }, [playing]);

  useLayoutEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(0.65, 1.35, 4.9);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = false;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf3f8ff, 0x748994, 1.8));
    const key = new THREE.DirectionalLight(0xfff2ee, 2.8);
    key.position.set(2.6, 4.1, 4.6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa7d7e1, 2.1);
    rim.position.set(-3, 1.7, -2.6);
    scene.add(rim);
    const pinkFill = new THREE.PointLight(0xf2c5d8, 12, 5);
    pinkFill.position.set(1.3, 0.8, 2.3);
    scene.add(pinkFill);

    let pmrem;
    let environment;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = environment.texture;
    } catch {
      // Directional lighting remains available if the generated environment cannot load.
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.target.set(0, 0.04, 0);

    const timer = new THREE.Timer();
    timer.connect(document);
    let frame = 0;
    let disposed = false;
    let device;
    const render = (timestamp) => {
      if (disposed) return;
      frame = window.requestAnimationFrame(render);
      timer.update(timestamp);
      if (device) {
        const elapsed = timer.getElapsed();
        device.group.rotation.z = playingRef.current ? Math.sin(elapsed * 3.6) * 0.025 : device.group.rotation.z * 0.94;
        device.hand.hand.rotation.x = playingRef.current ? Math.sin(elapsed * 2.2) * 0.025 : device.hand.hand.rotation.x * 0.96;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    const resize = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resize.observe(mount);

    const loadDevice = async () => {
      let sourceGeometry;
      try {
        const responses = await Promise.all([deviceModelPartOneUrl, deviceModelPartTwoUrl].map((url) => fetch(url)));
        const failedResponse = responses.find((response) => !response.ok);
        if (failedResponse) throw new Error(`Model request failed (${failedResponse.status}).`);
        const parts = await Promise.all(responses.map((response) => response.arrayBuffer()));
        const compressed = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
        let offset = 0;
        parts.forEach((part) => {
          compressed.set(new Uint8Array(part), offset);
          offset += part.byteLength;
        });
        let buffer = compressed.buffer;
        const bytes = new Uint8Array(buffer);
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          if (!('DecompressionStream' in window)) throw new Error('This browser cannot decompress the model asset.');
          const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
          buffer = await new Response(stream).arrayBuffer();
        }
        sourceGeometry = new STLLoader().parse(buffer);
        if (disposed) {
          sourceGeometry.dispose();
          return;
        }
        device = buildDevice(scene, sourceGeometry);
        deviceRef.current = device;
        setModelStatus('ready');
        gsap.fromTo(device.group.scale, { x: 0.78, y: 0.78, z: 0.78 }, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.22)' });
        device.bubbles.forEach(({ material }) => { material.opacity = playingRef.current ? 0.96 : 0; });
      } catch (error) {
        console.error('Could not load the soundscape device model.', error);
        sourceGeometry?.dispose();
        if (!disposed) setModelStatus('error');
      }
    };
    loadDevice();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      timer.dispose();
      if (device) {
        device.float.kill();
        device.turn.kill();
        device.bubbles.forEach(({ mesh, material }) => {
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);
          gsap.killTweensOf(material);
        });
        device.geometry.dispose();
        device.materials.forEach((material) => material.dispose());
        device.auxiliaryGeometries.forEach((geometry) => geometry.dispose());
        device.auxiliaryMaterials.forEach((material) => material.dispose());
        device.handGeometries.forEach((geometry) => geometry.dispose());
        device.handMaterials.forEach((material) => material.dispose());
        device.bubbles.forEach(({ mesh, material }) => {
          mesh.geometry.dispose();
          material.dispose();
        });
      }
      environment?.dispose();
      pmrem?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      deviceRef.current = null;
    };
  }, []);

  return (
    <div className={`device-canvas${playing ? ' is-playing' : ''}`} ref={mountRef} aria-label="可拖动旋转的 EchoCaster 手持式竖屏泡泡装置模型">
      {modelStatus === 'loading' && <span className="device-model-state">载入 EchoCaster 模型…</span>}
      {modelStatus === 'error' && <span className="device-model-state is-error">模型载入失败</span>}
    </div>
  );
}

export default function DeviceViewer({ open, onClose, playing }) {
  const panelRef = useRef(null);
  const closeTimer = useRef(null);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { y: 36, scale: 0.95, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.25)' });
      gsap.fromTo('.device-detail', { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.36, stagger: 0.07, delay: 0.18, ease: 'power2.out' });
    }, panelRef);
    return () => ctx.revert();
  }, [open]);

  if (!open) return null;
  const closeAnimated = () => {
    if (!panelRef.current) return onClose();
    window.clearTimeout(closeTimer.current);
    gsap.to(panelRef.current, { y: 26, scale: 0.96, autoAlpha: 0, duration: 0.22, ease: 'power2.in', onComplete: onClose });
  };

  return (
    <section className="device-viewer glass-surface" ref={panelRef} aria-label="EchoCaster 3D 展示">
      <header className="device-viewer-head">
        <div className="device-detail"><span className="device-eyebrow">SOUNDSCAPE · FIELD DEVICE</span><h2>EchoCaster</h2><small>竖屏手机仓 · 手持声音泡泡发射器</small></div>
        <button className="device-close" onClick={closeAnimated} aria-label="收起 EchoCaster">−</button>
      </header>
      <DeviceCanvas playing={playing} />
      <div className="device-viewer-foot">
        <div className="device-detail"><span className={`device-live-dot${playing ? ' active' : ''}`} /><span>{playing ? '播放演示中 · 手握装置正在吐泡泡' : '拖动旋转 · 查看手握姿态与手机仓'}</span></div>
        <div className="device-detail"><i className="device-key-icon" /> LINK · DEMO</div>
      </div>
    </section>
  );
}
