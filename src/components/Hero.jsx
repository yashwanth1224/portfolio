import React from 'react';
import { ArrowDown, FileDown, Github, Linkedin, Mail, MapPin, Sparkles, Terminal } from 'lucide-react';
import Workspace3D from './Workspace3D';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function Hero() {
  const handleMeetAvatar = () => {
    sound.playClick();
    const sceneEl = document.getElementById('workspace-3d-scene');
    if (sceneEl) {
      sceneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.dispatchEvent(new CustomEvent('trigger-avatar-speech'));
  };

  const handleResumeDownload = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#0B1B2B', '#38BDF8', '#0284C7', '#2563EB', '#FFFFFF', '#E8ECF2']
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <section className="relative min-h-screen bg-navy text-cream overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24 flex items-center border-b border-navy-light/40">
      {/* Decorative background grid and lighting in Electric Cyan and Cobalt Blue */}
      <div className="absolute inset-0 noise-overlay opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Text & Information (Resume Header Executive Theme) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            
            {/* Tag: // FRONTEND DEVELOPER */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-dark/70 backdrop-blur-md border border-accent/25 text-cream/90 font-mono text-xs sm:text-sm tracking-wider uppercase mb-6 w-fit shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              <span>// FRONTEND DEVELOPER</span>
            </div>

            {/* Large Serif Name */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05] mb-5 drop-shadow-sm">
              Yashwanth
              <span className="text-accent/90 font-light ml-2 sm:ml-3">S</span>
            </h1>

            {/* Italic Headline */}
            <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-slateBanner-light font-normal leading-relaxed max-w-xl mb-8">
              "Crafting pixel-perfect interfaces and the modern experiences that power them."
            </p>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-10">
              {/* Badge 1: Bengaluru */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-light/60 backdrop-blur-sm border border-white/10 text-xs font-mono font-medium text-cream tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>BENGALURU, INDIA</span>
              </div>

              {/* Badge 2: Available for work */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 backdrop-blur-sm border border-emerald-500/30 text-xs font-mono font-medium text-emerald-300 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AVAILABLE FOR WORK</span>
              </div>

              {/* Badge 3: React & JavaScript */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-light/60 backdrop-blur-sm border border-white/10 text-xs font-mono font-medium text-cream tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>REACT & JAVASCRIPT</span>
              </div>
            </div>

            {/* Action Buttons & Socials */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Primary Avatar Action */}
              <button
                type="button"
                onClick={handleMeetAvatar}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition-all duration-300 shadow-xl shadow-sky-500/25 hover:-translate-y-0.5 border border-white/20 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Meet My 3D Avatar 🎙️</span>
              </button>

              {/* Work Navigation */}
              <a
                href="#projects"
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-navy-dark text-cream hover:bg-black hover:text-white transition-all duration-300 shadow-xl shadow-black/25 hover:-translate-y-0.5 border border-white/10"
              >
                <span>Explore My Work</span>
                <ArrowDown className="w-4 h-4 text-accent animate-bounce" />
              </a>

              {/* Crisp White Resume Download Button with Sky Border */}
              <a
                href="./Yashwanth_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Yashwanth_Resume.pdf"
                onClick={handleResumeDownload}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-white text-navy hover:bg-slate-100 transition-all duration-300 shadow-lg shadow-sky-950/20 border border-sky-400/40 hover:-translate-y-0.5"
              >
                <FileDown className="w-4 h-4 text-accent-royal" />
                <span>Download Resume</span>
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-2 ml-1 sm:ml-2">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playPop()}
                  className="p-3 rounded-xl bg-navy-light/60 hover:bg-navy-light text-cream hover:text-white transition-all border border-white/10"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playPop()}
                  className="p-3 rounded-xl bg-navy-light/60 hover:bg-navy-light text-cream hover:text-white transition-all border border-white/10"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${personalInfo.email}`}
                  onMouseEnter={() => sound.playPop()}
                  className="p-3 rounded-xl bg-navy-light/60 hover:bg-navy-light text-cream hover:text-white transition-all border border-white/10"
                  aria-label="Send Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Canvas Scene */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full rounded-3xl bg-navy-dark/40 backdrop-blur-sm border border-white/15 p-2 sm:p-4 shadow-2xl">
              <Workspace3D />
              
              {/* Bottom tag inside 3D canvas box */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs font-mono text-cream/70 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  3D Developer Avatar & Workspace
                </span>
                <span className="text-accent/90">Interactive 3D • Voice Enabled</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle bottom curve separator to transition into cream/slate section */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
}
