import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { disposeObject3D } from './sceneUtils.js';

/**
 * Builds the Engineering Morph model group showcasing Yashwanth's evolution
 * from Mechanical Engineering (EWIT VTU) to Modern React / Software Engineering.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {{ group: THREE.Group, update: (dt: number, elapsed: number, pointer: import('../ScissorEngine.js').NormalizedPointer, state: Record<string, unknown>) => void, dispose: () => void }}
 */
export function createEngineeringMorphModel(ctx) {
  const group = new THREE.Group();

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let currentMorph = 0.5;

  // ==========================================
  // CLUSTER A: Mechanical Engineering Kinematics
  // ==========================================
  const mechanicalCluster = new THREE.Group();
  mechanicalCluster.position.set(-0.2, 0, 0);

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x8c432d,
    metalness: 0.85,
    roughness: 0.3,
    transparent: true,
    opacity: 1,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.9,
    roughness: 0.25,
    transparent: true,
    opacity: 1,
  });

  const terracottaMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    metalness: 0.5,
    roughness: 0.4,
    transparent: true,
    opacity: 1,
  });

  // Geared Flywheel
  const flywheelGroup = new THREE.Group();
  const flywheelHubGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32);
  const flywheelHub = new THREE.Mesh(flywheelHubGeo, metalMat);
  flywheelHub.rotation.x = Math.PI / 2;
  flywheelGroup.add(flywheelHub);

  // Outer gear teeth
  const toothCount = 12;
  const toothGeo = new THREE.BoxGeometry(0.12, 0.08, 0.11);
  for (let i = 0; i < toothCount; i++) {
    const angle = (i / toothCount) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeo, metalMat);
    tooth.position.set(Math.cos(angle) * 0.58, Math.sin(angle) * 0.58, 0);
    tooth.rotation.z = angle;
    flywheelGroup.add(tooth);
  }

  // Flywheel spokes
  const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12);
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(spokeGeo, steelMat);
    spoke.rotation.z = (i * Math.PI) / 4;
    flywheelGroup.add(spoke);
  }

  mechanicalCluster.add(flywheelGroup);

  // Slider-Crank Kinematic Mechanism
  const crankPinRadius = 0.35;
  const rodLength = 1.05;

  const crankPinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 16);
  const crankPin = new THREE.Mesh(crankPinGeo, terracottaMat);
  crankPin.rotation.x = Math.PI / 2;
  mechanicalCluster.add(crankPin);

  const connectingRodGeo = new THREE.CylinderGeometry(0.035, 0.035, rodLength, 16);
  const connectingRod = new THREE.Mesh(connectingRodGeo, steelMat);
  mechanicalCluster.add(connectingRod);

  const sliderGeo = new THREE.BoxGeometry(0.38, 0.26, 0.22);
  const slider = new THREE.Mesh(sliderGeo, terracottaMat);
  mechanicalCluster.add(slider);

  // Guide rails for slider
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.5,
    transparent: true,
    opacity: 0.8,
  });
  const railGeo = new THREE.BoxGeometry(1.2, 0.03, 0.26);
  const railTop = new THREE.Mesh(railGeo, railMat);
  railTop.position.set(0.9, 0.16, 0);
  const railBottom = new THREE.Mesh(railGeo, railMat);
  railBottom.position.set(0.9, -0.16, 0);
  mechanicalCluster.add(railTop, railBottom);

  group.add(mechanicalCluster);

  // ==========================================
  // CLUSTER B: React & Modern Software Cluster
  // ==========================================
  const softwareCluster = new THREE.Group();
  softwareCluster.position.set(0.2, 0, 0);

  // Glowing wireframe icosahedron core
  const outerCoreGeo = new THREE.IcosahedronGeometry(0.65, 1);
  const outerCoreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    wireframe: true,
    emissive: 0x0284c7,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.9,
  });
  const outerCore = new THREE.Mesh(outerCoreGeo, outerCoreMat);
  softwareCluster.add(outerCore);

  const innerCoreGeo = new THREE.IcosahedronGeometry(0.32, 0);
  const innerCoreMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.95,
  });
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  softwareCluster.add(innerCore);

  // 3 Tilted React Orbital Rings (#38bdf8, #D95D39, #F5F2EB)
  const ringRadius = 1.1;
  const ringTube = 0.018;

  const orbitalMatA = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.7,
    transparent: true,
    opacity: 0.85,
  });
  const orbitalA = new THREE.Mesh(new THREE.TorusGeometry(ringRadius, ringTube, 16, 64), orbitalMatA);
  orbitalA.rotation.x = Math.PI / 3;
  softwareCluster.add(orbitalA);

  const orbitalMatB = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.7,
    transparent: true,
    opacity: 0.85,
  });
  const orbitalB = new THREE.Mesh(new THREE.TorusGeometry(ringRadius, ringTube, 16, 64), orbitalMatB);
  orbitalB.rotation.x = -Math.PI / 3;
  softwareCluster.add(orbitalB);

  const orbitalMatC = new THREE.MeshStandardMaterial({
    color: 0xF5F2EB,
    emissive: 0xd4cdc3,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.5,
    transparent: true,
    opacity: 0.75,
  });
  const orbitalC = new THREE.Mesh(new THREE.TorusGeometry(ringRadius, ringTube, 16, 64), orbitalMatC);
  orbitalC.rotation.y = Math.PI / 2;
  softwareCluster.add(orbitalC);

  // Orbiting Electron Nodes
  const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
  const nodeMeshA = new THREE.Mesh(nodeGeo, orbitalMatA);
  const nodeMeshB = new THREE.Mesh(nodeGeo, orbitalMatB);
  const nodeMeshC = new THREE.Mesh(nodeGeo, orbitalMatC);
  softwareCluster.add(nodeMeshA, nodeMeshB, nodeMeshC);

  group.add(softwareCluster);

  const update = (dt, elapsed, pointer, state) => {
    // Kinematic mechanism update
    const theta = elapsed * 2.6;
    const pinX = Math.cos(theta) * crankPinRadius;
    const pinY = Math.sin(theta) * crankPinRadius;
    flywheelGroup.rotation.z = theta;

    crankPin.position.set(pinX, pinY, 0.05);

    // Slider displacement along X axis
    const sliderX = pinX + Math.sqrt(Math.max(0.01, rodLength * rodLength - pinY * pinY));
    slider.position.set(sliderX, 0, 0);

    // Connecting rod orientation and position
    connectingRod.position.set((pinX + sliderX) / 2, pinY / 2, 0);
    connectingRod.rotation.z = Math.atan2(-pinY, sliderX - pinX) + Math.PI / 2;

    // React cluster rotation
    outerCore.rotation.x = elapsed * 0.4;
    outerCore.rotation.y = elapsed * 0.6;
    innerCore.rotation.y = -elapsed * 0.5;

    orbitalA.rotation.z = elapsed * 0.3;
    orbitalB.rotation.z = -elapsed * 0.35;
    orbitalC.rotation.x = elapsed * 0.25;

    // Orbiting nodes position
    const nodeSpeed = 2.4;
    const angA = elapsed * nodeSpeed;
    nodeMeshA.position.set(
      Math.cos(angA) * ringRadius,
      Math.sin(angA) * ringRadius * Math.cos(Math.PI / 3),
      Math.sin(angA) * ringRadius * Math.sin(Math.PI / 3)
    );

    const angB = elapsed * nodeSpeed + 2;
    nodeMeshB.position.set(
      Math.cos(angB) * ringRadius,
      Math.sin(angB) * ringRadius * Math.cos(-Math.PI / 3),
      Math.sin(angB) * ringRadius * Math.sin(-Math.PI / 3)
    );

    const angC = elapsed * nodeSpeed + 4;
    nodeMeshC.position.set(
      0,
      Math.sin(angC) * ringRadius,
      Math.cos(angC) * ringRadius
    );

    let targetMorph;
    if (typeof state?.morphProgress === 'number' && Number.isFinite(state.morphProgress)) {
      targetMorph = Math.max(0, Math.min(1, state.morphProgress));
    } else {
      const photoMode = state?.photoMode || 'avatar';
      const scroll = typeof state?.scrollProgress === 'number' ? state.scrollProgress : 0.5;
      targetMorph = Math.max(0, Math.min(1, (photoMode === 'real' ? 0.25 : 0.75) + (scroll - 0.5) * 0.3));
    }

    currentMorph += (targetMorph - currentMorph) * 0.06;

    // Blend cluster scales and positions smoothly
    mechanicalCluster.scale.setScalar(0.7 + (1 - currentMorph) * 0.4);
    mechanicalCluster.position.x = -0.3 * (1 - currentMorph);
    mechanicalCluster.position.z = -currentMorph * 0.6;

    const mechOpacity = Math.max(0.2, 1 - currentMorph * 0.7);
    metalMat.opacity = mechOpacity;
    steelMat.opacity = mechOpacity;
    terracottaMat.opacity = mechOpacity;

    softwareCluster.scale.setScalar(0.7 + currentMorph * 0.4);
    softwareCluster.position.x = 0.3 * currentMorph;
    softwareCluster.position.z = -(1 - currentMorph) * 0.6;

    const softOpacity = Math.max(0.2, currentMorph);
    outerCoreMat.opacity = softOpacity;
    orbitalMatA.opacity = softOpacity * 0.85;
    orbitalMatB.opacity = softOpacity * 0.85;
    orbitalMatC.opacity = softOpacity * 0.75;

    // Pointer interactive drag orbit
    if (pointer) {
      targetRotY = (pointer.dragYaw || 0) + (pointer.x || 0) * 0.4;
      targetRotX = (pointer.dragPitch || 0) - (pointer.y || 0) * 0.4;
    }
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;

    group.rotation.x = currentRotX;
    group.rotation.y = currentRotY + Math.sin(elapsed * 0.5) * 0.08;
  };

  const dispose = () => {
    disposeObject3D(group);
  };

  return { group, update, dispose };
}
