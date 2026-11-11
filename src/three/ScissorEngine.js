import * as THREE from 'three';
import { PORTFOLIO_PALETTE, STAGE_BUDGET, resolveStagePriority } from './stageManifest.js';
import {
  computeScissorViewport,
  computeScrollProgress,
  selectBudgetedStages,
  findScrollClipAncestor,
} from './scissorMath.js';

/**
 * @typedef {'high' | 'mobile' | 'reduced' | 'fallback'} QualityTier
 * @typedef {'initializing' | 'ready' | 'context-lost' | 'fallback'} HealthStatus
 *
 * @typedef {Object} CanvasHealth
 * @property {HealthStatus} status
 * @property {QualityTier} qualityTier
 * @property {number} activeStageCount
 * @property {boolean} hasActiveModalStage
 * @property {number} overBudgetStages
 *
 * @typedef {Object} NormalizedPointer
 * @property {number} x
 * @property {number} y
 * @property {boolean} isHovered
 * @property {boolean} isDragging
 * @property {number} dragYaw
 * @property {number} dragPitch
 * @property {boolean} justClicked
 *
 * @typedef {Object} StageContext
 * @property {QualityTier} qualityTier
 * @property {typeof PORTFOLIO_PALETTE} palette
 * @property {(url: string) => Promise<THREE.Texture>} loadSharedTexture
 * @property {(url: string) => void} releaseSharedTexture
 * @property {(event: { type: string, [key: string]: unknown }) => void} emitInteract
 *
 * @typedef {Object} StageController
 * @property {THREE.Scene} scene
 * @property {THREE.Camera} camera
 * @property {(state: Record<string, unknown>) => void} [syncState]
 * @property {(dt: number, elapsed: number, pointer: NormalizedPointer, scrollProgress: number) => void} [update]
 * @property {(width: number, height: number) => void} [resize]
 * @property {(ndcX: number, ndcY: number) => void} [pick]
 * @property {() => void} dispose
 */

/**
 * Detects device graphics profile and client preferences.
 *
 * @returns {QualityTier}
 */
export function probeQualityTier() {
  if (typeof window === 'undefined') return 'fallback';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }

  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl') ||
      probeCanvas.getContext('experimental-webgl');
    if (!gl) return 'fallback';
  } catch {
    return 'fallback';
  }

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth < 768;
  return isCoarse || isNarrow ? 'mobile' : 'high';
}

/**
 * Single-context WebGL orchestration engine using scissor-based multi-viewport rendering.
 */
export class ScissorEngine {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {((health: CanvasHealth) => void) | null} */
  #onHealthChange = null;
  /** @type {((telemetry: { fps: number, frameMs: number, dpr: number, renderedCount: number, overBudgetCount: number }) => void) | null} */
  #telemetryListener = null;

  /** @type {HealthStatus} */
  #status = 'initializing';
  /** @type {QualityTier} */
  #qualityTier = 'high';
  /** @type {THREE.WebGLRenderer | null} */
  #renderer = null;

  /** @type {Map<string, any>} */
  #stages = new Map();
  /** @type {Map<string, { texture: THREE.Texture | null, refs: number, promise: Promise<THREE.Texture> | null }>} */
  #sharedTextures = new Map();

  #tokenCounter = 0;
  #rafId = null;
  #isLoopRunning = false;

  #currentDpr = 1;
  #baseDpr = 1;
  #emaFrameMs = 0;
  #lastFrameTime = 0;
  #startTime = 0;
  #lastCanvasW = 0;
  #lastCanvasH = 0;
  #lastAppliedDpr = 0;
  #hasDrawnFrame = false;

  #telemetryTimer = 0;
  #framesCounted = 0;
  #lastRenderedCount = 0;
  #lastOverBudgetCount = 0;

  /** @type {CanvasHealth} */
  #health;

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {(health: CanvasHealth) => void} [onHealthChange]
   */
  constructor(canvas, onHealthChange) {
    this.#canvas = canvas;
    this.#onHealthChange = onHealthChange || null;
    this.#qualityTier = probeQualityTier();

    this.#health = {
      status: this.#status,
      qualityTier: this.#qualityTier,
      activeStageCount: 0,
      hasActiveModalStage: false,
      overBudgetStages: 0,
    };

