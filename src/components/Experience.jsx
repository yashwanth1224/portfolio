import React, { useState } from 'react';
import { experiences } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Briefcase, Calendar, MapPin, ChevronRight, Award, ExternalLink } from 'lucide-react';

export default function Experience() {
  const [activeExp, setActiveExp] = useState(experiences[0].id);

  return (
    <section
      id="experience"
      className="relative bg-[#E8DEC9] text-[#1A1A1A] py-24 lg:py-32 overflow-hidden border-b border-[#1A1A1A]/10 font-sans"
    >
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D95D39]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5F2EB]/50 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F2EB] border border-[#D8CBB2] text-[#1A1A1A] font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <Briefcase className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>CAREER TIMELINE</span>
        </div>

        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight">
            Work Experience &{' '}
            <span className="text-[#D95D39]">Engineering Milestones</span>
          </h2>
          <p className="text-[#1A1A1A]/80 text-base sm:text-lg mt-3">
            A reverse-chronological timeline of hands-on software development, industrial internship optimization, and academic foundations.
          </p>
        </div>

        {/* Reverse-Chronological Vertical Timeline Layout */}
        <div className="relative border-l-2 border-[#D8CBB2] ml-4 sm:ml-8 lg:ml-32 pl-6 sm:pl-10 lg:pl-12 space-y-12">
          
          {experiences.map((exp) => {
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
                {/* Burnt Orange Timeline Node Indicator Dot */}
                <div 
                  className={`absolute -left-[33px] sm:-left-[49px] lg:-left-[57px] top-2 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#D95D39] border-white scale-125 shadow-lg shadow-[#D95D39]/50'
                      : 'bg-[#F5F2EB] border-[#D95D39] group-hover:bg-[#D95D39] group-hover:scale-110'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#D95D39]'}`} />
                </div>

                {/* Left Absolute Period Tag for Large Screens */}
                <div className="hidden lg:block absolute -left-44 top-1.5 w-32 text-right">
                  <span className={`font-mono text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isSelected ? 'text-[#D95D39]' : 'text-[#1A1A1A]/70'
                  }`}>
                    {exp.period}
                  </span>
                </div>

                {/* Timeline Card */}
                <div
                  className={`p-6 sm:p-8 rounded-2xl transition-all duration-300 border ${
                    isSelected
                      ? 'bg-white border-[#D95D39]/40 shadow-xl shadow-black/5 -translate-y-1'
                      : 'bg-[#F5F2EB] border-[#D8CBB2] hover:border-[#D95D39]/30 hover:bg-white'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      {/* Mobile period display */}
                      <span className="lg:hidden inline-flex items-center gap-1.5 text-xs font-mono text-[#D95D39] font-semibold mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.period}
                      </span>
                      
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1A1A1A] group-hover:text-[#D95D39] transition-colors">
                        {exp.role}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-[#1A1A1A]/80">
                        <span className="font-bold text-[#1A1A1A]">{exp.company}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D95D39]" />
                        <span className="flex items-center gap-1 text-xs text-[#1A1A1A]/70">
                          <MapPin className="w-3.5 h-3.5 text-[#D95D39]" />
                          {exp.location}
                        </span>
                      </div>
                    </div>

                    {/* Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide uppercase border ${
                      isSelected
                        ? 'bg-[#D95D39]/10 text-[#D95D39] border-[#D95D39]/30'
                        : 'bg-white text-[#1A1A1A]/70 border-[#D8CBB2]'
                    }`}>
                      {exp.badge}
                    </span>
                  </div>

                  {/* Highlights Bullet Points */}
                  <ul className="space-y-2.5 my-5 text-sm text-[#1A1A1A]/85">
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <ChevronRight className="w-4 h-4 text-[#D95D39] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Skills Pill Tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#D8CBB2]/60">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-white text-[#1A1A1A] border border-[#D8CBB2] hover:border-[#D95D39] transition-colors"
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
