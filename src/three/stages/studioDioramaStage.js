import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { OVERVIEW_POSE, STUDIO_STATIONS, findStationById } from '../studioStations.js';
import { CameraDirector } from '../CameraDirector.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

import { createAvatarStageModel } from '../models/avatarStageModel.js';
import { createEngineeringMorphModel } from '../models/engineeringMorphModel.js';
import { createCareerHelixModel } from '../models/careerHelixModel.js';
import { createProjectArtifactModel } from '../models/projectArtifactModel.js';
import { createSkillConstellationModel } from '../models/skillConstellationModel.js';
import { createTrophyCarouselModel } from '../models/trophyCarouselModel.js';
import { createContactBeaconModel } from '../models/contactBeaconModel.js';

/**
 * Draws rounded rectangle path on 2D canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Creates crisp billboard nameplate sprite for a studio station.
 *
 * @param {import('../studioStations.js').StudioStation} station
 * @returns {{ sprite: THREE.Sprite, texture: THREE.CanvasTexture }}
 */
function createStationNameplate(station) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx2d = canvas.getContext('2d');

  ctx2d.fillStyle = 'rgba(18, 18, 18, 0.9)';
  ctx2d.strokeStyle = '#D95D39';
  ctx2d.lineWidth = 4;
  roundRect(ctx2d, 10, 10, 492, 120, 24);
  ctx2d.fill();
  ctx2d.stroke();

  ctx2d.fillStyle = '#D95D39';
  ctx2d.font = 'bold 22px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(station.label.toUpperCase() + ' • ' + station.badge.toUpperCase(), 256, 48);

  ctx2d.fillStyle = '#F5F2EB';
  ctx2d.font = 'bold 30px sans-serif';
  ctx2d.fillText(station.title, 256, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.5, 0.41, 1);

  return { sprite, texture };
}

