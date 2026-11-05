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
    <section id="achievements" className="relative bg-obsidian text-cream py-24 lg:py-32 overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-terracotta/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-0.5 bg-coral" />
          <span className="font-mono text-xs uppercase tracking-widest text-coral font-semibold">
            HONORS & CREDENTIALS
          </span>
        </div>

        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Certifications &{' '}
            <span className="italic font-normal text-terracotta-light">National Distinctions</span>
          </h2>
          <p className="text-cream/70 text-base sm:text-lg mt-3">
            Recognitions spanning national athletics, all-India competitive academic merit, professional full-stack credentials, and industrial internships.
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {certifications.map((cert) => {
            const IconComponent = iconMap[cert.icon] || Award;

            return (
              <div
                key={cert.id}
                onMouseEnter={() => sound.playPop()}
                className="group relative bg-obsidian-card p-6 sm:p-7 rounded-2xl border border-white/10 hover:border-coral/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-coral group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-coral/10 text-coral border border-coral/30">
                      {cert.badge}
                    </span>
                  </div>

                  {/* Title & Issuer */}
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-coral transition-colors mb-1.5 leading-snug">
                    {cert.title}
                  </h3>
                  <p className="text-xs font-mono text-cream/60 mb-4">
                    {cert.issuer} • <span className="text-coral">{cert.year}</span>
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                {/* Bottom Verified Status */}
                <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cream/50">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Credential
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
