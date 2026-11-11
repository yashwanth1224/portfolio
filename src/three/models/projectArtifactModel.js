import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';
import { disposeObject3D } from './sceneUtils.js';

/**
 * @typedef {import('../ScissorEngine.js').StageContext} StageContext
 * @typedef {import('../ScissorEngine.js').NormalizedPointer} NormalizedPointer
 */

/**
 * Creates bespoke 3D geometric artifact models for portfolio project previews.
 *
 * @param {StageContext} ctx
 * @param {string} projectId
 * @returns {{
 *   group: THREE.Group,
 *   update: (dt: number, elapsed: number, pointer: NormalizedPointer, state?: Record<string, unknown>) => void,
 *   dispose: () => void
 * }}
 */
export function createProjectArtifactModel(ctx, projectId) {
  const group = new THREE.Group();

  let updateArtifact = null;

  switch (projectId) {
    case 'zisti': {
      const packageGroup = new THREE.Group();

      const boxMat = new THREE.MeshStandardMaterial({
        color: PORTFOLIO_PALETTE.burntOrange,
        roughness: 0.35,
        metalness: 0.15,
      });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.64, 0.78), boxMat);
      packageGroup.add(box);

      const tapeMat = new THREE.MeshStandardMaterial({
        color: PORTFOLIO_PALETTE.cream,
        roughness: 0.4,
        metalness: 0.05,
      });
      const tapeH = new THREE.Mesh(new THREE.BoxGeometry(0.79, 0.12, 0.79), tapeMat);
      const tapeV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.79), tapeMat);
      packageGroup.add(tapeH);
      packageGroup.add(tapeV);

      const arcMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      });
      const speedArc = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.024, 16, 64, Math.PI * 1.55),
        arcMat
      );
      speedArc.rotation.x = 1.15;
      speedArc.rotation.y = 0.35;

      group.add(packageGroup);
      group.add(speedArc);

      updateArtifact = (dt, elapsed, speedMult) => {
        packageGroup.position.y = Math.sin(elapsed * 2.2) * 0.06;
        packageGroup.rotation.y += dt * 0.85 * speedMult;
        speedArc.rotation.z += dt * 3.2 * speedMult;
      };
      break;
    }

    case 'astrovedic': {
      const ringOuter = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.02, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.25, metalness: 0.75 })
      );
      const ringMid = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.02, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 })
      );
      const ringInner = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.018, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.6 })
      );

      const coreGroup = new THREE.Group();
      const coreSolid = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3, 0),
        new THREE.MeshStandardMaterial({
          color: 0xffedd5,
          emissive: 0xa855f7,
          emissiveIntensity: 0.4,
          roughness: 0.2,
          metalness: 0.5,
        })
      );
      const coreWire = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38, 0),
        new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          wireframe: true,
          transparent: true,
          opacity: 0.6,
        })
      );
      coreGroup.add(coreSolid);
      coreGroup.add(coreWire);

      ringOuter.rotation.x = 0.4;
      ringMid.rotation.y = 0.8;
      ringInner.rotation.z = -0.6;

      group.add(ringOuter);
      group.add(ringMid);
      group.add(ringInner);
      group.add(coreGroup);

      updateArtifact = (dt, elapsed, speedMult) => {
        ringOuter.rotation.x += dt * 0.65 * speedMult;
        ringOuter.rotation.y += dt * 0.45 * speedMult;
        ringMid.rotation.y -= dt * 0.95 * speedMult;
        ringMid.rotation.z += dt * 0.55 * speedMult;
        ringInner.rotation.z += dt * 1.25 * speedMult;
        ringInner.rotation.x -= dt * 0.75 * speedMult;

        const pulse = 1 + Math.sin(elapsed * 2.8) * 0.08;
        coreGroup.scale.set(pulse, pulse, pulse);
        coreGroup.rotation.y += dt * 1.4 * speedMult;
      };
      break;
    }

    case 'sentiment-engine': {
      const crystalGroup = new THREE.Group();
      const crystal = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.52, 0),
        new THREE.MeshPhysicalMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.35,
          roughness: 0.12,
          metalness: 0.25,
          transparent: true,
          opacity: 0.78,
        })
      );
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.53, 0),
        new THREE.MeshBasicMaterial({
          color: 0x6ee7b7,
          wireframe: true,
          transparent: true,
          opacity: 0.5,
        })
      );
      crystalGroup.add(crystal);
      crystalGroup.add(wire);

      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.018, 16, 48),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.3,
        })
      );
      ring1.rotation.x = Math.PI / 4;

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.015, 16, 48),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.25,
        })
      );
      ring2.rotation.y = Math.PI / 3;
      ring2.rotation.z = Math.PI / 6;

      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
      });
      const nodeA = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), nodeMat);
      const nodeB = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), nodeMat);
      group.add(crystalGroup);
      group.add(ring1);
      group.add(ring2);
      group.add(nodeA);
      group.add(nodeB);

      updateArtifact = (dt, elapsed, speedMult) => {
        const scale = 1 + Math.sin(elapsed * 2.8) * 0.09;
        crystalGroup.scale.set(scale, scale, scale);
        crystalGroup.rotation.y += dt * 0.85 * speedMult;
        crystalGroup.rotation.x += dt * 0.45 * speedMult;

        ring1.rotation.z += dt * 1.35 * speedMult;
        ring2.rotation.x -= dt * 1.1 * speedMult;

        const nodeAngle = elapsed * 2.0 * speedMult;
        nodeA.position.set(Math.cos(nodeAngle) * 0.82, Math.sin(nodeAngle) * 0.82, 0);
        nodeA.position.applyEuler(ring1.rotation);

        nodeB.position.set(Math.sin(-nodeAngle) * 1.0, 0, Math.cos(-nodeAngle) * 1.0);
        nodeB.position.applyEuler(ring2.rotation);
      };
      break;
    }

    case 'developer-portfolio': {
      const diamondGroup = new THREE.Group();
      const topPyramid = new THREE.Mesh(
        new THREE.ConeGeometry(0.46, 0.52, 4),
        new THREE.MeshStandardMaterial({
          color: PORTFOLIO_PALETTE.burntOrange,
          emissive: PORTFOLIO_PALETTE.terracotta,
          emissiveIntensity: 0.4,
          roughness: 0.25,
          metalness: 0.75,
          transparent: true,
          opacity: 0.9,
        })
      );
      topPyramid.position.y = 0.26;

      const botPyramid = new THREE.Mesh(
        new THREE.ConeGeometry(0.46, 0.52, 4),
        new THREE.MeshStandardMaterial({
          color: PORTFOLIO_PALETTE.burntOrange,
          emissive: PORTFOLIO_PALETTE.terracotta,
          emissiveIntensity: 0.4,
          roughness: 0.25,
          metalness: 0.75,
          transparent: true,
          opacity: 0.9,
        })
      );
      botPyramid.position.y = -0.26;
      botPyramid.rotation.x = Math.PI;

      const wireDiamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.49, 0),
        new THREE.MeshBasicMaterial({
          color: 0xffedd5,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        })
      );
      diamondGroup.add(topPyramid);
      diamondGroup.add(botPyramid);
      diamondGroup.add(wireDiamond);

      const gimbalOuter = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.024, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.8 })
      );
      const gimbalInner = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.02, 16, 64),
        new THREE.MeshStandardMaterial({
          color: PORTFOLIO_PALETTE.burntOrange,
          roughness: 0.3,
          metalness: 0.8,
        })
      );
      group.add(diamondGroup);
      group.add(gimbalOuter);
      group.add(gimbalInner);

      updateArtifact = (dt, elapsed, speedMult) => {
        gimbalOuter.rotation.y += dt * 1.15 * speedMult;
        gimbalInner.rotation.x += dt * 1.55 * speedMult;
        gimbalInner.rotation.z += dt * 0.75 * speedMult;

        diamondGroup.rotation.y += dt * 2.1 * speedMult;
        diamondGroup.position.y = Math.sin(elapsed * 2.5) * 0.07;
      };
      break;
    }

    case 'pneumatic-mobility': {
      const tankGroup = new THREE.Group();
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.25,
        metalness: 0.75,
      });
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.85, 24), tankMat);
      tank.rotation.z = Math.PI / 2;
      tankGroup.add(tank);

      const domeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.25,
        metalness: 0.75,
      });
      const capA = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        domeMat
      );
      capA.position.x = 0.42;
      capA.rotation.z = -Math.PI / 2;
      const capB = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        domeMat
      );
      capB.position.x = -0.42;
      capB.rotation.z = Math.PI / 2;
      tankGroup.add(capA);
      tankGroup.add(capB);

      const valve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 })
      );
      valve.position.set(0, 0.28, 0);
      tankGroup.add(valve);
      tankGroup.position.y = 0.28;

      const wheelGroup = new THREE.Group();
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.03, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 })
      );
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.85 })
      );
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(rim);
      wheelGroup.add(hub);

      const spokeMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.3,
        metalness: 0.7,
      });
      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.82, 8), spokeMat);
        spoke.rotation.z = (i * Math.PI) / 3;
        wheelGroup.add(spoke);
      }
      wheelGroup.position.set(0, -0.32, 0);

      const crankLink = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.28, 0.04),
        new THREE.MeshStandardMaterial({
          color: PORTFOLIO_PALETTE.burntOrange,
          metalness: 0.8,
          roughness: 0.3,
        })
      );
      crankLink.position.set(0.18, -0.15, 0.08);

      group.add(tankGroup);
      group.add(wheelGroup);
      group.add(crankLink);

      updateArtifact = (dt, elapsed, speedMult) => {
        wheelGroup.rotation.z -= dt * 4.2 * speedMult;
        tankGroup.position.y = 0.28 + Math.sin(elapsed * 2.8) * 0.04;
        crankLink.rotation.z = Math.sin(elapsed * 4.2 * speedMult) * 0.4;
      };
      break;
    }

    case 'engine-3d-sim': {
      const casing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 1.25, 24, 1, true),
        new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          transparent: true,
          opacity: 0.35,
          wireframe: true,
        })
      );
      casing.position.y = 0.25;

      const piston = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.32, 24),
        new THREE.MeshStandardMaterial({
          color: PORTFOLIO_PALETTE.burntOrange,
          roughness: 0.3,
          metalness: 0.75,
        })
      );

      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.82, 12),
        new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.2, metalness: 0.9 })
      );

      const crankDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.08, 20),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 })
      );
      crankDisc.rotation.x = Math.PI / 2;
      crankDisc.position.set(0, -0.65, 0);

      group.add(casing);
      group.add(piston);
      group.add(rod);
      group.add(crankDisc);

      let crankAngle = 0;
      updateArtifact = (dt, elapsed, speedMult) => {
        crankAngle += dt * 4.8 * speedMult;
        crankDisc.rotation.z = crankAngle;

        const crankR = 0.22;
        const rodL = 0.82;
        const pinY = -0.65 + Math.cos(crankAngle) * crankR;
        const pinX = -Math.sin(crankAngle) * crankR;
        const pistonY = pinY + Math.sqrt(Math.max(0.01, rodL * rodL - pinX * pinX));

        piston.position.y = pistonY;
        rod.position.set(pinX / 2, (pinY + pistonY) / 2, 0);
        rod.rotation.z = Math.atan2(pinX, pistonY - pinY);
      };
      break;
    }

    case 'saas-dashboard': {
      const planeGroup = new THREE.Group();
      const basePlane = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 0.92, 0.04, 32),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.4,
          metalness: 0.6,
          transparent: true,
          opacity: 0.85,
        })
      );
      basePlane.position.y = -0.45;
      planeGroup.add(basePlane);

      const gridRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.012, 16, 48),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
      );
      gridRing.rotation.x = Math.PI / 2;
      gridRing.position.y = -0.43;
      planeGroup.add(gridRing);

      const barColors = [
        PORTFOLIO_PALETTE.burntOrange,
        0xf97316,
        0x38bdf8,
        0x06b6d4,
        0x10b981,
      ];
      const bars = [];
      const colX = [-0.46, -0.23, 0, 0.23, 0.46];

      for (let i = 0; i < 5; i++) {
        const c = barColors[i];
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.85, 0.13),
          new THREE.MeshStandardMaterial({
            color: c,
            emissive: c,
            emissiveIntensity: 0.35,
            roughness: 0.25,
            metalness: 0.4,
          })
        );
        bar.position.x = colX[i];
        bar.position.y = -0.45;
        bars.push(bar);
        planeGroup.add(bar);
      }

      planeGroup.rotation.x = 0.35;
      group.add(planeGroup);

      updateArtifact = (dt, elapsed, speedMult) => {
        planeGroup.rotation.y += dt * 0.5 * speedMult;
        for (let i = 0; i < 5; i++) {
          const h = 0.3 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * 3.2 + i * 0.9));
          bars[i].scale.y = h;
          bars[i].position.y = -0.45 + (h * 0.85) / 2;
        }
      };
      break;
    }

    default: {
      const defaultNode = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({
          color: PORTFOLIO_PALETTE.burntOrange,
          roughness: 0.3,
          metalness: 0.6,
        })
      );
      const defaultWire = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.02, 16, 48),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
      );
      group.add(defaultNode);
      group.add(defaultWire);

      updateArtifact = (dt, elapsed, speedMult) => {
        defaultNode.rotation.y += dt * 0.8 * speedMult;
        defaultWire.rotation.x += dt * 1.0 * speedMult;
      };
      break;
    }
  }

  let currentRotX = 0;
  let currentRotY = 0;

  return {
    group,
    update(dt, elapsed, pointer, state) {
      const isHovered = Boolean(state?.isHovered || pointer?.isHovered);
      const speedMult = isHovered ? 2.2 : 1.0;

      updateArtifact?.(dt, elapsed, speedMult);

      const targetRotX = -(pointer?.y ?? 0) * 0.35;
      const targetRotY = (pointer?.x ?? 0) * 0.45;
      currentRotX += (targetRotX - currentRotX) * Math.min(1, dt * 6);
      currentRotY += (targetRotY - currentRotY) * Math.min(1, dt * 6);

      group.rotation.x = currentRotX;
      group.rotation.y = currentRotY;
    },
    dispose() {
      disposeObject3D(group);
    },
  };
}
