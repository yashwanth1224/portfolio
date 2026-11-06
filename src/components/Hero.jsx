import React, { useState } from 'react';
import {
  ArrowDown,
  Code2,
  Download,
  GraduationCap,
  MapPin,
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1A1A1A] text-white pt-24 pb-16 lg:py-20"
    >
      {/* Cinematic Full-Bleed Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale contrast-125 scale-105"
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/90 via-[#1A1A1A]/75 to-[#1A1A1A]" />
        
        {/* Subtle Burnt Orange Radial Ambient Lighting */}
        <div className="absolute -top-32 left-1/3 -translate-x-1/2 w-[700px] h-[700px] bg-[#D95D39]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#D95D39]/10 rounded-full blur-[150px]" />

        {/* Film grain / subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      {/* Main Content Container: 2 Columns on lg */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* ======================================================== */}
        {/* Left Column: Heading, Subtitle, Stats, and Action CTA    */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left items-start">
          
          {/* Terminal Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 font-mono text-xs sm:text-sm tracking-wider uppercase mb-6 shadow-sm backdrop-blur-md">
            <Terminal className="w-3.5 h-3.5 text-[#D95D39]" />
            <span>// FRONTEND DEVELOPER & SOFTWARE ENGINEER</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.05] mb-3 drop-shadow-md">
            Yashwanth <span className="text-[#D95D39] font-light">S</span>
          </h1>

          {/* Subtitle */}
          <div className="font-mono text-base sm:text-lg lg:text-xl text-white/90 font-medium mb-3">
            Software Developer <span className="text-[#D95D39]">|</span> Frontend React.js
          </div>

          {/* Tagline */}
          <p className="font-sans text-lg sm:text-xl text-white/80 font-light leading-relaxed mb-6 italic">
            "Building fast, accessible web applications."
          </p>

          {/* 3-Column Stats Row */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-8">
            {/* Stat 1: Location */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-[#D95D39] shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Location</div>
                <div className="text-xs sm:text-sm font-semibold text-white">Bengaluru, India</div>
              </div>
            </div>

            {/* Stat 2: Focus */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <Code2 className="w-4 h-4 text-[#D95D39] shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Focus</div>
                <div className="text-xs sm:text-sm font-semibold text-white">Frontend Development</div>
              </div>
            </div>

            {/* Stat 3: Background */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 text-[#D95D39] shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Background</div>
                <div className="text-xs sm:text-sm font-semibold text-white">B.E. Mechanical → Tech</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full">
            {/* Explore Work */}
            <a
              href="#projects"
              onMouseEnter={() => sound.playPop()}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-heading font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/15 hover:border-white/30 backdrop-blur-sm hover:-translate-y-0.5"
            >
              <span>Explore Work</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#D95D39]" />
            </a>

            {/* Download Resume */}
            <a
              href={personalInfo.resumePath || "./Yashwanth_Resume.pdf"}
              download="Yashwanth_S_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-heading font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/15 hover:border-white/30 backdrop-blur-sm hover:-translate-y-0.5"
            >
              <Download className="w-3.5 h-3.5 text-[#D95D39]" />
              <span>Download Resume</span>
            </a>

            {/* Play Voice Intro 🎙️ */}
            <button
              type="button"
              onClick={handlePlayVoiceIntro}
              onMouseEnter={() => sound.playPop()}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-heading font-semibold text-sm bg-[#D95D39] hover:bg-[#C04D2B] text-white transition-all duration-200 shadow-xl shadow-[#D95D39]/35 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-orange-100 animate-pulse" />
              <span>Play Voice Intro 🎙️</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* Right Column: Prominent 3D Avatar & Video Reel Stage     */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex items-center justify-center w-full">
          <div className="relative group w-full">
            {/* Ambient Burnt Orange Glow Backdrop */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D95D39]/25 via-orange-600/15 to-[#D95D39]/25 rounded-[32px] blur-2xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

            {/* Glassmorphic Stage Card */}
            <div className="relative w-full rounded-3xl bg-[#141414]/90 backdrop-blur-2xl border border-white/15 p-3 sm:p-4 shadow-2xl shadow-black/80 flex flex-col group-hover:border-[#D95D39]/40 transition-all duration-300">
              
              {/* Stage Top Bar: Mode Switcher & Status */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 px-1 sm:px-2">
                {/* Mode Switcher */}
                <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setStageMode('3d');
                    }}
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
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
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
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
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{stageMode === '3d' ? 'Three.js 60FPS WebGL' : 'MP4 Video Reel'}</span>
                </div>
              </div>

              {/* Stage Viewport */}
              <div className="relative flex-1 w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#18181b] to-[#0d0d0f] border border-white/5 flex items-center justify-center">
                {stageMode === '3d' ? (
                  <Workspace3D />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-2 bg-black">
                    <video
                      controls
                      autoPlay
                      playsInline
                      src="./avatar-intro.mp4"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                  </div>
                )}
              </div>

              {/* Stage Footer Status Bar */}
              <div className="mt-2.5 pt-2 px-2 flex items-center justify-between text-[11px] font-mono text-white/50 border-t border-white/5">
                <span className="text-[#D95D39] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D95D39]" />
                  {stageMode === '3d' ? 'Interactive 3D Stage (Audio & Lip-Sync)' : 'Official Introduction Video Reel'}
                </span>
                <span>Yashwanth S • Bengaluru</span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Subtle Scroll Down Prompt at Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-white/40 pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#D95D39]" />
      </div>
    </section>
  );
}
