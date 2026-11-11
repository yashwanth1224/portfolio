import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import ThreeStage from '../three/ThreeStage.jsx';
import { createStudioDioramaStage } from '../three/stages/studioDioramaStage.js';
import { STUDIO_STATIONS, findStationById } from '../three/studioStations.js';
import { useScissorEngine } from '../three/ThreeCanvasProvider.jsx';
import { personalInfo } from '../data/portfolioData.js';
import { sound } from '../utils/audio.js';
import StudioFallbackGrid from './studio/StudioFallbackGrid.jsx';
import StudioCapsuleDock from './studio/StudioCapsuleDock.jsx';
import { StationPanelContent } from './studio/StationPanels.jsx';

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
  const [fps, setFps] = useState(60);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!engine) return undefined;
    engine.setTelemetryListener((t) => {
      if (typeof t?.fps === 'number') setFps(t.fps);
    });
    return () => engine.setTelemetryListener(null);
  }, [engine]);

  useEffect(() => sound.subscribe((muted) => setIsMuted(muted)), []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (typeof document !== 'undefined' && document.querySelector('[role="dialog"]')) {
        return;
      }
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.isContentEditable
      ) {
        return;
      }

      if (e.key >= '1' && e.key <= '7') {
        const st = STUDIO_STATIONS[parseInt(e.key, 10) - 1];
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
    () => ({ activeStationId, isSpeaking, activeSkillCategory }),
    [activeStationId, isSpeaking, activeSkillCategory]
  );

  const handleStageInteract = (event) => {
    if (event?.type === 'select' && event.stationId) {
      sound.playClick();
      onSelectStation(event.stationId);
    }
  };

  const handleVoiceGreeting = () => {
    if (typeof window === 'undefined') return;
    if (!window.speechSynthesis) {
      sound.playChime();
      return;
    }
    window.speechSynthesis.cancel();
    const text = `Hi! I'm ${personalInfo.name}, a ${personalInfo.role} from ${personalInfo.location}. Welcome to my interactive 3D Studio Showroom.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    sound.playSuccess();
  };

  const handleCopyText = (field, text) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    sound.playSuccess();
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCloseToOverview = () => {
    sound.playPop();
    onSelectStation('overview');
  };

  const handleExitStudio = () => {
    sound.playNavChime('Scroll');
    onExitToScroll();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#2b140d] via-[#1a1311] to-[#121212] select-none">
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
            {fps || 60} FPS • 1 WebGL Context
          </div>
          <div className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-[#181818]/85 backdrop-blur-sm border border-white/10 font-mono text-[10px] text-[#F5F2EB]/60">
            Drag to Orbit • Keys 1-7 / Esc
          </div>
        </div>
      </div>

      <StudioCapsuleDock
        activeStationId={activeStationId}
        currentStation={currentStation}
        isMuted={isMuted}
        onSelectStation={onSelectStation}
        onExitStudio={handleExitStudio}
      />

      {/* Right Slide-in Accessible Detail Drawer */}
      {currentStation && (
        <aside
          role="complementary"
          aria-label={`${currentStation.title} Station Drawer`}
          className="fixed right-0 top-[72px] sm:top-20 bottom-0 w-full sm:w-[440px] lg:w-[500px] bg-[#141414]/95 backdrop-blur-2xl border-l border-white/15 z-30 flex flex-col shadow-2xl transition-all duration-300 ease-out pointer-events-auto"
        >
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
              onClick={handleCloseToOverview}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F5F2EB]/70 hover:text-white transition-colors"
              aria-label="Close station detail drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto select-text">
            <StationPanelContent
              stationId={activeStationId}
              onVoiceGreeting={handleVoiceGreeting}
              isSpeaking={isSpeaking}
              onOpenProject={onOpenProject}
              activeSkillCategory={activeSkillCategory}
              onSelectSkillCategory={setActiveSkillCategory}
              copiedField={copiedField}
              onCopy={handleCopyText}
            />
          </div>

          <div className="p-4 border-t border-white/10 bg-[#161616]/90 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCloseToOverview}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F5F2EB]/80 transition-colors"
            >
              Back to Overview<span className="hidden sm:inline"> [Esc]</span>
            </button>

            <button
              type="button"
              onClick={handleExitStudio}
              className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D95D39]/15 hover:bg-[#D95D39]/25 border border-[#D95D39]/40 text-xs font-mono font-semibold text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D95D39]" />
              <span>Exit 3D Studio</span>
            </button>

            <span className="hidden sm:inline font-mono text-[11px] text-[#F5F2EB]/40">
              Station {currentStation.index} / 7
            </span>
          </div>
        </aside>
      )}
    </div>
  );
}
