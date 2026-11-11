import * as THREE from 'three';
import { createCareerHelixModel } from '../models/careerHelixModel.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

/**
 * Career timeline stage factory: hosts the interactive 3D Double-Helix Career Spine.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createCareerHelixStage(ctx) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.3);
  camera.lookAt(0, 0, 0);

  const lighting = createStudioLighting(scene, {
    rimLights: true,
    ambientIntensity: 1.1,
    keyIntensity: 1.45,
    accentIntensity: 3.6,
  });

  const helixModel = createCareerHelixModel(ctx);
  scene.add(helixModel.group);

  return {
    scene,
    camera,
    syncState(nextState) {
      helixModel.syncState(nextState);
    },
    pick(ndcX, ndcY) {
      helixModel.pick(ndcX, ndcY, camera);
    },
    update(dt, elapsed, pointer) {
      helixModel.update(dt, elapsed, pointer);
    },
    dispose() {
      helixModel.dispose();
      lighting.dispose();
      disposeObject3D(scene);
    },
  };
}
