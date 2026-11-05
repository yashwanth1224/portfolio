import React, { useState } from 'react';
import { skillCategories } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { Layout, Database, Wrench, Cpu, CheckCircle2, Sparkles, Terminal, Code2 } from 'lucide-react';

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);

  const icons = [Layout, Database, Wrench, Cpu];

  return (
    <section id="skills" className="relative bg-obsidian-surface text-cream py-24 lg:py-32 overflow-hidden border-t border-white/5">
      {/* Background glow in Sky Blue */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Banner in Resume Silver-Slate Format */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slateBanner border border-slateBanner-border text-navy font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <Code2 className="w-3.5 h-3.5 text-accent-royal" />
          <span>TECHNICAL REPERTOIRE</span>
        </div>

        <div className="max-w-3xl mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Skills, Tools &{' '}
            <span className="italic font-normal text-accent">Architectural Mastery</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mt-3">
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
                    ? 'bg-gradient-to-r from-navy-light to-navy text-white border-accent shadow-xl shadow-navy-deep/60 -translate-y-1'
                    : 'bg-obsidian-card text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="p-2 rounded-xl bg-white/10 mb-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-cream'}`} />
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
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {skillCategories[activeTab].description}
              </p>
            </div>
            <span className="text-xs font-mono text-accent bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20 w-fit">
              Mastery Matrix
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {skillCategories[activeTab].skills.map((skill) => (
              <div
                key={skill.name}
                onMouseEnter={() => sound.playPop()}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm sm:text-base text-cream group-hover:text-accent transition-colors">
                    {skill.name}
                  </span>
                  <span className="font-mono text-xs text-accent font-semibold group-hover:text-white transition-colors">
                    {skill.level}%
                  </span>
                </div>

                {/* Progress Meter Bar with Deep Navy Track & Cyan/Blue Electric Gradient */}
                <div className="w-full h-2 rounded-full bg-navy-deep/80 border border-white/5 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-700 ease-out shadow-sm shadow-sky-500/50"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
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
