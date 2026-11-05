import React from 'react';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certificates from './components/Certificates';
import Contact from './components/Contact';

export default function App() {
  return (
    <div className="relative min-h-screen bg-obsidian text-cream font-sans selection:bg-accent selection:text-navy-deep">
      {/* Magnetic Custom Cursor */}
      <CustomCursor />

      {/* Persistent Glassmorphic Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        {/* Frame 1-8: Deep Midnight Navy Hero with 3D Workspace */}
        <Hero />

        {/* Frame 11-13: Soft Slate White About with Framed Polaroid */}
        <About />

        {/* Frame 14-15: Career Experience Timeline */}
        <Experience />

        {/* Frame 16: Obsidian Projects with Mirrored Reflection & Live Demos */}
        <Projects />

        {/* Technical Repertoire & Skills Matrix */}
        <Skills />

        {/* National Sports & Professional Honors */}
        <Certificates />

        {/* Interactive Dispatch & Contact CTA */}
        <Contact />
      </main>
    </div>
  );
}
