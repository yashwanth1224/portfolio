import * as THREE from 'three';
import { disposeObject3D } from './sceneUtils.js';

const CODE_LINES = [
  { text: "import React, { useState } from 'react';", color: '#93c5fd' },
  { text: "import { Canvas } from '@three/engine';", color: '#93c5fd' },
  { text: "export function YashwanthAvatar() {", color: '#38bdf8' },
  { text: "  const [focus] = useState('Frontend & Systems');", color: '#fbbf24' },
  { text: "  return (", color: '#f472b6' },
  { text: "    <InteractiveStage fps={60}>", color: '#4ade80' },
  { text: "      <HolographicPedestal burntOrange />", color: '#D95D39' },
  { text: "      <VoiceSynthesizer active={speaking} />", color: '#a78bfa' },
  { text: "    </InteractiveStage>", color: '#4ade80' },
  { text: "  );", color: '#f472b6' },
  { text: "}", color: '#38bdf8' },
];

const TECH_ORBS = [
  { name: 'React', color: 0x00d8ff, hex: '#00d8ff', bg: '#082f49', pos: [-1.55, 1.35, 0.3], speed: 1.4, offset: 0 },
  { name: 'JavaScript', color: 0xf7df1e, hex: '#f7df1e', bg: '#422006', pos: [-1.45, 0.25, 0.4], speed: 1.8, offset: 1.2 },
  { name: 'Node.js', color: 0x4ade80, hex: '#4ade80', bg: '#052e16', pos: [1.55, 1.45, 0.3], speed: 1.6, offset: 2.1 },
  { name: 'Java', color: 0xfb923c, hex: '#fb923c', bg: '#431407', pos: [1.65, 0.4, 0.4], speed: 2.0, offset: 3.0 },
];

/**
 * Builds the interactive 3D avatar workspace model group.
 * Reusable across Hero workspace stage and Diorama studio stage.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {{ group: THREE.Group, update: (dt: number, elapsed: number, pointer: import('../ScissorEngine.js').NormalizedPointer, state: Record<string, unknown>) => void, dispose: () => void }}
 */
