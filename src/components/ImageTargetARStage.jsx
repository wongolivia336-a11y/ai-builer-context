import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CapsuleWaterProgress from './CapsuleWaterProgress';
import './ImageTargetARStage.css';

const TARGETS = [
  { id: 'wind', file: 'memo-01-river-wind.svg', label: '河面上的风', accent: '#87d9eb' },
  { id: 'bell', file: 'memo-02-alley-bell.svg', label: '巷口的钟声', accent: '#c9b5ff' },
  { id: 'steps', file: 'memo-03-passing-steps.svg', label: '刚经过的人', accent: '#ff9ec5' },
  { id: 'osmanthus', file: 'memo-04-osmanthus-tea.svg', label: '桂花茶的下午', accent: '#d8cbff' },
  { id: 'rain', file: 'memo-05-after-rain.svg', label: '雨停以后', accent: '#83d9ee' },
  { id: 'market', file: 'memo-06-market-light.svg', label: '收摊前的灯', accent: '#ffe3a0' },
  { id: 'goodnight', file: 'memo-07-goodnight.svg', label: '没说出口的晚安', accent: '#ff9ec5' },
  { id: 'bicycle', file: 'memo-08-bicycle-bell.svg', label: '车铃经过', accent: '#83d9ee' },
];
const TARGET_CACHE_KEY = 'memo-garden-eight-markers-v1';
const TARGET_DB_NAME = 'memo-garden-ar-cache';
const TARGET_DB_STORE = 'compiled-targets';
const MOTION_LIMIT = 1;
const ACCENT_TINTS = { blue: '#87d9eb', rose: '#ff9ec5', lilac: '#c5b4ff', gold: '#ffe3a0' };
const importFromBrowserImportMap = (specifier) => import(/* @vite-ignore */ specifier);

function markerUrl(file) {
  return new URL((import.meta.env.BASE_URL || './') + 'markers/' + file, document.baseURI).href;
}

function openCacheDb() {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  return new Promise((resolve) => {
    let request;
    try { request = indexedDB.open(TARGET_DB_NAME, 1); } catch { resolve(null); return; }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(TARGET_DB_STORE)) request.result.createObjectStore(TARGET_DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function readCompiledTargets() {
  const db = await openCacheDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const request = db.transaction(TARGET_DB_STORE, 'readonly').objectStore(TARGET_DB_STORE).get(TARGET_CACHE_KEY);
      request.onsuccess = () => { db.close(); resolve(request.result || null); };
      request.onerror = () => { db.close(); resolve(null); };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

async function writeCompiledTargets(buffer) {
  const db = await openCacheDb();
  if (!db) return;
  await new Promise((resolve) => {
    try {
      const request = db.transaction(TARGET_DB_STORE, 'readwrite').objectStore(TARGET_DB_STORE).put(buffer, TARGET_CACHE_KEY);
      request.onsuccess = request.onerror = () => { db.close(); resolve(); };
    } catch {
      db.close();
      resolve();
    }
  });
}

function loadMarkerImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('识别图载入失败，请检查网络或重新载入页面。'));
    image.src = url;
  });
}

function asArrayBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
  if (value?.data instanceof ArrayBuffer) return value.data;
  throw new Error('识别图编译没有返回有效目标数据。');
}

function loadMotionPermission() {
  return new Promise((resolve) => {
    const Motion = window.DeviceMotionEvent;
    if (!Motion) { resolve(false); return; }
    if (typeof Motion.requestPermission === 'function') {
      Motion.requestPermission().then((value) => resolve(value === 'granted')).catch(() => resolve(false));
    } else resolve(true);
  });
}

