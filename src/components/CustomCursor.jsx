import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"], .interactive-element');
      setIsPointer(!!isInteractive);
    };

    const handleMouseDown = () => setIsHovered(true);
    const handleMouseUp = () => setIsHovered(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Smooth lag for the outer circle
  useEffect(() => {
    let animId;
    const animate = () => {
      setTrailingPos(prev => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Inner pinpoint dot */}
      <div
        className={`fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovered ? 'scale-150' : 'scale-100'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      />
      {/* Outer magnetic trailing ring */}
      <div
        className={`fixed top-0 left-0 rounded-full border border-accent/60 transition-all duration-200 ease-out -translate-x-1/2 -translate-y-1/2 backdrop-blur-[0.5px] ${
          isPointer
            ? 'w-12 h-12 bg-accent/15 border-accent scale-110'
            : isHovered
            ? 'w-10 h-10 bg-accent/25 border-accent scale-95'
            : 'w-7 h-7 bg-transparent border-accent/40'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) translate(-50%, -50%)`,
        }}
      />
    </div>
  );
}
