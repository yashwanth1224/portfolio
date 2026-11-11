import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { skillCategories } from '../../data/portfolioData.js';
import { disposeObject3D } from './sceneUtils.js';

/**
 * Builds the interactive 3D Skills Constellation model group.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {{
 *   group: THREE.Group,
 *   update: (dt: number, elapsed: number, pointer: import('../ScissorEngine.js').NormalizedPointer) => void,
 *   pick: (ndcX: number, ndcY: number, camera: THREE.Camera) => void,
 *   syncState: (state: { activeTab?: number, hoveredSkill?: string | null }) => void,
 *   dispose: () => void
 * }}
 */
export function createSkillConstellationModel(ctx) {
  const group = new THREE.Group();
  // Isolate local bobbing and rotation from parent-stage pedestal offsets.
  const contentGroup = new THREE.Group();
  group.add(contentGroup);

  let targetYaw = 0;
  let targetPitch = 0;
  let currentYaw = 0;
  let currentPitch = 0;
  let activeCategoryIndex = 0;
  let currentHoveredSkill = null;

  // 1. Central Core
  const coreGroup = new THREE.Group();
  const coreMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 1.25,
    roughness: 0.25,
    metalness: 0.7,
  });
  const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), coreMat);
  coreGroup.add(coreMesh);

  const coreHaloMat = new THREE.MeshBasicMaterial({
    color: PORTFOLIO_PALETTE.sand,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const coreHalo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 1), coreHaloMat);
  coreGroup.add(coreHalo);

  const ringGeo = new THREE.TorusGeometry(0.48, 0.012, 8, 36);
  const ringMat = new THREE.MeshBasicMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    transparent: true,
    opacity: 0.6,
  });
  const coreRingA = new THREE.Mesh(ringGeo, ringMat);
  coreRingA.rotation.x = Math.PI / 3;
  const coreRingB = new THREE.Mesh(ringGeo, ringMat);
  coreRingB.rotation.y = Math.PI / 3;
  coreGroup.add(coreRingA, coreRingB);

  contentGroup.add(coreGroup);

  // 2. Orbital Quadrant Clusters
  const clusterRadius = 1.6;
  const clusterData = [];
  const pickableMeshes = [];
  const linePoints = [];
  const lineColors = [];

  const categoryAngles = [
    0,
    Math.PI / 2,
    Math.PI,
    (3 * Math.PI) / 2,
  ];

  const categoryPalettes = [
    { base: PORTFOLIO_PALETTE.burntOrange, emissive: PORTFOLIO_PALETTE.burntOrange },
    { base: 0x38bdf8, emissive: 0x0284c7 },
    { base: 0x34d399, emissive: 0x059669 },
    { base: 0xfbbf24, emissive: 0xd97706 },
  ];

  skillCategories.forEach((cat, cIdx) => {
    const angle = categoryAngles[cIdx] ?? (cIdx * Math.PI) / 2;
    const hubX = Math.cos(angle) * clusterRadius;
    const hubY = (cIdx % 2 === 0 ? 0.16 : -0.16);
    const hubZ = Math.sin(angle) * clusterRadius;
    const hubPos = new THREE.Vector3(hubX, hubY, hubZ);

    const catPalette = categoryPalettes[cIdx] || categoryPalettes[0];

    const hubGroup = new THREE.Group();
    hubGroup.position.copy(hubPos);

    const hubMat = new THREE.MeshStandardMaterial({
      color: catPalette.base,
      emissive: catPalette.emissive,
      emissiveIntensity: cIdx === 0 ? 1.2 : 0.35,
      roughness: 0.3,
      metalness: 0.6,
    });
    const hubMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), hubMat);
    hubGroup.add(hubMesh);

    const hubOrbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.01, 8, 24),
      new THREE.MeshBasicMaterial({
        color: catPalette.base,
        transparent: true,
        opacity: 0.45,
      })
    );
    hubOrbitRing.rotation.x = Math.PI / 2;
    hubGroup.add(hubOrbitRing);

    const hubHit = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hubHit.userData = { isHub: true, categoryIndex: cIdx };
    hubGroup.add(hubHit);
    pickableMeshes.push(hubHit);

    contentGroup.add(hubGroup);

    // Core to Hub connector line
    linePoints.push(0, 0, 0, hubX, hubY, hubZ);
    const cCol = new THREE.Color(catPalette.base);
    lineColors.push(cCol.r * 0.8, cCol.g * 0.8, cCol.b * 0.8);
    lineColors.push(cCol.r, cCol.g, cCol.b);

    const skillNodes = [];
    const skillCount = cat.skills.length;

    cat.skills.forEach((skill, sIdx) => {
      const subAngle = (sIdx / skillCount) * Math.PI * 2;
      const subRadius = 0.42 + (sIdx % 2) * 0.18;
      const sx = hubX + Math.cos(subAngle) * subRadius;
      const sy = hubY + Math.sin(subAngle * 1.5) * 0.22 + ((sIdx % 3) - 1) * 0.08;
      const sz = hubZ + Math.sin(subAngle) * subRadius;
      const skillPos = new THREE.Vector3(sx, sy, sz);

      const radius = 0.05 + (skill.level / 100) * 0.045;
      const skillMat = new THREE.MeshStandardMaterial({
        color: catPalette.base,
        emissive: catPalette.emissive,
        emissiveIntensity: cIdx === 0 ? 0.9 : 0.25,
        roughness: 0.35,
        metalness: 0.5,
      });

      const skillGroup = new THREE.Group();
      skillGroup.position.copy(skillPos);

      const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), skillMat);
      skillGroup.add(sphereMesh);

      const skillHit = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      skillHit.userData = {
        isSkill: true,
        categoryIndex: cIdx,
        skillName: skill.name,
      };
      skillGroup.add(skillHit);
      pickableMeshes.push(skillHit);

      contentGroup.add(skillGroup);

      // Hub to Skill filament line
      linePoints.push(hubX, hubY, hubZ, sx, sy, sz);
      lineColors.push(cCol.r * 0.6, cCol.g * 0.6, cCol.b * 0.6);
      lineColors.push(cCol.r, cCol.g, cCol.b);

      // Inter-skill neighbor filament
      if (sIdx > 0) {
        const prevNode = skillNodes[sIdx - 1];
        linePoints.push(prevNode.pos.x, prevNode.pos.y, prevNode.pos.z, sx, sy, sz);
        lineColors.push(cCol.r * 0.4, cCol.g * 0.4, cCol.b * 0.4);
        lineColors.push(cCol.r * 0.4, cCol.g * 0.4, cCol.b * 0.4);
      }

      skillNodes.push({
        name: skill.name,
        level: skill.level,
        pos: skillPos,
        group: skillGroup,
        mat: skillMat,
        baseRadius: radius,
        currentScale: 1.0,
        targetScale: 1.0,
      });
    });

    clusterData.push({
      categoryIndex: cIdx,
      angle,
      hubGroup,
      hubMat,
      hubOrbitRing,
      skills: skillNodes,
    });
  });

  // 3. Filament LineSegments
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
  lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  contentGroup.add(lineSegments);

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  /**
   * Syncs active category focus and hovered skill state.
   */
  const syncState = (state) => {
    if (!state) return;

    if (typeof state.activeTab === 'number') {
      activeCategoryIndex = Math.max(0, Math.min(clusterData.length - 1, state.activeTab));
    }
    currentHoveredSkill = typeof state.hoveredSkill === 'string' ? state.hoveredSkill : null;

    const activeAngle = categoryAngles[activeCategoryIndex] ?? 0;
    targetYaw = activeAngle - Math.PI / 2;

    for (let c = 0; c < clusterData.length; c++) {
      const cluster = clusterData[c];
      const isActive = c === activeCategoryIndex;

      cluster.hubMat.emissiveIntensity = isActive ? 1.3 : 0.2;
      cluster.hubOrbitRing.scale.setScalar(isActive ? 1.25 : 0.85);

      for (let s = 0; s < cluster.skills.length; s++) {
        const node = cluster.skills[s];
        const isHovered = currentHoveredSkill && node.name.toLowerCase() === currentHoveredSkill.toLowerCase();

        if (isHovered) {
          node.targetScale = 1.65;
          node.mat.emissiveIntensity = 2.0;
        } else if (isActive) {
          node.targetScale = 1.15;
          node.mat.emissiveIntensity = 0.9;
        } else {
          node.targetScale = 0.85;
          node.mat.emissiveIntensity = 0.2;
        }
      }
    }
  };

  /**
   * Raycast picking for interactive quadrant selection.
   */
  const pick = (ndcX, ndcY, camera) => {
    if (!camera) return;
    mouseVec.set(ndcX, ndcY);
    raycaster.setFromCamera(mouseVec, camera);

    const hits = raycaster.intersectObjects(pickableMeshes, false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      const data = hitObj.userData;
      if (data?.isHub) {
        ctx.emitInteract({ type: 'select', categoryIndex: data.categoryIndex });
      } else if (data?.isSkill) {
        ctx.emitInteract({
          type: 'select',
          categoryIndex: data.categoryIndex,
          skillName: data.skillName,
        });
      }
    }
  };

  /**
   * Per-frame animation tick.
   */
  const update = (dt, elapsed, pointer) => {
    const dragYaw = pointer?.dragYaw || 0;
    const dragPitch = pointer?.dragPitch || 0;
    const parallaxYaw = (pointer?.x || 0) * 0.35;
    const parallaxPitch = (pointer?.y || 0) * 0.25;

    const effectiveTargetYaw = targetYaw + dragYaw + parallaxYaw;
    const effectiveTargetPitch = targetPitch + dragPitch + parallaxPitch;

    currentYaw += (effectiveTargetYaw - currentYaw) * 0.08;
    currentPitch += (effectiveTargetPitch - currentPitch) * 0.08;

    contentGroup.rotation.y = currentYaw;
    contentGroup.rotation.x = currentPitch;
    contentGroup.position.y = Math.sin(elapsed * 1.5) * 0.035;

    coreHalo.rotation.x = elapsed * 0.4;
    coreHalo.rotation.y = elapsed * 0.6;
    coreRingA.rotation.z = elapsed * 0.8;
    coreRingB.rotation.z = -elapsed * 0.8;

    for (let c = 0; c < clusterData.length; c++) {
      const cluster = clusterData[c];
      cluster.hubOrbitRing.rotation.z += dt * 1.5;

      for (let s = 0; s < cluster.skills.length; s++) {
        const node = cluster.skills[s];
        node.currentScale += (node.targetScale - node.currentScale) * 0.12;

        const isHovered = currentHoveredSkill && node.name.toLowerCase() === currentHoveredSkill.toLowerCase();
        const pulse = isHovered ? Math.sin(elapsed * 6) * 0.15 : 0;
        node.group.scale.setScalar(Math.max(0.2, node.currentScale + pulse));
      }
    }
  };

  const dispose = () => {
    lineGeo.dispose();
    lineMat.dispose();
    disposeObject3D(group);
  };

  return { group, update, pick, syncState, dispose };
}

export const createSkillConstellationGroup = createSkillConstellationModel;