export function createAvatarStageModel(ctx) {
  const group = new THREE.Group();
  // Isolate local pointer/hover motion from parent-stage anchor transforms.
  const rigGroup = new THREE.Group();
  group.add(rigGroup);

  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;
  let lastCodeDrawTime = -1;

  // 1. Ambient Particles
  const particleCount = ctx.qualityTier === 'mobile' ? 45 : 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 8;
    particlePositions[i + 1] = (Math.random() - 0.5) * 5 + 0.5;
    particlePositions[i + 2] = (Math.random() - 0.5) * 5 - 1;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffb099,
    size: 0.034,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  const particlesMesh = new THREE.Points(particleGeo, particleMat);
  rigGroup.add(particlesMesh);

  // 2. Desk & Dual Monitors
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, -0.45, -0.55);

  const deskTopGeo = new THREE.BoxGeometry(2.8, 0.08, 1.1);
  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x141824,
    roughness: 0.35,
    metalness: 0.2,
  });
  const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
  deskTop.position.set(0, 0.25, 0);
  deskGroup.add(deskTop);

  const legMat = new THREE.MeshStandardMaterial({ color: 0x090b10, roughness: 0.5, metalness: 0.8 });
  const legGeo = new THREE.BoxGeometry(0.08, 1.1, 0.08);
  const legLeft = new THREE.Mesh(legGeo, legMat);
  legLeft.position.set(-1.25, -0.3, 0);
  deskGroup.add(legLeft);

  const legRight = new THREE.Mesh(legGeo, legMat);
  legRight.position.set(1.25, -0.3, 0);
  deskGroup.add(legRight);

  // Monitors
  const monitorsGroup = new THREE.Group();
  const codeTextureCanvas = document.createElement('canvas');
  codeTextureCanvas.width = 512;
  codeTextureCanvas.height = 320;
  const codeTextureContext = codeTextureCanvas.getContext('2d');
  const codeTexture = new THREE.CanvasTexture(codeTextureCanvas);

  const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x07090e, roughness: 0.2, metalness: 0.85 });
  const screenMat = new THREE.MeshBasicMaterial({ map: codeTexture });

  const monitorGeo = new THREE.BoxGeometry(1.15, 0.72, 0.03);
  const leftScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
  leftScreen.position.set(-1.08, 0.82, -0.1);
  leftScreen.rotation.y = 0.32;

  const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.10, 0.67), screenMat);
  leftDisplay.position.set(0, 0, 0.016);
  leftScreen.add(leftDisplay);
  monitorsGroup.add(leftScreen);

  const standPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
  const standPoleLeft = new THREE.Mesh(standPoleGeo, legMat);
  standPoleLeft.position.set(-1.08, 0.52, -0.15);
  monitorsGroup.add(standPoleLeft);

  // Right monitor (telemetry)
  const rightScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
  rightScreen.position.set(1.08, 0.82, -0.1);
  rightScreen.rotation.y = -0.32;

  const rightCanvas = document.createElement('canvas');
  rightCanvas.width = 512;
  rightCanvas.height = 320;
  const rightCtx = rightCanvas.getContext('2d');
  rightCtx.fillStyle = '#0a101d';
  rightCtx.fillRect(0, 0, 512, 320);
  rightCtx.fillStyle = '#111b2f';
  rightCtx.fillRect(16, 16, 480, 42);
  rightCtx.fillStyle = '#38bdf8';
  rightCtx.font = 'bold 18px monospace';
  rightCtx.fillText('<React.Engine status="Production" />', 30, 44);
  rightCtx.fillStyle = '#1e293b';
  rightCtx.fillRect(16, 74, 145, 75);
  rightCtx.fillRect(181, 74, 145, 75);
  rightCtx.fillRect(346, 74, 150, 75);
  rightCtx.fillStyle = '#94a3b8';
  rightCtx.font = '12px monospace';
  rightCtx.fillText('BUNDLE: OPTIMIZED', 24, 100);
  rightCtx.fillText('LATENCY: 12ms', 190, 100);
  rightCtx.fillText('FPS: 60 LOCKED', 356, 100);
  rightCtx.fillStyle = '#38bdf8';
  rightCtx.fillText('99.98%', 24, 128);
  rightCtx.fillStyle = '#10b981';
  rightCtx.fillText('HEALTHY', 190, 128);
  rightCtx.fillStyle = '#D95D39';
  rightCtx.fillText('STABLE', 356, 128);
  rightCtx.strokeStyle = '#38bdf8';
  rightCtx.lineWidth = 3.5;
  rightCtx.beginPath();
  rightCtx.moveTo(25, 260);
  rightCtx.bezierCurveTo(120, 180, 240, 280, 360, 195);
  rightCtx.lineTo(485, 215);
  rightCtx.stroke();

  const rightScreenTexture = new THREE.CanvasTexture(rightCanvas);
  const rightDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(1.10, 0.67),
    new THREE.MeshBasicMaterial({ map: rightScreenTexture })
  );
  rightDisplay.position.set(0, 0, 0.016);
  rightScreen.add(rightDisplay);
  monitorsGroup.add(rightScreen);

  const standPoleRight = new THREE.Mesh(standPoleGeo, legMat);
  standPoleRight.position.set(1.08, 0.52, -0.15);
  monitorsGroup.add(standPoleRight);

  deskGroup.add(monitorsGroup);
  rigGroup.add(deskGroup);

  // 3. Concentric Rotating Pedestal Rings
  const pedestalGroup = new THREE.Group();
  pedestalGroup.position.set(0, -0.95, 0.1);
  const ringMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const ringMatCobalt = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  const ringMatOuter = new THREE.MeshBasicMaterial({ color: 0xD95D39, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });

  const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.60, 64), ringMatCyan);
  innerRing.rotation.x = -Math.PI / 2;
  pedestalGroup.add(innerRing);

  const middleRing = new THREE.Mesh(new THREE.RingGeometry(0.74, 0.83, 64), ringMatCobalt);
  middleRing.rotation.x = -Math.PI / 2;
  pedestalGroup.add(middleRing);

  const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.08, 64), ringMatOuter);
  outerRing.rotation.x = -Math.PI / 2;
  pedestalGroup.add(outerRing);

  rigGroup.add(pedestalGroup);

  // 4. Avatar Plane & Waveform Aura
  const avatarGroup = new THREE.Group();
  avatarGroup.position.set(0, -0.95, 0.1);

  const avatarPlaneGeo = new THREE.PlaneGeometry(1.65, 2.75);
  const avatarPlaneMat = new THREE.MeshStandardMaterial({
    transparent: true,
    alphaTest: 0.01,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const avatarMesh = new THREE.Mesh(avatarPlaneGeo, avatarPlaneMat);
  avatarMesh.position.set(0, 1.38, 0.02);
  avatarMesh.name = 'officialAvatarMesh';
  // Hide avatar quad until texture finishes uploading so no blank fallback slab flashes.
  avatarMesh.visible = false;
  avatarGroup.add(avatarMesh);

  // Load avatar texture via ScissorEngine shared texture pool
  let disposed = false;
  ctx.loadSharedTexture('./avatar-3d.png')
    .then((texture) => {
      if (disposed) return;
      texture.userData = { ...texture.userData, isShared: true };
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      avatarPlaneMat.map = texture;
      avatarPlaneMat.needsUpdate = true;
      avatarMesh.visible = true;
    })
    .catch(() => {});

  // Acoustic Waveform Aura Rings
  const acousticRingsGroup = new THREE.Group();
  acousticRingsGroup.position.set(0, 1.40, 0.06);

  const auraMat1 = new THREE.MeshBasicMaterial({ color: 0xD95D39, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const auraMat2 = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const auraMat3 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const auraMat4 = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });

  const auraMesh1 = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.34, 48), auraMat1);
  const auraMesh2 = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.55, 48), auraMat2);
  const auraMesh3 = new THREE.Mesh(new THREE.RingGeometry(0.70, 0.78, 48), auraMat3);
  const auraMesh4 = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.02, 48), auraMat4);

  acousticRingsGroup.add(auraMesh1, auraMesh2, auraMesh3, auraMesh4);
  avatarGroup.add(acousticRingsGroup);
  rigGroup.add(avatarGroup);

  // 5. Floating Tech Orbs
  const floatingTechOrbs = [];
  TECH_ORBS.forEach((tech) => {
    const orbGroup = new THREE.Group();
    orbGroup.position.set(...tech.pos);

    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: tech.color,
      emissive: tech.color,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    orbGroup.add(sphere);

    const ringGeo = new THREE.TorusGeometry(0.14, 0.01, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: tech.color, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 3;
    orbGroup.add(orbitalRing);

    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 80;
    const bCtx = badgeCanvas.getContext('2d');
    bCtx.fillStyle = tech.bg;
    bCtx.strokeStyle = tech.hex;
    bCtx.lineWidth = 3;
    bCtx.beginPath();
    bCtx.roundRect(6, 6, 244, 68, 34);
    bCtx.fill();
    bCtx.stroke();
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 28px monospace';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(tech.name, 128, 40);

    const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true, side: THREE.DoubleSide });
    const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), badgeMat);
    badgeMesh.position.set(0, -0.16, 0);
    orbGroup.add(badgeMesh);

    orbGroup.userData = { initialY: tech.pos[1], speed: tech.speed, offset: tech.offset, orbitalRing };
    rigGroup.add(orbGroup);
    floatingTechOrbs.push(orbGroup);
  });

  const update = (dt, elapsed, pointer, state) => {
    const isSpeaking = Boolean(state?.isSpeaking);

    if (pointer) {
      targetRotationY = (pointer.x || 0) * 0.40;
      targetRotationX = -(pointer.y || 0) * 0.28;
    }
    currentRotationX += (targetRotationX - currentRotationX) * 0.06;
    currentRotationY += (targetRotationY - currentRotationY) * 0.06;

    rigGroup.rotation.y = currentRotationY;
    rigGroup.rotation.x = currentRotationX;
    rigGroup.position.x = currentRotationY * 0.22;

    const breath = Math.sin(elapsed * 2.2) * 0.012;
    const speechPulse = isSpeaking ? Math.sin(elapsed * 12) * 0.015 : 0;
    avatarMesh.position.y = 1.38 + breath + speechPulse;
    avatarMesh.rotation.y = currentRotationY * 0.22;

    middleRing.rotation.z = -elapsed * 0.4;
    innerRing.rotation.z = elapsed * 0.5;
    const pulseScale = 1.0 + Math.sin(elapsed * 3) * 0.06;
    outerRing.scale.set(pulseScale, pulseScale, pulseScale);
    outerRing.material.opacity = 0.35 + Math.sin(elapsed * 3) * 0.15;

    for (let i = 0; i < floatingTechOrbs.length; i++) {
      const orb = floatingTechOrbs[i];
      const { initialY, speed, offset, orbitalRing } = orb.userData;
      orb.position.y = initialY + Math.sin(elapsed * speed + offset) * 0.08;
      orb.rotation.y = currentRotationY * 0.5;
      if (orbitalRing) {
        orbitalRing.rotation.x += 0.02;
        orbitalRing.rotation.y += 0.03;
      }
    }

    particlesMesh.rotation.y = elapsed * 0.02;
    particlesMesh.rotation.x = Math.sin(elapsed * 0.03) * 0.05;

    if (isSpeaking) {
      const speed = 3.6;
      const wave1 = (elapsed * speed) % 1;
      const wave2 = (elapsed * speed + 0.25) % 1;
      const wave3 = (elapsed * speed + 0.5) % 1;
      const wave4 = (elapsed * speed + 0.75) % 1;

      auraMesh1.scale.set(1 + wave1 * 1.4, 1 + wave1 * 1.4, 1);
      auraMat1.opacity = (1 - wave1) * 0.85;

      auraMesh2.scale.set(1 + wave2 * 1.4, 1 + wave2 * 1.4, 1);
      auraMat2.opacity = (1 - wave2) * 0.75;

      auraMesh3.scale.set(1 + wave3 * 1.4, 1 + wave3 * 1.4, 1);
      auraMat3.opacity = (1 - wave3) * 0.65;

      auraMesh4.scale.set(1 + wave4 * 1.4, 1 + wave4 * 1.4, 1);
      auraMat4.opacity = (1 - wave4) * 0.55;
    } else {
      auraMat1.opacity += (0 - auraMat1.opacity) * 0.15;
      auraMat2.opacity += (0 - auraMat2.opacity) * 0.15;
      auraMat3.opacity += (0 - auraMat3.opacity) * 0.15;
      auraMat4.opacity += (0 - auraMat4.opacity) * 0.15;
    }

    if (lastCodeDrawTime < 0 || elapsed - lastCodeDrawTime >= 0.08) {
      lastCodeDrawTime = elapsed;

      codeTextureContext.fillStyle = '#080d17';
      codeTextureContext.fillRect(0, 0, 512, 320);

      codeTextureContext.fillStyle = '#1e293b';
      codeTextureContext.fillRect(0, 0, 512, 28);
      codeTextureContext.fillStyle = '#ef4444';
      codeTextureContext.beginPath(); codeTextureContext.arc(16, 14, 5, 0, Math.PI * 2); codeTextureContext.fill();
      codeTextureContext.fillStyle = '#eab308';
      codeTextureContext.beginPath(); codeTextureContext.arc(32, 14, 5, 0, Math.PI * 2); codeTextureContext.fill();
      codeTextureContext.fillStyle = '#22c55e';
      codeTextureContext.beginPath(); codeTextureContext.arc(48, 14, 5, 0, Math.PI * 2); codeTextureContext.fill();

      codeTextureContext.fillStyle = '#64748b';
      codeTextureContext.font = '11px monospace';
      codeTextureContext.fillText('Workspace3D.jsx — Yashwanth Portfolio', 68, 18);

      const scrollOffset = (elapsed * 14) % 18;
      for (let i = 0; i < CODE_LINES.length; i++) {
        const line = CODE_LINES[i];
        codeTextureContext.fillStyle = line.color;
        codeTextureContext.font = '13px monospace';
        codeTextureContext.fillText(line.text, 20, 52 + i * 22 - scrollOffset);
      }

      if (Math.sin(elapsed * 6) > 0) {
        codeTextureContext.fillStyle = '#38bdf8';
        codeTextureContext.fillRect(20, 275, 8, 14);
      }

      codeTexture.needsUpdate = true;
    }
  };

  const dispose = () => {
    disposed = true;
    ctx.releaseSharedTexture('./avatar-3d.png');
    disposeObject3D(group);
  };

  return { group, update, dispose };
}
