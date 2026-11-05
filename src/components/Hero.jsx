import React from 'react';
import { ArrowDown, FileDown, Github, Linkedin, Mail, MapPin, Sparkles, Terminal } from 'lucide-react';
import Workspace3D from './Workspace3D';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function Hero() {
  const handleResumeDownload = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#AF4426', '#FF5A36', '#F7F5F0', '#FFFFFF', '#0B0C0E']
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <section className="relative min-h-screen bg-terracotta text-cream overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24 flex items-center">
      {/* Decorative background grid and lighting */}
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-coral/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-terracotta-dark/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Text & Information (Frames 1-8 Replica) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            
            {/* Tag: // FRONTEND DEVELOPER */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-cream/90 font-mono text-xs sm:text-sm tracking-wider uppercase mb-6 w-fit shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-coral" />
              <span>// FRONTEND DEVELOPER</span>
            </div>

            {/* Large Serif Name */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05] mb-5 drop-shadow-sm">
              Yashwanth
              <span className="text-cream/90 font-light ml-2 sm:ml-3">S</span>
            </h1>

            {/* Italic Headline */}
            <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-cream/95 font-normal leading-relaxed max-w-xl mb-8">
              "Crafting pixel-perfect interfaces and the modern experiences that power them."
            </p>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-10">
              {/* Badge 1: Bengaluru */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-xs font-mono font-medium text-cream tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-coral" />
                <span>BENGALURU, INDIA</span>
              </div>

              {/* Badge 2: Available for work */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 backdrop-blur-sm border border-emerald-500/30 text-xs font-mono font-medium text-emerald-300 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AVAILABLE FOR WORK</span>
              </div>

              {/* Badge 3: React & JavaScript */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-xs font-mono font-medium text-cream tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>REACT & JAVASCRIPT</span>
              </div>
            </div>

            {/* Action Buttons & Socials */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-obsidian text-cream hover:bg-black hover:text-white transition-all duration-300 shadow-xl shadow-black/25 hover:-translate-y-0.5 border border-white/10"
              >
                <span>Explore My Work</span>
                <ArrowDown className="w-4 h-4 text-coral animate-bounce" />
              </a>

              <a
                href="./Yashwanth_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Yashwanth_Resume.pdf"
                onClick={handleResumeDownload}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-cream/15 hover:bg-cream/25 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:-translate-y-0.5"
              >
                <FileDown className="w-4 h-4 text-coral" />
                <span>Download Resume</span>
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-2 ml-1 sm:ml-2">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playPop()}
                  className="p-3 rounded-xl bg-black/20 hover:bg-black/40 text-cream hover:text-white transition-all border border-white/10"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playPop()}
                  className="p-3 rounded-xl bg-black/20 hover:bg-black/40 text-cream hover:text-white transition-all border border-white/10"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${personalInfo.email}`}
                  onMouseEnter={() => sound.playPop()}
                  className="p-3 rounded-xl bg-black/20 hover:bg-black/40 text-cream hover:text-white transition-all border border-white/10"
                  aria-label="Send Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Canvas Scene */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full rounded-3xl bg-black/15 backdrop-blur-sm border border-white/15 p-2 sm:p-4 shadow-2xl">
              <Workspace3D />
              
              {/* Bottom tag inside 3D canvas box */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs font-mono text-cream/70 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Three.js Standing Workspace
                </span>
                <span>Drag to Rotate 360°</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle bottom curve separator to transition into cream section */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
}
