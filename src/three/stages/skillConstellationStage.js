import * as THREE from 'three';
import { createSkillConstellationModel } from '../models/skillConstellationModel.js';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';

/**
 * Skills constellation stage factory: creates the interactive 3D technical repertoire stage.
 *
 * @param {import('../ScissorEngine.js').StageContext} ctx
 * @returns {import('../ScissorEngine.js').StageController}
 */
export function createSkillConstellationStage(ctx) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.4, 4.2);
  camera.lookAt(0, 0, 0);

  const lighting = createStudioLighting(scene, {
    rimLights: true,
    ambientIntensity: 1.15,
    keyIntensity: 1.5,
    accentIntensity: 3.8,
  });

  const constellationModel = createSkillConstellationModel(ctx);
  scene.add(constellationModel.group);

  return {
    scene,
    camera,
    syncState(nextState) {
      constellationModel.syncState(nextState);
    },
    pick(ndcX, ndcY) {
      constellationModel.pick(ndcX, ndcY, camera);
    },
    update(dt, elapsed, pointer) {
      constellationModel.update(dt, elapsed, pointer);
    },
    dispose() {
      constellationModel.dispose();
      lighting.dispose();
      disposeObject3D(scene);
    },
  };
}
