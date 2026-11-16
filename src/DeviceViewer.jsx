import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function roundedBox(width, height, depth, radius = 0.06, steps = 4) {
  return new RoundedBoxGeometry(width, height, depth, steps, radius);
}

function screenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#101824');
  bg.addColorStop(1, '#182337');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#d7e4f4';
  ctx.font = '500 24px system-ui, sans-serif';
  ctx.fillText('SOUND / 03', 34, 48);
  ctx.fillStyle = 'rgba(182,205,231,.4)';
  ctx.fillRect(32, 72, 448, 1);
  const heights = [20, 35, 24, 51, 27, 67, 42, 29, 70, 34, 45, 22, 58, 36, 73, 27, 48, 32, 61, 22, 39, 68, 31, 50, 26, 61, 35, 44, 72, 28];
  heights.forEach((height, index) => {
    const x = 36 + index * 14.8;
    const gradient = ctx.createLinearGradient(0, 178 - height / 2, 0, 178 + height / 2);
    gradient.addColorStop(0, '#f1c9bf');
    gradient.addColorStop(1, '#a9c4e3');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, 178 - height / 2, 4, height, 2);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(219,229,240,.56)';
  ctx.font = '400 16px system-ui, sans-serif';
  ctx.fillText('FIELD RECORDING   00:12', 34, 244);
  ctx.fillStyle = 'rgba(185,204,227,.13)';
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      ctx.beginPath();
      ctx.arc(42 + col * 38, 300 + row * 27, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createDevice(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0x94aeca, metalness: 0.18, roughness: 0.24, clearcoat: 0.85, clearcoatRoughness: 0.17 });
  const trimMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd7d9d6, metalness: 0.58, roughness: 0.28, clearcoat: 0.7 });
  const screenMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0d1521, metalness: 0.12, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 });
  const buttonMaterials = [
    new THREE.MeshPhysicalMaterial({ color: 0xe9ded7, roughness: 0.23, clearcoat: 0.7 }),
    new THREE.MeshPhysicalMaterial({ color: 0xc98183, roughness: 0.2, clearcoat: 0.8 }),
    new THREE.MeshPhysicalMaterial({ color: 0x9bb5d0, roughness: 0.22, clearcoat: 0.8 }),
  ];
  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf2dce7,
    roughness: 0.035,
    metalness: 0,
    transmission: 0.94,
    thickness: 0.45,
    ior: 1.33,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [110, 480],
    transparent: true,
    opacity: 0.82,
    clearcoat: 1,
  });

  const body = new THREE.Mesh(roundedBox(0.86, 1.34, 0.28, 0.1, 7), bodyMaterial);
  body.position.y = 0.08;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const front = new THREE.Mesh(roundedBox(0.7, 0.83, 0.055, 0.055, 5), trimMaterial);
  front.position.set(0, 0.24, 0.163);
  front.castShadow = true;
  group.add(front);

  const display = new THREE.Mesh(roundedBox(0.6, 0.69, 0.025, 0.035, 4), screenMaterial);
  display.position.set(0, 0.27, 0.207);
  group.add(display);
  const displayFace = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.61), new THREE.MeshBasicMaterial({ map: screenTexture(), toneMapped: false }));
  displayFace.position.set(0, 0.27, 0.222);
  group.add(displayFace);

  const hornMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd8aa9b, metalness: 0.18, roughness: 0.28, clearcoat: 0.85, clearcoatRoughness: 0.14 });
  const hornProfile = [new THREE.Vector2(0.055, 0), new THREE.Vector2(0.075, 0.12), new THREE.Vector2(0.14, 0.28), new THREE.Vector2(0.27, 0.45), new THREE.Vector2(0.3, 0.5)];
  const horn = new THREE.Mesh(new THREE.LatheGeometry(hornProfile, 48), hornMaterial);
  horn.rotation.z = Math.PI / 2;
  horn.position.set(-0.28, 0.47, 0.16);
  horn.castShadow = true;
  group.add(horn);
  const hornLip = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 12, 48), trimMaterial);
  hornLip.rotation.y = -Math.PI / 2;
  hornLip.position.set(-0.78, 0.47, 0.16);
  group.add(hornLip);
  const hornInside = new THREE.Mesh(new THREE.CircleGeometry(0.276, 48), new THREE.MeshPhysicalMaterial({ color: 0x4e5a69, roughness: 0.37, metalness: 0.28, side: THREE.DoubleSide }));
  hornInside.rotation.y = -Math.PI / 2;
  hornInside.position.set(-0.775, 0.47, 0.16);
  group.add(hornInside);

  const speaker = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.055, 36), screenMaterial);
  speaker.rotation.x = Math.PI / 2;
  speaker.position.set(-0.25, -0.42, 0.18);
  group.add(speaker);
  const speakerRim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.013, 10, 36), trimMaterial);
  speakerRim.position.set(-0.25, -0.42, 0.215);
  group.add(speakerRim);
  for (let row = -2; row <= 2; row += 1) {
    for (let col = -2; col <= 2; col += 1) {
      if (row * row + col * col > 6) continue;
      const hole = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), trimMaterial);
      hole.position.set(-0.25 + col * 0.034, -0.42 + row * 0.034, 0.22);
      group.add(hole);
    }
  }

  const buttonPositions = [
    [-0.22, -0.34], [0, -0.34], [0.22, -0.34],
    [-0.22, -0.56], [0, -0.56], [0.22, -0.56],
  ];
  buttonPositions.forEach(([x, y], index) => {
    const key = new THREE.Mesh(roundedBox(0.12, 0.105, 0.055, 0.025, 4), buttonMaterials[index === 2 || index === 5 ? 1 : index % 2 ? 2 : 0]);
    key.position.set(x, y, 0.19);
    key.castShadow = true;
    group.add(key);
  });

  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.5, 5, 16), bodyMaterial);
  handle.position.set(0.04, -0.83, 0.02);
  handle.rotation.z = -0.04;
  handle.castShadow = true;
  group.add(handle);
  const trigger = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.07, 32), buttonMaterials[1]);
  trigger.rotation.x = Math.PI / 2;
  trigger.position.set(0.27, -0.25, 0.2);
  trigger.castShadow = true;
  group.add(trigger);

  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.33, 0.9, 0.04),
    new THREE.Vector3(0.55, 0.91, 0.04),
    new THREE.Vector3(0.7, 0.8, 0.04),
  ]);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 28, 0.042, 10, false), trimMaterial);
  group.add(hose);
  const reservoir = new THREE.Mesh(new THREE.SphereGeometry(0.245, 56, 40), bubbleMaterial);
  reservoir.position.set(0.68, 1.01, 0.05);
  reservoir.castShadow = true;
  group.add(reservoir);
  const reservoirNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.24, 24), hornMaterial);
  reservoirNeck.rotation.z = -0.42;
  reservoirNeck.position.set(0.51, 0.91, 0.05);
  group.add(reservoirNeck);

  const outputBubbles = [];
  for (let index = 0; index < 4; index += 1) {
    const outputMaterial = bubbleMaterial.clone();
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.045 + index * 0.008, 24, 18), outputMaterial);
    bubble.position.set(-0.82, 0.5 + index * 0.04, 0.14 + index * 0.03);
    group.add(bubble);
    outputBubbles.push(bubble);
    gsap.to(bubble.position, { x: -1.25 - index * 0.11, y: 0.85 + index * 0.12, duration: 1.6 + index * 0.24, delay: index * -0.38, repeat: -1, ease: 'sine.inOut' });
    gsap.to(bubble.material, { opacity: 0.22, duration: 0.8 + index * 0.1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: index * -0.3 });
  }

  const float = gsap.to(group.position, { y: 0.08, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  const turn = gsap.to(group.rotation, { y: 0.16, duration: 4.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  group.rotation.y = -0.16;
  return { group, float, turn, outputBubbles };
}

function DeviceCanvas({ playing }) {
  const mountRef = useRef(null);
  const playState = useRef(playing);
  playState.current = playing;

  useLayoutEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(2.85, 1.85, 3.45);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x657186, 2.05));
    const key = new THREE.DirectionalLight(0xffe7dc, 3.5);
    key.position.set(2.8, 4.2, 4.6);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa9c9f0, 2.7);
    rim.position.set(-3, 1.3, -2.5);
    scene.add(rim);
    const fill = new THREE.PointLight(0xf0c9cf, 34, 5);
    fill.position.set(0.4, 1.2, 2.5);
    scene.add(fill);

    let pmrem;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    } catch {
      // The directional lights still provide a readable material response if PMREM is unavailable.
    }
    const device = createDevice(scene);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.target.set(-0.08, 0.12, 0);
    const timer = new THREE.Timer();
    timer.connect(document);
    let frame = 0;
    let isDisposed = false;
    const render = (timestamp) => {
      if (isDisposed) return;
      frame = window.requestAnimationFrame(render);
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      if (playState.current) device.group.rotation.z = Math.sin(elapsed * 3.4) * 0.025;
      else device.group.rotation.z *= 0.92;
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

    const entrance = gsap.fromTo(device.group.scale, { x: 0.84, y: 0.84, z: 0.84 }, { x: 1, y: 1, z: 1, duration: 0.85, ease: 'back.out(1.25)' });
    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      timer.dispose();
      entrance.kill();
      device.float.kill();
      device.turn.kill();
      gsap.killTweensOf(device.outputBubbles.map((bubble) => bubble.position));
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        }
      });
      if (scene.environment) scene.environment.dispose?.();
      pmrem?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className={`device-canvas${playing ? ' is-playing' : ''}`} ref={mountRef} aria-label="可拖动旋转的 3D 声景装置" />;
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
    <section className="device-viewer glass-surface" ref={panelRef} aria-label="声景装置 3D 展示">
      <header className="device-viewer-head">
        <div className="device-detail"><span className="device-eyebrow">SOUNDSCAPE · OBJECT 01</span><h2>声景装置</h2></div>
        <button className="device-close" onClick={closeAnimated} aria-label="收起装置">−</button>
      </header>
      <DeviceCanvas playing={playing} />
      <div className="device-viewer-foot">
        <div className="device-detail"><span className={`device-live-dot${playing ? ' active' : ''}`} /><span>{playing ? '正在播放 · 泡泡正在冒出' : '拖动旋转 · 点击左下角收起'}</span></div>
        <div className="device-detail"><i className="device-key-icon" /> ESP32 · Wi‑Fi</div>
      </div>
    </section>
  );
}
