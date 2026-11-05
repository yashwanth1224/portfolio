import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Workspace3D() {
  const mountRef = useRef(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let deskGroup = new THREE.Group();
    let monitorsGroup = new THREE.Group();
    let floatingBadges = [];
    let codeTextureCanvas, codeTextureContext, codeTexture;
    let photoMesh = null;

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    try {
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 500;

      // 1. Scene & Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.8, 5.2);
      camera.lookAt(0, 0.6, 0);

      // 2. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // 3. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(3, 5, 4);
      mainLight.castShadow = true;
      scene.add(mainLight);

      const rimLightCoral = new THREE.PointLight(0xff5a36, 3, 10);
      rimLightCoral.position.set(-3, 2, -1);
      scene.add(rimLightCoral);

      const rimLightCyan = new THREE.PointLight(0x00d8ff, 2.5, 10);
      rimLightCyan.position.set(3, 1.5, -1);
      scene.add(rimLightCyan);

      // 4. Standing Desk
      // Desk Top Slab
      const deskTopGeo = new THREE.BoxGeometry(3.6, 0.1, 1.8);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x1f232b,
        roughness: 0.35,
        metalness: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
      deskTop.position.set(0, 0.7, 0);
      deskTop.receiveShadow = true;
      deskTop.castShadow = true;
      deskGroup.add(deskTop);

      // Desk Legs (Minimalist dual-beam standing desk)
      const legGeo = new THREE.BoxGeometry(0.12, 1.4, 0.12);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.5, metalness: 0.8 });
      
      const legLeft = new THREE.Mesh(legGeo, legMat);
      legLeft.position.set(-1.5, 0, 0);
      deskGroup.add(legLeft);

      const legRight = new THREE.Mesh(legGeo, legMat);
      legRight.position.set(1.5, 0, 0);
      deskGroup.add(legRight);

      // Desk Feet
      const footGeo = new THREE.BoxGeometry(0.2, 0.05, 1.4);
      const footLeft = new THREE.Mesh(footGeo, legMat);
      footLeft.position.set(-1.5, -0.7, 0);
      deskGroup.add(footLeft);

      const footRight = new THREE.Mesh(footGeo, legMat);
      footRight.position.set(1.5, -0.7, 0);
      deskGroup.add(footRight);

      // 5. Dual Monitors
      // Procedural animated code screen texture
      codeTextureCanvas = document.createElement('canvas');
      codeTextureCanvas.width = 512;
      codeTextureCanvas.height = 320;
      codeTextureContext = codeTextureCanvas.getContext('2d');
      codeTexture = new THREE.CanvasTexture(codeTextureCanvas);

      const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x090a0d, roughness: 0.2, metalness: 0.8 });
      const screenMat = new THREE.MeshBasicMaterial({ map: codeTexture });

      // Left Monitor (Curved/Slanted Inwards)
      const monitorGeo = new THREE.BoxGeometry(1.4, 0.85, 0.04);
      const leftScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      leftScreen.position.set(-0.75, 1.35, -0.15);
      leftScreen.rotation.y = 0.22;
      
      const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.79), screenMat);
      leftDisplay.position.set(0, 0, 0.021);
      leftScreen.add(leftDisplay);
      monitorsGroup.add(leftScreen);

      // Left Monitor Stand
      const standPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 16);
      const standPole = new THREE.Mesh(standPoleGeo, legMat);
      standPole.position.set(-0.75, 1.0, -0.25);
      monitorsGroup.add(standPole);

      // Right Monitor (Code / UI Preview)
      const rightScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      rightScreen.position.set(0.75, 1.35, -0.15);
      rightScreen.rotation.y = -0.22;

      // Gradient canvas for right screen (React Dashboard preview)
      const rightCanvas = document.createElement('canvas');
      rightCanvas.width = 512;
      rightCanvas.height = 320;
      const rightCtx = rightCanvas.getContext('2d');
      rightCtx.fillStyle = '#0f172a';
      rightCtx.fillRect(0, 0, 512, 320);
      // Mock UI charts & header
      rightCtx.fillStyle = '#1e293b';
      rightCtx.fillRect(20, 20, 472, 45);
      rightCtx.fillStyle = '#ff5a36';
      rightCtx.font = 'bold 20px monospace';
      rightCtx.fillText('<React.Component state="running" />', 35, 48);
      // Metric boxes
      rightCtx.fillStyle = '#334155';
      rightCtx.fillRect(20, 80, 140, 80);
      rightCtx.fillRect(180, 80, 140, 80);
      rightCtx.fillRect(340, 80, 150, 80);
      // Chart line
      rightCtx.strokeStyle = '#38bdf8';
      rightCtx.lineWidth = 4;
      rightCtx.beginPath();
      rightCtx.moveTo(30, 260);
      rightCtx.bezierCurveTo(120, 180, 240, 290, 360, 200);
      rightCtx.lineTo(480, 220);
      rightCtx.stroke();
      const rightScreenTexture = new THREE.CanvasTexture(rightCanvas);
      const rightDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(1.34, 0.79),
        new THREE.MeshBasicMaterial({ map: rightScreenTexture })
      );
      rightDisplay.position.set(0, 0, 0.021);
      rightScreen.add(rightDisplay);
      monitorsGroup.add(rightScreen);

      // Right Stand
      const rightStandPole = new THREE.Mesh(standPoleGeo, legMat);
      rightStandPole.position.set(0.75, 1.0, -0.25);
      monitorsGroup.add(rightStandPole);

      deskGroup.add(monitorsGroup);

      // 6. Keyboard, Mouse, and Coffee Mug
      const keyboardGeo = new THREE.BoxGeometry(0.8, 0.02, 0.28);
      const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x1e2129, roughness: 0.4 });
      const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
      keyboard.position.set(-0.1, 0.76, 0.35);
      deskGroup.add(keyboard);

      const mouseGeo = new THREE.BoxGeometry(0.1, 0.025, 0.16);
      const mouse = new THREE.Mesh(mouseGeo, keyboardMat);
      mouse.position.set(0.65, 0.76, 0.35);
      deskGroup.add(mouse);

      // Coffee Mug
      const mugGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.16, 24);
      const mugMat = new THREE.MeshStandardMaterial({ color: 0xaf4426, roughness: 0.1 });
      const mug = new THREE.Mesh(mugGeo, mugMat);
      mug.position.set(1.2, 0.83, 0.2);
      deskGroup.add(mug);

      // 7. Framed 3D Portrait of Yashwanth S
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        './yashwanth.jpg',
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const photoCardGeo = new THREE.BoxGeometry(0.8, 1.0, 0.03);
          const photoFrameMat = new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 0.8 });
          const photoFaceMat = new THREE.MeshBasicMaterial({ map: tex });

          const materials = [
            photoFrameMat,
            photoFrameMat,
            photoFrameMat,
            photoFrameMat,
            photoFaceMat,
            photoFrameMat,
          ];

          photoMesh = new THREE.Mesh(photoCardGeo, materials);
          photoMesh.position.set(-1.35, 1.15, 0.25);
          photoMesh.rotation.y = 0.38;
          photoMesh.rotation.x = -0.05;
          photoMesh.castShadow = true;
          deskGroup.add(photoMesh);
        },
        undefined,
        () => {
          // Fallback if image fails to load
        }
      );

      // 8. Floating Tech Pills / Spheres
      const techItems = [
        { name: 'React', color: 0x61dafb, pos: [-2.1, 2.2, 0.5], scale: 0.22 },
        { name: 'JS', color: 0xf7df1e, pos: [2.1, 2.4, 0.2], scale: 0.18 },
        { name: 'Node', color: 0x68a063, pos: [-1.9, 0.9, 0.8], scale: 0.18 },
        { name: 'Java', color: 0xe76f00, pos: [2.2, 1.1, 0.9], scale: 0.2 },
        { name: 'Tailwind', color: 0x38bdf8, pos: [1.7, 2.8, -0.4], scale: 0.2 },
      ];

      techItems.forEach((item, index) => {
        const sphereGeo = new THREE.IcosahedronGeometry(item.scale, 2);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: item.color,
          roughness: 0.2,
          metalness: 0.5,
          emissive: item.color,
          emissiveIntensity: 0.25,
        });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(...item.pos);
        mesh.userData = {
          baseY: item.pos[1],
          speed: 1.5 + index * 0.4,
          offset: index * 1.2,
        };
        deskGroup.add(mesh);
        floatingBadges.push(mesh);
      });

      scene.add(deskGroup);

      // Mouse tracking for parallax tilt
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotationY = x * 0.45;
        targetRotationX = y * 0.25;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Window resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // 9. Animation Loop
      let clock = new THREE.Clock();
      let lineCounter = 0;

      const codeLines = [
        'import React, { useState } from "react";',
        'const YashwanthDev = () => {',
        '  const [crafted, setCrafted] = useState(true);',
        '  const stack = ["React", "Node", "Tailwind"];',
        '  // 60FPS WebGL Engine Active',
        '  return <Architect status="innovating" />;',
        '};',
        'export default YashwanthDev;',
        '// Building pixel-perfect modern web apps',
        'const metrics = { accuracy: "94%", fps: 60 };',
      ];

      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const elapsedTime = clock.getElapsedTime();

        // Smooth camera tilt towards mouse
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;

        deskGroup.rotation.y = currentRotationY;
        deskGroup.rotation.x = currentRotationX;

        // Floating pills bobbing & gentle rotation
        floatingBadges.forEach((mesh) => {
          mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.speed + mesh.userData.offset) * 0.12;
          mesh.rotation.y += 0.015;
          mesh.rotation.x += 0.01;
        });

        // Photo card gentle breath
        if (photoMesh) {
          photoMesh.rotation.z = Math.sin(elapsedTime * 0.8) * 0.03;
        }

        // Animate procedural code editor on left monitor
        if (codeTextureContext && Math.floor(elapsedTime * 15) !== lineCounter) {
          lineCounter = Math.floor(elapsedTime * 15);
          codeTextureContext.fillStyle = '#0b0e14';
          codeTextureContext.fillRect(0, 0, 512, 320);

          // Editor tab bar
          codeTextureContext.fillStyle = '#161b22';
          codeTextureContext.fillRect(0, 0, 512, 35);
          codeTextureContext.fillStyle = '#ff5a36';
          codeTextureContext.fillRect(20, 10, 14, 14);
          codeTextureContext.fillStyle = '#f7df1e';
          codeTextureContext.fillRect(40, 10, 14, 14);
          codeTextureContext.fillStyle = '#68a063';
          codeTextureContext.fillRect(60, 10, 14, 14);

          codeTextureContext.fillStyle = '#8b949e';
          codeTextureContext.font = '14px monospace';
          codeTextureContext.fillText('PortfolioArchitecture.jsx', 90, 24);

          // Lines of code
          codeTextureContext.font = '15px monospace';
          const maxVisible = 10;
          const offset = Math.floor(lineCounter * 0.25) % codeLines.length;

          for (let i = 0; i < maxVisible; i++) {
            const line = codeLines[(i + offset) % codeLines.length];
            const y = 65 + i * 24;

            if (line.includes('import') || line.includes('export')) {
              codeTextureContext.fillStyle = '#ff7b72';
            } else if (line.includes('const') || line.includes('return')) {
              codeTextureContext.fillStyle = '#79c0ff';
            } else if (line.includes('//')) {
              codeTextureContext.fillStyle = '#7ee787';
            } else {
              codeTextureContext.fillStyle = '#d2a8ff';
            }

            codeTextureContext.fillText(line, 25, y);
          }

          // Blinking cursor
          if (Math.sin(elapsedTime * 8) > 0) {
            codeTextureContext.fillStyle = '#38bdf8';
            codeTextureContext.fillRect(25, 275, 10, 18);
          }

          codeTexture.needsUpdate = true;
        }

        renderer.render(scene, camera);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn("WebGL initialization failed, rendering clean fallback:", err);
      setLoadError(true);
    }
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] flex items-center justify-center select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Interactive Badge Overlays */}
      <div className="absolute top-4 right-4 pointer-events-none hidden sm:flex flex-col gap-2 z-10">
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg text-xs font-mono text-cream/90 border border-white/10 animate-float">
          <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
          <span>Interactive 3D Engine</span>
        </div>
      </div>

      {/* Fallback if WebGL isn't supported */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-obsidian-surface/80 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-coral mb-4 shadow-xl">
            <img src="./yashwanth.jpg" alt="Yashwanth S" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-serif font-bold text-cream">Yashwanth S</h3>
          <p className="text-sm text-cream/70 max-w-sm mt-1">
            Frontend Developer & Software Engineer passionate about 3D WebGL interfaces and clean code architecture.
          </p>
        </div>
      )}
    </div>
  );
}
