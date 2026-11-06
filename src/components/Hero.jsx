import React, { useState } from 'react';
import {
  ArrowDown,
  Download,
  Play,
  Sparkles,
  Terminal,
  Volume2
} from 'lucide-react';
import Workspace3D from './Workspace3D';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';

export default function Hero() {
  const [stageMode, setStageMode] = useState('3d'); // '3d' | 'video'

  const handlePlayVoiceIntro = () => {
    sound.playClick();
    if (stageMode !== '3d') {
      setStageMode('3d');
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-avatar-speech'));
    }, 150);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between items-center overflow-hidden bg-[#1A1A1A] text-white pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8 select-none"
    >
      {/* Cinematic Full-Bleed Video & Atmospheric Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15 filter grayscale contrast-125 scale-105"
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/92 via-[#1A1A1A]/75 to-[#1A1A1A]" />
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#D95D39]/12 rounded-full blur-[180px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[160px]" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      {/* ======================================================== */}
      {/* 1. Top Bar: Terminal Tag, Yashwanth S, and Bengaluru Tag */}
      {/* ======================================================== */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10 mb-4 sm:mb-6">
        {/* Tag 1: Terminal Role Identifier */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 font-mono text-xs sm:text-sm tracking-wider uppercase backdrop-blur-md shadow-sm">
          <Terminal className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>// FRONTEND DEVELOPER & SOFTWARE ENGINEER</span>
        </div>

        {/* Center: Hero Identity */}
        <div className="text-center">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2 drop-shadow-md">
            <span>Yashwanth</span>
            <span className="text-[#D95D39] font-light">S</span>
          </h1>
        </div>

        {/* Tag 2: Location Dot */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#38bdf8]">●</span>
          <span>BENGALURU, INDIA</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Center: High-Impact 3D Avatar Center Stage             */}
      {/* ======================================================== */}
      <div className="w-full max-w-5xl relative z-10 group">
        {/* Ambient Burnt Orange & Cobalt Glow Backdrop */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D95D39]/25 via-sky-500/15 to-[#D95D39]/25 rounded-[32px] blur-2xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        {/* Glassmorphic Stage Card */}
        <div className="relative w-full rounded-3xl bg-[#141414]/92 backdrop-blur-2xl border border-white/15 p-3 sm:p-4 md:p-5 shadow-2xl shadow-black/80 flex flex-col group-hover:border-[#D95D39]/40 transition-all duration-300">
          
          {/* Stage Top Bar: Dual Mode Switcher & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-white/10 px-1 sm:px-2">
            {/* Live Dual-Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setStageMode('3d');
                }}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  stageMode === '3d'
                    ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/40'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Interactive Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setStageMode('video');
                }}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  stageMode === 'video'
                    ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/40'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Intro Video</span>
              </button>
            </div>

            {/* Stage Status Indicator */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 font-medium">
                {stageMode === '3d' ? 'Three.js 60FPS WebGL • Speech Sync' : 'Official MP4 Introduction Reel'}
              </span>
            </div>
          </div>

          {/* Stage Viewport */}
          <div className="relative flex-1 w-full h-[470px] sm:h-[530px] md:h-[590px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#18181b] via-[#111116] to-[#0c0c0e] border border-white/5 flex items-center justify-center">
            {stageMode === '3d' ? (
              <Workspace3D />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 bg-black/95">
                <video
                  controls
                  autoPlay
                  playsInline
                  src="./avatar-intro.mp4"
                  className="w-full h-full object-contain rounded-2xl shadow-2xl"
                />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Play / Replay Voice Button */}
              <button
                type="button"
                onClick={handlePlayVoiceIntro}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#D95D39] to-orange-600 hover:from-orange-500 hover:to-[#D95D39] text-white shadow-lg shadow-[#D95D39]/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-orange-100 animate-pulse" />
                <span>▶ Play / Replay Voice</span>
              </button>

              {/* Download Resume Button */}
              <a
                href={personalInfo.resumePath || "./Yashwanth_Resume.pdf"}
                download="Yashwanth_S_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/15 hover:border-white/30 backdrop-blur-sm hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 text-[#D95D39]" />
                <span>Download Resume</span>
              </a>

              {/* Explore Projects Button */}
              <a
                href="#projects"
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/15 hover:border-white/30 backdrop-blur-sm hover:-translate-y-0.5"
              >
                <span>Explore Projects</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#D95D39]" />
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-white/50">
              <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" />
              <span>Interactive 3D Stage • Move mouse for parallax</span>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 4 Quick Metric Badges                                 */}
      {/* ======================================================== */}
      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 relative z-10">
        <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-[#141414]/85 border border-white/10 backdrop-blur-md hover:border-[#D95D39]/40 transition-all duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <div className="font-heading font-bold text-sm sm:text-base text-white">2 Live Platforms</div>
            <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Zisti & Astrovedic</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-[#141414]/85 border border-white/10 backdrop-blur-md hover:border-[#38bdf8]/40 transition-all duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shrink-0" />
          <div>
            <div className="font-heading font-bold text-sm sm:text-base text-white">8+ Projects</div>
            <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Full Stack & WebGL</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-[#141414]/85 border border-white/10 backdrop-blur-md hover:border-[#D95D39]/40 transition-all duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D95D39] shrink-0" />
          <div>
            <div className="font-heading font-bold text-sm sm:text-base text-white">400+ Hrs Training</div>
            <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Full-Stack Lead</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-[#141414]/85 border border-white/10 backdrop-blur-md hover:border-purple-400/40 transition-all duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
          <div>
            <div className="font-heading font-bold text-sm sm:text-base text-white">100% Code Quality</div>
            <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Modular Architecture</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Bottom: Prominent Pulsing Scroll Indicator Button     */}
      {/* ======================================================== */}
      <div className="w-full flex justify-center mt-6 mb-2 relative z-10">
        <a
          href="#about"
          onClick={() => sound.playClick()}
          onMouseEnter={() => sound.playPop()}
          className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono text-xs sm:text-sm uppercase tracking-wider font-bold border border-white/15 hover:border-[#D95D39]/60 shadow-xl shadow-black/50 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
        >
          <span>Explore Portfolio & Resume ↓</span>
        </a>
      </div>

    </section>
  );
}
