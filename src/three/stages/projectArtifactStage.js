import * as THREE from 'three';
import { createStudioLighting, disposeObject3D } from '../models/sceneUtils.js';
import { createProjectArtifactModel } from '../models/projectArtifactModel.js';

/**
 * @typedef {import('../ScissorEngine.js').StageContext} StageContext
 * @typedef {import('../ScissorEngine.js').StageController} StageController
 * @typedef {(ctx: StageContext) => StageController} StageFactory
 */

/** @type {Map<string, StageFactory>} */
const factoryCache = new Map();

/**
 * Creates a stage controller factory for a given project ID.
 *
 * @param {string} projectId
 * @returns {StageFactory}
 */
function createProjectStageFactory(projectId) {
  return function projectStageFactory(ctx) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0.2, 3.1);
    camera.lookAt(0, 0, 0);

    const lighting = createStudioLighting(scene, { rimLights: true });
    const model = createProjectArtifactModel(ctx, projectId);
    scene.add(model.group);

    let currentState = {};

    return {
      scene,
      camera,
      syncState(nextState) {
        currentState = nextState || {};
      },
      update(dt, elapsed, pointer) {
        model.update(dt, elapsed, pointer, currentState);
      },
      resize(width, height) {
        if (height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      },
      dispose() {
        model.dispose();
        lighting.dispose();
        disposeObject3D(scene);
      },
    };
  };
}

/**
 * Returns a referentially memoized StageFactory per projectId.
 * Guarantees stable reference equality across component re-renders.
 *
 * @param {string} projectId
 * @returns {StageFactory}
 */
export function getProjectStageFactory(projectId) {
  let factory = factoryCache.get(projectId);
  if (!factory) {
    factory = createProjectStageFactory(projectId);
    factoryCache.set(projectId, factory);
  }
  return factory;
}
