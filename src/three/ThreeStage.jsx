import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useScissorEngine } from './ThreeCanvasProvider.jsx';

/**
 * @typedef {'none' | 'parallax' | 'orbit-x' | 'orbit-xy' | 'pick'} InteractionMode
 *
 * @typedef {Object} ThreeStageProps
 * @property {string} stageId
 * @property {'page' | 'modal'} [layer]
 * @property {(ctx: import('./ScissorEngine.js').StageContext) => import('./ScissorEngine.js').StageController} factory
 * @property {Record<string, unknown>} [state]
 * @property {InteractionMode} [interactive]
 * @property {(event: { type: string, [key: string]: unknown }) => void} [onInteract]
 * @property {React.ReactNode} [fallback]
 * @property {string} [className]
 * @property {React.ReactNode} [children]
 */

/**
 * Declarative DOM anchor syncing a section container to the solitary ScissorEngine WebGL renderer.
 *
 * @param {ThreeStageProps} props
 */
export default function ThreeStage({
  stageId,
  layer = 'page',
  factory,
  state,
  interactive = 'parallax',
  onInteract,
  fallback = null,
  className = '',
  children = null,
}) {
  const containerRef = useRef(null);
  const tokenRef = useRef(null);
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;
  const [isOverBudget, setIsOverBudget] = useState(false);

  const { engine, health } = useScissorEngine();

  const pointerRef = useRef({
    x: 0,
    y: 0,
    isHovered: false,
    isDragging: false,
    dragYaw: 0,
    dragPitch: 0,
    justClicked: false,
  });

  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    active: false,
  });

  useEffect(() => {
    if (!engine || !containerRef.current) return;

    const token = engine.registerStage({
      id: stageId,
      layer,
      element: containerRef.current,
      factory,
      initialState: state,
      onInteract: (event) => onInteractRef.current?.(event),
      onBudgetChange: (over) => {
        setIsOverBudget(over);
      },
    });

    tokenRef.current = token;

    return () => {
      engine.unregisterStage(stageId, token);
      tokenRef.current = null;
    };
  }, [engine, stageId, layer, factory]);

  useEffect(() => {
    if (engine && tokenRef.current !== null && state) {
      engine.updateStageState(stageId, tokenRef.current, state);
    }
  }, [engine, stageId, state]);

  const pointerHandlers = useMemo(() => {
    if (interactive === 'none') return {};

    const handlePointerDown = (e) => {
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        active: true,
      };
      pointerRef.current.isDragging = true;
    };

    const handlePointerMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      const normY = Math.max(-1, Math.min(1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)));

      pointerRef.current.x = normX;
      pointerRef.current.y = normY;
      pointerRef.current.isHovered = true;

      if (dragStartRef.current.active) {
        const deltaX = e.clientX - dragStartRef.current.lastX;
        const deltaY = e.clientY - dragStartRef.current.lastY;
        dragStartRef.current.lastX = e.clientX;
        dragStartRef.current.lastY = e.clientY;

        if (interactive === 'orbit-x' || interactive === 'orbit-xy') {
          pointerRef.current.dragYaw += deltaX * 0.01;
        }
        if (interactive === 'orbit-xy') {
          pointerRef.current.dragPitch = Math.max(
            -Math.PI / 3,
            Math.min(Math.PI / 3, pointerRef.current.dragPitch + deltaY * 0.01)
          );
        }
      }

      if (engine && tokenRef.current !== null) {
        engine.updateStagePointer(stageId, tokenRef.current, pointerRef.current);
      }
    };

    const handlePointerUp = (e) => {
      if (dragStartRef.current.active) {
        const totalDist = Math.hypot(
          e.clientX - dragStartRef.current.startX,
          e.clientY - dragStartRef.current.startY
        );
        if (totalDist < 6) {
          pointerRef.current.justClicked = true;
        }
        dragStartRef.current.active = false;
      }
      pointerRef.current.isDragging = false;

      if (engine && tokenRef.current !== null) {
        engine.updateStagePointer(stageId, tokenRef.current, pointerRef.current);
      }
      pointerRef.current.justClicked = false;
    };

    const handlePointerEnter = () => {
      pointerRef.current.isHovered = true;
      if (engine && tokenRef.current !== null) {
        engine.updateStagePointer(stageId, tokenRef.current, pointerRef.current);
      }
    };

    const handlePointerLeave = () => {
      pointerRef.current.isHovered = false;
      pointerRef.current.isDragging = false;
      dragStartRef.current.active = false;
      if (interactive === 'parallax') {
        pointerRef.current.x = 0;
        pointerRef.current.y = 0;
      }
      if (engine && tokenRef.current !== null) {
        engine.updateStagePointer(stageId, tokenRef.current, pointerRef.current);
      }
    };

    return {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerLeave,
    };
  }, [interactive, engine, stageId]);

  const shouldShowFallback =
    health.status === 'fallback' ||
    health.qualityTier === 'reduced' ||
    isOverBudget;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ touchAction: 'pan-y' }}
      {...pointerHandlers}
    >
      {shouldShowFallback && fallback ? fallback : null}
      {children}
    </div>
  );
}
