import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Layers,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  Github,
  Globe,
  FileDown,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Trophy,
  Cpu,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import ThreeStage from '../three/ThreeStage.jsx';
import { createStudioDioramaStage } from '../three/stages/studioDioramaStage.js';
import {
  STUDIO_STATIONS,
  findStationById,
} from '../three/studioStations.js';
import { useScissorEngine } from '../three/ThreeCanvasProvider.jsx';
import {
  personalInfo,
  experiences,
  projects,
  skillCategories,
  certifications,
} from '../data/portfolioData.js';
import { sound } from '../utils/audio.js';

/**
 * Fullscreen 3D Studio Diorama Mode Overlay.
 * Integrates single-context WebGL diorama with HUD telemetry, capsule dock, and accessible drawer.
 *
 * @param {Object} props
 * @param {string} [props.activeStationId='overview']
 * @param {(stationId: string) => void} props.onSelectStation
 * @param {() => void} props.onExitToScroll
 * @param {(project: Object) => void} props.onOpenProject
 */
export default function StudioModeOverlay({
  activeStationId = 'overview',
  onSelectStation,
  onExitToScroll,
  onOpenProject,
}) {
  const { engine } = useScissorEngine();
  const [telemetry, setTelemetry] = useState({ fps: 60, frameMs: 16.6 });
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  // Subscribe to engine telemetry for real-time 1Hz FPS telemetry badge
  useEffect(() => {
    if (!engine) return;
    engine.setTelemetryListener((t) => {
      setTelemetry(t);
    });
    return () => {
      engine.setTelemetryListener(null);
    };
  }, [engine]);

  // Subscribe to global sound mute changes
  useEffect(() => {
    const unsub = sound.subscribe((muted) => setIsMuted(muted));
    return unsub;
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.isContentEditable
      ) {
        return;
      }

      if (e.key >= '1' && e.key <= '7') {
        const idx = parseInt(e.key, 10);
        const st = STUDIO_STATIONS[idx - 1];
        if (st) {
          sound.playClick();
          onSelectStation(st.id);
        }
      } else if (e.key === '0' || e.key === 'Escape') {
        sound.playPop();
        onSelectStation('overview');
      } else if (e.key === 'm' || e.key === 'M') {
        sound.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectStation]);

  const currentStation = useMemo(
    () => (activeStationId === 'overview' ? null : findStationById(activeStationId)),
    [activeStationId]
  );

  const studioState = useMemo(
    () => ({
      activeStationId,
      isSpeaking,
    }),
    [activeStationId, isSpeaking]
  );

  const handleStageInteract = (event) => {
    if (event?.type === 'select' && event.stationId) {
      sound.playClick();
      onSelectStation(event.stationId);
    }
  };

  const handleVoiceGreeting = () => {
    if (typeof window === 'undefined') return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const text =
        "Hi! I'm Yashwanth S, a Frontend Developer and Software Engineer from Bengaluru, India. Welcome to my interactive 3D Studio Showroom.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      sound.playSuccess();
    } else {
      sound.playChime();
    }
  };

  const handleCopyText = (field, text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      sound.playSuccess();
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#2b140d] via-[#1a1311] to-[#121212] select-none">
      {/* 3D WebGL Diorama Viewport Canvas Anchor */}
      <ThreeStage
        stageId="studio-diorama"
        factory={createStudioDioramaStage}
        state={studioState}
        interactive="orbit-xy"
        onInteract={handleStageInteract}
        fallback={<StudioFallbackGrid onSelectStation={onSelectStation} />}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-Left HUD Badge */}
      <div className="absolute top-20 left-4 sm:left-6 z-30 pointer-events-auto flex flex-col gap-2 max-w-sm">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#181818]/90 backdrop-blur-md border border-white/10 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-[#D95D39] animate-pulse" />
          <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
            {currentStation
              ? `${currentStation.label} • ${currentStation.title}`
              : 'Isometric Showroom • Overview'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md bg-[#181818]/85 backdrop-blur-sm border border-white/10 font-mono text-[11px] text-[#D95D39] font-semibold">
            {telemetry.fps || 60} FPS • 1 WebGL Context
          </div>
          <div className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-[#181818]/85 backdrop-blur-sm border border-white/10 font-mono text-[10px] text-[#F5F2EB]/60">
            Drag to Orbit • Keys 1-7 / Esc
          </div>
        </div>
      </div>

      {/* Bottom Capsule HUD Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[96vw] overflow-x-auto custom-scrollbar pb-1">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/15 shadow-2xl">
          {/* Overview button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectStation('overview');
            }}
            onMouseEnter={() => sound.playPop()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              activeStationId === 'overview'
                ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/30 font-bold'
                : 'text-[#F5F2EB]/75 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Overview (0)</span>
          </button>

          <span className="w-px h-5 bg-white/15 mx-0.5" />

          {/* 7 Station Pills */}
          {STUDIO_STATIONS.map((station) => {
            const isActive = activeStationId === station.id;
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectStation(station.id);
                }}
                onMouseEnter={() => sound.playPop()}
                title={`${station.label}: ${station.title}`}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/30 font-bold'
                    : 'text-[#F5F2EB]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="opacity-60 text-[10px]">[{station.index}]</span>
                <span className="hidden sm:inline">{station.badge}</span>
                <span className="sm:hidden">{station.label.replace('Station ', 'S')}</span>
              </button>
            );
          })}

          <span className="w-px h-5 bg-white/15 mx-0.5" />

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.toggleMute();
            }}
            onMouseEnter={() => sound.playPop()}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio (M)'}
            className="p-2 rounded-xl text-[#F5F2EB]/70 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 opacity-50" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#D95D39] animate-pulse" />
            )}
          </button>

          {/* Exit to 3D Scroll Button */}
          <button
            type="button"
            onClick={() => {
              sound.playNavChime('Scroll');
              onExitToScroll();
            }}
            onMouseEnter={() => sound.playPop()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-medium transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D95D39]" />
            <span className="whitespace-nowrap">Exit to 3D Scroll</span>
          </button>
        </div>
      </div>

      {/* Right Slide-in Accessible Detail Drawer */}
      {currentStation && (
        <aside
          role="complementary"
          aria-label={`${currentStation.title} Station Drawer`}
          className="fixed right-0 top-[72px] sm:top-20 bottom-0 w-full sm:w-[440px] lg:w-[500px] bg-[#141414]/95 backdrop-blur-2xl border-l border-white/15 z-30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 pointer-events-auto"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D95D39] animate-ping" />
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#D95D39] font-bold">
                  {currentStation.label} • {currentStation.badge}
                </span>
                <h2 className="font-serif text-lg font-bold text-white leading-tight">
                  {currentStation.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onSelectStation('overview');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F5F2EB]/70 hover:text-white transition-colors"
              aria-label="Close station detail drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar select-text">
            {activeStationId === 'hero-avatar' && (
              <StationHeroAvatarContent
                onVoiceGreeting={handleVoiceGreeting}
                isSpeaking={isSpeaking}
              />
            )}

            {activeStationId === 'about-lab' && <StationAboutLabContent />}

            {activeStationId === 'experience-helix' && <StationExperienceHelixContent />}

            {activeStationId === 'project-gallery' && (
              <StationProjectGalleryContent onOpenProject={onOpenProject} />
            )}

            {activeStationId === 'skills-reactor' && (
              <StationSkillsReactorContent
                activeCategory={activeSkillCategory}
                onSelectCategory={setActiveSkillCategory}
              />
            )}

            {activeStationId === 'achievements-vitrine' && <StationAchievementsContent />}

            {activeStationId === 'contact-terminal' && (
              <StationContactTerminalContent
                copiedField={copiedField}
                onCopy={handleCopyText}
              />
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10 bg-[#161616]/90 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onSelectStation('overview');
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F5F2EB]/80 transition-colors"
            >
              Back to Overview [Esc]
            </button>

            <span className="font-mono text-[11px] text-[#F5F2EB]/40">
              Station {currentStation.index} / 7
            </span>
          </div>
        </aside>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 1: AVATAR & WORKSPACE
// ---------------------------------------------------------------------------
function StationHeroAvatarContent({ onVoiceGreeting, isSpeaking }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D95D39]/15 border border-[#D95D39]/30 text-[#D95D39] text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{personalInfo.status}</span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-white">{personalInfo.name}</h3>
        <p className="font-mono text-xs text-[#D95D39]">{personalInfo.role}</p>
        <p className="text-sm text-[#F5F2EB]/80 leading-relaxed pt-1">{personalInfo.bio}</p>
      </div>

      {/* Voice Synthesizer & Resume Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onVoiceGreeting}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-md ${
            isSpeaking
              ? 'bg-[#D95D39] text-white animate-pulse'
              : 'bg-[#D95D39] hover:bg-[#c44e2c] text-white shadow-[#D95D39]/25'
          }`}
        >
          <span>{isSpeaking ? 'Speaking...' : '🔊 Play Voice Greeting'}</span>
        </button>

        <a
          href={personalInfo.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          download="Yashwanth_Resume.pdf"
          onClick={() => sound.playSuccess()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-medium transition-colors border border-white/10"
        >
          <FileDown className="w-4 h-4 text-[#D95D39]" />
          <span>Resume PDF</span>
        </a>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {personalInfo.stats.map((s, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-[#F5F2EB]/60 uppercase">{s.label}</span>
            <div className="font-serif text-sm font-bold text-white">{s.value}</div>
            <div className="text-[11px] font-mono text-[#D95D39]">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 2: ENGINEERING MORPH LAB
// ---------------------------------------------------------------------------
function StationAboutLabContent() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Mechanical Rigor → Modern React</span>
        </div>
        <p className="text-sm text-[#F5F2EB]/80 leading-relaxed">
          Graduated in Mechanical Engineering from East West Institute of Technology (VTU) with First
          Class with Distinction (8.2 CGPA equivalent), then transitioned analytical problem-solving
          and systems modeling directly into modern full-stack and frontend React engineering at
          JSPIDERS.
        </p>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5">
          <div className="font-serif text-xl font-bold text-[#D95D39]">8.2 CGPA</div>
          <div className="text-[11px] font-mono text-[#F5F2EB]/70">First Class Distinction</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5">
          <div className="font-serif text-xl font-bold text-emerald-400">2 Live</div>
          <div className="text-[11px] font-mono text-[#F5F2EB]/70">Commercial Platforms</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5">
          <div className="font-serif text-xl font-bold text-amber-400">4 Years</div>
          <div className="text-[11px] font-mono text-[#F5F2EB]/70">Applied Engineering</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5">
          <div className="font-serif text-xl font-bold text-sky-400">100%</div>
          <div className="text-[11px] font-mono text-[#F5F2EB]/70">Fluid Kinematics</div>
        </div>
      </div>

      {/* Capstone Highlights */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
        <h4 className="font-mono text-xs font-bold text-[#D95D39] uppercase tracking-wider">
          Engineering Capstones
        </h4>
        <ul className="space-y-2 text-xs text-[#F5F2EB]/80">
          <li className="flex items-start gap-2">
            <span className="text-[#D95D39] font-bold">•</span>
            <span>
              <strong>Pneumatic Bicycle (2023):</strong> Zero-emission vehicle driven by inversion of
              slider-crank mechanism and Arduino solenoid timing.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D95D39] font-bold">•</span>
            <span>
              <strong>Transparent IC Engine Simulation (2022):</strong> 4-stroke kinematic mechanism
              with WebGL dynamic simulation and transparent display casing.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 3: CAREER DOUBLE HELIX
// ---------------------------------------------------------------------------
function StationExperienceHelixContent() {
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-[#D95D39] uppercase tracking-wider font-semibold">
        Reverse-Chronological Milestones
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-serif text-base font-bold text-white">{exp.role}</h4>
                <div className="font-mono text-xs text-[#D95D39]">{exp.company}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#F5F2EB]/80 shrink-0">
                {exp.period}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-[#F5F2EB]/75">
              {exp.highlights.slice(0, 3).map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#D95D39] font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {exp.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#F5F2EB]/70 border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 4: PROJECT ARTIFACT GALLERY
// ---------------------------------------------------------------------------
function StationProjectGalleryContent({ onOpenProject }) {
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-[#D95D39] uppercase tracking-wider font-semibold">
        Shipped Platforms & Interactive Simulators
      </div>

      <div className="space-y-4">
        {projects.map((proj) => (
          <div key={proj.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      proj.liveUrl ? 'bg-emerald-400' : 'bg-[#D95D39]'
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] uppercase font-bold ${
                      proj.liveUrl ? 'text-emerald-400' : 'text-[#D95D39]'
                    }`}
                  >
                    {proj.tag}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-white mt-0.5">{proj.title}</h4>
                <p className="text-xs text-[#F5F2EB]/70 leading-relaxed mt-1 line-clamp-2">
                  {proj.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenProject(proj);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D95D39] hover:bg-[#c44e2c] text-white font-mono text-xs font-semibold tracking-wide uppercase transition-colors shadow-sm"
              >
                <span>Open Interactive Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-mono text-xs transition-colors border border-emerald-500/40"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Site</span>
                </a>
              )}

              {proj.githubUrl && (
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F2EB]/80 font-mono text-xs transition-colors border border-white/10"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 5: SKILLS REACTOR
// ---------------------------------------------------------------------------
function StationSkillsReactorContent({ activeCategory, onSelectCategory }) {
  const currentCat = skillCategories[activeCategory] || skillCategories[0];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
        {skillCategories.map((cat, idx) => (
          <button
            key={cat.category}
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectCategory(idx);
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              activeCategory === idx
                ? 'bg-[#D95D39] text-white shadow-sm font-semibold'
                : 'text-[#F5F2EB]/70 hover:text-white'
            }`}
          >
            {cat.category.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <div>
          <h4 className="font-serif text-base font-bold text-white">{currentCat.category}</h4>
          <p className="text-xs font-mono text-[#D95D39]">{currentCat.description}</p>
        </div>

        <div className="space-y-2.5 pt-2">
          {currentCat.skills.map((skill) => (
            <div key={skill.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-medium">{skill.name}</span>
                <span className="text-[#D95D39] font-bold">{skill.level}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D95D39] to-amber-400"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50">{skill.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spoken Languages & Interests */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
        <h5 className="font-mono text-xs font-bold text-[#F5F2EB]/70 uppercase">
          Languages & Interests
        </h5>
        <div className="flex flex-wrap gap-1.5">
          {personalInfo.languages.map((l) => (
            <span
              key={l.name}
              className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-mono text-white border border-white/10"
            >
              {l.name} ({l.tag})
            </span>
          ))}
          {personalInfo.interests.map((it) => (
            <span
              key={it.name}
              className="px-2.5 py-1 rounded-md bg-[#D95D39]/15 text-[11px] font-mono text-[#D95D39] border border-[#D95D39]/30"
            >
              {it.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 6: HONORS & CERTIFICATIONS VITRINE
// ---------------------------------------------------------------------------
function StationAchievementsContent() {
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-[#D95D39] uppercase tracking-wider font-semibold">
        Athletic & Engineering Credentials
      </div>

      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#D95D39]">
                  {cert.badge}
                </span>
                <h4 className="font-serif text-sm sm:text-base font-bold text-white mt-0.5">
                  {cert.title}
                </h4>
                <div className="font-mono text-xs text-[#F5F2EB]/60">{cert.issuer}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white shrink-0">
                {cert.year}
              </span>
            </div>

            <p className="text-xs text-[#F5F2EB]/75 leading-relaxed">{cert.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATION 7: CONTACT & TELEMETRY BEACON
// ---------------------------------------------------------------------------
function StationContactTerminalContent({ copiedField, onCopy }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>Active & Available for Work</span>
        </div>
        <p className="text-sm text-[#F5F2EB]/80 leading-relaxed">
          Open to full-time frontend engineering roles in Bengaluru or remote worldwide. Direct
          channels:
        </p>
      </div>

      {/* Copyable Contact Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#D95D39]" />
            <div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50 uppercase">Email Address</div>
              <div className="font-mono text-xs text-white font-medium">{personalInfo.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCopy('email', personalInfo.email)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Copy email"
          >
            {copiedField === 'email' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#D95D39]" />
            <div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50 uppercase">Phone & WhatsApp</div>
              <div className="font-mono text-xs text-white font-medium">{personalInfo.phone}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCopy('phone', personalInfo.phone)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Copy phone"
          >
            {copiedField === 'phone' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#D95D39]" />
            <div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50 uppercase">Base Coordinates</div>
              <div className="font-mono text-xs text-white font-medium">
                {personalInfo.location} (PIN {personalInfo.postalCode})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <a
          href={personalInfo.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white transition-colors"
        >
          <span>LinkedIn</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D95D39]" />
        </a>

        <a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub</span>
        </a>
      </div>

      <a
        href={`mailto:${personalInfo.email}?subject=Frontend%20Developer%20Inquiry%20-%20Yashwanth%20S`}
        onClick={() => sound.playSuccess()}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D95D39] hover:bg-[#c44e2c] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#D95D39]/25"
      >
        <Mail className="w-4 h-4" />
        <span>Dispatch Direct Email</span>
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2D ACCESSIBLE FALLBACK GRID
// ---------------------------------------------------------------------------
function StudioFallbackGrid({ onSelectStation }) {
  return (
    <div className="w-full h-full p-6 sm:p-12 overflow-y-auto flex flex-col items-center justify-center bg-[#121212] text-center space-y-6">
      <div className="max-w-xl space-y-2">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          3D Studio Showroom Stations
        </h3>
        <p className="font-mono text-xs text-[#F5F2EB]/70">
          Hardware acceleration unavailable or reduced motion active. Select any station below:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl w-full">
        {STUDIO_STATIONS.map((station) => (
          <button
            key={station.id}
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectStation(station.id);
            }}
            className="p-4 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 text-left transition-colors space-y-1"
          >
            <span className="text-[10px] font-mono text-[#D95D39] font-bold">
              {station.label} • {station.badge}
            </span>
            <div className="font-serif text-base font-bold text-white">{station.title}</div>
            <div className="text-xs text-[#F5F2EB]/60">{station.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
