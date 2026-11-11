import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { disposeObject3D } from './sceneUtils.js';

/**
 * Builds the 3D stylized wireframe geodesic globe with Bengaluru telemetry beacon.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {{
 *   group: THREE.Group,
 *   update: (dt: number, elapsed: number, pointer: import('../ScissorEngine.js').NormalizedPointer) => void,
 *   syncState: (state: { isSubmitting?: boolean, submitted?: boolean }) => void,
 *   dispose: () => void
 * }}
 */
export function createContactBeaconModel(ctx) {
  const group = new THREE.Group();

  let isSubmitting = false;
  let submitted = false;
  let burstTime = 0;

  let currentYaw = 0;
  let currentPitch = 0;

  // Globe radius
  const globeRadius = 1.05;

  // Globe Rig holding rotating elements
  const globeRig = new THREE.Group();
  group.add(globeRig);

  // 1. Inner Charcoal Core Sphere
  const innerSphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius - 0.03, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.8,
      metalness: 0.3,
    })
  );
  globeRig.add(innerSphere);

  // 2. Geodesic Wireframe Outer Shell
  const geodesicGeo = new THREE.IcosahedronGeometry(globeRadius, 2);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const geodesicMesh = new THREE.Mesh(geodesicGeo, wireframeMat);
  globeRig.add(geodesicMesh);

  // Lat/Long Guide Grid Rings
  const equatorRing = new THREE.Mesh(
    new THREE.TorusGeometry(globeRadius + 0.01, 0.005, 8, 48),
    new THREE.MeshBasicMaterial({
      color: PORTFOLIO_PALETTE.burntOrange,
      transparent: true,
      opacity: 0.25,
    })
  );
  equatorRing.rotation.x = Math.PI / 2;
  globeRig.add(equatorRing);

  // 3. Bengaluru Coordinates (12.97° N, 77.59° E)
  const latRad = (12.97 * Math.PI) / 180;
  const lonRad = (77.59 * Math.PI) / 180;

  const bx = globeRadius * Math.cos(latRad) * Math.sin(lonRad);
  const by = globeRadius * Math.sin(latRad);
  const bz = globeRadius * Math.cos(latRad) * Math.cos(lonRad);
  const bengaluruPos = new THREE.Vector3(bx, by, bz);
  const bengaluruNormal = bengaluruPos.clone().normalize();

  // Beacon Group pinned to Bengaluru
  const beaconGroup = new THREE.Group();
  beaconGroup.position.copy(bengaluruPos);
  beaconGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bengaluruNormal);

  // Pin Cone pointing outward
  const pinMat = new THREE.MeshStandardMaterial({
    color: PORTFOLIO_PALETTE.burntOrange,
    emissive: PORTFOLIO_PALETTE.burntOrange,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.7,
  });
  const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 16), pinMat);
  pinCone.position.y = 0.09;
  beaconGroup.add(pinCone);

  // Glowing beacon tip sphere
  const beaconTipMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const beaconTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), beaconTipMat);
  beaconTip.position.y = 0.18;
  beaconGroup.add(beaconTip);

  // 4. Atmospheric Telemetry Wave Rings
  const waveRings = [];
  const waveRingCount = 3;
  const waveGeo = new THREE.RingGeometry(0.02, 0.04, 32);

  for (let i = 0; i < waveRingCount; i++) {
    const waveMat = new THREE.MeshBasicMaterial({
      color: PORTFOLIO_PALETTE.burntOrange,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = Math.PI / 2;
    waveMesh.position.y = 0.01;
    beaconGroup.add(waveMesh);

    waveRings.push({
      mesh: waveMesh,
      mat: waveMat,
      phase: i / waveRingCount,
    });
  }

  // Celebratory Burst Ring
  const burstMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const burstMesh = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.1, 32), burstMat);
  burstMesh.rotation.x = Math.PI / 2;
  burstMesh.position.y = 0.02;
  beaconGroup.add(burstMesh);

  globeRig.add(beaconGroup);

  // Orient globeRig so Bengaluru faces front-center toward camera (+Z)
  const restYaw = -lonRad + 0.25;
  const restPitch = -latRad * 0.4;
  globeRig.rotation.y = restYaw;
  globeRig.rotation.x = restPitch;

  // 5. Orbiting Satellite Node
  const satelliteRig = new THREE.Group();
  satelliteRig.rotation.x = Math.PI / 4;
  satelliteRig.rotation.z = Math.PI / 6;

  const satOrbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.005, 8, 64),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    })
  );
  satOrbitRing.rotation.x = Math.PI / 2;
  satelliteRig.add(satOrbitRing);

  const satNode = new THREE.Group();
  const satBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.04, 0.04),
    new THREE.MeshStandardMaterial({
      color: PORTFOLIO_PALETTE.sand,
      emissive: PORTFOLIO_PALETTE.burntOrange,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    })
  );
  satNode.add(satBody);

  const satWingLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.05),
    new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
    })
  );
  satWingLeft.position.x = -0.09;
  satNode.add(satWingLeft);

  const satWingRight = satWingLeft.clone();
  satWingRight.position.x = 0.09;
  satNode.add(satWingRight);

  satelliteRig.add(satNode);
  group.add(satelliteRig);

  /**
   * Syncs form transmission telemetry states.
   */
  const syncState = (state) => {
    if (!state) return;
    isSubmitting = Boolean(state.isSubmitting);
    const wasSubmitted = submitted;
    submitted = Boolean(state.submitted);

    if (submitted && !wasSubmitted) {
      burstTime = 0.01;
    }
  };

  /**
   * Per-frame animation tick.
   */
  const update = (dt, elapsed, pointer) => {
    const dragYaw = pointer?.dragYaw || 0;
    const dragPitch = pointer?.dragPitch || 0;
    const parallaxYaw = (pointer?.x || 0) * 0.25;
    const parallaxPitch = (pointer?.y || 0) * 0.2;

    const targetYaw = restYaw + dragYaw + parallaxYaw;
    const targetPitch = restPitch + dragPitch + parallaxPitch;

    currentYaw += (targetYaw - currentYaw) * 0.08;
    currentPitch += (targetPitch + Math.sin(elapsed * 0.8) * 0.03 - currentPitch) * 0.08;

    globeRig.rotation.y = currentYaw;
    globeRig.rotation.x = currentPitch;

    // Telemetry Wave Rings expansion
    const waveSpeed = isSubmitting ? 1.6 : 0.55;
    for (let i = 0; i < waveRings.length; i++) {
      const ring = waveRings[i];
      ring.phase = (ring.phase + dt * waveSpeed) % 1.0;
      const currentScale = 0.2 + ring.phase * 3.8;
      ring.mesh.scale.setScalar(currentScale);
      ring.mat.opacity = Math.max(0, 1 - ring.phase) * (isSubmitting ? 1.0 : 0.7);
    }

    // Celebratory Burst Ring
    if (burstTime > 0) {
      burstTime += dt * 1.5;
      if (burstTime < 1.0) {
        burstMesh.scale.setScalar(1 + burstTime * 7.5);
        burstMat.opacity = (1 - burstTime) * 0.95;
      } else {
        burstTime = 0;
        burstMat.opacity = 0;
      }
    }

    // Beacon Pin Pulses
    const beaconPulse = isSubmitting
      ? Math.sin(elapsed * 12) * 1.0 + 2.0
      : submitted
      ? 2.5
      : Math.sin(elapsed * 3.0) * 0.4 + 1.2;
    pinMat.emissiveIntensity = beaconPulse;

    // Orbiting Satellite Node position
    const satAngle = elapsed * (isSubmitting ? 1.4 : 0.6);
    const satRadius = 1.45;
    satNode.position.set(Math.cos(satAngle) * satRadius, 0, Math.sin(satAngle) * satRadius);
    satNode.rotation.y = -satAngle;

    satelliteRig.rotation.y = elapsed * 0.15;
  };

  const dispose = () => {
    geodesicGeo.dispose();
    wireframeMat.dispose();
    waveGeo.dispose();
    disposeObject3D(group);
  };

  return { group, update, syncState, dispose };
}
