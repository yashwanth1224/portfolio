import * as THREE from 'three';
import { OVERVIEW_POSE } from './studioStations.js';

/**
 * Critically-damped 1D spring step (analytic implicit Euler).
 *
 * @param {number} current
 * @param {number} target
 * @param {number} velocity
 * @param {number} omega
 * @param {number} dt
 * @returns {[number, number]} [nextValue, nextVelocity]
 */
function spring1D(current, target, velocity, omega, dt) {
  const f = 1 + 2 * dt * omega;
  const inv = 1 / (f * f);
  const diff = current - target;
  const temp = (velocity + diff * omega) * dt;
  const nextVel = (velocity - temp * omega) * inv;
  const nextVal = target + (diff + temp) * inv;
  return [nextVal, nextVel];
}

/**
 * Critically-damped 3D vector spring step.
 *
 * @param {THREE.Vector3} currVec
 * @param {THREE.Vector3} targetVec
 * @param {THREE.Vector3} velVec
 * @param {number} omega
 * @param {number} dt
 */
function spring3D(currVec, targetVec, velVec, omega, dt) {
  const f = 1 + 2 * dt * omega;
  const inv = 1 / (f * f);

  for (const axis of ['x', 'y', 'z']) {
    const c = currVec[axis];
    const t = targetVec[axis];
    const v = velVec[axis];
    const diff = c - t;
    const temp = (v + diff * omega) * dt;
    velVec[axis] = (v - temp * omega) * inv;
    currVec[axis] = t + (diff + temp) * inv;
  }
}

/**
 * Smooth camera director using critically-damped harmonic interpolation
 * with layered interactive orbit offsets around focus targets.
 */
export class CameraDirector {
  /** @type {THREE.PerspectiveCamera} */
  #camera;

  /** @type {THREE.Vector3} */
  #currentPos = new THREE.Vector3();
  /** @type {THREE.Vector3} */
  #targetPos = new THREE.Vector3();
  /** @type {THREE.Vector3} */
  #posVel = new THREE.Vector3();

  /** @type {THREE.Vector3} */
  #currentTarget = new THREE.Vector3();
  /** @type {THREE.Vector3} */
  #desiredTarget = new THREE.Vector3();
  /** @type {THREE.Vector3} */
  #targetVel = new THREE.Vector3();

  #currentFov = 40;
  #targetFov = 40;
  #fovVel = 0;

  #omega = 5.5;
  #dragBaselineYaw = 0;
  #dragBaselinePitch = 0;
  #pendingBaselineCapture = false;

  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {import('./studioStations.js').CameraPose} [initialPose]
   */
  constructor(camera, initialPose = OVERVIEW_POSE) {
    this.#camera = camera;
    this.snapTo(initialPose);
  }

  /**
   * Snaps camera instantly to the given pose.
   *
   * @param {import('./studioStations.js').CameraPose} pose
   */
  snapTo(pose) {
    if (!pose) return;
    const p = pose.position;
    const t = pose.target;
    const f = typeof pose.fov === 'number' ? pose.fov : 40;

    this.#currentPos.set(p[0], p[1], p[2]);
    this.#targetPos.copy(this.#currentPos);
    this.#posVel.set(0, 0, 0);

    this.#currentTarget.set(t[0], t[1], t[2]);
    this.#desiredTarget.copy(this.#currentTarget);
    this.#targetVel.set(0, 0, 0);

    this.#currentFov = f;
    this.#targetFov = f;
    this.#fovVel = 0;
    this.#dragBaselineYaw = 0;
    this.#dragBaselinePitch = 0;
    this.#pendingBaselineCapture = false;

    this.#camera.position.copy(this.#currentPos);
    this.#camera.lookAt(this.#currentTarget);
    this.#camera.fov = f;
    this.#camera.updateProjectionMatrix();
  }

