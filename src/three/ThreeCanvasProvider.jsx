import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { ScissorEngine, probeQualityTier } from './ScissorEngine.js';

/**
 * @typedef {import('./ScissorEngine.js').CanvasHealth} CanvasHealth
 */

const ThreeContext = createContext(null);

/**
 * Canvas host managing the solitary WebGL renderer canvas and providing capability state.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ThreeCanvasProvider({ children }) {
  const canvasRef = useRef(null);
  const [engineInstance, setEngineInstance] = useState(null);

  const initialTier = useMemo(() => probeQualityTier(), []);
  const [health, setHealth] = useState(() => ({
    status: initialTier === 'fallback' ? 'fallback' : 'initializing',
    qualityTier: initialTier,
    activeStageCount: 0,
    hasActiveModalStage: false,
    overBudgetStages: 0,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new ScissorEngine(canvas, (nextHealth) => {
      setHealth(nextHealth);
    });

    setEngineInstance(engine);
    setHealth(engine.getHealth());

    return () => {
      engine.dispose();
      setEngineInstance(null);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      engine: engineInstance,
      health,
    }),
    [engineInstance, health]
  );

  const zClass = health.hasActiveModalStage ? 'z-[55]' : 'z-[15]';

  return (
    <ThreeContext.Provider value={contextValue}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`fixed inset-0 w-full h-full pointer-events-none ${zClass}`}
      />
      {children}
    </ThreeContext.Provider>
  );
}

/**
 * Hook exposing current WebGL engine health and device quality tier.
 *
 * @returns {CanvasHealth}
 */
export function useThreeCapability() {
  const context = useContext(ThreeContext);
  if (!context) {
    return {
      status: 'fallback',
      qualityTier: 'fallback',
      hasActiveModalStage: false,
      activeStageCount: 0,
      overBudgetStages: 0,
    };
  }
  return context.health;
}

/**
 * Internal hook providing engine instance and health.
 *
 * @returns {{ engine: ScissorEngine | null, health: CanvasHealth }}
 */
export function useScissorEngine() {
  const context = useContext(ThreeContext);
  if (!context) {
    return {
      engine: null,
      health: {
        status: 'fallback',
        qualityTier: 'fallback',
        hasActiveModalStage: false,
        activeStageCount: 0,
        overBudgetStages: 0,
      },
    };
  }
  return context;
}
