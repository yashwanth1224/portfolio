import * as THREE from 'three';
import { PORTFOLIO_PALETTE } from '../stageManifest.js';

/**
 * Recursively disposes geometries, materials, and non-shared texture maps on an Object3D hierarchy.
 *
 * @param {THREE.Object3D | null | undefined} root
 */
export function disposeObject3D(root) {
  if (!root) return;

  root.traverse((obj) => {
    if (obj.geometry && typeof obj.geometry.dispose === 'function') {
      obj.geometry.dispose();
    }

    if (obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];
        if (!mat) continue;

        const textureKeys = [
          'map',
          'alphaMap',
          'roughnessMap',
          'metalnessMap',
          'normalMap',
          'bumpMap',
          'emissiveMap',
          'envMap',
          'lightMap',
          'specularMap',
        ];

        for (let j = 0; j < textureKeys.length; j++) {
          const key = textureKeys[j];
          const tex = mat[key];
          if (tex && typeof tex.dispose === 'function' && !tex.userData?.isShared) {
            tex.dispose();
          }
        }

        if (typeof mat.dispose === 'function') {
          mat.dispose();
        }
      }
    }
  });
}

/**
 * Configures the portfolio's signature studio lighting setup:
 * warm cream ambient, directional key, burnt-orange accent, and optional cool cobalt/cyan rim lights.
 *
 * @param {THREE.Scene} scene
 * @param {Object} [options]
 * @param {boolean} [options.rimLights=true]
 * @param {number} [options.ambientIntensity=1.05]
 * @param {number} [options.keyIntensity=1.45]
 * @param {number} [options.accentIntensity=3.2]
 * @returns {{ lights: THREE.Light[], dispose: () => void }}
 */
export function createStudioLighting(scene, options = {}) {
  const {
    rimLights = true,
    ambientIntensity = 1.05,
    keyIntensity = 1.45,
    accentIntensity = 3.2,
  } = options;

  const lights = [];

  const ambient = new THREE.AmbientLight(0xfff7ed, ambientIntensity);
  scene.add(ambient);
  lights.push(ambient);

  const keyLight = new THREE.DirectionalLight(0xffedd5, keyIntensity);
  keyLight.position.set(2.5, 5, 4);
  scene.add(keyLight);
  lights.push(keyLight);

  const accentLight = new THREE.PointLight(PORTFOLIO_PALETTE.burntOrange, accentIntensity, 8);
  accentLight.position.set(0, -0.5, 2.2);
  scene.add(accentLight);
  lights.push(accentLight);

  if (rimLights) {
    const rimCobalt = new THREE.PointLight(0x2563eb, 2.2, 10);
    rimCobalt.position.set(-3, 2, -1);
    scene.add(rimCobalt);
    lights.push(rimCobalt);

    const rimCyan = new THREE.PointLight(0x38bdf8, 2.2, 10);
    rimCyan.position.set(3, 1.5, -0.5);
    scene.add(rimCyan);
    lights.push(rimCyan);
  }

  const dispose = () => {
    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      scene.remove(light);
      if (typeof light.dispose === 'function') {
        light.dispose();
      }
    }
    lights.length = 0;
  };

  return { lights, dispose };
}
