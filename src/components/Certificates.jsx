import React, { useState, useMemo } from 'react';
import { certifications } from '../data/portfolioData';
import { sound } from '../utils/audio';
import ThreeStage from '../three/ThreeStage.jsx';
import { createTrophyCarouselStage } from '../three/stages/trophyCarouselStage.js';
import DepthCard3D from './DepthCard3D.jsx';
import { Trophy, Award, Code2, Briefcase, HeartHandshake, Sparkles, CheckCircle } from 'lucide-react';

export default function Certificates() {
  const [activeCert, setActiveCert] = useState(certifications[0]?.id || '');

  const carouselState = useMemo(
    () => ({ activeCertId: activeCert }),
    [activeCert]
  );

  const iconMap = {
    Trophy,
    Award,
    Code2,
    Briefcase,
    HeartHandshake,
    Sparkles,
    CheckCircle,
  };

  const carouselFallback = (
    <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#161616] rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden opacity-85">
        {certifications.map((cert) => {
          const isActive = cert.id === activeCert;
          return (
            <div
              key={cert.id}
              className={`px-4 py-3 rounded-2xl border text-center transition-all ${
                isActive
                  ? 'bg-[#222222] border-[#D95D39] text-[#D95D39] scale-105 shadow-lg'
                  : 'bg-[#1a1a1a] border-white/10 text-white/60'
              }`}
            >
              <div className="text-[10px] font-mono font-bold tracking-wider">{cert.badge}</div>
              <div className="text-xs font-heading font-bold text-white mt-1 max-w-[140px] truncate">{cert.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section id="achievements" className="relative bg-[#1A1A1A] text-[#F5F2EB] py-24 lg:py-32 overflow-hidden border-t border-white/10 font-sans">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#D95D39]/5 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5F2EB] font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>HONORS & CREDENTIALS</span>
        </div>

        <div className="max-w-3xl mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Certifications &{' '}
            <span className="text-[#D95D39]">Distinctions</span>
          </h2>
          <p className="text-[#F5F2EB]/75 text-base sm:text-lg mt-3">
            Recognitions spanning national athletics, all-India competitive academic merit, professional full-stack credentials, computing excellence, and industrial internships.
          </p>
        </div>

        {/* 3D Awards Pedestal Turntable Stage */}
        <ThreeStage
          stageId="certificates-carousel"
          factory={createTrophyCarouselStage}
          state={carouselState}
          interactive="orbit-x"
          onInteract={(e) => {
            if (e.type === 'select' && e.itemId) {
              sound.playPop();
              setActiveCert(e.itemId);
            }
          }}
          fallback={carouselFallback}
          className="w-full h-[270px] sm:h-[310px] rounded-3xl bg-[#161616] border border-white/10 shadow-2xl mb-12 cursor-grab active:cursor-grabbing"
        />

        {/* Certificates Responsive 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => {
            const IconComponent = iconMap[cert.icon] || Award;
            const isActive = cert.id === activeCert;

            return (
              <DepthCard3D
                key={cert.id}
                active={isActive}
                intensity={6}
                className="h-full"
              >
                <div
                  onClick={() => {
                    sound.playPop();
                    setActiveCert(cert.id);
                  }}
                  onMouseEnter={() => setActiveCert(cert.id)}
                  className={`group relative bg-[#222222] p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer h-full ${
                    isActive
                      ? 'border-[#D95D39] ring-1 ring-[#D95D39]/50 shadow-[#D95D39]/10'
                      : 'border-white/10 hover:border-[#D95D39]/50'
                  }`}
                >
                  <div>
                    {/* Top Bar with Icon & Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-[#D95D39] text-white border-[#D95D39]'
                          : 'bg-white/5 border-white/10 text-[#D95D39] group-hover:bg-[#D95D39] group-hover:text-white'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wide border transition-all ${
                        isActive
                          ? 'bg-[#D95D39]/20 text-[#D95D39] border-[#D95D39]'
                          : 'bg-white/5 text-[#D95D39] border-[#D95D39]/30'
                      }`}>
                        {cert.badge}
                      </span>
                    </div>

                    {/* Title & Issuer */}
                    <h3 className={`font-heading text-base sm:text-lg font-bold mb-1.5 leading-snug transition-colors ${
                      isActive ? 'text-[#D95D39]' : 'text-white group-hover:text-[#D95D39]'
                    }`}>
                      {cert.title}
                    </h3>
                    <p className="text-xs font-mono text-white/50 mb-3">
                      {cert.issuer} • <span className="text-[#D95D39] font-semibold">{cert.year}</span>
                    </p>

                    {/* Description */}
                    <p className="text-xs text-[#F5F2EB]/70 leading-relaxed">
                      {cert.description}
                    </p>
                  </div>

                  {/* Bottom Status */}
                  <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified Credential
                    </span>
                    <span>ID: {cert.id}</span>
                  </div>
                </div>
              </DepthCard3D>
            );
          })}
        </div>

      </div>
    </section>
  );
}
