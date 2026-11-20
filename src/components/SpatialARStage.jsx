import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';

const TINT = { blue: '#83d9ee', rose: '#ff9ec5', lilac: '#c9b5ff', gold: '#ffe3a0' };
const POSITIONS = [[0, 0, 0, 1], [-0.34, 0.2, 0.04, 0.82], [0.35, 0.17, -0.02, 0.76], [-0.18, -0.32, 0.08, 0.72]];

function bubbleShape(kind) {
  const shape = new THREE.Shape();
  if (kind === 'heart') {
    shape.moveTo(0, -0.45);
    shape.bezierCurveTo(-0.12, -0.3, -0.48, -0.05, -0.48, 0.2);
    shape.bezierCurveTo(-0.48, 0.55, -0.08, 0.6, 0, 0.32);
    shape.bezierCurveTo(0.1, 0.6, 0.48, 0.55, 0.48, 0.2);
    shape.bezierCurveTo(0.48, -0.05, 0.12, -0.3, 0, -0.45);
    return shape;
  }
  const count = kind === 'flower' ? 12 : 10;
  const outside = kind === 'flower' ? 0.48 : 0.49;
  const inside = kind === 'flower' ? 0.32 : kind === 'star' ? 0.23 : 0.34;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const radius = kind === 'flower' ? (i % 2 ? outside : inside) : (i % 2 ? inside : outside);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function liquidMaterial(color) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTint: { value: new THREE.Color(color) } },
    vertexShader: 'varying vec3 vNormal; varying vec3 vView; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
    fragmentShader: 'uniform vec3 uTint; varying vec3 vNormal; varying vec3 vView; void main(){ float f=max(dot(normalize(vNormal),normalize(vView)),0.0); float rim=pow(1.0-f,2.2); vec3 spectral=0.5+0.5*cos(vec3(0.3,2.35,4.5)+rim*7.2); vec3 color=mix(uTint,spectral,0.24+rim*0.5); float alpha=0.22+rim*0.68; gl_FragColor=vec4(color,alpha); }',
    side: THREE.DoubleSide,
  });
}

function buildBubbles(sounds) {
  const root = new THREE.Group();
  const targets = [];
  const materials = [];
  const geometries = [];
  sounds.slice(0, 4).forEach((sound, index) => {
    const [x, y, z, scale] = POSITIONS[index];
    const target = new THREE.Group();
    const tint = TINT[sound.accent] || TINT.blue;
    target.position.set(x, y, z);
    target.scale.setScalar(scale);
    target.userData.sound = sound;
    target.userData.baseScale = scale;

    const sphereGeometry = new THREE.SphereGeometry(0.19, 28, 20);
    const sphereMaterial = liquidMaterial(tint);
    geometries.push(sphereGeometry);
    materials.push(sphereMaterial);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.userData.sound = sound;
    target.add(sphere);

    const geometry = new THREE.ExtrudeGeometry(bubbleShape(sound.shape), {
      depth: 0.05, bevelEnabled: true, bevelSegments: 3, steps: 1,
      bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 12,
    });
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({
      color: tint, emissive: tint, emissiveIntensity: 0.12, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.04,
      clearcoat: 1, clearcoatRoughness: 0.06, side: THREE.DoubleSide, depthWrite: false,
    });
    geometries.push(geometry);
    materials.push(material);
    const sticker = new THREE.Mesh(geometry, material);
    sticker.position.z = 0.17;
    sticker.scale.setScalar(0.4);
    sticker.userData.sound = sound;
    target.add(sticker);

    const edgeGeometry = new THREE.EdgesGeometry(geometry, 22);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: '#fff9e8', transparent: true, opacity: 0.82 });
    geometries.push(edgeGeometry);
    materials.push(edgeMaterial);
    const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edge.position.copy(sticker.position);
    edge.scale.copy(sticker.scale);
    target.add(edge);

    const glintGeometry = new THREE.SphereGeometry(0.018, 12, 10);
    const glintMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 });
    geometries.push(glintGeometry);
    materials.push(glintMaterial);
    const glint = new THREE.Mesh(glintGeometry, glintMaterial);
    glint.position.set(-0.075, 0.1, 0.185);
    target.add(glint);

    root.add(target);
    targets.push(target);
  });
  const points = [];
  for (let i = 0; i <= 64; i += 1) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * 0.64, Math.sin(angle) * 0.25, -0.03));
  }
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: '#d9ffd0', transparent: true, opacity: 0.7 });
  geometries.push(orbitGeometry);
  materials.push(orbitMaterial);
  root.add(new THREE.Line(orbitGeometry, orbitMaterial));
  return { root, targets, geometries, materials };
}

