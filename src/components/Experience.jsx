import React, { useState } from 'react';
import { experiences } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Briefcase, Calendar, MapPin, ChevronRight, Sparkles } from 'lucide-react';

export default function Experience() {
  const [activeExp, setActiveExp] = useState(experiences[0].id);

  return (
    <section id="experience" className="relative bg-obsidian text-cream py-24 lg:py-32 overflow-hidden border-t border-white/5">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-terracotta/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-coral/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-0.5 bg-coral" />
          <span className="font-mono text-xs uppercase tracking-widest text-coral font-semibold">
            CAREER & MILESTONES
          </span>
        </div>

        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Work Experience &{' '}
            <span className="italic font-normal text-terracotta-light">Engineering Path</span>
          </h2>
          <p className="text-cream/70 text-base sm:text-lg mt-3">
            A chronological timeline of hands-on software development, industrial internship optimization, and academic foundations.
          </p>
        </div>

        {/* Timeline Layout (Video Frames 14-15 Replica) */}
        <div className="relative border-l border-white/15 ml-4 sm:ml-8 lg:ml-32 pl-6 sm:pl-10 lg:pl-12 space-y-12">
          
          {experiences.map((exp, index) => {
            const isSelected = activeExp === exp.id;

            return (
              <div
                key={exp.id}
                onMouseEnter={() => {
                  sound.playPop();
                  setActiveExp(exp.id);
                }}
                className="relative group transition-all duration-300"
              >
                {/* Timeline node marker on the left line */}
                <div 
                  className={`absolute -left-[31px] sm:-left-[47px] lg:-left-[55px] top-1.5 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isSelected
                      ? 'bg-coral border-white scale-125 shadow-lg shadow-coral/50'
                      : 'bg-obsidian-surface border-white/40 group-hover:border-coral group-hover:scale-110'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent'}`} />
                </div>

                {/* Left Absolute Period Tag for Large Screens */}
                <div className="hidden lg:block absolute -left-44 top-1 w-32 text-right">
                  <span className={`font-mono text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isSelected ? 'text-coral' : 'text-cream/60'
                  }`}>
                    {exp.period}
                  </span>
                </div>

                {/* Interactive Card */}
                <div
                  className={`p-6 sm:p-8 rounded-2xl transition-all duration-300 border ${
                    isSelected
                      ? 'bg-obsidian-card/95 border-coral/40 shadow-2xl shadow-coral/10 -translate-y-1'
                      : 'bg-obsidian-surface/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      {/* Mobile period display */}
                      <span className="lg:hidden inline-flex items-center gap-1.5 text-xs font-mono text-coral font-medium mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.period}
                      </span>
                      
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-coral transition-colors">
                        {exp.role}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-cream/75">
                        <span className="font-semibold text-cream">{exp.company}</span>
                        <span className="w-1 h-1 rounded-full bg-cream/40" />
                        <span className="flex items-center gap-1 text-cream/60 text-xs">
                          <MapPin className="w-3 h-3 text-coral" />
                          {exp.location}
                        </span>
                      </div>
                    </div>

                    {/* Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase border ${
                      isSelected
                        ? 'bg-coral/20 text-coral border-coral/30'
                        : 'bg-white/5 text-cream/70 border-white/10'
                    }`}>
                      {exp.badge}
                    </span>
                  </div>

                  {/* Highlights Bullet Points */}
                  <ul className="space-y-2.5 my-5 text-sm text-cream/80">
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <ChevronRight className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Skills Pill Tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 text-cream/90 border border-white/10 hover:border-coral/40 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
