import * as THREE from 'three';
import { createContactBeaconModel } from '../models/contactBeaconModel.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

/**
 * Contact beacon stage factory: creates the interactive 3D Bengaluru globe beacon stage.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createContactBeaconStage(ctx) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.2);
  camera.lookAt(0, 0, 0);

  const lighting = createStudioLighting(scene, {
    rimLights: true,
    ambientIntensity: 1.15,
    keyIntensity: 1.5,
    accentIntensity: 3.6,
  });

  const beaconModel = createContactBeaconModel(ctx);
  scene.add(beaconModel.group);

  return {
    scene,
    camera,
    syncState(nextState) {
      beaconModel.syncState(nextState);
    },
    update(dt, elapsed, pointer) {
      beaconModel.update(dt, elapsed, pointer);
    },
    dispose() {
      beaconModel.dispose();
      lighting.dispose();
      disposeObject3D(scene);
    },
  };
}
