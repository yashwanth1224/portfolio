import React, { useState } from 'react';
import { ArrowDown, Code2, GraduationCap, MapPin, Sparkles, Terminal, X, Play, Volume2 } from 'lucide-react';
import Workspace3D from './Workspace3D';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';

export default function Hero() {
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleMeetAvatar = () => {
    sound.playClick();
    setShowAvatarModal(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-avatar-speech'));
    }, 400);
  };

  const handleCloseModal = () => {
    sound.playPop();
    setShowAvatarModal(false);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1A1A1A] text-white pt-24 pb-16 lg:py-0"
    >
      {/* Cinematic Full-Bleed Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-25 filter grayscale contrast-125 scale-105"
          poster="./avatar-3d.jpg"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-42861-large.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.coverr.co/videos/coverr-digital-world-networking-2882/1080p.mp4"
            type="video/mp4"
          />
        </video>

        {/* Cinematic Multi-stop Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/85 via-[#1A1A1A]/70 to-[#1A1A1A]" />
        
        {/* Subtle Burnt Orange Radial Ambient Lighting */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-[#D95D39]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#D95D39]/10 rounded-full blur-[140px]" />

        {/* Film grain / subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center flex flex-col items-center">
        
        {/* Terminal Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 font-mono text-xs sm:text-sm tracking-wider uppercase mb-8 shadow-sm backdrop-blur-md">
          <Terminal className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>// FRONTEND DEVELOPER & SOFTWARE ENGINEER</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white leading-[1.02] mb-6 drop-shadow-md">
          Yashwanth
          <span className="text-[#D95D39] ml-2 sm:ml-4 font-light">S</span>
        </h1>

        {/* Tagline */}
        <p className="font-sans text-xl sm:text-2xl md:text-3xl text-white/90 font-light max-w-2xl leading-relaxed mb-10">
          "Building fast, accessible web applications."
        </p>

        {/* Stats Row */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12">
          {/* Stat 1: Location */}
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-[#D95D39] shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">Location</div>
              <div className="text-sm font-semibold text-white">Bengaluru, India</div>
            </div>
          </div>

          {/* Stat 2: Focus */}
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <Code2 className="w-4 h-4 text-[#D95D39] shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">Focus</div>
              <div className="text-sm font-semibold text-white">Frontend Development</div>
            </div>
          </div>

          {/* Stat 3: Background */}
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-[#D95D39] shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">Background</div>
              <div className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-none">
                B.E. Mechanical → Tech
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {/* 3D Avatar Trigger Button */}
          <button
            type="button"
            onClick={handleMeetAvatar}
            onMouseEnter={() => sound.playPop()}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base bg-[#D95D39] hover:bg-[#C04D2B] text-white transition-all duration-300 shadow-xl shadow-[#D95D39]/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-orange-200" />
            <span>Meet 3D Avatar 🎙️</span>
          </button>

          {/* Explore Projects Button */}
          <a
            href="#projects"
            onMouseEnter={() => sound.playPop()}
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-medium text-sm sm:text-base bg-white/5 hover:bg-white/10 text-white transition-all duration-300 border border-white/15 hover:border-white/30 backdrop-blur-sm hover:-translate-y-0.5"
          >
            <span>Explore Projects</span>
          </a>

          {/* About Me Anchor */}
          <a
            href="#about"
            onMouseEnter={() => sound.playPop()}
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-sans text-sm text-white/70 hover:text-white transition-colors"
          >
            <span>About Yashwanth</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#D95D39]" />
          </a>
        </div>

      </div>

      {/* Subtle Scroll Down Prompt at Bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-4 h-4 animate-bounce text-[#D95D39]" />
      </div>

      {/* Modal / Drawer for Interactive 3D Avatar Workspace */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] bg-[#1A1A1A] rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1A1A1A]/95">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#D95D39] animate-pulse" />
                <h3 className="font-heading font-bold text-white text-base sm:text-lg">
                  Yashwanth S — Interactive 3D Avatar Workspace
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Close 3D Workspace"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 3D Workspace Canvas */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
              <Workspace3D />
            </div>

            {/* Modal Footer Note */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#141414] text-xs font-mono text-white/60 flex items-center justify-between">
              <span>Interactive Three.js WebGL & Speech Synthesizer</span>
              <span className="text-[#D95D39] font-medium">Click avatar or audio buttons to interact</span>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
