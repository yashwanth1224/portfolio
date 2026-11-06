import React, { useState } from 'react';
import { skillCategories } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Layout, Database, Wrench, Cpu, Terminal, Code2 } from 'lucide-react';

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);

  const icons = [Layout, Database, Wrench, Cpu];

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

        <div className="max-w-3xl mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Skills, Tools &{' '}
            <span className="text-[#D95D39]">Engineering Mastery</span>
          </h2>
          <p className="text-[#F5F2EB]/75 text-base sm:text-lg mt-3">
            A comprehensive inventory of modern languages, component frameworks, database management, and engineering competencies.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {skillCategories.map((cat, idx) => {
            const Icon = icons[idx] || Terminal;
            const isActive = activeTab === idx;

            return (
              <button
                key={cat.category}
                onClick={() => {
                  sound.playChime();
                  setActiveTab(idx);
                }}
                onMouseEnter={() => sound.playPop()}
                className={`p-4 rounded-2xl flex flex-col items-start justify-between text-left transition-all duration-300 border ${
                  isActive
                    ? 'bg-[#282828] text-white border-[#D95D39] shadow-xl shadow-black/40 -translate-y-1'
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
            );
          })}
        </div>

        {/* Active Tab Skills Grid */}
        <div className="bg-[#222222] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
          
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
              <div
                key={skill.name}
                onMouseEnter={() => sound.playPop()}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D95D39]/40 transition-all duration-200"
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
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