    if (this.#qualityTier === 'fallback') {
      this.#status = 'fallback';
      this.#updateHealthSnapshot();
      return;
    }

    try {
      this.#renderer = new THREE.WebGLRenderer({
        canvas: this.#canvas,
        alpha: true,
        antialias: this.#qualityTier === 'high',
        powerPreference: 'high-performance',
        premultipliedAlpha: true,
      });
      this.#renderer.setClearColor(0x000000, 0);
      this.#renderer.autoClear = false;
      this.#status = 'ready';
    } catch {
      this.#status = 'fallback';
      this.#qualityTier = 'fallback';
      this.#updateHealthSnapshot();
      return;
    }

    const maxDpr = (STAGE_BUDGET[this.#qualityTier] || STAGE_BUDGET.high).maxDpr;
    const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    this.#baseDpr = Math.min(deviceDpr, maxDpr);
    this.#currentDpr = this.#baseDpr;
    this.#renderer.setPixelRatio(this.#currentDpr);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.#handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.#handleResize);
    }
    this.#canvas.addEventListener('webglcontextlost', this.#handleContextLost);
    this.#canvas.addEventListener('webglcontextrestored', this.#handleContextRestored);

    this.#updateHealthSnapshot();
  }

  /**
   * Registers a 3D stage portal. Returns a monotonic MountToken.
   *
   * @param {Object} options
   * @param {string} options.id
   * @param {'page' | 'modal'} [options.layer]
   * @param {HTMLElement} options.element
   * @param {(ctx: StageContext) => StageController} options.factory
   * @param {Record<string, unknown>} [options.initialState]
   * @param {(event: { type: string, [key: string]: unknown }) => void} [options.onInteract]
   * @param {(overBudget: boolean) => void} [options.onBudgetChange]
   * @returns {number}
   */
  registerStage({
    id,
    layer = 'page',
    element,
    factory,
    initialState = {},
    onInteract,
    onBudgetChange,
  }) {
    const priority = resolveStagePriority(id);

    if (this.#stages.has(id)) {
      const existing = this.#stages.get(id);
      existing.controller?.dispose();
      this.#stages.delete(id);
    }

    const token = ++this.#tokenCounter;

    /** @type {StageContext} */
    const ctx = {
      qualityTier: this.#qualityTier,
      palette: PORTFOLIO_PALETTE,
      loadSharedTexture: (url) => this.loadSharedTexture(url),
      releaseSharedTexture: (url) => this.releaseSharedTexture(url),
      emitInteract: (event) => onInteract?.(event),
    };

    const controller = factory(ctx);
    if (initialState) {
      controller.syncState?.(initialState);
    }

    const scrollClipRoot = layer === 'modal' ? findScrollClipAncestor(element) : null;

    this.#stages.set(id, {
      id,
      token,
      layer,
      priority,
      element,
      scrollClipRoot,
      controller,
      onBudgetChange,
      pointer: {
        x: 0,
        y: 0,
        isHovered: false,
        isDragging: false,
        dragYaw: 0,
        dragPitch: 0,
        justClicked: false,
      },
      stateSnapshot: { ...initialState },
      lastAspect: 0,
      lastVpW: 0,
      lastVpH: 0,
      isOverBudget: false,
    });

    this.#updateHealthSnapshot();
    if (!this.#isLoopRunning && this.#status === 'ready' && this.#stages.size > 0) {
      this.#startLoop();
    }

    return token;
  }

  /**
   * Token-guarded stage unregistration.
   *
   * @param {string} id
   * @param {number} token
   */
  unregisterStage(id, token) {
    const reg = this.#stages.get(id);
    if (!reg || reg.token !== token) return;

    reg.controller?.dispose();
    this.#stages.delete(id);

    this.#updateHealthSnapshot();
    if (this.#stages.size === 0) {
      this.#stopLoop();
    }
  }

  /**
   * Updates state snapshot for a stage with shallow key diffing.
   *
   * @param {string} id
   * @param {number} token
   * @param {Record<string, unknown>} nextState
   */
  updateStageState(id, token, nextState) {
    const reg = this.#stages.get(id);
    if (!reg || reg.token !== token || !nextState) return;

    const prev = reg.stateSnapshot;
    let changed = false;
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(nextState);

    if (prevKeys.length !== nextKeys.length) {
      changed = true;
    } else {
      for (let i = 0; i < nextKeys.length; i++) {
        const k = nextKeys[i];
        if (prev[k] !== nextState[k]) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      reg.stateSnapshot = { ...nextState };
      reg.controller?.syncState?.(nextState);
    }
  }

  /**
   * Updates normalized pointer state for a stage.
   *
   * @param {string} id
   * @param {number} token
   * @param {Partial<NormalizedPointer>} nextPointer
   */
  updateStagePointer(id, token, nextPointer) {
    const reg = this.#stages.get(id);
    if (!reg || reg.token !== token || !nextPointer) return;

    if (typeof nextPointer.x === 'number') reg.pointer.x = nextPointer.x;
    if (typeof nextPointer.y === 'number') reg.pointer.y = nextPointer.y;
    if (typeof nextPointer.isHovered === 'boolean') reg.pointer.isHovered = nextPointer.isHovered;
    if (typeof nextPointer.isDragging === 'boolean') reg.pointer.isDragging = nextPointer.isDragging;
    if (typeof nextPointer.dragYaw === 'number') reg.pointer.dragYaw = nextPointer.dragYaw;
    if (typeof nextPointer.dragPitch === 'number') reg.pointer.dragPitch = nextPointer.dragPitch;
    if (nextPointer.justClicked) reg.pointer.justClicked = true;
  }

  /**
   * Loads or shares a cached THREE.Texture with reference counting.
   *
   * @param {string} url
   * @returns {Promise<THREE.Texture>}
   */
  loadSharedTexture(url) {
    const existing = this.#sharedTextures.get(url);
    if (existing) {
      existing.refs++;
      if (existing.texture) return Promise.resolve(existing.texture);
      return existing.promise || Promise.reject(new Error('Texture load failed'));
    }

    const loader = new THREE.TextureLoader();
    let resolvePromise;
    let rejectPromise;
    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const entry = { texture: null, refs: 1, promise };
    this.#sharedTextures.set(url, entry);

    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        entry.texture = tex;
        resolvePromise(tex);
      },
      undefined,
      (err) => {
        this.#sharedTextures.delete(url);
        rejectPromise(err);
      }
    );

    return promise;
  }

  /**
   * Releases a reference to a shared texture, disposing GPU memory when references reach 0.
   *
   * @param {string} url
   */
  releaseSharedTexture(url) {
    const entry = this.#sharedTextures.get(url);
    if (!entry) return;

    entry.refs--;
    if (entry.refs <= 0) {
      entry.texture?.dispose();
      this.#sharedTextures.delete(url);
    }
  }

  /**
   * Attaches an optional 1Hz telemetry listener.
   *
   * @param {((telemetry: { fps: number, frameMs: number, dpr: number, renderedCount: number, overBudgetCount: number }) => void) | null} listener
   */
  setTelemetryListener(listener) {
    this.#telemetryListener = listener;
  }

  /**
   * Returns current health snapshot.
   *
   * @returns {CanvasHealth}
   */
  getHealth() {
    return this.#health;
  }

  #startLoop() {
    if (this.#isLoopRunning) return;
    this.#isLoopRunning = true;
    this.#lastFrameTime = 0;
    this.#rafId = requestAnimationFrame(this.#renderLoop);
  }

  #stopLoop() {
    if (!this.#isLoopRunning) return;
    this.#isLoopRunning = false;
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #renderLoop = (timestamp) => {
    if (!this.#isLoopRunning) return;
    this.#renderFrame(timestamp);
    this.#rafId = requestAnimationFrame(this.#renderLoop);
  };

  /**
   * Main render pass: reads DOM rects synchronously before writing WebGL state.
   *
   * @param {number} timestamp
   */
  #renderFrame(timestamp) {
    if (
      this.#status !== 'ready' ||
      !this.#renderer ||
      this.#qualityTier === 'reduced' ||
      this.#qualityTier === 'fallback'
    ) {
      return;
    }

    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : timestamp;
    if (this.#startTime === 0) this.#startTime = now;

    const dt = this.#lastFrameTime > 0 ? Math.min(0.05, (now - this.#lastFrameTime) / 1000) : 0.016;
    const frameMs = this.#lastFrameTime > 0 ? now - this.#lastFrameTime : 16.6;
    this.#lastFrameTime = now;
    const elapsed = (now - this.#startTime) / 1000;

    if (this.#qualityTier === 'high') {
      this.#emaFrameMs =
        this.#emaFrameMs === 0 ? frameMs : this.#emaFrameMs * 0.95 + frameMs * 0.05;
      if (this.#emaFrameMs > 20 && this.#currentDpr > 1.0) {
        this.#currentDpr = Math.max(1.0, this.#currentDpr - 0.05);
        this.#renderer.setPixelRatio(this.#currentDpr);
      }
    }

    this.#framesCounted++;
    if (now - this.#telemetryTimer >= 1000) {
      if (this.#telemetryListener) {
        const fps = Math.round((this.#framesCounted * 1000) / (now - this.#telemetryTimer));
        this.#telemetryListener({
          fps,
          frameMs: Math.round(this.#emaFrameMs || frameMs),
          dpr: Number(this.#currentDpr.toFixed(2)),
          renderedCount: this.#lastRenderedCount,
          overBudgetCount: this.#lastOverBudgetCount,
        });
      }
      this.#framesCounted = 0;
      this.#telemetryTimer = now;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const entries = [];
    for (const reg of this.#stages.values()) {
      if (!reg.element.isConnected) continue;
      const stageRect = reg.element.getBoundingClientRect();
      const scrollClipRect =
        reg.scrollClipRoot && reg.scrollClipRoot.isConnected
          ? reg.scrollClipRoot.getBoundingClientRect()
          : null;
      const scissor = computeScissorViewport(stageRect, scrollClipRect, vw, vh);
      const scrollProgress = computeScrollProgress(stageRect, vh);

      entries.push({
        id: reg.id,
        layer: reg.layer,
        priority: reg.priority,
        visibleAreaPx: scissor.visibleAreaPx,
        scissor,
        scrollProgress,
        reg,
      });
    }

    const maxVisible = (STAGE_BUDGET[this.#qualityTier] || STAGE_BUDGET.high).maxVisibleStages;
    const budgetResult = selectBudgetedStages(entries, maxVisible);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const isOver = budgetResult.overBudgetIds.has(entry.id);
      if (entry.reg.isOverBudget !== isOver) {
        entry.reg.isOverBudget = isOver;
        entry.reg.onBudgetChange?.(isOver);
      }
    }

    this.#lastRenderedCount = budgetResult.renderedIds.size;
    this.#lastOverBudgetCount = budgetResult.overBudgetIds.size;
    this.#updateHealthSnapshot(budgetResult.overBudgetIds.size);

    if (budgetResult.renderedIds.size === 0) {
      if (this.#hasDrawnFrame) {
        this.#renderer.setScissorTest(false);
        this.#renderer.clear();
        this.#hasDrawnFrame = false;
      }
      return;
    }

    if (
      this.#lastCanvasW !== vw ||
      this.#lastCanvasH !== vh ||
      this.#lastAppliedDpr !== this.#currentDpr
    ) {
      this.#renderer.setPixelRatio(this.#currentDpr);
      this.#renderer.setSize(vw, vh, false);
      this.#lastCanvasW = vw;
      this.#lastCanvasH = vh;
      this.#lastAppliedDpr = this.#currentDpr;
    }

    this.#renderer.setScissorTest(false);
    this.#renderer.clear();
    this.#renderer.setScissorTest(true);
    this.#hasDrawnFrame = true;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!budgetResult.renderedIds.has(entry.id)) continue;

      const { scissor, scrollProgress, reg } = entry;

      if (reg.lastVpW !== scissor.vpW || reg.lastVpH !== scissor.vpH) {
        reg.lastVpW = scissor.vpW;
        reg.lastVpH = scissor.vpH;
        reg.lastAspect = scissor.vpW / scissor.vpH;
        if (reg.controller.camera && reg.controller.camera.isPerspectiveCamera) {
          reg.controller.camera.aspect = scissor.vpW / scissor.vpH;
          reg.controller.camera.updateProjectionMatrix();
        }
        reg.controller.resize?.(scissor.vpW, scissor.vpH);
      }

      if (reg.pointer.justClicked) {
        reg.controller.pick?.(reg.pointer.x, reg.pointer.y);
        reg.pointer.justClicked = false;
      }

      reg.controller.update?.(dt, elapsed, reg.pointer, scrollProgress);

      this.#renderer.setViewport(scissor.vpX, scissor.vpY, scissor.vpW, scissor.vpH);
      this.#renderer.setScissor(scissor.scX, scissor.scY, scissor.scW, scissor.scH);
      this.#renderer.clearDepth();
      this.#renderer.render(reg.controller.scene, reg.controller.camera);
    }
  }

  #updateHealthSnapshot(overBudgetStages = 0) {
    let hasActiveModalStage = false;
    for (const reg of this.#stages.values()) {
      if (reg.layer === 'modal') {
        hasActiveModalStage = true;
        break;
      }
    }

    const nextHealth = {
      status: this.#status,
      qualityTier: this.#qualityTier,
      activeStageCount: this.#stages.size,
      hasActiveModalStage,
      overBudgetStages,
    };

    const prev = this.#health;
    if (
      prev.status !== nextHealth.status ||
      prev.qualityTier !== nextHealth.qualityTier ||
      prev.activeStageCount !== nextHealth.activeStageCount ||
      prev.hasActiveModalStage !== nextHealth.hasActiveModalStage ||
      prev.overBudgetStages !== nextHealth.overBudgetStages
    ) {
      this.#health = nextHealth;
      this.#onHealthChange?.(this.#health);
    }
  }

  #handleVisibilityChange = () => {
    if (document.hidden) {
      this.#stopLoop();
    } else if (this.#stages.size > 0 && this.#status === 'ready') {
      this.#startLoop();
    }
  };

  #handleResize = () => {
    if (!this.#renderer || this.#status !== 'ready') return;
    const maxDpr = (STAGE_BUDGET[this.#qualityTier] || STAGE_BUDGET.high).maxDpr;
    const deviceDpr = window.devicePixelRatio || 1;
    this.#baseDpr = Math.min(deviceDpr, maxDpr);
    this.#currentDpr = this.#baseDpr;
    this.#renderer.setPixelRatio(this.#currentDpr);
  };

  #handleContextLost = (event) => {
    event.preventDefault();
    this.#status = 'context-lost';
    this.#updateHealthSnapshot();
  };

  #handleContextRestored = () => {
    this.#lastCanvasW = 0;
    this.#lastCanvasH = 0;
    this.#lastAppliedDpr = 0;
    this.#status = 'ready';
    this.#updateHealthSnapshot();
  };

  /**
   * Disposes the WebGL context, all registered stages, textures, and DOM listeners.
   */
  dispose() {
    this.#stopLoop();

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.#handleResize);
    }
    if (this.#canvas) {
      this.#canvas.removeEventListener('webglcontextlost', this.#handleContextLost);
      this.#canvas.removeEventListener('webglcontextrestored', this.#handleContextRestored);
    }

    for (const reg of this.#stages.values()) {
      reg.controller?.dispose();
    }
    this.#stages.clear();

    for (const entry of this.#sharedTextures.values()) {
      entry.texture?.dispose();
    }
    this.#sharedTextures.clear();

    if (this.#renderer) {
      this.#renderer.dispose();
      this.#renderer = null;
    }

    this.#status = 'fallback';
    this.#updateHealthSnapshot();
  }
}
