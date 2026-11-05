import React, { useState } from 'react';
import { projects } from '../data/portfolioData';
import ProjectModal from './ProjectModal';
import { sound } from '../utils/audio';
import { ExternalLink, Github, Sparkles, Layers, ArrowUpRight, Play, Eye } from 'lucide-react';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Live Websites', 'Full Stack', '3D WebGL', 'Hardware & IoT', 'Frontend'];

  const filteredProjects = projects.filter((project) => {
    if (filter === 'All') return true;
    if (filter === 'Live Websites') return !!project.liveUrl;
    if (filter === 'Full Stack') return (project.id === 'sentiment-engine' || project.id === 'saas-dashboard');
    if (filter === '3D WebGL') return (project.id === 'engine-3d-sim' || project.id === 'developer-portfolio');
    if (filter === 'Hardware & IoT') return project.id === 'pneumatic-mobility';
    if (filter === 'Frontend') return (project.id === 'zisti' || project.id === 'astrovedic' || project.id === 'developer-portfolio' || project.id === 'saas-dashboard' || project.id === 'sentiment-engine');
    return false;
  });

  const handleOpenModal = (project) => {
    sound.playClick();
    setSelectedProject(project);
  };

  return (
    <section id="projects" className="relative bg-obsidian text-cream py-24 lg:py-36 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-terracotta/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-coral/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-0.5 bg-coral" />
          <span className="font-mono text-xs uppercase tracking-widest text-coral font-semibold">
            FEATURED PORTFOLIO WORKS
          </span>
        </div>

        {/* Video Frame 16 Title with True Mirrored Reflection */}
        <div className="mb-20">
          <div className="relative inline-block">
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Things I’ve built
            </h2>
            {/* Mirrored reflection effect */}
            <div 
              aria-hidden="true" 
              className="absolute top-full left-0 right-0 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white/20 select-none pointer-events-none reflection-mirror mt-1"
            >
              Things I’ve built
            </div>
          </div>
          <p className="text-cream/70 text-base sm:text-lg max-w-2xl mt-8">
            Each project is built with architectural discipline, real-time interactivity, and full responsiveness. Click any card to launch interactive demos.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playChime();
                setFilter(cat);
              }}
              onMouseEnter={() => sound.playPop()}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                filter === cat
                  ? 'bg-coral text-white border-coral shadow-lg shadow-coral/25'
                  : 'bg-obsidian-card text-cream/75 border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              onMouseEnter={() => sound.playPop()}
              className="group relative bg-obsidian-card rounded-2xl border border-white/10 hover:border-coral/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-1.5"
            >
              {/* Glowing Coral Top Indicator Bar (Frame 16 requirement) */}
              <div className="h-1.5 w-full bg-gradient-to-r from-terracotta via-coral to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Header Tag and Index */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium uppercase tracking-wider border ${
                      project.liveUrl
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 text-coral'
                    }`}>
                      {project.liveUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {project.tag}
                    </span>
                    <span className="font-mono text-xs text-cream/40 font-bold">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-coral transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-cream/60 mt-1">
                    {project.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-cream/75 mt-3.5 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 bg-obsidian/40 rounded-xl px-3 my-2">
                  {project.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="text-center">
                      <div className={`font-serif font-bold text-sm sm:text-base ${
                        project.liveUrl && m.label === 'STATUS' ? 'text-emerald-400' : 'text-coral'
                      }`}>
                        {m.value}
                      </div>
                      <div className="text-[10px] font-mono text-cream/60 uppercase">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-cream/80 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-cream/50 border border-white/10">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4">
                  {project.liveUrl ? (
                    <>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => sound.playPop()}
                        onClick={() => sound.playClick()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-semibold tracking-wide uppercase transition-all duration-200 shadow-lg shadow-emerald-950/40 group-hover:shadow-emerald-600/30"
                      >
                        <span>Visit Live Site</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>

                      <button
                        onClick={() => handleOpenModal(project)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cream text-xs font-mono font-semibold tracking-wide uppercase transition-all duration-200 border border-white/15"
                        title="View Project Details & Architecture"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => sound.playPop()}
                        onClick={() => sound.playClick()}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-cream border border-white/10 transition-colors"
                        title="View GitHub Repository"
                        aria-label="GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-coral text-cream text-xs font-mono font-semibold tracking-wide uppercase transition-all duration-200 shadow-lg shadow-terracotta/20 group-hover:shadow-coral/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Interactive Demo</span>
                      </button>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => sound.playPop()}
                        onClick={() => sound.playClick()}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-cream border border-white/10 transition-colors"
                        title="View GitHub Repository"
                        aria-label="GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