/**
 * Single-stage factory assembling the complete 3D Studio Diorama Showroom.
 * Reuses all 7 existing model builders without duplicated geometry.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createStudioDioramaStage(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);

  const cameraDirector = new CameraDirector(camera, OVERVIEW_POSE);

  let activeStationId = 'overview';
  let isSpeaking = false;
  let activeSkillCategory = 0;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const disposables = [];
  const stationColliders = [];
  const glowRings = [];

  // ==========================================
  // 1. Studio Lighting Setup
  // ==========================================
  const studioLights = createStudioLighting(scene, {
    ambientIntensity: 1.15,
    keyIntensity: 1.6,
    accentIntensity: 3.6,
    rimLights: true,
  });
  disposables.push(studioLights);

  const showroomTopLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
  showroomTopLight.position.set(-2, 8, 3);
  scene.add(showroomTopLight);
  disposables.push({ dispose: () => scene.remove(showroomTopLight) });

  // ==========================================
  // 2. Diorama Floor, Plinth & Architectural Walls
  // ==========================================
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x141414,
    roughness: 0.8,
    metalness: 0.2,
  });
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 14), floorMat);
  floorMesh.position.y = -0.2;
  scene.add(floorMesh);

  // Glowing Burnt-Orange Perimeter Plinth
  const plinthMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });
  const plinthRimNorth = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.08, 0.12), plinthMat);
  plinthRimNorth.position.set(0, 0.02, -7.02);
  const plinthRimSouth = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.08, 0.12), plinthMat);
  plinthRimSouth.position.set(0, 0.02, 7.02);
  const plinthRimWest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 14.2), plinthMat);
  plinthRimWest.position.set(-7.02, 0.02, 0);
  const plinthRimEast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 14.2), plinthMat);
  plinthRimEast.position.set(7.02, 0.02, 0);
  scene.add(plinthRimNorth, plinthRimSouth, plinthRimWest, plinthRimEast);

  // Subtle Floor Grid Lines
  const gridHelper = new THREE.GridHelper(14, 28, PORTFOLIO_PALETTE.burntOrange, 0x282828);
  gridHelper.position.y = 0.005;
  scene.add(gridHelper);

  // Back Architectural Cutaway Walls (#181210)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x181210,
    roughness: 0.9,
    metalness: 0.15,
  });
  const backWallZ = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 0.2), wallMat);
  backWallZ.position.set(0, 2.25, -7.1);
  const backWallX = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 14), wallMat);
  backWallX.position.set(-7.1, 2.25, 0);

  const baseboardMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 0.6,
  });
  const baseboardZ = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 0.08), baseboardMat);
  baseboardZ.position.set(0, 0.05, -6.96);
  const baseboardX = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 14), baseboardMat);
  baseboardX.position.set(-6.96, 0.05, 0);
  scene.add(backWallZ, backWallX, baseboardZ, baseboardX);

  // Ambient Dust Particles
  const particleCount = ctx.qualityTier === 'mobile' ? 60 : 160;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 12;
    particlePos[i + 1] = Math.random() * 4.5 + 0.2;
    particlePos[i + 2] = (Math.random() - 0.5) * 12;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffb099,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });
  const particlesMesh = new THREE.Points(particleGeo, particleMat);
  scene.add(particlesMesh);

  // ==========================================
  // 3. Mount Station Pedestals & Hit-Box Cylinders
  // ==========================================
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7,
    metalness: 0.3,
  });

  const stationRadii = {
    'hero-avatar': 1.6,
    'about-lab': 1.25,
    'experience-helix': 1.15,
    'project-gallery': 1.55,
    'skills-reactor': 1.2,
    'achievements-vitrine': 1.35,
    'contact-terminal': 1.2,
  };

  STUDIO_STATIONS.forEach((station) => {
    const radius = stationRadii[station.id] || 1.2;
    const height = 0.28;

    const pedMesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.04, height, 36), pedestalMat);
    pedMesh.position.set(station.anchorPos[0], height / 2, station.anchorPos[2]);
    scene.add(pedMesh);

    const glowRingMat = new THREE.MeshBasicMaterial({
      color: PORTFOLIO_PALETTE.burntOrange,
      transparent: true,
      opacity: 0.45,
    });
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.024, 8, 48), glowRingMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.set(station.anchorPos[0], height + 0.01, station.anchorPos[2]);
    scene.add(glowRing);
    glowRings.push({ stationId: station.id, mesh: glowRing, material: glowRingMat });

    // Invisible Clickable Hit-Box Collider
    const collider = new THREE.Mesh(
      new THREE.CylinderGeometry(radius + 0.35, radius + 0.35, 3.2, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.set(station.anchorPos[0], 1.6, station.anchorPos[2]);
    collider.userData = { isStationCollider: true, stationId: station.id };
    stationColliders.push(collider);
    scene.add(collider);

    // Floating Canvas Station Nameplate (lift Station 1 above avatar plane top 2.755)
    const nameplateY = station.id === 'hero-avatar' ? 3.2 : station.anchorPos[1] + 1.65;
    const { sprite, texture } = createStationNameplate(station);
    sprite.position.set(
      station.anchorPos[0],
      nameplateY,
      station.anchorPos[2]
    );
    scene.add(sprite);
    disposables.push({
      dispose: () => {
        texture.dispose();
        sprite.material.dispose();
      },
    });
  });

  // ==========================================
  // 4. Mount Shared Model Assemblies
  // ==========================================

  // Station 1: Avatar & Workspace
  const avatarModel = createAvatarStageModel(ctx);
  avatarModel.group.position.set(0, 0.95, 0);
  scene.add(avatarModel.group);
  disposables.push(avatarModel);

  // Station 2: Engineering Morph Lab
  const morphModel = createEngineeringMorphModel(ctx);
  morphModel.group.position.set(-4.3, 1.0, -2.8);
  scene.add(morphModel.group);
  disposables.push(morphModel);

  // Station 3: Career Double Helix
  const helixModel = createCareerHelixModel(ctx);
  helixModel.group.position.set(-4.1, 1.5, 2.6);
  helixModel.group.scale.setScalar(0.78);
  scene.add(helixModel.group);
  disposables.push(helixModel);

  // Station 4: Artifact Showcase Pod Cluster
  const galleryGroup = new THREE.Group();
  galleryGroup.position.set(4.3, 1.1, -2.5);

  const zistiArtifact = createProjectArtifactModel(ctx, 'zisti');
  zistiArtifact.group.scale.setScalar(0.55);
  zistiArtifact.group.position.set(-0.75, 0, -0.45);

  const astrovedicArtifact = createProjectArtifactModel(ctx, 'astrovedic');
  astrovedicArtifact.group.scale.setScalar(0.55);
  astrovedicArtifact.group.position.set(-0.25, 0, 0.55);

  const sentimentArtifact = createProjectArtifactModel(ctx, 'sentiment-engine');
  sentimentArtifact.group.scale.setScalar(0.55);
  sentimentArtifact.group.position.set(0.4, 0, 0.45);

  const engineSimArtifact = createProjectArtifactModel(ctx, 'engine-3d-sim');
  engineSimArtifact.group.scale.setScalar(0.55);
  engineSimArtifact.group.position.set(0.75, 0, -0.45);

  galleryGroup.add(
    zistiArtifact.group,
    astrovedicArtifact.group,
    sentimentArtifact.group,
    engineSimArtifact.group
  );
  scene.add(galleryGroup);
  disposables.push(zistiArtifact, astrovedicArtifact, sentimentArtifact, engineSimArtifact);

  // Station 5: Skills Reactor
  const skillsModel = createSkillConstellationModel(ctx);
  skillsModel.group.position.set(4.2, 1.25, 2.7);
  skillsModel.group.scale.setScalar(0.52);
  scene.add(skillsModel.group);
  disposables.push(skillsModel);

  // Station 6: Honors Vitrine
  const trophyModel = createTrophyCarouselModel(ctx);
  trophyModel.group.position.set(0, 0.55, -4.7);
  trophyModel.group.scale.setScalar(0.75);
  scene.add(trophyModel.group);
  disposables.push(trophyModel);

  // Station 7: Dispatch Beacon
  const beaconModel = createContactBeaconModel(ctx);
  beaconModel.group.position.set(0, 1.15, 4.7);
  beaconModel.group.scale.setScalar(0.85);
  scene.add(beaconModel.group);
  disposables.push(beaconModel);

  /**
   * Raycasts station colliders from normalized device coordinates (-1 to 1).
   *
   * @param {number} ndcX
   * @param {number} ndcY
   */
  function pick(ndcX, ndcY) {
    mouse.set(ndcX, ndcY);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(stationColliders, false);

    if (intersects.length > 0) {
      const stationId = intersects[0].object.userData.stationId;
      if (stationId) {
        ctx.emitInteract({ type: 'select', stationId });
      }
    }
  }

  return {
    scene,
    camera,

    syncState(state) {
      if (!state) return;

      if (typeof state.activeStationId === 'string') {
        activeStationId = state.activeStationId;
        if (activeStationId === 'overview') {
          cameraDirector.setTargetPose(OVERVIEW_POSE);
        } else {
          const station = findStationById(activeStationId);
          if (station) {
            cameraDirector.setTargetPose(station.cameraPose);
          }
        }
      }

      if (typeof state.isSpeaking === 'boolean') {
        isSpeaking = state.isSpeaking;
      }

      if (typeof state.activeSkillCategory === 'number') {
        activeSkillCategory = state.activeSkillCategory;
        skillsModel.syncState({ activeTab: activeSkillCategory });
      }

      // Update pedestal glow feedback
      for (let i = 0; i < glowRings.length; i++) {
        const ring = glowRings[i];
        const isActive = ring.stationId === activeStationId;
        ring.material.opacity = isActive ? 0.95 : 0.35;
        ring.mesh.scale.setScalar(isActive ? 1.05 : 1.0);
      }
    },

    update(dt, elapsed, pointer) {
      cameraDirector.update(dt, pointer);

      // Dust particle slow circulation
      particlesMesh.rotation.y = elapsed * 0.03;

      // Pulse active station glow ring
      for (let i = 0; i < glowRings.length; i++) {
        const ring = glowRings[i];
        if (ring.stationId === activeStationId) {
          const pulse = Math.sin(elapsed * 4) * 0.15 + 0.85;
          ring.material.opacity = pulse;
        }
      }

      // Update shared model assemblies
      avatarModel.update(dt, elapsed, null, { isSpeaking });
      morphModel.update(dt, elapsed, null, { morphProgress: 0.5 });
      helixModel.update(dt, elapsed, null, {});
      zistiArtifact.update(dt, elapsed, null);
      astrovedicArtifact.update(dt, elapsed, null);
      sentimentArtifact.update(dt, elapsed, null);
      engineSimArtifact.update(dt, elapsed, null);
      skillsModel.update(dt, elapsed, null);
      trophyModel.update(dt, elapsed, null);
      beaconModel.update(dt, elapsed, null);
    },

    pick(ndcX, ndcY) {
      pick(ndcX, ndcY);
    },

    dispose() {
      for (let i = 0; i < disposables.length; i++) {
        const d = disposables[i];
        if (typeof d?.dispose === 'function') {
          d.dispose();
        }
      }
      disposables.length = 0;
      stationColliders.length = 0;
      glowRings.length = 0;

      disposeObject3D(scene);
    },
  };
}
