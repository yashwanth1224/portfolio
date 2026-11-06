import React from 'react';
import {
  ArrowDown,
  Download,
  Volume2,
  Terminal,
  ExternalLink
} from 'lucide-react';
import Workspace3D from './Workspace3D';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';

export default function Hero() {
  const handlePlayVoiceIntro = () => {
    sound.playClick();
    window.dispatchEvent(new CustomEvent('trigger-avatar-speech'));
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#542416] via-[#3a180e] to-[#200d07] text-white pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 select-none"
    >
      {/* Warm Ambient Terracotta Glows & Atmospheric Lighting */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[650px] h-[650px] bg-[#D95D39]/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D95D39]/18 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[140px]" />

        {/* Subtle architectural dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]" />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Split Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =================================================== */}
          {/* LEFT COLUMN: Identity, Bio, Chips & CTA Buttons     */}
          {/* =================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
            
            {/* 1. Terminal Role Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/95 font-mono text-xs sm:text-sm tracking-wider uppercase backdrop-blur-md shadow-sm w-fit">
              <Terminal className="w-3.5 h-3.5 text-[#D95D39]" />
              <span>// SOFTWARE DEVELOPER</span>
            </div>

            {/* 2. Large High-Impact Heading */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] drop-shadow-md">
              <span>Yashwanth </span>
              <span className="text-[#D95D39] font-light">S</span>
            </h1>

            {/* 3. Subtitle with Burnt Orange Accent */}
            <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold text-white/90 leading-snug">
              Building high-performance frontends and the{' '}
              <span className="text-[#D95D39] underline decoration-[#D95D39]/50 underline-offset-4">
                services that power them.
              </span>
            </p>

            {/* 4. Resume Bio Narrative */}
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
              Software developer with formal Java Full Stack training and mechanical engineering foundation. Specializing in React.js, JavaScript, and scalable web architectures — delivered live commercial platforms like{' '}
              <strong className="text-white font-semibold">Zisti</strong> and{' '}
              <strong className="text-white font-semibold">Astrovedic Jyotishya Kendra</strong>.
            </p>

            {/* 5. Status Chips Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white/90 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>BENGALURU, INDIA</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 backdrop-blur-md font-semibold">
                <span>AVAILABLE FOR HIRE</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white/85 backdrop-blur-md">
                <span>REACT & JAVA FULL-STACK</span>
              </div>

              <a
                href={personalInfo.resumePath || "./Yashwanth_Resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D95D39]/20 hover:bg-[#D95D39]/35 border border-[#D95D39]/40 text-[#ffb099] hover:text-white backdrop-blur-md transition-all font-semibold"
              >
                <span>RESUME</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* 6. Primary Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Listen to Yashwanth button */}
              <button
                type="button"
                onClick={handlePlayVoiceIntro}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-gradient-to-r from-[#D95D39] to-orange-600 hover:from-orange-500 hover:to-[#D95D39] text-white shadow-xl shadow-[#D95D39]/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-orange-100 animate-pulse" />
                <span>🔊 Listen to Yashwanth</span>
              </button>

              {/* Download Resume */}
              <a
                href={personalInfo.resumePath || "./Yashwanth_Resume.pdf"}
                download="Yashwanth_S_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/15 hover:border-white/30 backdrop-blur-sm hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 text-[#D95D39]" />
                <span>Download Resume</span>
              </a>

              {/* Explore Work */}
              <a
                href="#projects"
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-white/5 hover:bg-white/15 text-white/90 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/25 backdrop-blur-sm"
              >
                <span>Explore Work</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#D95D39]" />
              </a>
            </div>

            {/* Micro Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10">
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-white font-heading font-bold text-sm">2 Live</div>
                <div className="text-[10px] font-mono text-white/60 uppercase">Platforms</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-white font-heading font-bold text-sm">8+ Works</div>
                <div className="text-[10px] font-mono text-white/60 uppercase">React & Full Stack</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-white font-heading font-bold text-sm">400+ Hrs</div>
                <div className="text-[10px] font-mono text-white/60 uppercase">Java Training</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-white font-heading font-bold text-sm">National</div>
                <div className="text-[10px] font-mono text-white/60 uppercase">Athlete Grit</div>
              </div>
            </div>

          </div>

          {/* =================================================== */}
          {/* RIGHT COLUMN: Frameless 3D Avatar Centerpiece       */}
          {/* =================================================== */}
          <div className="lg:col-span-6 relative w-full h-[520px] sm:h-[580px] lg:h-[640px] flex items-center justify-center">
            {/* Ambient amber backdrop halo */}
            <div className="absolute w-[80%] h-[80%] bg-[#D95D39]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Seamless 3D Avatar Workspace */}
            <div className="relative w-full h-full">
              <Workspace3D />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