function disposeResources(resources) {
  if (!resources || resources.closed) return;
  resources.closed = true;
  resources.renderer.setAnimationLoop(null);
  resources.hitSource?.cancel?.();
  resources.controller.removeEventListener('select', resources.onSelect);
  resources.geometries.forEach((item) => item.dispose());
  resources.materials.forEach((item) => item.dispose());
  resources.renderer.dispose();
  resources.renderer.domElement.remove();
}

export default function SpatialARStage({ sounds, zoom, onZoom, onSelect, onCapture, onCloseCamera, onModeChange, capturedBubble, capturePhase, playing, onListen }) {
  const [support, setSupport] = useState('checking');
  const [status, setStatus] = useState('idle');
  const [placed, setPlaced] = useState(false);
  const [surfaceSeen, setSurfaceSeen] = useState(false);
  const [errorCopy, setErrorCopy] = useState('');
  const [commentPreview, setCommentPreview] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [captureFlash, setCaptureFlash] = useState(false);
  const overlayRef = useRef(null);
  const canvasHostRef = useRef(null);
  const activeRef = useRef(null);
  const latestRef = useRef({});
  const mountedRef = useRef(true);
  const placedRef = useRef(false);
  const clusterRef = useRef(null);
  const targetsRef = useRef([]);
  const anchorRef = useRef(null);
  const zoomRef = useRef(zoom);
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  latestRef.current = { sounds, onSelect, onCapture, onCloseCamera, onZoom, onListen, onModeChange };
  zoomRef.current = zoom;

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (!window.isSecureContext) { if (mounted) setSupport('insecure'); return; }
      if (!navigator.xr?.isSessionSupported) { if (mounted) setSupport('unsupported'); return; }
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (mounted) setSupport(supported ? 'supported' : 'unsupported');
      } catch { if (mounted) setSupport('unsupported'); }
    };
    check();
    return () => { mounted = false; };
  }, []);

  const stopAR = useCallback(async () => {
    const resource = activeRef.current;
    if (!resource) return;
    try { await resource.session.end(); }
    catch { resource.dispose(); activeRef.current = null; setStatus('idle'); }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const resource = activeRef.current;
      if (!resource) return;
      disposeResources(resource);
      activeRef.current = null;
      resource.session.end().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (clusterRef.current) clusterRef.current.scale.setScalar(zoom);
  }, [zoom]);

  useEffect(() => {
    latestRef.current.onModeChange?.(status === 'active');
  }, [status]);

  useEffect(() => () => latestRef.current.onModeChange?.(false), []);

  const captureSelectedSound = (sound) => {
    if (!sound) return;
    const target = targetsRef.current.find((item) => item.userData.sound?.id === sound.id);
    if (target) {
      target.userData.capturedAt = performance.now();
      target.userData.isSelected = false;
    }
    setCaptureFlash(true);
    window.setTimeout(() => setCaptureFlash(false), 1250);
    window.setTimeout(() => latestRef.current.onCapture?.(sound), 260);
  };

  const startAR = async () => {
    if (support !== 'supported' || status === 'starting' || status === 'active') return;
    setStatus('starting');
    setSelectedSound(null);
    setCommentPreview(null);
    setErrorCopy('');
    latestRef.current.onCloseCamera?.();
    let session;
    let renderer;
    let resources;
    try {
      const overlayRoot = overlayRef.current;
      const sessionRequest = navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['anchors', 'dom-overlay'],
        domOverlay: overlayRoot ? { root: overlayRoot } : undefined,
      });
      session = await sessionRequest;
      if (!mountedRef.current) { await session.end(); return; }
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');
      renderer.domElement.className = 'spatial-ar-canvas';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      canvasHostRef.current?.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 30);
      scene.add(new THREE.HemisphereLight(0xf5fbff, 0x57656a, 1.5));
      const reticle = new THREE.Group();
      const ringMaterial = new THREE.MeshBasicMaterial({ color: '#d7ff72', transparent: true, opacity: 0.94, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.091, 40), ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      reticle.add(ring);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), new THREE.MeshBasicMaterial({ color: '#fffde7' }));
      dot.position.y = 0.006;
      reticle.add(dot);
      reticle.visible = false;
      scene.add(reticle);
      const cluster = new THREE.Group();
      cluster.visible = false;
      scene.add(cluster);

      const viewerSpace = await session.requestReferenceSpace('viewer');
      const hitSource = await session.requestHitTestSource({ space: viewerSpace });
      if (!mountedRef.current) { hitSource.cancel?.(); await session.end(); renderer.dispose(); renderer.domElement.remove(); return; }
      const controller = renderer.xr.getController(0);
      scene.add(controller);
      const raycaster = new THREE.Raycaster();
      const dispose = () => {
        disposeResources(resources);
        if (activeRef.current === resources) activeRef.current = null;
        placedRef.current = false;
        clusterRef.current = null;
        targetsRef.current = [];
        anchorRef.current = null;
        setPlaced(false);
        setSurfaceSeen(false);
        setStatus('idle');
      };
      resources = {
        session, renderer, scene, camera, reticle, cluster, hitSource, controller, raycaster,
        geometries: [ring.geometry, dot.geometry],
        materials: [ringMaterial, dot.material],
        closed: false,
        dispose,
      };
      const findSound = () => {
        if (!targetsRef.current.length) return null;
        raycaster.setFromXRController(controller);
        const hits = raycaster.intersectObjects(targetsRef.current, true);
        for (const hit of hits) {
          let object = hit.object;
          while (object && !object.userData?.sound) object = object.parent;
          if (object?.userData?.sound) return object.userData.sound;
        }
        return null;
      };
      const onSelect = async (event) => {
        const sound = findSound();
        if (placedRef.current) {
          if (!sound) return;
          const index = latestRef.current.sounds.findIndex((item) => item.id === sound.id);
          if (index >= 0) latestRef.current.onSelect?.(index + 1);
          targetsRef.current.forEach((target) => { target.userData.isSelected = target.userData.sound?.id === sound.id; });
          setSelectedSound(sound);
          setCommentPreview(null);
          return;
        }
        const referenceSpace = renderer.xr.getReferenceSpace();
        const hit = event.frame?.getHitTestResults(hitSource)?.[0];
        const pose = hit && referenceSpace ? hit.getPose(referenceSpace) : null;
        if (!pose) return;
        const bubbleSet = buildBubbles(latestRef.current.sounds);
        resources.geometries.push(...bubbleSet.geometries);
        resources.materials.push(...bubbleSet.materials);
        const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        matrix.decompose(position, rotation, scale);
        const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(rotation).normalize();
        cluster.position.copy(position).addScaledVector(normal, 0.42);
        const xrCamera = renderer.xr.getCamera(camera);
        xrCamera.updateMatrixWorld(true);
        xrCamera.getWorldQuaternion(cluster.quaternion);
        bubbleSet.root.position.set(0, 0, 0);
        bubbleSet.root.rotation.z = 0;
        bubbleSet.root.scale.setScalar(zoomRef.current);
        cluster.add(bubbleSet.root);
        cluster.visible = true;
        clusterRef.current = bubbleSet.root;
        targetsRef.current = bubbleSet.targets;
        placedRef.current = true;
        setSelectedSound(null);
        setPlaced(true);
        try { if (typeof hit.createAnchor === 'function') anchorRef.current = await hit.createAnchor(); } catch { anchorRef.current = null; }
      };
      resources.onSelect = onSelect;
      controller.addEventListener('select', onSelect);
      session.addEventListener('end', dispose, { once: true });

      const normalAxis = new THREE.Vector3(0, 1, 0);
      renderer.setAnimationLoop((time, frame) => {
        if (frame) {
          const referenceSpace = renderer.xr.getReferenceSpace();
          const anchor = anchorRef.current;
          if (anchor && referenceSpace && placedRef.current) {
            const pose = frame.getPose(anchor.anchorSpace, referenceSpace);
            if (pose && cluster.children[0]) {
              const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
              const position = new THREE.Vector3();
              const rotation = new THREE.Quaternion();
              const scale = new THREE.Vector3();
              matrix.decompose(position, rotation, scale);
              const normal = normalAxis.clone().applyQuaternion(rotation).normalize();
              cluster.position.copy(position).addScaledVector(normal, 0.42);
              const xrCamera = renderer.xr.getCamera(camera);
              xrCamera.updateMatrixWorld(true);
              xrCamera.getWorldQuaternion(cluster.quaternion);
            }
          }
          const result = frame.getHitTestResults(hitSource)[0];
          const hitPose = result && referenceSpace ? result.getPose(referenceSpace) : null;
          reticle.visible = !!hitPose && !placedRef.current;
          if (hitPose && !placedRef.current) {
            reticle.matrix.fromArray(hitPose.transform.matrix);
            reticle.matrix.decompose(reticle.position, reticle.quaternion, reticle.scale);
            reticle.matrixAutoUpdate = true;
            setSurfaceSeen((seen) => seen || true);
          }
          if (cluster.visible) {
            if (cluster.children[0]) {
              cluster.children[0].rotation.z = Math.sin(time * 0.00055) * 0.025;
              cluster.children[0].scale.setScalar(zoomRef.current);
            }
            for (const target of targetsRef.current) {
              if (target.userData.capturedAt) {
                const progress = Math.min(1, (time - target.userData.capturedAt) / 620);
                const eased = progress * progress * (3 - 2 * progress);
                target.scale.setScalar(target.userData.baseScale * (1 - eased * 0.82));
                if (progress >= 1) target.visible = false;
              } else if (target.userData.isSelected) {
                target.scale.setScalar(target.userData.baseScale * (1 + Math.sin(time * 0.009) * 0.045));
              } else target.scale.setScalar(target.userData.baseScale);
            }
          }
        }
        renderer.render(scene, camera);
      });
      await renderer.xr.setSession(session);
      if (!mountedRef.current) {
        resources.dispose();
        await session.end().catch(() => {});
        return;
      }
      activeRef.current = resources;
      setStatus('active');
    } catch (error) {
      try { await session?.end(); } catch {}
      if (renderer) renderer.dispose();
      renderer?.domElement.remove();
      if (mountedRef.current) {
        setErrorCopy(error?.name === 'NotAllowedError' ? '相机或空间追踪权限未开启，请允许浏览器使用相机后重试。' : '空间 AR 没有启动成功。请确认设备支持 hit-test，并在 HTTPS 页面打开。');
        setStatus('error');
      }
    }
  };

  const portal = portalTarget ? createPortal(
    <div ref={overlayRef} className={'spatial-ar-overlay-root' + (status === 'active' ? ' is-visible' : '')} aria-label="空间泡泡 AR">
      <div ref={canvasHostRef} className="spatial-ar-canvas-host" />
      {status === 'active' && (
        <div className="spatial-ar-hud">
          <div className="spatial-hud-top">
            <span className="spatial-live-pill"><i />{placed ? '表面已锚定' : surfaceSeen ? '空间平面已识别' : '正在寻找真实平面'}</span>
            <button type="button" className="spatial-exit" onClick={stopAR}>退出 AR</button>
          </div>
          {!placed && <div className="spatial-reticle-help">{surfaceSeen ? '准星已找到表面 · 轻点放下一组泡泡' : '缓慢移动手机，扫描地面、桌面或墙面'}</div>}
          {placed && <div className="spatial-reticle-help">{selectedSound ? '已选中泡泡 · 可试听、看留言或捕捉' : '轻点一颗泡泡选择它，再决定如何回应'}</div>}
          <div className="spatial-zoom-controls"><button type="button" aria-label="放大泡泡" onClick={() => latestRef.current.onZoom?.(Math.min(2.2, zoomRef.current + 0.16))}>＋</button><span>{Math.round(zoomRef.current * 100)}%</span><button type="button" aria-label="缩小泡泡" onClick={() => latestRef.current.onZoom?.(Math.max(0.72, zoomRef.current - 0.16))}>−</button></div>
          {placed && selectedSound && <section className="spatial-bubble-card">
            <div className="spatial-bubble-copy"><small>{selectedSound.kind} · {selectedSound.author} · {selectedSound.duration}</small><strong>{selectedSound.title}</strong><p>{selectedSound.quote}</p></div>
            <div className="spatial-bubble-actions">
              <button type="button" onClick={() => latestRef.current.onListen?.(selectedSound)}>♫ 听一听</button>
              <button type="button" onClick={() => setCommentPreview(selectedSound)}>♡ 留言 {selectedSound.comments?.length || 0}</button>
              <button type="button" className="is-primary" disabled={capturePhase === 'travelling' || capturedBubble?.id === selectedSound.id} onClick={() => captureSelectedSound(selectedSound)}>{capturedBubble?.id === selectedSound.id ? '已捕捉' : capturePhase === 'travelling' ? '光流靠近中' : '捕捉泡泡'}</button>
            </div>
          </section>}
          {capturePhase === 'travelling' && <svg className="spatial-capture-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="xr-liquid-flow" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#b5ffde" stopOpacity="0" /><stop offset=".42" stopColor="#b5ffde" /><stop offset=".76" stopColor="#e7caff" /><stop offset="1" stopColor="#fff" /></linearGradient><filter id="xr-flow-glow"><feGaussianBlur stdDeviation="1.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path d="M4 86 C22 28 76 78 50 50" pathLength="100" stroke="url(#xr-liquid-flow)" filter="url(#xr-flow-glow)" /></svg>}
          {(capturePhase === 'arrived' || capturePhase === 'listening') && capturedBubble && <button type="button" className={'spatial-captured-bubble' + (playing ? ' is-playing' : '')} onClick={() => latestRef.current.onListen?.()}><i className={'spatial-captured-orb accent-' + (capturedBubble.accent || 'blue')}><b /></i><strong>{playing ? '正在回响' : '轻点听听'}</strong><small>{capturedBubble.title}</small></button>}
          {commentPreview && <aside className="spatial-comment-glass"><button type="button" className="spatial-comment-close" aria-label="关闭留言" onClick={() => setCommentPreview(null)}>×</button><small>{commentPreview.author} 留下的回声</small><strong>{commentPreview.title}</strong><p>{commentPreview.comments?.[0]?.text || '这颗泡泡还没有留言。'}</p></aside>}
          {captureFlash && <span className="spatial-capture-flash" aria-hidden="true" />}
        </div>
      )}
    </div>,
    portalTarget,
  ) : null;

  const checking = support === 'checking' || status === 'starting';
  const message = support === 'insecure'
    ? '空间识别需要 HTTPS 安全页面。'
    : support === 'unsupported'
      ? '此浏览器未开放 WebXR 空间追踪。下方泡泡是可点选、可缩放的屏幕预览；真实平面锚定需支持 WebXR hit-test 的 Android Chrome + ARCore。'
      : support === 'error' ? errorCopy : '';

  return (
    <>
      {status !== 'active' && <section className={'spatial-ar-entry' + (support === 'unsupported' || support === 'insecure' ? ' is-fallback' : '')} aria-live="polite">
        {support === 'supported'
          ? <button type="button" className="spatial-ar-launch" onClick={startAR} disabled={checking}><span className="spatial-launch-icon">✳</span><span><strong>{checking ? (status === 'starting' ? '正在启动空间 AR…' : '正在检查设备…') : '进入空间 AR'}</strong><small>平面识别 · 选泡试听/留言/捕捉</small></span><i>↗</i></button>
          : <div className="spatial-fallback-copy"><span className="spatial-launch-icon">{support === 'checking' ? '◌' : '⌁'}</span><span><strong>{support === 'checking' ? '正在检查空间 AR' : support === 'insecure' ? '需要安全连接' : '空间 AR 设备提示'}</strong><small>{support === 'checking' ? '检查浏览器的平面追踪能力' : message}</small></span></div>}
        {support === 'error' && <small className="spatial-ar-error">{errorCopy}</small>}
      </section>}
      {portal}
    </>
  );
}
