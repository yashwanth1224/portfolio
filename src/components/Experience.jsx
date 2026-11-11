import React, { useState, useMemo } from 'react';
import { experiences } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Briefcase, Calendar, MapPin, ChevronRight, GraduationCap, Building2 } from 'lucide-react';
import DepthCard3D from './DepthCard3D.jsx';
import ThreeStage from '../three/ThreeStage.jsx';
import { createCareerHelixStage } from '../three/stages/careerHelixStage.js';

export default function Experience() {
  const [activeExp, setActiveExp] = useState(experiences[0].id);
  const [filter, setFilter] = useState('all'); // 'all' | 'internship' | 'education'

  const filteredExperiences = useMemo(
    () =>
      experiences.filter((exp) => (filter === 'all' ? true : exp.category === filter)),
    [filter]
  );

  const handleFilterChange = (nextFilter) => {
    sound.playPop();
    setFilter(nextFilter);
    const nextFiltered = experiences.filter((exp) =>
      nextFilter === 'all' ? true : exp.category === nextFilter
    );
    if (nextFiltered.length > 0 && !nextFiltered.some((exp) => exp.id === activeExp)) {
      setActiveExp(nextFiltered[0].id);
    }
  };

  const helixState = useMemo(
    () => ({
      experiences,
      activeId: activeExp,
      filter,
      visibleIds: filteredExperiences.map((e) => e.id),
    }),
    [activeExp, filter, filteredExperiences]
  );

  return (
    <section
      id="experience"
      className="relative bg-[#E8DEC9] text-[#1A1A1A] py-24 lg:py-32 overflow-x-clip border-b border-[#1A1A1A]/10 font-sans"
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

        {/* Section Heading & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight">
              Work Experience &{' '}
              <span className="text-[#D95D39]">Engineering Milestones</span>
            </h2>
            <p className="text-[#1A1A1A]/80 text-base sm:text-lg mt-3">
              A reverse-chronological timeline of full-stack engineering, industrial internship processes, and academic foundations.
            </p>
          </div>

          {/* Filter Segmented Control */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#D8CBB2]/50 border border-[#D8CBB2] shadow-inner self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white text-[#1A1A1A] shadow-md border border-[#D8CBB2]'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              All Milestones ({experiences.length})
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange('internship')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                filter === 'internship'
                  ? 'bg-[#D95D39] text-white shadow-md'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Internships & Industry (3)</span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange('education')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                filter === 'education'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Education (3)</span>
            </button>
          </div>
        </div>

        {/* 12-Column Grid: Sticky 3D Career Helix on Desktop (col-span-4) + Timeline Cards (col-span-8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Desktop Sticky 3D Career Helix */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#1A1A1A]/70 uppercase tracking-wider px-1">
              <span className="font-bold text-[#1A1A1A]">Career Helix 3D</span>
              <span className="text-[#D95D39] font-semibold">Click Node</span>
            </div>

            <ThreeStage
              stageId="experience-helix"
              factory={createCareerHelixStage}
              state={helixState}
              interactive="orbit-x"
              onInteract={(e) => {
                if (e.type === 'select' && e.itemId) {
                  sound.playPop();
                  setActiveExp(e.itemId);
                }
              }}
              className="w-full h-[540px] rounded-2xl bg-[#1A1A1A] border border-[#D8CBB2] shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#1A1A1A] text-white">
                  <svg viewBox="0 0 100 240" className="w-24 h-48 stroke-[#D95D39] fill-none stroke-2">
                    <path d="M 30,20 Q 70,60 30,100 T 30,180 T 30,220" />
                    <path d="M 70,20 Q 30,60 70,100 T 70,180 T 70,220" stroke="#38bdf8" />
                    <line x1="30" y1="20" x2="70" y2="20" stroke="#fff" strokeWidth="1" />
                    <line x1="30" y1="60" x2="70" y2="60" stroke="#fff" strokeWidth="1" />
                    <line x1="30" y1="100" x2="70" y2="100" stroke="#fff" strokeWidth="1" />
                    <line x1="30" y1="140" x2="70" y2="140" stroke="#fff" strokeWidth="1" />
                    <line x1="30" y1="180" x2="70" y2="180" stroke="#fff" strokeWidth="1" />
                    <line x1="30" y1="220" x2="70" y2="220" stroke="#fff" strokeWidth="1" />
                  </svg>
                  <p className="font-mono text-xs uppercase tracking-wider text-[#D95D39] font-bold mt-2">
                    Career Helix Timeline
                  </p>
                </div>
              }
            />

            <p className="text-[11px] font-mono text-[#1A1A1A]/60 text-center">
              Double-helix spine synchronizes with active timeline card.
            </p>
          </div>

          {/* Timeline Cards Column */}
          <div className="lg:col-span-8 w-full">
            <div className="relative border-l-2 border-[#D8CBB2] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
              {filteredExperiences.map((exp) => {
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
                      className={`absolute -left-[33px] sm:-left-[49px] top-3 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#D95D39] border-white scale-125 shadow-lg shadow-[#D95D39]/50'
                          : 'bg-[#F5F2EB] border-[#D95D39] group-hover:bg-[#D95D39] group-hover:scale-110'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#D95D39]'}`} />
                    </div>

                    {/* Timeline Card wrapped in DepthCard3D */}
                    <DepthCard3D
                      active={isSelected}
                      intensity={5}
                      glareColor="#D95D39"
                      className={`p-6 sm:p-8 rounded-2xl transition-all duration-300 border ${
                        isSelected
                          ? 'bg-white border-[#D95D39]/40 shadow-xl shadow-black/5 -translate-y-1'
                          : 'bg-[#F5F2EB] border-[#D8CBB2] hover:border-[#D95D39]/30 hover:bg-white'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D95D39] font-semibold mb-1">
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide uppercase border ${
                            isSelected
                              ? 'bg-[#D95D39]/10 text-[#D95D39] border-[#D95D39]/30'
                              : 'bg-white text-[#1A1A1A]/70 border-[#D8CBB2]'
                          }`}
                        >
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
                    </DepthCard3D>
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