function shapeForThree(THREE, kind) {
  const shape = new THREE.Shape();
  if (kind === 'orb') {
    shape.absarc(0, 0, 0.46, 0, Math.PI * 2, false);
    return shape;
  }
  if (kind === 'heart') {
    shape.moveTo(0, -0.47);
    shape.bezierCurveTo(-0.16, -0.29, -0.48, -0.04, -0.48, 0.2);
    shape.bezierCurveTo(-0.48, 0.52, -0.08, 0.6, 0, 0.32);
    shape.bezierCurveTo(0.1, 0.6, 0.48, 0.52, 0.48, 0.2);
    shape.bezierCurveTo(0.48, -0.04, 0.16, -0.29, 0, -0.47);
    return shape;
  }
  if (kind === 'cloud') {
    shape.moveTo(-0.4, -0.17);
    shape.bezierCurveTo(-0.56, 0.05, -0.33, 0.3, -0.14, 0.24);
    shape.bezierCurveTo(-0.09, 0.53, 0.3, 0.52, 0.33, 0.25);
    shape.bezierCurveTo(0.59, 0.25, 0.57, -0.1, 0.35, -0.17);
    shape.bezierCurveTo(0.23, -0.43, -0.1, -0.42, -0.17, -0.2);
    shape.bezierCurveTo(-0.25, -0.33, -0.39, -0.29, -0.4, -0.17);
    return shape;
  }
  const petals = kind === 'flower' ? 12 : 10;
  for (let index = 0; index < petals; index += 1) {
    const angle = (Math.PI * 2 * index) / petals - Math.PI / 2;
    const outer = kind === 'flower' ? 0.48 : 0.5;
    const inner = kind === 'flower' ? 0.31 : kind === 'star' ? 0.23 : 0.35;
    const radius = kind === 'flower' ? (index % 2 ? outer : inner) : (index % 2 ? inner : outer);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function makeBubbleVisual(THREE, sound) {
  const root = new THREE.Group();
  root.position.set(0, 0.31, 0.06);
  const tint = ACCENT_TINTS[sound.accent] || sound.accent || '#87d9eb';
  const shape = shapeForThree(THREE, sound.shape);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.115, bevelEnabled: true, bevelSegments: 7, steps: 1,
    bevelSize: 0.048, bevelThickness: 0.045, curveSegments: 28,
  });
  geometry.computeVertexNormals();
  geometry.translate(0, 0, -0.057);
  const material = new THREE.MeshPhysicalMaterial({
    color: tint, emissive: tint, emissiveIntensity: 0.12,
    transparent: true, opacity: 0.76, roughness: 0.055, metalness: 0.015,
    clearcoat: 1, clearcoatRoughness: 0.025, side: THREE.DoubleSide,
    depthWrite: false,
  });
  const volume = new THREE.Mesh(geometry, material);
  volume.scale.set(0.57, 0.57, 0.88);
  volume.renderOrder = 2;
  root.add(volume);

  const glimmerGeometry = new THREE.ShapeGeometry(shape, 28);
  const glimmerMaterial = new THREE.MeshBasicMaterial({
    color: '#fffefa', transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glimmer = new THREE.Mesh(glimmerGeometry, glimmerMaterial);
  glimmer.position.set(-0.018, 0.012, 0.071);
  glimmer.scale.setScalar(0.75);
  glimmer.renderOrder = 3;
  root.add(glimmer);

  const rimPoints = shape.getPoints(72).map((point) => new THREE.Vector3(point.x * 0.585, point.y * 0.585, 0.081));
  if (rimPoints.length) rimPoints.push(rimPoints[0].clone());
  const rimGeometry = new THREE.BufferGeometry().setFromPoints(rimPoints);
  const rimMaterial = new THREE.LineBasicMaterial({
    color: '#fffdf8', transparent: true, opacity: 0.92, depthWrite: false, depthTest: false,
  });
  const rim = new THREE.Line(rimGeometry, rimMaterial);
  rim.renderOrder = 4;
  root.add(rim);

  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 12, 10),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.98 }),
  );
  glint.position.set(-0.115, 0.15, 0.092);
  glint.renderOrder = 5;
  root.add(glint);

  const glintTrailPoints = [
    new THREE.Vector3(-0.17, 0.12, 0.085),
    new THREE.Vector3(-0.15, 0.16, 0.086),
    new THREE.Vector3(-0.12, 0.18, 0.087),
    new THREE.Vector3(-0.075, 0.19, 0.086),
  ];
  const trailGeometry = new THREE.BufferGeometry().setFromPoints(glintTrailPoints);
  const trailMaterial = new THREE.LineBasicMaterial({
    color: '#ffffff', transparent: true, opacity: 0.56, depthWrite: false,
  });
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  trail.renderOrder = 5;
  root.add(trail);

  const sparkle = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.022, 0),
    new THREE.MeshBasicMaterial({ color: '#fff7cf', transparent: true, opacity: 0.88 }),
  );
  sparkle.position.set(0.18, 0.14, 0.035);
  sparkle.renderOrder = 5;
  root.add(sparkle);

  return {
    root, body: volume, sticker: glimmer, glint, sparkle,
    resources: [
      geometry, material, glimmerGeometry, glimmerMaterial, rimGeometry, rimMaterial,
      glint.geometry, glint.material, trailGeometry, trailMaterial, sparkle.geometry, sparkle.material,
    ],
  };
}

