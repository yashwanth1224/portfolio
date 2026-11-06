import React, { useEffect, useRef, useState } from 'react';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certificates from './components/Certificates';
import Contact from './components/Contact';
import { sound } from './utils/audio';

function FadeInSection({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '-60px' }
    );

    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  // Global tactile acoustic feedback on touch / click
  useEffect(() => {
    const handlePointerDown = (e) => {
      sound.playTouchClick(e.target);
    };

    window.addEventListener('pointerdown', handlePointerDown, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#1A1A1A] text-[#F5F2EB] font-sans selection:bg-[#D95D39] selection:text-white">
      {/* Magnetic Custom Cursor */}
      <CustomCursor />

      {/* Dynamic Color-Shifting Sticky Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        {/* Full-Bleed 100vh Cinematic Video Hero */}
        <Hero />

        {/* Cream Section: Photo/Avatar Card + Engineering Bio */}
        <FadeInSection>
          <About />
        </FadeInSection>

        {/* Sand Section: Reverse-Chronological Experience Timeline */}
        <FadeInSection>
          <Experience />
        </FadeInSection>

        {/* Dark Charcoal Section: Card Grid with Abstract Graphics & Burnt Orange Borders */}
        <FadeInSection>
          <Projects />
        </FadeInSection>

        {/* Technical Repertoire Skills Matrix */}
        <FadeInSection>
          <Skills />
        </FadeInSection>

        {/* Honors & Credentials */}
        <FadeInSection>
          <Certificates />
        </FadeInSection>

        {/* Dark Charcoal Section: Interactive Dispatch & Contact CTA */}
        <FadeInSection>
          <Contact />
        </FadeInSection>
      </main>
    </div>
  );
}
