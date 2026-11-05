import React, { useState } from 'react';
import { skillCategories } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Layout, Database, Wrench, Cpu, CheckCircle2, Sparkles, Terminal } from 'lucide-react';

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);

  const icons = [Layout, Database, Wrench, Cpu];

  return (
    <section id="skills" className="relative bg-obsidian-surface text-cream py-24 lg:py-32 overflow-hidden border-t border-white/5">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terracotta/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-0.5 bg-coral" />
          <span className="font-mono text-xs uppercase tracking-widest text-coral font-semibold">
            TECHNICAL REPERTOIRE
          </span>
        </div>

        <div className="max-w-3xl mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Skills, Tools &{' '}
            <span className="italic font-normal text-coral">Architectural Mastery</span>
          </h2>
          <p className="text-cream/70 text-base sm:text-lg mt-3">
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
                    ? 'bg-terracotta text-white border-coral shadow-xl shadow-terracotta/25 -translate-y-1'
                    : 'bg-obsidian-card text-cream/70 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="p-2 rounded-xl bg-white/10 mb-3">
                  <Icon className="w-5 h-5 text-cream" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm sm:text-base leading-snug">
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
        <div className="bg-obsidian-card/90 rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-2">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">
                {skillCategories[activeTab].category}
              </h3>
              <p className="text-xs font-mono text-cream/60 mt-0.5">
                {skillCategories[activeTab].description}
              </p>
            </div>
            <span className="text-xs font-mono text-coral bg-coral/10 px-3 py-1 rounded-full border border-coral/20 w-fit">
              Mastery Matrix
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {skillCategories[activeTab].skills.map((skill) => (
              <div
                key={skill.name}
                onMouseEnter={() => sound.playPop()}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-coral/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm sm:text-base text-cream group-hover:text-coral transition-colors">
                    {skill.name}
                  </span>
                  <span className="font-mono text-xs text-cream/60 group-hover:text-white transition-colors">
                    {skill.level}%
                  </span>
                </div>

                {/* Progress Meter Bar */}
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-terracotta to-coral transition-all duration-700 ease-out"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-cream/50 group-hover:text-cream/80 transition-colors">
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
