import React, { useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Award, Compass, Cpu, Layers, Sparkles, User, CheckCircle2 } from 'lucide-react';

export default function About() {
  const [photoMode, setPhotoMode] = useState('avatar'); // 'avatar' | 'real'

  const pillars = [
    {
      icon: Cpu,
      title: "Analytical Engineering Rigor",
      desc: "Trained in mechanical systems, dynamics, and mathematical modeling at EWIT (VTU), translating physical systems discipline into robust web architectures."
    },
    {
      icon: Layers,
      title: "Component Architecture",
      desc: "Specializing in modular React 18, clean state management, TypeScript/ES6+ practices, and predictable data flows."
    },
    {
      icon: Compass,
      title: "Pixel-Perfect UX",
      desc: "Focused on responsive layouts, mobile-first design, fluid transitions, and tactile user feedback with WCAG accessibility standards."
    },
    {
      icon: Award,
      title: "Resilience & Tenacity",
      desc: "Represented Karnataka as a national championship athlete; bringing grit, team synergy, and composure under tight delivery timelines."
    }
  ];

  return (
    <section
      id="about"
      className="relative bg-[#F5F2EB] text-[#1A1A1A] py-24 lg:py-32 overflow-hidden border-b border-[#1A1A1A]/10 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8DEC9] border border-[#D8CBB2] text-[#1A1A1A] font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <User className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>ABOUT YASHWANTH S</span>
        </div>

        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-[1.15] mb-5">
            Engineering foundation meets{' '}
            <span className="text-[#D95D39]">modern frontend craftsmanship.</span>
          </h2>
          <p className="text-[#1A1A1A]/75 text-base sm:text-lg leading-relaxed">
            I build fast, accessible web applications where performance, maintainable React architecture, and tactile aesthetic clarity converge.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Photo / 3D Avatar Toggle Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              
              {/* Tape sticker effect */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#E8DEC9] border border-[#D8CBB2] shadow-sm rotate-2 z-20 pointer-events-none rounded-sm opacity-90" />

              {/* Card Container */}
              <div 
                onMouseEnter={() => sound.playPop()}
                className="bg-white p-4 sm:p-5 pb-7 rounded-2xl shadow-xl border border-[#E8DEC9] transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Toggle: 3D Avatar vs Real Photo */}
                <div className="flex items-center justify-center mb-3">
                  <div className="inline-flex p-1 bg-[#F5F2EB] rounded-full border border-[#E8DEC9]">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setPhotoMode('avatar');
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                        photoMode === 'avatar'
                          ? 'bg-[#1A1A1A] text-[#D95D39] shadow-sm'
                          : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#D95D39]" />
                      <span>3D Avatar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setPhotoMode('real');
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                        photoMode === 'real'
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <User className="w-3 h-3 text-[#D95D39]" />
                      <span>Real Portrait</span>
                    </button>
                  </div>
                </div>

                {/* Media Container */}
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-[#1A1A1A] border border-neutral-200 shadow-inner">
                  {photoMode === 'avatar' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#222222] via-[#1A1A1A] to-[#111111] overflow-hidden">
                      {/* Ambient Orange Glow behind Avatar */}
                      <div className="absolute w-48 h-48 rounded-full bg-[#D95D39]/20 blur-2xl pointer-events-none" />
                      
                      <img
                        src={personalInfo.avatarPath || "./avatar-3d.png"}
                        alt="Yashwanth S 3D Avatar"
                        className="relative z-10 w-full h-full object-contain p-2 filter drop-shadow-[0_12px_24px_rgba(217,93,57,0.3)] group-hover:scale-105 transition-all duration-500"
                      />
                      
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/90 uppercase tracking-wider z-20">
                        3D Cutout Render
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={personalInfo.photoPath || "./yashwanth.jpg"}
                        alt="Yashwanth S"
                        className="w-full h-full object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/90 uppercase tracking-wider z-20">
                        Portrait Photo
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Caption */}
                <div className="mt-4 pt-2 text-center border-t border-[#F5F2EB]">
                  <h4 className="font-heading font-bold text-lg text-[#1A1A1A]">Yashwanth S</h4>
                  <p className="text-xs font-mono text-[#D95D39] tracking-wider uppercase mt-0.5 font-semibold">
                    Bengaluru, India • Frontend & Software Engineer
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Engineering Bio Narrative */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            
            {/* Bio Paragraphs */}
            <div className="space-y-4 text-[#1A1A1A]/85 text-base sm:text-lg leading-relaxed">
              <p>
                My journey began in the mechanical engineering halls at{' '}
                <strong className="text-[#1A1A1A] font-semibold">East West Institute of Technology (VTU)</strong>, where I developed an appreciation for mathematical modeling, thermodynamics, and physical tolerances.
              </p>
              <p>
                Driven by the desire to build high-impact interactive systems, I pivoted into software engineering, completing over{' '}
                <strong className="text-[#D95D39] font-semibold">400+ hours of full-stack Java and frontend training at JSPIDERS Bengaluru</strong>. There, I mastered enterprise React.js architectures, modern ES6+, SQL schemas, and decoupled REST APIs.
              </p>
              <p>
                I specialize in shipping live platforms that solve real problems—including <strong className="text-[#1A1A1A] font-semibold">Zisti</strong> (on-demand food delivery) and <strong className="text-[#1A1A1A] font-semibold">Astrovedic Jyotishya Kendra</strong> (sidereal astrology & consultation engine). My engineering background gives me an obsession with precision, structural integrity, and clean code that scales seamlessly.
              </p>
            </div>

            {/* Quick Stat Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[#1A1A1A]/10">
              {personalInfo.stats.map((stat, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => sound.playPop()}
                  className="bg-white p-4 rounded-xl border border-[#E8DEC9] shadow-sm hover:border-[#D95D39]/50 transition-colors"
                >
                  <div className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-[#1A1A1A] mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-[#1A1A1A]/60 mt-0.5 truncate">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Four Core Engineering Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {pillars.map((pillar, i) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => sound.playPop()}
                    className="p-4 rounded-xl bg-white border border-[#E8DEC9] hover:shadow-md hover:border-[#D95D39]/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E8DEC9] text-[#D95D39] flex items-center justify-center font-bold">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-[#1A1A1A]">{pillar.title}</h4>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/70 leading-normal">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
