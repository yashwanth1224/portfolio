import * as THREE from 'three';
import { createEngineeringMorphModel } from '../models/engineeringMorphModel.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

/**
 * About section morph stage factory: showcases Yashwanth's mechanical to software evolution.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createAboutMorphStage(ctx) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.8);
  camera.lookAt(0, 0, 0);

  const lighting = createStudioLighting(scene, {
    rimLights: true,
    ambientIntensity: 0.95,
    keyIntensity: 1.35,
    accentIntensity: 3.5,
  });

  const morphModel = createEngineeringMorphModel(ctx);
  scene.add(morphModel.group);

  let stageState = {};

  return {
    scene,
    camera,
    syncState(nextState) {
      stageState = { ...stageState, ...nextState };
    },
    update(dt, elapsed, pointer, scrollProgress) {
      const mergedState = { ...stageState, scrollProgress };
      morphModel.update(dt, elapsed, pointer, mergedState);
    },
    dispose() {
      morphModel.dispose();
      lighting.dispose();
      disposeObject3D(scene);
    },
  };
}
