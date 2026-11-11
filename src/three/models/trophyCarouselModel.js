import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { certifications } from '../../data/portfolioData.js';
import { disposeObject3D } from './sceneUtils.js';

/**
 * Builds the interactive 3D Trophy Carousel model group.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {{
 *   group: THREE.Group,
 *   update: (dt: number, elapsed: number, pointer: import('../ScissorEngine.js').NormalizedPointer) => void,
 *   pick: (ndcX: number, ndcY: number, camera: THREE.Camera) => void,
 *   syncState: (state: { activeCertId?: string }) => void,
 *   dispose: () => void
 * }}
 */
export function createTrophyCarouselModel(ctx) {
  const group = new THREE.Group();

  let activeIndex = 0;
  let targetTurntableYaw = 0;
  let currentTurntableYaw = 0;

  const carouselRadius = 1.65;
  const totalCerts = certifications.length; // 6 awards

  // 1. Central Turntable Floor & Orbit Ring
  const turntableFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.05, 0.06, 48),
    new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.85,
      metalness: 0.2,
    })
  );
  turntableFloor.position.y = -0.42;
  group.add(turntableFloor);

  const orbitGuideRing = new THREE.Mesh(
    new THREE.TorusGeometry(carouselRadius, 0.012, 8, 64),
    new THREE.MeshBasicMaterial({
      color: PORTFOLIO_PALETTE.burntOrange,
      transparent: true,
      opacity: 0.35,
    })
  );
  orbitGuideRing.rotation.x = Math.PI / 2;
  orbitGuideRing.position.y = -0.38;
  group.add(orbitGuideRing);

  // 2. Rotating Turntable Rig
  const turntableRig = new THREE.Group();
  group.add(turntableRig);

  const awardNodes = [];
  const pickableMeshes = [];

  certifications.forEach((cert, idx) => {
    const angle = (idx / totalCerts) * Math.PI * 2;
    const posX = Math.sin(angle) * carouselRadius;
    const posZ = Math.cos(angle) * carouselRadius;

    const slotGroup = new THREE.Group();
    slotGroup.position.set(posX, 0, posZ);

    // Pedestal base
    const pedestalBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.22, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1e1e1e,
        roughness: 0.7,
        metalness: 0.4,
      })
    );
    pedestalBase.position.y = -0.28;
    slotGroup.add(pedestalBase);

    // Terracotta pedestal rim
    const pedestalRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.016, 8, 24),
      new THREE.MeshStandardMaterial({
        color: PORTFOLIO_PALETTE.terracotta,
        emissive: PORTFOLIO_PALETTE.burntOrange,
        emissiveIntensity: 0.25,
        roughness: 0.4,
        metalness: 0.6,
      })
    );
    pedestalRim.rotation.x = Math.PI / 2;
    pedestalRim.position.y = -0.17;
    slotGroup.add(pedestalRim);

    // Pedestal active halo ring
    const pedestalHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.014, 8, 24),
      new THREE.MeshBasicMaterial({
        color: PORTFOLIO_PALETTE.burntOrange,
        transparent: true,
        opacity: idx === 0 ? 0.9 : 0.15,
      })
    );
    pedestalHalo.rotation.x = Math.PI / 2;
    pedestalHalo.position.y = -0.16;
    slotGroup.add(pedestalHalo);

    // 3. Procedural Award Sculpture
    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.y = 0.08;

    let mainMat;

    if (cert.id === 'national-sports') {
      // Sculpted chalice cup for 29th Junior Men Tug-of-War National Championship
      mainMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.85,
      });

      const chaliceFoot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.04, 20),
        mainMat
      );
      chaliceFoot.position.y = -0.12;
      sculptureGroup.add(chaliceFoot);

      const chaliceStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.18, 16),
        mainMat
      );
      chaliceStem.position.y = -0.01;
      sculptureGroup.add(chaliceStem);

      const chaliceBowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.08, 0.22, 20),
        mainMat
      );
      chaliceBowl.position.y = 0.15;
      sculptureGroup.add(chaliceBowl);

      const handleLeft = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.018, 8, 16, Math.PI),
        mainMat
      );
      handleLeft.position.set(-0.18, 0.14, 0);
      handleLeft.rotation.z = Math.PI / 2;
      sculptureGroup.add(handleLeft);

      const handleRight = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.018, 8, 16, Math.PI),
        mainMat
      );
      handleRight.position.set(0.18, 0.14, 0);
      handleRight.rotation.z = -Math.PI / 2;
      sculptureGroup.add(handleRight);
    } else if (cert.id === 'jspiders-cert') {
      // Beveled holographic crest plaque / octahedron
      mainMat = new THREE.MeshStandardMaterial({
        color: PORTFOLIO_PALETTE.burntOrange,
        emissive: PORTFOLIO_PALETTE.burntOrange,
        emissiveIntensity: 0.6,
        roughness: 0.25,
        metalness: 0.75,
      });

      const crestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), mainMat);
      sculptureGroup.add(crestCore);

      const crestCage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.26, 0),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        })
      );
      sculptureGroup.add(crestCage);
    } else if (cert.id === 'gk-merit') {
      // All-India Academic Merit Crystal Star / Dodecahedron
      mainMat = new THREE.MeshStandardMaterial({
        color: PORTFOLIO_PALETTE.sand,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.8,
      });

      const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), mainMat);
      sculptureGroup.add(crystal);

      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.012, 8, 24),
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.6,
        })
      );
      orbitRing.rotation.x = Math.PI / 3;
      sculptureGroup.add(orbitRing);
    } else if (cert.id === 'manjushree-cert') {
      // Precision engineering hexagonal prism / mould tooling
      mainMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        emissive: 0x78350f,
        emissiveIntensity: 0.4,
        roughness: 0.35,
        metalness: 0.8,
      });

      const hexPrism = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.16, 6),
        mainMat
      );
      hexPrism.rotation.y = Math.PI / 6;
      sculptureGroup.add(hexPrism);

      const innerBore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.18, 16),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          metalness: 0.9,
        })
      );
      sculptureGroup.add(innerBore);
    } else if (cert.id === 'spoorthy-cert') {
      // Advanced computing monolith tablet with circuitry edges
      mainMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.7,
      });

      const monolith = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.08), mainMat);
      sculptureGroup.add(monolith);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.224, 0.324, 0.084)),
        new THREE.LineBasicMaterial({ color: 0x38bdf8 })
      );
      sculptureGroup.add(edges);
    } else {
      // Karnataka Gandhi Smarak distinction: peace flame tetrahedron obelisk
      mainMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: 0xb45309,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.7,
      });

      const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.36, 5), mainMat);
      sculptureGroup.add(obelisk);

      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.012, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 })
      );
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = -0.16;
      sculptureGroup.add(baseRing);
    }

    slotGroup.add(sculptureGroup);

    // Pickable hit sphere
    const hitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.userData = { id: cert.id, index: idx };
    slotGroup.add(hitMesh);
    pickableMeshes.push(hitMesh);

    turntableRig.add(slotGroup);

    awardNodes.push({
      id: cert.id,
      index: idx,
      angle,
      slotGroup,
      sculptureGroup,
      pedestalHalo,
      mainMat,
      targetY: idx === 0 ? 0.14 : 0.06,
      currentY: 0.06,
      currentScale: 1.0,
      targetScale: idx === 0 ? 1.2 : 0.95,
    });
  });

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  /**
   * Syncs active award by rotating the turntable so the award faces directly forward (+Z).
   */
  const syncState = (state) => {
    if (!state) return;
    const certId = state.activeCertId || certifications[0]?.id;
    const matchIdx = certifications.findIndex((c) => c.id === certId);
    if (matchIdx >= 0) {
      activeIndex = matchIdx;
      const awardAngle = (activeIndex / totalCerts) * Math.PI * 2;
      targetTurntableYaw = -awardAngle;

      for (let i = 0; i < awardNodes.length; i++) {
        const node = awardNodes[i];
        const isActive = i === activeIndex;

        node.targetScale = isActive ? 1.25 : 0.92;
        node.targetY = isActive ? 0.14 : 0.05;
        node.pedestalHalo.material.opacity = isActive ? 0.95 : 0.15;
        if (node.mainMat) {
          node.mainMat.emissiveIntensity = isActive ? 0.9 : 0.3;
        }
      }
    }
  };

  /**
   * Raycast picking for interactive award selection.
   */
  const pick = (ndcX, ndcY, camera) => {
    if (!camera) return;
    mouseVec.set(ndcX, ndcY);
    raycaster.setFromCamera(mouseVec, camera);

    const hits = raycaster.intersectObjects(pickableMeshes, false);
    if (hits.length > 0) {
      const hit = hits[0].object;
      const itemId = hit.userData?.id;
      if (itemId) {
        ctx.emitInteract({ type: 'select', itemId });
      }
    }
  };

  /**
   * Per-frame animation tick.
   */
  const update = (dt, elapsed, pointer) => {
    const dragYaw = pointer?.dragYaw || 0;
    const parallaxYaw = (pointer?.x || 0) * 0.2;

    const effectiveTargetYaw = targetTurntableYaw + dragYaw + parallaxYaw;
    currentTurntableYaw += (effectiveTargetYaw - currentTurntableYaw) * 0.08;
    turntableRig.rotation.y = currentTurntableYaw;

    const tiltX = (pointer?.y || 0) * 0.08;
    group.rotation.x = tiltX;

    for (let i = 0; i < awardNodes.length; i++) {
      const node = awardNodes[i];
      node.currentScale += (node.targetScale - node.currentScale) * 0.1;
      node.currentY += (node.targetY - node.currentY) * 0.1;

      const levitation = Math.sin(elapsed * 2.2 + i * 1.05) * 0.025;
      node.sculptureGroup.position.y = node.currentY + levitation;
      node.sculptureGroup.scale.setScalar(node.currentScale);
      node.sculptureGroup.rotation.y += dt * 0.6;
    }
  };

  const dispose = () => {
    disposeObject3D(group);
  };

  return { group, update, pick, syncState, dispose };
}
