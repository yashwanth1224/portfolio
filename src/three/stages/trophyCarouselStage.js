import * as THREE from 'three';
import { createTrophyCarouselModel } from '../models/trophyCarouselModel.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

/**
 * Trophy carousel stage factory: hosts the orbital pedestal awards turntable.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createTrophyCarouselStage(ctx) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.85, 3.8);
  camera.lookAt(0, -0.05, 0);

  const lighting = createStudioLighting(scene, {
    rimLights: true,
    ambientIntensity: 1.1,
    keyIntensity: 1.6,
    accentIntensity: 3.5,
  });

  const carouselModel = createTrophyCarouselModel(ctx);
  scene.add(carouselModel.group);

  return {
    scene,
    camera,
    syncState(nextState) {
      carouselModel.syncState(nextState);
    },
    pick(ndcX, ndcY) {
      carouselModel.pick(ndcX, ndcY, camera);
    },
    update(dt, elapsed, pointer) {
      carouselModel.update(dt, elapsed, pointer);
    },
    dispose() {
      carouselModel.dispose();
      lighting.dispose();
      disposeObject3D(scene);
    },
  };
}
