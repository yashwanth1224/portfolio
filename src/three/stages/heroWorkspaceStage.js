import * as THREE from 'three';
import { createAvatarStageModel } from '../models/avatarStageModel.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

/**
 * Hero workspace stage factory: hosts Yashwanth's interactive 3D avatar workspace.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createHeroWorkspaceStage(ctx) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.45, 4.4);
  camera.lookAt(0, 0.25, 0);

  const lighting = createStudioLighting(scene, {
    rimLights: true,
    ambientIntensity: 1.05,
    keyIntensity: 1.45,
    accentIntensity: 3.8,
  });

  const avatarModel = createAvatarStageModel(ctx);
  scene.add(avatarModel.group);

  let stageState = {};

  return {
    scene,
    camera,
    syncState(nextState) {
      stageState = { ...stageState, ...nextState };
    },
    update(dt, elapsed, pointer) {
      avatarModel.update(dt, elapsed, pointer, stageState);
    },
    dispose() {
      avatarModel.dispose();
      lighting.dispose();
      disposeObject3D(scene);
    },
  };
}
