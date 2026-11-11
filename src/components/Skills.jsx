import React, { useState, useMemo } from 'react';
import { skillCategories, personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import ThreeStage from '../three/ThreeStage.jsx';
import { createSkillConstellationStage } from '../three/stages/skillConstellationStage.js';
import DepthCard3D from './DepthCard3D.jsx';
import {
  Layout,
  Database,
  Wrench,
  Cpu,
  Terminal,
  Code2,
  Globe2,
  Music,
  Film,
  Compass,
  Sparkles
} from 'lucide-react';

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const constellationState = useMemo(
    () => ({ activeTab, hoveredSkill }),
    [activeTab, hoveredSkill]
  );

  const icons = [Layout, Database, Wrench, Cpu];

  const interestIconMap = {
    Music: Music,
    Film: Film,
    Compass: Compass
  };

  const constellationFallback = (
    <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#161616] rounded-3xl overflow-hidden">
      <svg className="w-full h-full max-w-lg" viewBox="0 0 400 240" fill="none">
        <circle cx="200" cy="120" r="16" fill="#D95D39" fillOpacity="0.85" />
        <circle cx="200" cy="120" r="30" stroke="#D95D39" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
        <line x1="200" y1="120" x2="100" y2="70" stroke="#D95D39" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="200" y1="120" x2="300" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="200" y1="120" x2="100" y2="170" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="200" y1="120" x2="300" y2="170" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.6" />
        <circle cx="100" cy="70" r="12" fill="#D95D39" />
        <circle cx="300" cy="70" r="12" fill="#38bdf8" />
        <circle cx="100" cy="170" r="12" fill="#34d399" />
        <circle cx="300" cy="170" r="12" fill="#fbbf24" />
        <text x="100" y="48" fill="#F5F2EB" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Frontend</text>
        <text x="300" y="48" fill="#F5F2EB" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Backend</text>
        <text x="100" y="200" fill="#F5F2EB" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Tools</text>
        <text x="300" y="200" fill="#F5F2EB" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Core</text>
      </svg>
    </div>
  );

  return (
    <section id="skills" className="relative bg-[#1A1A1A] text-[#F5F2EB] py-24 lg:py-32 overflow-hidden border-t border-white/10 font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D95D39]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5F2EB] font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <Code2 className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>TECHNICAL REPERTOIRE</span>
        </div>

        <div className="max-w-3xl mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Skills, Tools &{' '}
            <span className="text-[#D95D39]">Engineering Mastery</span>
          </h2>
          <p className="text-[#F5F2EB]/75 text-base sm:text-lg mt-3">
            A comprehensive inventory of modern frameworks, database management, core engineering competencies, languages, and personal pursuits.
          </p>
        </div>

        {/* 3D Skills Constellation Interactive Stage */}
        <ThreeStage
          stageId="skills-constellation"
          factory={createSkillConstellationStage}
          state={constellationState}
          interactive="orbit-xy"
          onInteract={(e) => {
            if (e.type === 'select' && typeof e.categoryIndex === 'number') {
              sound.playChime();
              setActiveTab(e.categoryIndex);
            }
          }}
          fallback={constellationFallback}
          className="w-full h-[300px] sm:h-[340px] rounded-3xl bg-[#161616] border border-white/10 shadow-2xl mb-10 cursor-grab active:cursor-grabbing"
        />

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {skillCategories.map((cat, idx) => {
            const Icon = icons[idx] || Terminal;
            const isActive = activeTab === idx;

            return (
              <DepthCard3D key={cat.category} active={isActive} intensity={6} className="h-full">
                <button
                  onClick={() => {
                    sound.playChime();
                    setActiveTab(idx);
                  }}
                  className={`w-full h-full p-4 rounded-2xl flex flex-col items-start justify-between text-left transition-all duration-300 border ${
                    isActive
                      ? 'bg-[#282828] text-white border-[#D95D39] shadow-xl shadow-black/40'
                      : 'bg-[#222222] text-[#F5F2EB]/70 border-white/10 hover:border-[#D95D39]/40 hover:text-white'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/10 mb-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#D95D39]' : 'text-white'}`} />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm sm:text-base leading-snug">
                      {cat.category}
                    </div>
                    <div className="text-[11px] font-mono opacity-70 mt-1 line-clamp-1">
                      {cat.skills.length} core technologies
                    </div>
                  </div>
                </button>
              </DepthCard3D>
            );
          })}
        </div>

        {/* Active Tab Skills Grid */}
        <div className="bg-[#222222] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl mb-12">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-2">
            <div>
              <h3 className="font-heading text-2xl font-bold text-white">
                {skillCategories[activeTab].category}
              </h3>
              <p className="text-xs font-mono text-white/50 mt-0.5">
                {skillCategories[activeTab].description}
              </p>
            </div>
            <span className="text-xs font-mono text-[#D95D39] bg-[#D95D39]/10 px-3 py-1 rounded-full border border-[#D95D39]/30 w-fit">
              Mastery Matrix
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {skillCategories[activeTab].skills.map((skill) => (
              <DepthCard3D
                key={skill.name}
                intensity={5}
                className="h-full"
              >
                <div
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D95D39]/40 transition-all duration-200 h-full"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm sm:text-base text-white group-hover:text-[#D95D39] transition-colors">
                      {skill.name}
                    </span>
                    <span className="font-mono text-xs text-[#D95D39] font-semibold group-hover:text-white transition-colors">
                      {skill.level}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D95D39] to-orange-400 transition-all duration-700"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>

                  <div className="text-[11px] font-mono text-white/50 mt-2">
                    {skill.note}
                  </div>
                </div>
              </DepthCard3D>
            ))}
          </div>

        </div>

        {/* ======================================================== */}
        {/* Languages & Personal Interests Dual Showcase Row          */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Languages Known */}
          <div className="lg:col-span-6">
            <DepthCard3D intensity={4} className="h-full">
              <div className="bg-[#222222] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#D95D39]">
                        <Globe2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                          Languages Known
                        </h3>
                        <p className="text-xs font-mono text-white/50 mt-0.5">
                          Multilingual communication proficiency
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#D95D39]/10 text-[#D95D39] border border-[#D95D39]/30">
                      4 Languages
                    </span>
                  </div>

                  <div className="space-y-4">
                    {personalInfo.languages.map((lang) => (
                      <div
                        key={lang.name}
                        className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D95D39]/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-heading font-semibold text-white text-sm sm:text-base">
                            {lang.name}
                          </span>
                          <span className="text-xs font-mono text-[#D95D39] font-bold">
                            {lang.tag} • {lang.fluency}
                          </span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#D95D39] to-orange-400"
                            style={{ width: lang.fluency }}
                          />
                        </div>

                        <div className="text-[11px] font-mono text-white/50">
                          {lang.level}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DepthCard3D>
          </div>

          {/* Right Column: Personal Interests & Creative Pursuits */}
          <div className="lg:col-span-6">
            <DepthCard3D intensity={4} className="h-full">
              <div className="bg-[#222222] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#D95D39]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                          Interests & Creative Pursuits
                        </h3>
                        <p className="text-xs font-mono text-white/50 mt-0.5">
                          Personal passions outside of engineering
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#D95D39]/10 text-[#D95D39] border border-[#D95D39]/30">
                      Life & Arts
                    </span>
                  </div>

                  <div className="space-y-4">
                    {personalInfo.interests.map((interest) => {
                      const Icon = interestIconMap[interest.icon] || Compass;
                      return (
                        <div
                          key={interest.name}
                          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D95D39]/30 transition-all flex items-start gap-4"
                        >
                          <div className="p-2.5 rounded-xl bg-[#D95D39]/15 border border-[#D95D39]/30 text-[#D95D39] shrink-0 mt-0.5">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-white text-base mb-1">
                              {interest.name}
                            </h4>
                            <p className="text-xs text-[#F5F2EB]/70 leading-relaxed">
                              {interest.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/10 text-xs font-mono text-white/40 flex items-center justify-between">
                  <span>Balance of Athletic Discipline, Code & Creative Expression</span>
                  <span className="text-[#D95D39]">Yashwanth S</span>
                </div>
              </div>
            </DepthCard3D>
          </div>

        </div>

      </div>
    </section>
  );
}