  /**
   * Sets target camera pose. Idempotent on identical coordinates.
   *
   * @param {import('./studioStations.js').CameraPose} pose
   */
  setTargetPose(pose) {
    if (!pose) return;
    const p = pose.position;
    const t = pose.target;
    const f = typeof pose.fov === 'number' ? pose.fov : 40;

    const samePos =
      Math.abs(this.#targetPos.x - p[0]) < 1e-4 &&
      Math.abs(this.#targetPos.y - p[1]) < 1e-4 &&
      Math.abs(this.#targetPos.z - p[2]) < 1e-4;
    const sameTarget =
      Math.abs(this.#desiredTarget.x - t[0]) < 1e-4 &&
      Math.abs(this.#desiredTarget.y - t[1]) < 1e-4 &&
      Math.abs(this.#desiredTarget.z - t[2]) < 1e-4;
    const sameFov = Math.abs(this.#targetFov - f) < 1e-4;

    if (samePos && sameTarget && sameFov) return;

    this.#targetPos.set(p[0], p[1], p[2]);
    this.#desiredTarget.set(t[0], t[1], t[2]);
    this.#targetFov = f;
    this.#pendingBaselineCapture = true;
  }

  /**
   * Advances interpolation and layers user orbit drag around current target.
   *
   * @param {number} dt Delta time in seconds
   * @param {import('./ScissorEngine.js').NormalizedPointer} [pointer]
   */
  update(dt, pointer) {
    const clampedDt = Math.min(Math.max(dt || 0.016, 0.001), 0.1);

    spring3D(this.#currentPos, this.#targetPos, this.#posVel, this.#omega, clampedDt);
    spring3D(this.#currentTarget, this.#desiredTarget, this.#targetVel, this.#omega, clampedDt);

    const [nextFov, nextFovVel] = spring1D(
      this.#currentFov,
      this.#targetFov,
      this.#fovVel,
      this.#omega,
      clampedDt
    );
    this.#currentFov = nextFov;
    this.#fovVel = nextFovVel;

    if (Math.abs(this.#camera.fov - this.#currentFov) > 0.01) {
      this.#camera.fov = this.#currentFov;
      this.#camera.updateProjectionMatrix();
    }

    const offsetX = this.#currentPos.x - this.#currentTarget.x;
    const offsetY = this.#currentPos.y - this.#currentTarget.y;
    const offsetZ = this.#currentPos.z - this.#currentTarget.z;
    const radius = Math.max(0.001, Math.hypot(offsetX, offsetY, offsetZ));

    const baseTheta = Math.atan2(offsetX, offsetZ);
    const basePhi = Math.asin(Math.max(-0.999, Math.min(0.999, offsetY / radius)));

    const rawDragYaw = pointer?.dragYaw || 0;
    const rawDragPitch = pointer?.dragPitch || 0;
    if (this.#pendingBaselineCapture) {
      this.#dragBaselineYaw = rawDragYaw;
      this.#dragBaselinePitch = rawDragPitch;
      this.#pendingBaselineCapture = false;
    }

    const dragYaw = rawDragYaw - this.#dragBaselineYaw;
    const dragPitch = rawDragPitch - this.#dragBaselinePitch;

    const finalTheta = baseTheta + dragYaw;
    const finalPhi = Math.max(-1.42, Math.min(1.42, basePhi + dragPitch));

    const orbitedX = this.#currentTarget.x + radius * Math.cos(finalPhi) * Math.sin(finalTheta);
    const orbitedY = this.#currentTarget.y + radius * Math.sin(finalPhi);
    const orbitedZ = this.#currentTarget.z + radius * Math.cos(finalPhi) * Math.cos(finalTheta);

    this.#camera.position.set(orbitedX, orbitedY, orbitedZ);
    this.#camera.lookAt(this.#currentTarget);
  }

  /**
   * Returns current interpolated camera target.
   *
   * @returns {THREE.Vector3}
   */
  getTarget() {
    return this.#currentTarget.clone();
  }
}
