'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers } from 'lucide-react';

interface RetroHeroCanvasProps {
  initialMode?: 'toy' | 'streetwear';
  allowToggle?: boolean;
}

export default function RetroHeroCanvas({
  initialMode = 'toy',
  allowToggle = true,
}: RetroHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'toy' | 'streetwear'>(initialMode);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isSceneReady, setIsSceneReady] = useState(false);

  // Sync mode with URL query parameter ?scene=toy or ?scene=streetwear if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sceneParam = params.get('scene') || params.get('mode');
      if (sceneParam === 'streetwear' || sceneParam === 'elements' || sceneParam === '2') {
        setMode('streetwear');
      } else if (sceneParam === 'toy' || sceneParam === '1') {
        setMode('toy');
      }
    }
  }, []);

  // Update mode state
  const handleToggleMode = (newMode: 'toy' | 'streetwear') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('scene', newMode);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff3d1, 3.2);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambientLight);

    // Fill light (creamy bounce)
    const fillLight = new THREE.DirectionalLight(0xffebba, 1.8);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    // Burgundy rim light for retro depth
    const rimLight = new THREE.DirectionalLight(0x661716, 2.5);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Group for the entire interactive scene
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // Group for the central character (allows squish and independent tilt)
    const toyGroup = new THREE.Group();
    sceneGroup.add(toyGroup);

    // --- Create 5-Lobed Plump Star Mascot Geometry ---
    const shape = new THREE.Shape();
    const pointsCount = 90;
    const baseR = 1.6;
    const amp1 = 0.65;
    const amp2 = 0.1;

    for (let i = 0; i <= pointsCount; i++) {
      const theta = (i / pointsCount) * Math.PI * 2;
      // 5-lobed smooth harmonic curve, oriented upwards (-PI / 2)
      const r = baseR + amp1 * Math.cos(5 * (theta - Math.PI / 2)) - amp2 * Math.cos(10 * (theta - Math.PI / 2));
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.35,
      bevelThickness: 0.35,
    };

    const toyGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    toyGeometry.center();

    // --- Create Mascot Face Texture (Cute Retro Streetwear Face) ---
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 1024;
    faceCanvas.height = 1024;
    const ctx = faceCanvas.getContext('2d')!;

    // Yellow background for the front face
    ctx.fillStyle = '#FFDD48';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle warm vinyl gradient
    const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 500);
    grad.addColorStop(0, '#FFE875');
    grad.addColorStop(1, '#FFDD48');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // --- Draw Mascot Eyes ---
    ctx.fillStyle = '#661716'; // Burgundy eyes
    // Left eye
    ctx.beginPath();
    ctx.ellipse(430, 440, 24, 38, -0.05, 0, Math.PI * 2);
    ctx.fill();
    // Left eye gleam
    ctx.fillStyle = '#FFF8EE';
    ctx.beginPath();
    ctx.ellipse(422, 428, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#661716';
    ctx.beginPath();
    ctx.ellipse(594, 440, 24, 38, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Right eye gleam
    ctx.fillStyle = '#FFF8EE';
    ctx.beginPath();
    ctx.ellipse(586, 428, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Rosy Cheeks ---
    ctx.fillStyle = 'rgba(230, 120, 100, 0.35)';
    ctx.beginPath();
    ctx.ellipse(370, 485, 32, 18, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(654, 485, 32, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // --- Happy Mouth ---
    ctx.strokeStyle = '#661716';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(512, 475, 45, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Tongue inside mouth
    ctx.fillStyle = '#E86666';
    ctx.beginPath();
    ctx.arc(512, 492, 22, 0, Math.PI, false);
    ctx.fill();

    // --- "QUIRONA STORE" Retro Badge on Belly ---
    ctx.save();
    ctx.translate(512, 600);
    // Badge pill shadow
    ctx.fillStyle = '#440C0B';
    ctx.beginPath();
    ctx.roundRect(-170, -38, 340, 76, [38]);
    ctx.fill();
    // Badge pill top
    ctx.fillStyle = '#661716';
    ctx.beginPath();
    ctx.roundRect(-174, -42, 340, 76, [38]);
    ctx.fill();

    // Gold border around badge
    ctx.strokeStyle = '#FFECB9';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Lettering
    ctx.fillStyle = '#FFDD48';
    ctx.font = '900 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText('QUIRONA', 0, -6);

    ctx.fillStyle = '#FFECB9';
    ctx.font = '800 18px sans-serif';
    ctx.fillText('STORE 2026', 0, 20);
    ctx.restore();

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    // Materials
    // Front face material with face texture
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.3,
      metalness: 0.05,
    });

    // Side & back material with warm yellow vinyl
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdd48,
      roughness: 0.28,
      metalness: 0.08,
    });

    const toyMesh = new THREE.Mesh(toyGeometry, [frontMaterial, bodyMaterial]);
    toyMesh.castShadow = true;
    toyMesh.receiveShadow = true;
    toyGroup.add(toyMesh);

    // --- Inverted Outline Hull for Authentic Comic/Vinyl Pop ---
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x661716,
      side: THREE.BackSide,
    });
    const outlineMesh = new THREE.Mesh(toyGeometry, outlineMat);
    outlineMesh.scale.set(1.04, 1.04, 1.04);
    toyGroup.add(outlineMesh);

    // -------------------------------------------------------------
    // OPTION 2: STREETWEAR ACCESSORIES (Hang Tag, Enamel Pin, Tape)
    // -------------------------------------------------------------
    const accessoriesGroup = new THREE.Group();
    sceneGroup.add(accessoriesGroup);

    // 1. Hang Tag (Etiqueta Streetwear con cordón)
    const tagGroup = new THREE.Group();
    // Card shape
    const tagShape = new THREE.Shape();
    const tw = 1.0;
    const th = 1.6;
    const tr = 0.12;
    tagShape.moveTo(-tw / 2 + tr, -th / 2);
    tagShape.lineTo(tw / 2 - tr, -th / 2);
    tagShape.quadraticCurveTo(tw / 2, -th / 2, tw / 2, -th / 2 + tr);
    tagShape.lineTo(tw / 2, th / 2 - tr);
    tagShape.quadraticCurveTo(tw / 2, th / 2, tw / 2 - tr, th / 2);
    tagShape.lineTo(-tw / 2 + tr, th / 2);
    tagShape.quadraticCurveTo(-tw / 2, th / 2, -tw / 2, th / 2 - tr);
    tagShape.lineTo(-tw / 2, -th / 2 + tr);
    tagShape.quadraticCurveTo(-tw / 2, -th / 2, -tw / 2 + tr, -th / 2);

    const tagGeom = new THREE.ExtrudeGeometry(tagShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
    });
    tagGeom.center();

    // Tag Texture
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 512;
    tagCanvas.height = 800;
    const tctx = tagCanvas.getContext('2d')!;
    tctx.fillStyle = '#DAD6BB'; // Arena Sage
    tctx.fillRect(0, 0, 512, 800);
    // Border
    tctx.strokeStyle = '#661716';
    tctx.lineWidth = 14;
    tctx.strokeRect(20, 20, 472, 760);
    // Eyelet hole
    tctx.fillStyle = '#661716';
    tctx.beginPath();
    tctx.arc(256, 90, 28, 0, Math.PI * 2);
    tctx.fill();
    tctx.fillStyle = '#FFDD48';
    tctx.beginPath();
    tctx.arc(256, 90, 16, 0, Math.PI * 2);
    tctx.fill();

    // Text on tag
    tctx.fillStyle = '#661716';
    tctx.font = 'bold 44px sans-serif';
    tctx.textAlign = 'center';
    tctx.fillText('QUIRONA', 256, 260);
    tctx.font = '24px sans-serif';
    tctx.letterSpacing = '4px';
    tctx.fillText('ORIGINAL CUT', 256, 310);
    tctx.font = 'bold 36px monospace';
    tctx.fillText('MEDIDAS CM', 256, 460);
    tctx.font = '22px sans-serif';
    tctx.fillText('CARACAS - 2026', 256, 680);

    const tagTex = new THREE.CanvasTexture(tagCanvas);
    tagTex.colorSpace = THREE.SRGBColorSpace;

    const tagMat = new THREE.MeshStandardMaterial({
      map: tagTex,
      roughness: 0.5,
      metalness: 0.1,
    });
    const tagMesh = new THREE.Mesh(tagGeom, tagMat);
    tagMesh.castShadow = true;
    tagGroup.add(tagMesh);

    // Golden Eyelet Ring on top
    const ringGeom = new THREE.TorusGeometry(0.1, 0.03, 8, 20);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffdd48,
      metalness: 0.85,
      roughness: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeom, goldMat);
    ringMesh.position.set(0, 0.65, 0.03);
    tagGroup.add(ringMesh);

    // String hanging
    const stringCurve = new THREE.LineCurve3(
      new THREE.Vector3(0, 0.72, 0.03),
      new THREE.Vector3(0.4, 2.2, 0.2)
    );
    const stringGeom = new THREE.TubeGeometry(stringCurve, 10, 0.02, 6, false);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x661716, roughness: 0.9 });
    const stringMesh = new THREE.Mesh(stringGeom, stringMat);
    tagGroup.add(stringMesh);

    tagGroup.position.set(-2.4, 0.6, 1.0);
    tagGroup.rotation.set(0.1, 0.35, -0.2);
    accessoriesGroup.add(tagGroup);

    // 2. Enamel Pin 3D (Pin metálico retro de solapa)
    const pinGroup = new THREE.Group();
    const pinBaseGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 32);
    const pinBaseMat = new THREE.MeshStandardMaterial({
      color: 0xffdd48, // Polished Brass/Gold
      metalness: 0.9,
      roughness: 0.2,
    });
    const pinBase = new THREE.Mesh(pinBaseGeom, pinBaseMat);
    pinBase.rotation.x = Math.PI / 2;
    pinGroup.add(pinBase);

    // Enamel inlay (burgundy center)
    const pinInlayGeom = new THREE.CylinderGeometry(0.52, 0.52, 0.12, 32);
    const pinInlayMat = new THREE.MeshStandardMaterial({
      color: 0x661716, // Glossy Burgundy enamel
      metalness: 0.1,
      roughness: 0.15,
    });
    const pinInlay = new THREE.Mesh(pinInlayGeom, pinInlayMat);
    pinInlay.rotation.x = Math.PI / 2;
    pinGroup.add(pinInlay);

    // Embossed "Q" letter on pin
    const pinCenterGeom = new THREE.TorusGeometry(0.24, 0.05, 8, 24);
    const pinCenter = new THREE.Mesh(pinCenterGeom, pinBaseMat);
    pinCenter.position.z = 0.08;
    pinGroup.add(pinCenter);

    pinGroup.position.set(2.3, 1.4, 0.8);
    pinGroup.rotation.set(-0.2, -0.3, 0.3);
    accessoriesGroup.add(pinGroup);

    // 3. Rolled Tape Measure 3D (Cinta métrica retro en espiral)
    const tapeGroup = new THREE.Group();
    const tapeGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 28, 1, true);
    const tapeCanvas = document.createElement('canvas');
    tapeCanvas.width = 512;
    tapeCanvas.height = 128;
    const tpctx = tapeCanvas.getContext('2d')!;
    tpctx.fillStyle = '#FFDD48';
    tpctx.fillRect(0, 0, 512, 128);
    tpctx.fillStyle = '#661716';
    for (let cm = 0; cm < 512; cm += 20) {
      const isMajor = cm % 40 === 0;
      tpctx.fillRect(cm, 0, 3, isMajor ? 50 : 25);
      if (isMajor) {
        tpctx.font = 'bold 20px monospace';
        tpctx.fillText(String(cm / 4), cm + 5, 80);
      }
    }
    const tapeTex = new THREE.CanvasTexture(tapeCanvas);
    tapeTex.wrapS = THREE.RepeatWrapping;
    tapeTex.repeat.set(3, 1);
    const tapeMat = new THREE.MeshStandardMaterial({
      map: tapeTex,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    const tapeMesh = new THREE.Mesh(tapeGeom, tapeMat);
    tapeGroup.add(tapeMesh);

    // Central cap of tape
    const tapeCapGeom = new THREE.CylinderGeometry(0.54, 0.54, 0.02, 28);
    const tapeCapMat = new THREE.MeshStandardMaterial({ color: 0x661716, roughness: 0.3 });
    const tapeCap = new THREE.Mesh(tapeCapGeom, tapeCapMat);
    tapeCap.position.y = 0.2;
    tapeGroup.add(tapeCap);

    tapeGroup.position.set(2.1, -1.5, 0.5);
    tapeGroup.rotation.set(0.6, 0.4, -0.4);
    accessoriesGroup.add(tapeGroup);

    // --- Interaction State ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragging = false;
    let squishScaleX = 1;
    let squishScaleY = 1;
    let squishScaleZ = 1;
    let squishVelocity = 0;

    // Mouse Move (Parallax)
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx;
      mouseY = ny;

      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      setIsInteracting(true);
    };

    const onMouseUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    // Squish on click
    const onClick = () => {
      // Elastic spring squish bounce
      squishScaleY = 0.72;
      squishScaleX = 1.22;
      squishScaleZ = 1.22;
      squishVelocity = 0.15;
    };

    // Touch Support for Mobile / Tablet
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        setIsInteracting(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartX;
        const deltaY = e.touches[0].clientY - dragStartY;
        targetRotationY += deltaX * 0.012;
        targetRotationX += deltaY * 0.012;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      setIsInteracting(false);
      onClick(); // Tap triggers squish
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Observer
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // --- Animation Loop (Smooth 60 FPS) ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Visibility based on mode
      accessoriesGroup.visible = mode === 'streetwear';

      // 1. Idle Floating Bob
      const floatY = Math.sin(elapsed * 1.8) * 0.16;
      toyGroup.position.y = floatY;

      // 2. Parallax & Smooth Drag Rotation
      if (!isDragging) {
        // Gently return to mouse look-at angle + gentle idle wave
        const idleRotY = Math.sin(elapsed * 1.2) * 0.2;
        const targetX = mouseY * 0.4;
        const targetY = mouseX * 0.55 + idleRotY;

        targetRotationX += (targetX - targetRotationX) * 0.05;
        targetRotationY += (targetY - targetRotationY) * 0.05;
      }

      toyGroup.rotation.x = targetRotationX;
      toyGroup.rotation.y = targetRotationY;

      // 3. Squish Spring Physics
      // Spring back to 1.0
      const forceY = (1.0 - squishScaleY) * 0.35;
      squishVelocity += forceY;
      squishVelocity *= 0.72; // Damping
      squishScaleY += squishVelocity;
      squishScaleX = 1 + (1 - squishScaleY) * 0.6;
      squishScaleZ = 1 + (1 - squishScaleY) * 0.6;

      toyMesh.scale.set(squishScaleX, squishScaleY, squishScaleZ);
      outlineMesh.scale.set(squishScaleX * 1.04, squishScaleY * 1.04, squishScaleZ * 1.04);

      // 4. Streetwear Accessories Animation (Option 2)
      if (mode === 'streetwear') {
        // Tag gently swings like on a garment
        tagGroup.position.y = 0.6 + Math.sin(elapsed * 1.5 + 1) * 0.12;
        tagGroup.rotation.z = -0.2 + Math.sin(elapsed * 2.0) * 0.08;
        tagGroup.rotation.y = 0.35 + mouseX * 0.2;

        // Enamel pin floats and sparkles
        pinGroup.position.y = 1.4 + Math.sin(elapsed * 2.2 + 2) * 0.15;
        pinGroup.rotation.z = elapsed * 0.5;
        pinGroup.rotation.x = -0.2 + Math.cos(elapsed * 1.8) * 0.1;

        // Tape measure rolls softly
        tapeGroup.position.y = -1.5 + Math.sin(elapsed * 1.6 + 3) * 0.1;
        tapeGroup.rotation.y += 0.015;
      }

      renderer.render(scene, camera);

      if (!isSceneReady) {
        setIsSceneReady(true);
      }
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      // Dispose Three.js objects
      renderer.dispose();
      toyGeometry.dispose();
      frontMaterial.dispose();
      bodyMaterial.dispose();
      outlineMat.dispose();
      faceTexture.dispose();
      tagGeom.dispose();
      tagMat.dispose();
      tagTex.dispose();
      ringGeom.dispose();
      goldMat.dispose();
      stringGeom.dispose();
      stringMat.dispose();
      pinBaseGeom.dispose();
      pinBaseMat.dispose();
      pinInlayGeom.dispose();
      pinInlayMat.dispose();
      pinCenterGeom.dispose();
      tapeGeom.dispose();
      tapeMat.dispose();
      tapeTex.dispose();
      tapeCapGeom.dispose();
      tapeCapMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mode]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center transition-opacity duration-500 ${
          isSceneReady ? 'opacity-100' : 'opacity-0'
        }`}
        title="Arrastra para girar 360°, haz clic para rebotar"
      />

      {/* Fallback / Placeholder elegante mientras WebGL se inicia o si no está disponible */}
      {(!isSceneReady || !webGLSupported) && (
        <div className="absolute inset-4 rounded-full bg-quirona-cream border-4 border-quirona-burgundy retro-shadow-lg flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_quirona.jpeg"
            alt="Mascota Quirona"
            className="w-56 h-56 object-contain"
          />
        </div>
      )}

      {/* Indicador interactivo discreto estilo retro */}
      <div
        className={`absolute bottom-3 right-3 pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-70'
        }`}
      >
        <span className="text-[10px] font-black uppercase tracking-wider bg-quirona-cream text-quirona-burgundy px-2.5 py-1 rounded-full border border-quirona-burgundy/60 retro-shadow-sm">
          {isInteracting ? 'Girando 360°' : '3D Interactivo'}
        </span>
      </div>

      {/* Switcher interactivo para comparar Opción 1 vs Opción 2 */}
      {allowToggle && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-quirona-cream/95 backdrop-blur-sm p-1 rounded-full border-2 border-quirona-burgundy retro-shadow-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMode('toy');
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1 ${
              mode === 'toy'
                ? 'bg-quirona-yellow text-quirona-burgundy border border-quirona-burgundy shadow-sm'
                : 'text-quirona-burgundy/70 hover:text-quirona-burgundy'
            }`}
          >
            <span>Opción 1: Vinyl Toy</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMode('streetwear');
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1 ${
              mode === 'streetwear'
                ? 'bg-quirona-burgundy text-quirona-cream border border-quirona-cream shadow-sm'
                : 'text-quirona-burgundy/70 hover:text-quirona-burgundy'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Opción 2: Streetwear</span>
          </button>
        </div>
      )}
    </div>
  );
}
