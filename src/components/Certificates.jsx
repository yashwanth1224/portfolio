import React from 'react';
import { certifications } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Trophy, Award, Code2, Briefcase, HeartHandshake, Sparkles, CheckCircle } from 'lucide-react';

export default function Certificates() {
  const iconMap = {
    Trophy,
    Award,
    Code2,
    Briefcase,
    HeartHandshake,
    Sparkles,
  };

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

        <div className="max-w-3xl mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Certifications &{' '}
            <span className="text-[#D95D39]">Distinctions</span>
          </h2>
          <p className="text-[#F5F2EB]/75 text-base sm:text-lg mt-3">
            Recognitions spanning national athletics, all-India competitive academic merit, professional full-stack credentials, and industrial internships.
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert) => {
            const IconComponent = iconMap[cert.icon] || Award;

            return (
              <div
                key={cert.id}
                onMouseEnter={() => sound.playPop()}
                className="group relative bg-[#222222] p-6 rounded-2xl border border-white/10 hover:border-[#D95D39] transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#D95D39] group-hover:bg-[#D95D39] group-hover:text-white transition-all">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wide bg-white/5 text-[#D95D39] border border-[#D95D39]/30">
                      {cert.badge}
                    </span>
                  </div>

                  {/* Title & Issuer */}
                  <h3 className="font-heading text-base sm:text-lg font-bold text-white group-hover:text-[#D95D39] transition-colors mb-1.5 leading-snug">
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
                    Verified
                  </span>
                  <span>ID: {cert.id}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
