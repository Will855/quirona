'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface RetroHeroCanvasProps {
  className?: string;
}

export default function RetroHeroCanvas({ className = '' }: RetroHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Verify WebGL availability
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

    const width = container.clientWidth || 384;
    const height = container.clientHeight || 384;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    // Warm key light from top-left
    const keyLight = new THREE.DirectionalLight(0xfff5d6, 3.2);
    keyLight.position.set(3.5, 4.5, 5);
    scene.add(keyLight);

    // Creamy ambient bounce light
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4);
    scene.add(ambientLight);

    // Warm fill light from bottom-left
    const fillLight = new THREE.DirectionalLight(0xffecb9, 1.6);
    fillLight.position.set(-3.5, -2, 3);
    scene.add(fillLight);

    // Deep burgundy rim light from behind for silhouette depth
    const rimLight = new THREE.DirectionalLight(0x661716, 2.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // --- Interactive Toy Root Group ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Toy Group (receives squish bounce and rotation)
    const toyGroup = new THREE.Group();
    rootGroup.add(toyGroup);

    // --- Texture Loading (Official Quirona Mascot Artwork) ---
    const textureLoader = new THREE.TextureLoader();
    const mascotTexture = textureLoader.load('/mascot_main_toy.png');
    mascotTexture.colorSpace = THREE.SRGBColorSpace;
    mascotTexture.minFilter = THREE.LinearMipmapLinearFilter;
    mascotTexture.magFilter = THREE.LinearFilter;
    mascotTexture.generateMipmaps = true;

    // --- 3D Sculpted Vinyl Layers ---
    // Dimension of the mascot in 3D scene units
    const toySize = 4.8;
    const planeGeom = new THREE.PlaneGeometry(toySize, toySize);

    // 1. Front Vinyl Face Material (with official lettering & gel highlights)
    const frontMat = new THREE.MeshStandardMaterial({
      map: mascotTexture,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.28,
      metalness: 0.05,
      side: THREE.FrontSide,
    });
    const frontMesh = new THREE.Mesh(planeGeom, frontMat);
    frontMesh.position.z = 0.22;
    toyGroup.add(frontMesh);

    // 2. Multi-layered 3D Thickness (Creates tactile vinyl depth when rotated)
    const depthLayersCount = 14;
    const totalDepth = 0.44;
    const stepDepth = totalDepth / depthLayersCount;

    // Intermediate depth slices in burgundy contour & warm yellow
    const rimMat = new THREE.MeshStandardMaterial({
      map: mascotTexture,
      transparent: true,
      alphaTest: 0.08,
      color: 0x5a1211, // Burgundy rim contour
      roughness: 0.4,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    for (let i = 1; i < depthLayersCount; i++) {
      const zPos = 0.22 - i * stepDepth;
      const sliceMesh = new THREE.Mesh(planeGeom, rimMat);
      sliceMesh.position.z = zPos;
      // Very slight scale step for rounded edge feel
      const edgeScale = 1.0 - Math.sin((i / depthLayersCount) * Math.PI) * 0.015;
      sliceMesh.scale.set(edgeScale, edgeScale, 1);
      toyGroup.add(sliceMesh);
    }

    // 3. Back Vinyl Face (Solid yellow vinyl back with burgundy outline)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 1024;
    backCanvas.height = 1024;
    const bctx = backCanvas.getContext('2d')!;
    bctx.fillStyle = '#FFDD48';
    bctx.fillRect(0, 0, 1024, 1024);
    // Subtle vinyl back radial glow
    const bGrad = bctx.createRadialGradient(512, 512, 100, 512, 512, 500);
    bGrad.addColorStop(0, '#FFE875');
    bGrad.addColorStop(1, '#FFDD48');
    bctx.fillStyle = bGrad;
    bctx.fillRect(0, 0, 1024, 1024);

    // Embossed back brand stamp
    bctx.strokeStyle = '#661716';
    bctx.lineWidth = 12;
    bctx.strokeRect(320, 440, 384, 144);
    bctx.fillStyle = '#661716';
    bctx.font = '900 48px sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('QUIRONA', 512, 495);
    bctx.font = '700 24px sans-serif';
    bctx.fillText('ORIGINAL VINYL', 512, 545);

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;

    const backMat = new THREE.MeshStandardMaterial({
      map: mascotTexture,
      transparent: true,
      alphaTest: 0.02,
      color: 0xffdd48, // Warm yellow back
      roughness: 0.35,
      metalness: 0.04,
      side: THREE.BackSide,
    });
    const backMesh = new THREE.Mesh(planeGeom, backMat);
    backMesh.position.z = -0.22;
    toyGroup.add(backMesh);

    // 4. Ground Contact Shadow (Soft ellipse that reacts to toy bounce)
    const shadowGeom = new THREE.PlaneGeometry(3.6, 1.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d')!;
    const sGrad = sctx.createRadialGradient(128, 64, 10, 128, 64, 60);
    sGrad.addColorStop(0, 'rgba(78, 17, 16, 0.45)');
    sGrad.addColorStop(0.6, 'rgba(78, 17, 16, 0.18)');
    sGrad.addColorStop(1, 'rgba(78, 17, 16, 0)');
    sctx.fillStyle = sGrad;
    sctx.fillRect(0, 0, 256, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeom, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -2.3;
    rootGroup.add(contactShadow);

    // --- Physics & Interaction State ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragging = false;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    // Squish spring physics
    let squishScaleY = 1.0;
    let squishScaleX = 1.0;
    let squishScaleZ = 1.0;
    let squishVelocity = 0;

    // Mouse Listeners
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx;
      mouseY = ny;

      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        dragVelocityY = deltaX * 0.011;
        dragVelocityX = deltaY * 0.011;
        targetRotY += dragVelocityY;
        targetRotX += dragVelocityX;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragVelocityX = 0;
      dragVelocityY = 0;
      setIsInteracting(true);
    };

    const onMouseUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    // Elastic squish bounce on click
    const triggerSquish = () => {
      squishScaleY = 0.76;
      squishScaleX = 1.20;
      squishScaleZ = 1.20;
      squishVelocity = 0.16;
    };

    // Touch Listeners (Mobile & Tablet)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragVelocityX = 0;
        dragVelocityY = 0;
        setIsInteracting(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartX;
        const deltaY = e.touches[0].clientY - dragStartY;
        dragVelocityY = deltaX * 0.013;
        dragVelocityX = deltaY * 0.013;
        targetRotY += dragVelocityY;
        targetRotX += dragVelocityX;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      setIsInteracting(false);
      triggerSquish();
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', triggerSquish);
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

    // --- Main Animation Loop (60 FPS) ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 1. Idle Floating Bob
      const floatY = Math.sin(elapsed * 1.8) * 0.14;
      toyGroup.position.y = floatY;

      // Dynamic ground shadow scaling with bounce
      const shadowScale = 1.0 - floatY * 0.5;
      contactShadow.scale.set(shadowScale, shadowScale, 1);
      shadowMat.opacity = 0.5 - floatY * 0.3;

      // 2. Parallax and Inertial Drag Rotation
      if (isDragging) {
        currentRotX += (targetRotX - currentRotX) * 0.25;
        currentRotY += (targetRotY - currentRotY) * 0.25;
      } else {
        // Inertia spin damping
        targetRotX += dragVelocityX;
        targetRotY += dragVelocityY;
        dragVelocityX *= 0.92;
        dragVelocityY *= 0.92;

        // If stopped spinning, gently blend with mouse parallax tilt
        if (Math.abs(dragVelocityX) < 0.001 && Math.abs(dragVelocityY) < 0.001) {
          const parallaxTargetX = mouseY * 0.35;
          const parallaxTargetY = mouseX * 0.45;
          targetRotX += (parallaxTargetX - targetRotX) * 0.05;
          // Keep whatever 360 rotation accumulated, but tilt gently
          currentRotX += (targetRotX - currentRotX) * 0.08;
          currentRotY += (targetRotY - currentRotY) * 0.08;
        } else {
          currentRotX += (targetRotX - currentRotX) * 0.2;
          currentRotY += (targetRotY - currentRotY) * 0.2;
        }
      }

      toyGroup.rotation.x = currentRotX;
      toyGroup.rotation.y = currentRotY;

      // 3. Squish Spring Physics
      const springForce = (1.0 - squishScaleY) * 0.38;
      squishVelocity += springForce;
      squishVelocity *= 0.74; // Harmonic damping
      squishScaleY += squishVelocity;
      squishScaleX = 1.0 + (1.0 - squishScaleY) * 0.65;
      squishScaleZ = 1.0 + (1.0 - squishScaleY) * 0.65;

      toyGroup.scale.set(squishScaleX, squishScaleY, squishScaleZ);

      // Render
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
      container.removeEventListener('click', triggerSquish);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      planeGeom.dispose();
      frontMat.dispose();
      rimMat.dispose();
      backMat.dispose();
      shadowGeom.dispose();
      shadowMat.dispose();
      mascotTexture.dispose();
      backTexture.dispose();
      shadowTex.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center transition-opacity duration-500 ${
          isSceneReady ? 'opacity-100' : 'opacity-0'
        }`}
        title="Arrastra para girar en 360°, haz clic para rebotar"
      />

      {/* Fallback & Initial Loading Placeholder */}
      {(!isSceneReady || !webGLSupported) && (
        <div className="absolute inset-4 rounded-full bg-quirona-cream border-4 border-quirona-burgundy retro-shadow-lg flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot_main_toy.png"
            alt="Mascota Estrella Quirona"
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
    </div>
  );
}