function markerIndexForMessage(message, sounds) {
  const id = message.bubbleId || message.targetId || message.id;
  if (id) return sounds.find((sound) => sound.id === String(id)) || null;
  const index = Number.isInteger(message.targetIndex) ? message.targetIndex : Number(message.targetIndex);
  if (Number.isInteger(index) && index >= 0 && index < sounds.length) return sounds[index];
  return null;
}

export default function ImageTargetARStage({
  sounds, zoom, onZoom, onSelect, onCapture, onCloseCamera, onModeChange,
  capturedBubble, capturePhase, playing, onListen, onComments,
}) {
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0.04);
  const [statusCopy, setStatusCopy] = useState('准备识别图');
  const [errorCopy, setErrorCopy] = useState('');
  const [foundSound, setFoundSound] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('idle');
  const [deviceRssi, setDeviceRssi] = useState(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const stageHostRef = useRef(null);
  const runtimeRef = useRef(null);
  const deviceSocketRef = useRef(null);
  const cancelledRef = useRef(false);
  const activeSoundRef = useRef(null);
  const lostTimerRef = useRef(null);
  const gravityRef = useRef({ value: 0, baseline: null, tiltBaseline: null });
  const motionHandlersRef = useRef([]);
  const lastSignalAtRef = useRef(0);
  const latestRef = useRef({});
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const soundTargets = sounds.slice(0, TARGETS.length);
  const deviceEndpoint = new URLSearchParams(window.location.search).get('deviceWs') || import.meta.env.VITE_MEMO_CATCHER_WS || import.meta.env.VITE_ECHOCASTER_WS || '';
  const markerItems = TARGETS.map((target, index) => ({ ...target, url: markerUrl(target.file), sound: soundTargets[index] }));
  latestRef.current = {
    sounds: soundTargets, onSelect, onCapture, onCloseCamera, onZoom, onListen, onComments,
    capturedBubble, capturePhase, zoom, onModeChange,
  };

  const stopDeviceSocket = useCallback(() => {
    const socket = deviceSocketRef.current;
    deviceSocketRef.current = null;
    if (!socket) return;
    socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
    try { socket.close(); } catch {}
  }, []);

  const removeMotionListeners = useCallback(() => {
    motionHandlersRef.current.forEach(({ type, handler }) => window.removeEventListener(type, handler));
    motionHandlersRef.current = [];
  }, []);

  const handleDeviceSignal = useCallback((message, source = 'hardware') => {
    const now = Date.now();
    if (now - lastSignalAtRef.current < 1200) return;
    if (!['idle', 'absorbed'].includes(latestRef.current.capturePhase)) return;
    const namedSound = markerIndexForMessage(message, latestRef.current.sounds);
    const sound = namedSound || activeSoundRef.current;
    if (!sound) return;
    lastSignalAtRef.current = now;
    const index = latestRef.current.sounds.findIndex((item) => item.id === sound.id);
    if (index >= 0) latestRef.current.onSelect?.(index + 1);
    setFoundSound(sound);
    latestRef.current.onCapture?.(sound);
    if (source === 'hardware') setStatusCopy('正在收下这颗回声');
  }, []);

  const connectDevice = useCallback(() => {
    stopDeviceSocket();
    setDeviceRssi(null);
    if (!deviceEndpoint) {
      setDeviceStatus('demo');
      return;
    }
    if (!('WebSocket' in window)) {
      setDeviceStatus('unavailable');
      return;
    }
    setDeviceStatus('connecting');
    try {
      const socket = new WebSocket(deviceEndpoint);
      deviceSocketRef.current = socket;
      socket.onopen = () => setDeviceStatus('connected');
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const eventName = String(message.type || message.event || '').toLowerCase();
          if (typeof message.rssi === 'number') setDeviceRssi(message.rssi);
          if (eventName === 'capture' || eventName === 'trigger_capture' || eventName === 'button' || eventName === 'button_pressed' || eventName === 'capture_button' || eventName === 'physical_button') {
            handleDeviceSignal(message, 'hardware');
          }
        } catch {}
      };
      socket.onerror = () => setDeviceStatus('error');
      socket.onclose = () => {
        if (deviceSocketRef.current === socket) setDeviceStatus('disconnected');
      };
    } catch {
      setDeviceStatus('error');
    }
  }, [deviceEndpoint, handleDeviceSignal, stopDeviceSocket]);

  const stopScan = useCallback(() => {
    cancelledRef.current = true;
    window.clearTimeout(lostTimerRef.current);
    const runtime = runtimeRef.current;
    runtimeRef.current = null;
    window.clearTimeout(runtime?.burstTimer);
    if (runtime) {
      runtime.renderer?.setAnimationLoop(null);
      try { runtime.mindar?.stop(); } catch {}
      try { runtime.renderer?.dispose(); } catch {}
      runtime.resources?.forEach((resource) => resource.dispose?.());
      if (runtime.targetUrl) URL.revokeObjectURL(runtime.targetUrl);
    }
    stageHostRef.current?.querySelectorAll('video, canvas').forEach((node) => node.remove());
    stopDeviceSocket();
    removeMotionListeners();
    setDeviceStatus('idle');
    setMotionEnabled(false);
    setFoundSound(null);
    activeSoundRef.current = null;
    setStage('idle');
    latestRef.current.onModeChange?.(false);
  }, [stopDeviceSocket, removeMotionListeners]);

  useEffect(() => () => {
    cancelledRef.current = true;
    window.clearTimeout(lostTimerRef.current);
    removeMotionListeners();
    const runtime = runtimeRef.current;
    window.clearTimeout(runtime?.burstTimer);
    runtimeRef.current = null;
    if (runtime) {
      runtime.renderer?.setAnimationLoop(null);
      try { runtime.mindar?.stop(); } catch {}
      try { runtime.renderer?.dispose(); } catch {}
      runtime.resources?.forEach((resource) => resource.dispose?.());
      if (runtime.targetUrl) URL.revokeObjectURL(runtime.targetUrl);
    }
    stopDeviceSocket();
    latestRef.current.onModeChange?.(false);
  }, [stopDeviceSocket, removeMotionListeners]);

  const startScan = async () => {
    if (stage === 'preparing' || stage === 'starting' || stage === 'active') return;
    cancelledRef.current = false;
    setErrorCopy('');
    setFoundSound(null);
    activeSoundRef.current = null;
    latestRef.current.onCloseCamera?.();
    connectDevice();
    const motionPermissionRequest = loadMotionPermission();
    setStage('preparing');
    setProgress(0.04);
    setStatusCopy('正在准备镜头与声音图卡');
    latestRef.current.onModeChange?.(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (cancelledRef.current) return;
    let pendingTargetUrl = null;
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('相机识别需要 HTTPS 安全页面，并允许浏览器使用后置相机。');
      }
      const motionAllowed = await motionPermissionRequest;
      setMotionEnabled(motionAllowed);
      removeMotionListeners();
      if (motionAllowed) {
        const motionHandler = (event) => {
          const gravity = event.accelerationIncludingGravity?.y;
          if (typeof gravity !== 'number') return;
          if (gravityRef.current.baseline === null) gravityRef.current.baseline = gravity;
          const delta = (gravity - gravityRef.current.baseline) / 9.81;
          const target = Math.max(-MOTION_LIMIT, Math.min(MOTION_LIMIT, delta));
          gravityRef.current.value = gravityRef.current.value * 0.84 + target * 0.16;
        };
        const orientationHandler = (event) => {
          if (typeof event.beta !== 'number') return;
          if (gravityRef.current.tiltBaseline === null) gravityRef.current.tiltBaseline = event.beta;
          const target = Math.max(-MOTION_LIMIT, Math.min(MOTION_LIMIT, (event.beta - gravityRef.current.tiltBaseline) / 42));
          gravityRef.current.value = gravityRef.current.value * 0.9 + target * 0.1;
        };
        motionHandlersRef.current = [
          { type: 'devicemotion', handler: motionHandler },
          { type: 'deviceorientation', handler: orientationHandler },
        ];
        motionHandlersRef.current.forEach(({ type, handler }) => window.addEventListener(type, handler, { passive: true }));
      }

      const cache = await readCompiledTargets();
      let compiled = cache;
      if (compiled) {
        setProgress(0.5);
        setStatusCopy('已找到缓存识别库 · 加载追踪器');
      } else {
        setProgress(0.12);
        setStatusCopy('正在整理声音图卡');
        await importFromBrowserImportMap('mindar-image-compiler');
        const Compiler = window.MINDAR?.Compiler || window.MINDAR?.IMAGE?.Compiler;
          if (!Compiler) throw new Error('识别图编译器没有载入，请检查网络后重试。');
        const images = await Promise.all(markerItems.map((item) => loadMarkerImage(item.url)));
        const compiler = new Compiler();
        await compiler.compileImageTargets(images, (value) => {
          const raw = typeof value === 'number' ? value : Number(value?.progress ?? value?.value ?? 0);
          const fraction = Math.max(0, Math.min(1, raw > 1 ? raw / 100 : raw));
          setProgress(0.12 + fraction * 0.52);
        });
        compiled = asArrayBuffer(await compiler.exportData());
        await writeCompiledTargets(compiled);
      }
      if (cancelledRef.current) return;

      setProgress(0.72);
      setStatusCopy('正在启动后置相机与图像追踪');
      setStage('starting');
      const [threeModule, mindarModule] = await Promise.all([
        importFromBrowserImportMap('three'),
        importFromBrowserImportMap('mindar-image-three'),
      ]);
      const THREE = threeModule;
      const MindARThree = mindarModule.MindARThree || mindarModule.default?.MindARThree;
      if (!MindARThree) throw new Error('图像追踪引擎没有载入，请重新载入页面。');
      const targetUrl = URL.createObjectURL(new Blob([compiled], { type: 'application/octet-stream' }));
      pendingTargetUrl = targetUrl;
      const mindar = new MindARThree({
        container: stageHostRef.current,
        imageTargetSrc: targetUrl,
        maxTrack: 1,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        warmupTolerance: 7,
        missTolerance: 8,
        filterMinCF: 0.001,
        filterBeta: 1000,
      });
      const { renderer, scene, camera } = mindar;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
      scene.add(new THREE.HemisphereLight(0xf7fbff, 0x273443, 1.8));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
      keyLight.position.set(-1, 1.5, 2);
      scene.add(keyLight);

      const resources = [];
      const targetGroups = [];
      markerItems.forEach((item, index) => {
        const sound = item.sound;
        if (!sound) return;
        const anchor = mindar.addAnchor(index);
        const visual = makeBubbleVisual(THREE, sound);
        anchor.group.add(visual.root);
        resources.push(...visual.resources);
        const track = { sound, anchor, root: visual.root, body: visual.body, sticker: visual.sticker, glint: visual.glint, sparkle: visual.sparkle, baseY: 0.23, phase: index * 0.82 };
        targetGroups.push(track);
        anchor.onTargetFound = () => {
          window.clearTimeout(lostTimerRef.current);
          activeSoundRef.current = sound;
          setFoundSound(sound);
          const soundIndex = latestRef.current.sounds.findIndex((entry) => entry.id === sound.id);
          if (soundIndex >= 0) latestRef.current.onSelect?.(soundIndex + 1);
          setStatusCopy('识别到「' + sound.title + '」· 泡泡已浮现');
        };
        anchor.onTargetLost = () => {
          window.clearTimeout(lostTimerRef.current);
          lostTimerRef.current = window.setTimeout(() => {
            if (activeSoundRef.current?.id === sound.id) {
              activeSoundRef.current = null;
              setFoundSound(null);
              setStatusCopy('继续将一张识别图对准镜头');
            }
          }, 520);
        };
      });

      runtimeRef.current = { mindar, renderer, resources, targetGroups, targetUrl };
      pendingTargetUrl = null;
      await mindar.start();
      if (cancelledRef.current) {
        stopScan();
        return;
      }
      renderer.setAnimationLoop((time) => {
        const gravity = gravityRef.current.value;
        targetGroups.forEach((target) => {
          target.root.position.y = target.baseY + gravity * 0.075 + Math.sin(time * 0.0012 + target.phase) * 0.025;
          target.root.rotation.z = Math.sin(time * 0.00065 + target.phase) * 0.045;
          target.root.rotation.x = gravity * 0.035;
          const scale = latestRef.current.zoom || 1;
          target.root.scale.setScalar(scale);
          const breath = 1 + Math.sin(time * 0.0014 + target.phase) * 0.022;
          target.body.scale.set(0.57 * breath, 0.57 / breath, 0.88);
          target.glint.material.opacity = 0.78 + Math.sin(time * 0.003 + target.phase) * 0.16;
          target.sparkle.rotation.y = time * 0.0012 + target.phase;
          target.sticker.rotation.z = Math.sin(time * 0.0009 + target.phase) * 0.025;
        });
        renderer.render(scene, camera);
      });
      setProgress(1);
      setStage('burst');
      latestRef.current.onModeChange?.(true);
      runtimeRef.current.burstTimer = window.setTimeout(() => {
        setStage('active');
        setStatusCopy('对准一张识别图 · 发现泡泡后可听声音与留言');
      }, 1050);
    } catch (error) {
      if (cancelledRef.current) return;
      if (pendingTargetUrl) URL.revokeObjectURL(pendingTargetUrl);
      const failedRuntime = runtimeRef.current;
      runtimeRef.current = null;
      if (failedRuntime) {
        failedRuntime.renderer?.setAnimationLoop(null);
        try { failedRuntime.mindar?.stop(); } catch {}
        try { failedRuntime.renderer?.dispose(); } catch {}
        failedRuntime.resources?.forEach((resource) => resource.dispose?.());
        if (failedRuntime.targetUrl) URL.revokeObjectURL(failedRuntime.targetUrl);
      }
      stageHostRef.current?.querySelectorAll('video, canvas').forEach((node) => node.remove());
      removeMotionListeners();
      stopDeviceSocket();
      setDeviceStatus(deviceEndpoint ? 'error' : 'demo');
      setErrorCopy(error?.name === 'NotAllowedError' || error?.name === 'SecurityError'
        ? '请允许浏览器使用相机后再试。'
        : error?.name === 'NotFoundError'
          ? '没有找到可用的相机。'
          : '镜头暂时没有打开，请检查相机权限与网络后再试。');
      setStage('error');
      latestRef.current.onModeChange?.(false);
    }
  };

  const selectedSound = foundSound || activeSoundRef.current;
  const canCapture = !!selectedSound && stage === 'active' && ['idle', 'absorbed'].includes(capturePhase);

  const stagePortal = portalTarget && stage !== 'idle' ? createPortal(
    <div className="image-ar-overlay" role="dialog" aria-label="识别图 AR 扫描">
      <div ref={stageHostRef} className="image-ar-host" />
      {stage === 'preparing' || stage === 'starting' || stage === 'burst' ? (
        <div className={'image-ar-loader' + (stage === 'burst' ? ' is-complete' : '')} aria-live="polite">
          <div className="image-ar-loader-orbit" aria-hidden="true"><i /><i /><i /><b /></div>
          <strong>{stage === 'burst' ? '花园已经醒来' : statusCopy}</strong>
          <small>{stage === 'preparing' ? '正在为声音图卡做好准备' : stage === 'starting' ? '镜头即将打开，泡泡水正在注满' : '镜头就绪，开始漫游吧'}</small>
          <CapsuleWaterProgress progress={progress} />
          {stage === 'burst' && <div className="image-ar-burst" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ '--burst-index': index, '--burst-angle': (index * 360 / 22) + 'deg', '--burst-size': ((index % 4) * 2) + 'px', '--burst-drift': ((index % 5) * 12) + 'px' }} />)}</div>}
          <button type="button" className="image-ar-cancel" onClick={stopScan}>返回漫游</button>
        </div>
      ) : stage === 'error' ? (
        <div className="image-ar-loader image-ar-error-panel" role="alert">
          <strong>镜头暂时没有打开</strong>
          <p>{errorCopy}</p>
          <button type="button" className="image-ar-primary" onClick={startScan}>重新扫描</button>
          <button type="button" className="image-ar-cancel" onClick={stopScan}>返回漫游</button>
        </div>
      ) : (
        <div className="image-ar-hud">
          <div className="image-ar-topbar">
            <span className="image-ar-live"><i />{selectedSound ? '识别到一张图' : '识别图扫描中'}</span>
            <button type="button" className="image-ar-exit" onClick={stopScan}>结束扫描</button>
          </div>
          <div className="image-ar-scan-hint">{selectedSound ? '把镜头稍微靠近，泡泡会跟着图卡轻轻浮动' : '缓慢移动镜头，寻找声音图卡'}</div>
          {stage === 'burst' && <span className="image-ar-entry-burst" aria-hidden="true" />}
          {!selectedSound && <div className="image-ar-reticle" aria-hidden="true"><i /><b /></div>}
          {selectedSound && (
            <section className="image-ar-target-card">
              <div className="image-ar-target-heading">
                <span className="image-ar-target-orb" style={{ '--target-accent': markerItems.find((item) => item.sound?.id === selectedSound.id)?.accent || '#87d9eb' }}><i /></span>
                <div><small>{selectedSound.kind} · {selectedSound.author} · {selectedSound.duration}</small><strong>{selectedSound.title}</strong></div>
                <span className="image-ar-index">0{soundTargets.findIndex((item) => item.id === selectedSound.id) + 1}</span>
              </div>
              <p>{selectedSound.quote}</p>
              <div className="image-ar-target-comments">{selectedSound.comments?.[0]?.text ? '“' + selectedSound.comments[0].text + '”' : '这颗泡泡还没有留言。'}</div>
              <div className="image-ar-target-actions">
                <button type="button" onClick={() => latestRef.current.onListen?.(selectedSound)}>{playing ? '正在回响' : '♫ 听一听'}</button>
                <button type="button" onClick={() => latestRef.current.onComments?.(selectedSound)}>♡ 留言 {selectedSound.comments?.length || 0}</button>
              </div>
              <div className="image-ar-capture-line">
                <span><i />瞄准泡泡，轻点或按下 Memo Catcher 收下回声</span>
                {canCapture && <button type="button" onClick={() => handleDeviceSignal({ bubbleId: selectedSound.id }, 'manual')}>捕捉泡泡</button>}
              </div>
            </section>
          )}
          {capturedBubble && capturePhase !== 'idle' && (
            <>
              {capturePhase === 'travelling' && <svg className="image-ar-water-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="image-ar-liquid-gradient" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#b6f8df" stopOpacity="0" /><stop offset=".44" stopColor="#b6f8df" /><stop offset=".78" stopColor="#e4caff" /><stop offset="1" stopColor="#fff" /></linearGradient><filter id="image-ar-liquid-blur"><feGaussianBlur stdDeviation="1.3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path className="image-ar-water-ribbon" d="M2 82 C27 17 73 78 50 49" stroke="url(#image-ar-liquid-gradient)" filter="url(#image-ar-liquid-blur)" /><path className="image-ar-water-core" d="M2 82 C27 17 73 78 50 49" stroke="url(#image-ar-liquid-gradient)" /></svg>}
              {capturePhase !== 'absorbed' && <div className={'image-ar-captured-bubble phase-' + capturePhase + (playing ? ' is-playing' : '')}>
                <button type="button" className="image-ar-capture-orb" aria-label="点击聆听捕捉到的泡泡" onClick={() => latestRef.current.onListen?.()}><i /><b /></button>
                <strong>{capturePhase === 'travelling' ? '泡泡正在靠岸' : playing ? '声音正在回响' : capturePhase === 'absorbing' ? '正在被右侧花园收下' : '轻点再听一次'}</strong>
                <small>{capturedBubble.title}</small>
              </div>}
              {capturePhase === 'absorbed' && <div className="image-ar-absorbed-note"><i />{capturedBubble.title} 已收入个人回声</div>}
            </>
          )}
          <div className="image-ar-bottom-tools">
            <div className="image-ar-zoom">
              <button type="button" aria-label="放大泡泡" onClick={() => latestRef.current.onZoom?.(Math.min(2.2, (latestRef.current.zoom || 1) + 0.16))}>＋</button>
              <span>{Math.round((latestRef.current.zoom || 1) * 100)}%</span>
              <button type="button" aria-label="缩小泡泡" onClick={() => latestRef.current.onZoom?.(Math.max(0.72, (latestRef.current.zoom || 1) - 0.16))}>−</button>
            </div>
            <span className="image-ar-motion">{motionEnabled ? '随手势轻轻漂浮' : '轻轻漂浮'}</span>
          </div>
        </div>
      )}
    </div>,
    portalTarget,
  ) : null;

  return (
    <>
      <section className="image-ar-entry">
        <div className="image-ar-entry-copy">
          <span className="image-ar-entry-eyebrow">漫游拾音</span>
          <strong>扫描声音图卡，让泡泡浮现</strong>
          <small>每张图卡都藏着一段独一无二的回声。</small>
          <button type="button" className="image-ar-entry-button" onClick={startScan}>开始扫描 <i>↗</i></button>
        </div>
        <details className="image-ar-marker-list">
          <summary>声音图卡 <i>＋</i></summary>
          <div className="image-ar-marker-grid">
            {markerItems.map((item, index) => (
              <a key={item.id} className="image-ar-marker-link" href={item.url} download={item.file} aria-label={'下载第 ' + (index + 1) + ' 张识别图：' + item.sound?.title}>
                <img src={item.url} alt="" loading="lazy" />
                <span><i>0{index + 1}</i>{item.sound?.title || item.label}</span>
              </a>
            ))}
          </div>
          <p>选一张图卡，用镜头寻找对应的声音泡泡。</p>
        </details>
      </section>
      {stagePortal}
    </>
  );
}
