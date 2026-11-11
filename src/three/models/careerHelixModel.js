import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { experiences as defaultExperiences } from '../../data/portfolioData.js';
import { disposeObject3D } from './sceneUtils.js';

/**
 * Builds the interactive 3D Double-Helix Career Spine model group.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {{ group: THREE.Group, update: (dt: number, elapsed: number, pointer: import('../ScissorEngine.js').NormalizedPointer, state: Record<string, unknown>) => void, pick: (ndcX: number, ndcY: number, camera: THREE.Camera) => void, syncState: (state: Record<string, unknown>) => void, dispose: () => void }}
 */
export function createCareerHelixModel(ctx) {
  const group = new THREE.Group();
  // Isolate local bobbing and rotation from parent-stage pedestal offsets.
  const contentGroup = new THREE.Group();
  group.add(contentGroup);

  let targetYaw = 0;
  let currentYaw = 0;

  const helixRadius = 0.7;
  const helixHeight = 3.2;
  const turns = 1.25;
  const sampleSteps = 60;

  // 1. Double-Helix Backbone Curves
  const pointsA = [];
  const pointsB = [];

  for (let s = 0; s <= sampleSteps; s++) {
    const t = s / sampleSteps;
    const y = helixHeight / 2 - t * helixHeight;
    const theta = t * Math.PI * 2 * turns;

    pointsA.push(new THREE.Vector3(Math.cos(theta) * helixRadius, y, Math.sin(theta) * helixRadius));
    pointsB.push(
      new THREE.Vector3(Math.cos(theta + Math.PI) * helixRadius, y, Math.sin(theta + Math.PI) * helixRadius)
    );
  }

  const curveA = new THREE.CatmullRomCurve3(pointsA);
  const curveB = new THREE.CatmullRomCurve3(pointsB);

  const strandMatA = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 0.4,
    metalness: 0.7,
    roughness: 0.3,
  });

  const strandMatB = new THREE.MeshStandardMaterial({
    color: 0x3d2b24,
    emissive: 0x1a120e,
    emissiveIntensity: 0.2,
    metalness: 0.85,
    roughness: 0.25,
  });

  const strandMeshA = new THREE.Mesh(new THREE.TubeGeometry(curveA, 64, 0.026, 8, false), strandMatA);
  const strandMeshB = new THREE.Mesh(new THREE.TubeGeometry(curveB, 64, 0.026, 8, false), strandMatB);

  contentGroup.add(strandMeshA, strandMeshB);

  // 2. Milestone Rungs & Pickable Nodes
  const rungMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.8,
    roughness: 0.4,
    transparent: true,
    opacity: 0.75,
  });

  const badgeTextures = [];
  const milestoneNodes = [];
  const pickableMeshes = [];

  const exps = defaultExperiences.slice(0, 6);
  const totalRungs = exps.length;

  for (let i = 0; i < totalRungs; i++) {
    const exp = exps[i];
    const t = totalRungs > 1 ? i / (totalRungs - 1) : 0.5;
    const y = 1.35 - t * 2.7;
    const theta = t * Math.PI * 2 * turns;

    const posA = new THREE.Vector3(Math.cos(theta) * helixRadius, y, Math.sin(theta) * helixRadius);
    const posB = new THREE.Vector3(
      Math.cos(theta + Math.PI) * helixRadius,
      y,
      Math.sin(theta + Math.PI) * helixRadius
    );

    // Connecting horizontal rung cylinder
    const rungGeo = new THREE.CylinderGeometry(0.016, 0.016, helixRadius * 2, 8);
    const rungMesh = new THREE.Mesh(rungGeo, rungMat);
    rungMesh.position.set(0, y, 0);
    rungMesh.rotation.z = Math.PI / 2;
    rungMesh.rotation.y = -theta;
    contentGroup.add(rungMesh);

    // Pickable milestone node at posA
    const nodeGroup = new THREE.Group();
    nodeGroup.position.copy(posA);

    const sphereGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: PORTFOLIO_PALETTE.burntOrange,
      emissive: PORTFOLIO_PALETTE.burntOrange,
      emissiveIntensity: i === 0 ? 0.9 : 0.25,
      roughness: 0.25,
      metalness: 0.75,
      transparent: true,
      opacity: 1,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.userData = { id: exp.id, category: exp.category, isMilestoneNode: true };
    nodeGroup.add(sphereMesh);

    const hitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.userData = { id: exp.id, category: exp.category, isMilestoneNode: true };
    nodeGroup.add(hitMesh);
    pickableMeshes.push(hitMesh);

    // Glowing orbital ring for selection highlight
    const ringGeo = new THREE.TorusGeometry(0.18, 0.016, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: i === 0 ? 0.9 : 0.2,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    nodeGroup.add(ringMesh);

    // Floating year / company badge canvas
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 84;
    const bCtx = badgeCanvas.getContext('2d');
    bCtx.fillStyle = '#140c09';
    bCtx.strokeStyle = '#D95D39';
    bCtx.lineWidth = 3;
    bCtx.beginPath();
    bCtx.roundRect(6, 6, 244, 72, 16);
    bCtx.fill();
    bCtx.stroke();

    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 22px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText(exp.company.slice(0, 16), 128, 36);

    bCtx.fillStyle = '#ffb099';
    bCtx.font = 'bold 15px monospace';
    bCtx.fillText(exp.period, 128, 62);

    const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    badgeTextures.push(badgeTexture);

    const badgeMat = new THREE.MeshBasicMaterial({
      map: badgeTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.17), badgeMat);
    badgeMesh.position.set(0, -0.22, 0);
    nodeGroup.add(badgeMesh);

    contentGroup.add(nodeGroup);

    milestoneNodes.push({
      id: exp.id,
      category: exp.category,
      nodeGroup,
      hitMesh,
      sphereMat,
      ringMat,
      badgeMat,
      ringMesh,
      targetScale: i === 0 ? 1.35 : 1.0,
      currentScale: 1.0,
    });
  }

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();
  const hiddenIds = new Set();
  let activePickableMeshes = pickableMeshes;

  const syncState = (state) => {
    if (!state) return;
    const activeId = state.activeId || exps[0]?.id;
    const filter = state.filter || 'all';
    const visibleIdSet =
      state.visibleIds instanceof Set
        ? state.visibleIds
        : Array.isArray(state.visibleIds)
        ? new Set(state.visibleIds)
        : null;

    hiddenIds.clear();
    const nextPickable = [];

    for (let i = 0; i < milestoneNodes.length; i++) {
      const node = milestoneNodes[i];
      const isSelected = node.id === activeId;
      const hiddenByFilter = filter !== 'all' && node.category !== filter;
      const hiddenByIds = visibleIdSet !== null && !visibleIdSet.has(node.id);
      const isFilteredOut = hiddenByFilter || hiddenByIds;

      if (isFilteredOut) {
        hiddenIds.add(node.id);
        node.targetScale = 0.7;
        node.sphereMat.opacity = 0.25;
        node.ringMat.opacity = 0.1;
        node.badgeMat.opacity = 0.2;
        node.sphereMat.emissiveIntensity = 0.1;
      } else {
        nextPickable.push(node.hitMesh);
        if (isSelected) {
          node.targetScale = 1.35;
          node.sphereMat.opacity = 1.0;
          node.ringMat.opacity = 0.95;
          node.badgeMat.opacity = 1.0;
          node.sphereMat.emissiveIntensity = 1.0;
        } else {
          node.targetScale = 1.0;
          node.sphereMat.opacity = 0.85;
          node.ringMat.opacity = 0.25;
          node.badgeMat.opacity = 0.85;
          node.sphereMat.emissiveIntensity = 0.25;
        }
      }
    }

    activePickableMeshes = nextPickable;
  };

  const pick = (ndcX, ndcY, camera) => {
    if (!camera) return;
    mouseVec.set(ndcX, ndcY);
    raycaster.setFromCamera(mouseVec, camera);

    const intersects = raycaster.intersectObjects(activePickableMeshes, false);
    for (let i = 0; i < intersects.length; i++) {
      const itemId = intersects[i].object.userData?.id;
      if (itemId && !hiddenIds.has(itemId)) {
        ctx.emitInteract({ type: 'select', itemId });
        return;
      }
    }
  };

  const update = (dt, elapsed, pointer) => {
    const autoYaw = elapsed * 0.25;
    const dragYaw = pointer?.dragYaw || 0;
    const parallaxYaw = (pointer?.x || 0) * 0.4;
    targetYaw = autoYaw + dragYaw + parallaxYaw;

    currentYaw += (targetYaw - currentYaw) * 0.08;
    contentGroup.rotation.y = currentYaw;
    contentGroup.position.y = Math.sin(elapsed * 1.5) * 0.04;

    for (let i = 0; i < milestoneNodes.length; i++) {
      const node = milestoneNodes[i];
      node.currentScale += (node.targetScale - node.currentScale) * 0.1;
      node.nodeGroup.scale.setScalar(node.currentScale);
      node.ringMesh.rotation.z += dt * 1.2;
    }
  };

  const dispose = () => {
    for (let i = 0; i < badgeTextures.length; i++) {
      badgeTextures[i].dispose();
    }
    badgeTextures.length = 0;
    disposeObject3D(group);
  };

  return { group, update, pick, syncState, dispose };
}
