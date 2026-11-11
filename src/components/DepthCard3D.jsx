import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/audio.js';

/**
 * @typedef {Object} DepthCard3DProps
 * @property {React.ReactNode} children
 * @property {number} [intensity] Max degrees of 3D tilt.
 * @property {string} [glareColor] Hex or CSS color for the specular radial glare.
 * @property {boolean} [active] Whether the card is selected/active.
 * @property {boolean} [hoverSound] Play subtle tactile sound on hover.
 * @property {string} [className]
 * @property {(nx: number, ny: number) => void} [onPointerTilt]
 */

/**
 * GPU-composited CSS perspective 3D card tilt with specular glare overlay.
 * Drives tilt and glare directly via CSS custom properties to avoid pointermove React re-renders.
 * Automatically disables under (pointer: coarse) or prefers-reduced-motion: reduce.
 *
 * @param {DepthCard3DProps} props
 */
export default function DepthCard3D({
  children,
  intensity = 8,
  glareColor = '#D95D39',
  active = false,
  hoverSound = true,
  className = '',
  onPointerTilt,
  ...rest
}) {
  const cardRef = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const hasHoveredRef = useRef(false);

  const resetTiltVars = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-rx', '0deg');
    el.style.setProperty('--tilt-ry', '0deg');
    el.style.setProperty('--glare-x', '50%');
    el.style.setProperty('--glare-y', '50%');
    el.style.setProperty('--glare-opacity', '0');
    el.style.setProperty('--tilt-duration', '0.4s');
    el.style.willChange = 'auto';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDisabled = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setDisabled(coarse || reduced);
    };

    checkDisabled();

    const mCoarse = window.matchMedia('(pointer: coarse)');
    const mReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    mCoarse.addEventListener('change', checkDisabled);
    mReduced.addEventListener('change', checkDisabled);

    return () => {
      mCoarse.removeEventListener('change', checkDisabled);
      mReduced.removeEventListener('change', checkDisabled);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      hasHoveredRef.current = false;
      resetTiltVars();
    }
  }, [disabled, resetTiltVars]);

  const handlePointerEnter = () => {
    if (disabled) return;
    if (hoverSound && !hasHoveredRef.current) {
      sound.playPop();
    }
    hasHoveredRef.current = true;
  };

  const handlePointerMove = (e) => {
    const el = cardRef.current;
    if (disabled || !el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));

    const rotX = -ny * intensity;
    const rotY = nx * intensity;
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;

    el.style.setProperty('--tilt-rx', `${rotX.toFixed(2)}deg`);
    el.style.setProperty('--tilt-ry', `${rotY.toFixed(2)}deg`);
    el.style.setProperty('--glare-x', `${glareX.toFixed(2)}%`);
    el.style.setProperty('--glare-y', `${glareY.toFixed(2)}%`);
    el.style.setProperty('--glare-opacity', '0.25');
    el.style.setProperty('--tilt-duration', '0.08s');
    el.style.willChange = 'transform';

    onPointerTilt?.(nx, -ny);
  };

  const handlePointerLeave = () => {
    hasHoveredRef.current = false;
    resetTiltVars();
    onPointerTilt?.(0, 0);
  };

  const transformStyle = disabled
    ? undefined
    : {
        transform:
          'perspective(900px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg)) translateZ(0)',
        transformStyle: 'preserve-3d',
        transition: 'transform var(--tilt-duration, 0.4s) ease-out',
      };

  const resolvedGlare =
    glareColor.startsWith('#') && glareColor.length === 7
      ? `${glareColor}44`
      : glareColor;

  return (
    <div
      ref={cardRef}
      style={transformStyle}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative ${active ? 'ring-1 ring-[#D95D39]/50 shadow-lg shadow-[#D95D39]/10' : ''} ${className}`}
      {...rest}
    >
      {children}
      {!disabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            opacity: 'var(--glare-opacity, 0)',
            background: `radial-gradient(circle 350px at var(--glare-x, 50%) var(--glare-y, 50%), ${resolvedGlare}, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
