import React, { useState } from 'react';
import { projects } from '../data/portfolioData';
import ProjectModal from './ProjectModal';
import ThreeStage from '../three/ThreeStage';
import { getProjectStageFactory } from '../three/stages/projectArtifactStage';
import { sound } from '../utils/audio';
import { Github, FolderKanban, Play, Cpu, Globe, Bot } from 'lucide-react';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('All');
  const [hoveredProjectId, setHoveredProjectId] = useState(null);

  const categories = ['All', 'Live Websites', 'Frontend & Full Stack', 'AI & Machine Learning', 'Hardware & 3D'];

  const filteredProjects = projects.filter((project) => {
    if (filter === 'All') return true;
    if (filter === 'Live Websites') return !!project.liveUrl;
    if (filter === 'Frontend & Full Stack') return (project.id === 'zisti' || project.id === 'astrovedic' || project.id === 'developer-portfolio' || project.id === 'saas-dashboard');
    if (filter === 'AI & Machine Learning') return project.id === 'sentiment-engine';
    if (filter === 'Hardware & 3D') return (project.id === 'pneumatic-mobility' || project.id === 'engine-3d-sim');
    return false;
  });

  const handleOpenModal = (project) => {
    sound.playClick();
    setSelectedProject(project);
  };

  const renderAbstractGraphic = (projectId) => {
    switch (projectId) {
      case 'zisti':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#241a18] via-[#1a1a1a] to-[#2a1712] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#D95D39_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="absolute w-28 h-28 rounded-full bg-[#D95D39]/15 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#D95D39]/20 border border-[#D95D39]/40 flex items-center justify-center text-[#D95D39] font-heading font-black text-xl shadow-lg">
                Z
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                On-Demand Food Delivery
              </span>
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE IN PRODUCTION
            </div>
          </div>
        );
      case 'astrovedic':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#1d1b24] via-[#1a1a1a] to-[#261d2b] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="absolute w-28 h-28 rounded-full bg-purple-500/15 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-heading font-black text-xl shadow-lg">
                ✨
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                Sidereal Astrology & Kundli
              </span>
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE CLIENT HUB
            </div>
          </div>
        );
      case 'sentiment-engine':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#1a221f] via-[#1a1a1a] to-[#15241b] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="absolute w-28 h-28 rounded-full bg-emerald-500/15 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-heading font-black text-xl shadow-lg">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                Real-Time NLP Classifier
              </span>
            </div>
          </div>
        );
      case 'developer-portfolio':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#291e19] via-[#1a1a1a] to-[#211612] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#D95D39_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            <div className="absolute w-28 h-28 rounded-full bg-[#D95D39]/20 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#D95D39]/20 border border-[#D95D39]/40 flex items-center justify-center text-[#D95D39] font-heading font-black text-xl shadow-lg">
                3D
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                Three.js & Speech Synthesis
              </span>
            </div>
          </div>
        );
      case 'pneumatic-mobility':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#18202b] via-[#1a1a1a] to-[#121c27] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="absolute w-28 h-28 rounded-full bg-sky-500/15 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 font-heading font-black text-xl shadow-lg">
                ⚙️
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                Zero-Emission Micro-Mobility
              </span>
            </div>
          </div>
        );
      case 'engine-3d-sim':
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#1b2229] via-[#1a1a1a] to-[#121c25] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="absolute w-28 h-28 rounded-full bg-cyan-500/15 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-heading font-black text-xl shadow-lg">
                ⚡
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                Transparent IC Engine Kinematics
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-36 bg-gradient-to-br from-[#222222] via-[#1a1a1a] to-[#202020] rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-heading font-black text-xl">
                <Cpu className="w-6 h-6 text-[#D95D39]" />
              </div>
              <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase font-semibold">
                Interactive Engineering Model
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <section
      id="projects"
      className="relative bg-[#1A1A1A] text-[#F5F2EB] py-24 lg:py-36 overflow-hidden border-b border-white/10 font-sans"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#D95D39]/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#D95D39]/8 rounded-full blur-[150px] pointer-events-none" />

      {/* Inner section container without restrictive z-10 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5F2EB] font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm relative z-20">
          <FolderKanban className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>FEATURED PORTFOLIO WORKS</span>
        </div>

        {/* Section Heading */}
        <div className="mb-16 relative z-20">
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Things I’ve <span className="text-[#D95D39]">built.</span>
          </h2>
          <p className="text-[#F5F2EB]/75 text-base sm:text-lg max-w-2xl mt-4">
            From live production platforms serving active customers to hardware kinematics and NLP models. Each project emphasizes clean architecture, responsiveness, and performance.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-12 relative z-20">
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
                  ? 'bg-[#D95D39] text-white border-[#D95D39] shadow-lg shadow-[#D95D39]/25 font-bold scale-105'
                  : 'bg-[#222222] text-[#F5F2EB]/80 border-white/10 hover:border-[#D95D39]/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid: 3D WebGL Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              onMouseEnter={() => {
                sound.playPop();
                setHoveredProjectId(project.id);
              }}
              onMouseLeave={() => setHoveredProjectId(null)}
              className="group relative bg-[#222222] rounded-2xl border border-white/10 hover:border-[#D95D39] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              {/* Burnt Orange Top Indicator Bar */}
              <div className="h-1.5 w-full bg-[#D95D39] opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                
                {/* 3D WebGL Preview Viewport */}
                <ThreeStage
                  stageId={`project-preview-${project.id}`}
                  factory={getProjectStageFactory(project.id)}
                  state={{ isHovered: hoveredProjectId === project.id }}
                  interactive="parallax"
                  fallback={renderAbstractGraphic(project.id)}
                  className="w-full h-36 rounded-xl bg-gradient-to-br from-[#201a18] via-[#1a1a1a] to-[#161a1e] border border-white/5 overflow-hidden"
                >
                  {project.id === 'zisti' && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 z-20 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE IN PRODUCTION
                    </div>
                  )}
                  {project.id === 'astrovedic' && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 z-20 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE CLIENT HUB
                    </div>
                  )}
                </ThreeStage>

                {/* Header Tag and Index */}
                <div className="relative z-20">
                  <div className="flex items-center justify-between mb-2.5 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium uppercase tracking-wider border ${
                      project.liveUrl
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/5 border-white/15 text-[#D95D39]'
                    }`}>
                      {project.liveUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {project.tag}
                    </span>
                    <span className="font-mono text-xs text-white/40 font-bold">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-white group-hover:text-[#D95D39] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-white/50 mt-1">
                    {project.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[#F5F2EB]/75 mt-3 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2 relative z-20">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-white/80 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-white/50 border border-white/10">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* Interactive Action Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-20">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(project)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-white/10 hover:bg-[#D95D39] text-white transition-all duration-200 border border-white/15 hover:border-[#D95D39]"
                  >
                    <Play className="w-3.5 h-3.5 text-[#D95D39] group-hover:text-white" />
                    <span>Open Interactive Demo</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600 text-white transition-all border border-white/10"
                        title="Visit Live Website"
                        aria-label="Visit Live Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={project.githubUrl || "https://github.com/yashwanth1224"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-all border border-white/10"
                      title="Source Code"
                      aria-label="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Modal View */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
