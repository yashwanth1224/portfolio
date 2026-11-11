import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { disposeObject3D } from '../models/sceneUtils.js';

/**
 * @typedef {import('../ScissorEngine.js').StageContext} StageContext
 * @typedef {import('../ScissorEngine.js').StageController} StageController
 */

const STROKE_LABELS = Object.freeze([
  '1. Intake Stroke (Fuel-Air Induction)',
  '2. Compression Stroke (High Pressure)',
  '3. Power Stroke (Ignition & Expansion)',
  '4. Exhaust Stroke (Scavenging)',
]);

/**
 * Single-context WebGL stage controller for the 4-stroke IC kinematic engine simulation.
 *
 * @param {StageContext} ctx
 * @returns {StageController}
 */
export function createEngineSimStage(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 5);

  const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.95);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffedd5, 1.4);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  const rimLight = new THREE.PointLight(PORTFOLIO_PALETTE.burntOrange, 2.2, 8);
  rimLight.position.set(-2, -1, 2);
  scene.add(rimLight);

  const assembly = new THREE.Group();
  scene.add(assembly);

  const cylGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 32, 1, true);
  const cylMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    roughness: 0.1,
    transmission: 0.8,
    wireframe: true,
  });
  const cylinder = new THREE.Mesh(cylGeo, cylMat);
  cylinder.position.y = 0.5;
  assembly.add(cylinder);

  const headRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.04, 16, 32),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.85,
    })
  );
  headRing.rotation.x = Math.PI / 2;
  headRing.position.y = 1.6;
  assembly.add(headRing);

  const pistonMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    metalness: 0.8,
    roughness: 0.3,
  });
  const pistonGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 32);
  const pistonMesh = new THREE.Mesh(pistonGeo, pistonMat);
  assembly.add(pistonMesh);

  const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16);
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.9,
    roughness: 0.2,
  });
  const rodMesh = new THREE.Mesh(rodGeo, rodMat);
  assembly.add(rodMesh);

  const crankGroup = new THREE.Group();
  const crankGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  const crankMesh = new THREE.Mesh(crankGeo, pistonMat);
  crankMesh.position.y = 0.3;
  crankGroup.add(crankMesh);
  crankGroup.position.y = -1.1;
  assembly.add(crankGroup);

  const sparkLight = new THREE.PointLight(0xff7733, 0, 3);
  sparkLight.position.set(0, 1.4, 0);
  assembly.add(sparkLight);

  const sparkMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    })
  );
  sparkMesh.position.set(0, 1.35, 0);
  assembly.add(sparkMesh);

  let rpm = 1800;
  let isRunning = true;
  let angle = 0;
  let lastStrokeIndex = -1;

  const crankRadius = 0.35;
  const rodLength = 1.4;

  return {
    scene,
    camera,
    syncState(nextState) {
      if (!nextState) return;
      if (typeof nextState.rpm === 'number') {
        rpm = nextState.rpm;
      }
      if (typeof nextState.isRunning === 'boolean') {
        isRunning = nextState.isRunning;
      }
    },
    update(dt, elapsed, pointer) {
      if (isRunning) {
        const angularSpeed = (rpm / 60) * Math.PI * 2 * 0.15;
        angle += angularSpeed * dt;
      }

      assembly.rotation.y = pointer.dragYaw;
      assembly.rotation.x = pointer.dragPitch;

      crankGroup.rotation.z = angle;

      const crankPinY = -1.1 + Math.cos(angle) * crankRadius;
      const crankPinX = -Math.sin(angle) * crankRadius;

      const pistonY = crankPinY + Math.sqrt(Math.max(0.01, rodLength * rodLength - crankPinX * crankPinX));
      pistonMesh.position.y = pistonY;

      rodMesh.position.set(crankPinX / 2, (crankPinY + pistonY) / 2, 0);
      rodMesh.rotation.z = Math.atan2(crankPinX, pistonY - crankPinY);

      const cycleAngle = ((angle % (Math.PI * 4)) + Math.PI * 4) % (Math.PI * 4);
      const strokeIndex = Math.min(3, Math.floor(cycleAngle / Math.PI));

      if (strokeIndex === 2) {
        const strokeProgress = (cycleAngle - 2 * Math.PI) / Math.PI;
        if (strokeProgress < 0.28) {
          const intensity = 1 - strokeProgress / 0.28;
          sparkLight.intensity = intensity * 4.5;
          sparkMesh.material.opacity = intensity;
        } else {
          sparkLight.intensity = 0;
          sparkMesh.material.opacity = 0;
        }
      } else {
        sparkLight.intensity = 0;
        sparkMesh.material.opacity = 0;
      }

      if (strokeIndex !== lastStrokeIndex) {
        lastStrokeIndex = strokeIndex;
        ctx.emitInteract({
          type: 'telemetry',
          strokeLabel: STROKE_LABELS[strokeIndex],
          strokeIndex,
        });
      }
    },
    resize(width, height) {
      if (height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    },
    dispose() {
      disposeObject3D(scene);
    },
  };
}
