import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Github, Sparkles, Star, Activity, Play, Pause, Gauge, Check, Globe, ShieldCheck, CheckCircle2, Copy, Zap } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import ThreeStage from '../three/ThreeStage.jsx';
import { createEngineSimStage } from '../three/stages/engineSimStage.js';

export default function ProjectModal({ project, isOpen, onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || !project) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[52] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl bg-obsidian-surface border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[calc(100vh-2rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-obsidian/70">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${project.liveUrl ? 'bg-emerald-400' : 'bg-coral'} animate-ping`} />
            <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${
              project.liveUrl ? 'text-emerald-400' : 'text-coral'
            }`}>
              {project.tag}
            </span>
            {project.liveUrl && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Online
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold tracking-wide uppercase transition-all shadow-md shadow-emerald-950/40"
              >
                <span>Launch Live Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cream/70 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              {project.title}
            </h3>
            <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Metrics ribbon */}
          <div className="grid grid-cols-3 gap-3">
            {project.metrics.map((m, idx) => (
              <div key={idx} className="bg-obsidian-card p-3 rounded-xl border border-white/10 text-center">
                <div className={`font-serif text-xl sm:text-2xl font-bold ${
                  project.liveUrl && m.label === 'STATUS' ? 'text-emerald-400' : 'text-coral'
                }`}>{m.value}</div>
                <div className="text-[11px] font-mono text-cream/60 uppercase mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          {/* DYNAMIC INTERACTIVE CONTENT BASED ON DEMO TYPE */}
          {project.demoType === 'live-website' && (
            <LiveWebsiteWidget project={project} />
          )}

          {project.demoType === 'sentiment-tester' && (
            <SentimentTesterWidget />
          )}

          {project.demoType === 'engine-sim' && (
            <EngineSimulatorWidget />
          )}

          {project.demoType === 'pneumatic-detail' && (
            <PneumaticDetailWidget />
          )}

          {/* Feature Highlights */}
          <div className="bg-obsidian-card/60 p-5 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-sm font-mono font-semibold text-cream uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral" />
              Key Architectural Highlights
            </h4>
            <ul className="space-y-2 text-sm text-cream/80">
              {project.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-coral font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack badges */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-cream/60 mb-2.5">
              Technologies & Frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-lg text-xs font-mono bg-white/5 text-cream border border-white/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  onMouseEnter={() => sound.playPop()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-950/40 hover:-translate-y-0.5"
                >
                  <Globe className="w-4 h-4" />
                  <span>Launch Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              )}

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playPop()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cream text-sm font-medium transition-colors border border-white/10"
              >
                <Github className="w-4 h-4" />
                <span>Inspect Source</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 text-cream/60" />
              </a>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-sky-500/25"
            >
              Close Window
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}

// 1. LIVE SENTIMENT ANALYSIS TESTER WIDGET
function SentimentTesterWidget() {
  const [inputText, setInputText] = useState(
    "The user interface is exceptionally smooth, intuitive, and blisteringly fast. Incredible attention to detail!"
  );
  const [sentimentResult, setSentimentResult] = useState(null);

  const analyzeSentiment = (text) => {
    const positiveWords = [
      'great', 'good', 'exceptional', 'fast', 'smooth', 'intuitive', 'incredible', 'love', 'amazing',
      'excellent', 'perfect', 'beautiful', 'clean', 'responsive', 'brilliant', 'solid', 'best',
      'innovative', 'masterpiece', 'wonder', 'friendly', 'high', 'delightful', 'outstanding', 'super'
    ];
    const negativeWords = [
      'bad', 'poor', 'slow', 'ugly', 'buggy', 'error', 'broken', 'terrible', 'worst', 'clunky',
      'difficult', 'horrible', 'crash', 'fail', 'flaw', 'hate', 'annoying', 'delayed', 'lag'
    ];

    const tokens = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let score = 0;
    const foundPositives = [];
    const foundNegatives = [];

    tokens.forEach((word) => {
      if (positiveWords.includes(word)) {
        score += 2;
        foundPositives.push(word);
      } else if (negativeWords.includes(word)) {
        score -= 2;
        foundNegatives.push(word);
      }
    });

    let starRating = 3;
    let label = 'Neutral';
    let color = 'text-amber-400';

    if (score > 3) {
      starRating = 5;
      label = 'Strongly Positive (5/5)';
      color = 'text-emerald-400';
    } else if (score > 0) {
      starRating = 4;
      label = 'Positive (4/5)';
      color = 'text-emerald-300';
    } else if (score === 0) {
      starRating = 3;
      label = 'Neutral Balanced (3/5)';
      color = 'text-amber-300';
    } else if (score >= -2) {
      starRating = 2;
      label = 'Slightly Negative (2/5)';
      color = 'text-orange-400';
    } else {
      starRating = 1;
      label = 'Critical Negative (1/5)';
      color = 'text-rose-500';
    }

    const wordCount = tokens.length;
    const charCount = text.length;

    return {
      score,
      starRating,
      label,
      color,
      wordCount,
      charCount,
      positives: [...new Set(foundPositives)],
      negatives: [...new Set(foundNegatives)],
    };
  };

  useEffect(() => {
    const res = analyzeSentiment(inputText);
    setSentimentResult(res);
  }, [inputText]);

  const handleTestEvaluation = () => {
    sound.playSuccess();
    if (sentimentResult && sentimentResult.starRating >= 4) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="bg-obsidian p-5 rounded-2xl border border-coral/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-coral animate-pulse" />
          <h4 className="font-mono text-sm font-bold text-cream uppercase tracking-wide">
            Interactive Sentiment Tester (Live Engine)
          </h4>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-coral/20 text-coral border border-coral/30">
          NLP Sandbox
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-cream/70">
          Enter any user review or feedback below to trigger real-time lexical inference:
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type any review here..."
          className="w-full bg-obsidian-surface border border-white/20 rounded-xl p-3 text-sm text-cream placeholder-cream/40 focus:outline-none focus:border-coral transition-colors font-sans"
        />
      </div>

      {sentimentResult && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0">
            <div className="flex items-center gap-1 text-amber-400 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= sentimentResult.starRating ? 'fill-amber-400 text-amber-400' : 'text-cream/20'
                  }`}
                />
              ))}
            </div>
            <span className={`font-mono text-xs font-bold ${sentimentResult.color}`}>
              {sentimentResult.label}
            </span>
          </div>

          <div className="sm:col-span-2 flex flex-col justify-center space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-cream/70">
              <span>Token Count: <strong className="text-cream">{sentimentResult.wordCount}</strong></span>
              <span>Polarity Score: <strong className={sentimentResult.color}>{sentimentResult.score > 0 ? `+${sentimentResult.score}` : sentimentResult.score}</strong></span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-cream/50 text-[11px]">Keywords:</span>
              {sentimentResult.positives.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] border border-emerald-500/30">
                  +{p}
                </span>
              ))}
              {sentimentResult.negatives.map((n) => (
                <span key={n} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] border border-rose-500/30">
                  -{n}
                </span>
              ))}
              {sentimentResult.positives.length === 0 && sentimentResult.negatives.length === 0 && (
                <span className="text-cream/40 italic text-[11px]">No polarized tokens matched</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleTestEvaluation}
        onMouseEnter={() => sound.playPop()}
        className="w-full py-2.5 rounded-xl bg-coral hover:bg-terracotta text-white font-mono text-xs font-semibold tracking-wider uppercase transition-colors shadow-lg shadow-coral/20"
      >
        Re-Evaluate & Trigger Confetti Burst 🎉
      </button>
    </div>
  );
}

// 2. 2D ENGINE SCHEMATIC FALLBACK COMPONENT
function EngineSchematicFallback({ rpm, isRunning, initialStrokeLabel = 'Power Stroke' }) {
  return (
    <div className="w-full h-[240px] rounded-xl bg-obsidian-surface/60 border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
      <div className="relative w-20 h-28 border-2 border-dashed border-[#38bdf8]/50 rounded-lg flex flex-col items-center justify-between p-2">
        <div className="w-3 h-2 bg-[#D95D39] rounded-t-sm" />
        <div className="w-14 h-8 bg-[#D95D39]/80 rounded border border-[#D95D39] shadow-md flex items-center justify-center text-[10px] font-mono text-white font-bold">
          PISTON
        </div>
        <div className="w-1 h-10 bg-white/40 rounded-full" />
        <div className="w-6 h-6 rounded-full border-2 border-[#D95D39] flex items-center justify-center text-[8px] font-mono text-cream/70">
          CRK
        </div>
      </div>
      <div className="space-y-1">
        <div className="font-mono text-xs text-white/90 font-semibold">
          {isRunning ? `Running at ${rpm} RPM` : 'Engine Simulation Paused'}
        </div>
        <div className="text-[11px] font-mono text-[#D95D39]">
          {isRunning ? `4-Stroke Cycle • ${initialStrokeLabel}` : 'Simulation Paused'}
        </div>
      </div>
    </div>
  );
}

// 3. INTERACTIVE 3D ENGINE MECHANISM SIMULATOR WIDGET (Migrated to ThreeStage)
function EngineSimulatorWidget() {
  const [rpm, setRpm] = useState(1800);
  const [isRunning, setIsRunning] = useState(true);
  const [initialStrokeLabel] = useState('Power Stroke');
  const strokeBadgeRef = useRef(null);

  const engineState = useMemo(() => ({ rpm, isRunning }), [rpm, isRunning]);

  const handleEngineInteract = (event) => {
    if (event?.type === 'telemetry' && event.strokeLabel && strokeBadgeRef.current) {
      strokeBadgeRef.current.textContent = event.strokeLabel;
    }
  };

  return (
    <div className="bg-obsidian p-4 rounded-2xl border border-white/15 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-coral" />
          <h4 className="font-mono text-sm font-bold text-cream uppercase">
            3D WebGL Kinematic Mechanism
          </h4>
        </div>
        <span
          ref={strokeBadgeRef}
          className="text-xs font-mono text-coral bg-coral/10 px-2.5 py-1 rounded-full border border-coral/30"
        >
          {initialStrokeLabel}
        </span>
      </div>

      {/* 3D WebGL Engine Simulation Viewport */}
      <ThreeStage
        stageId="modal-engine-sim"
        layer="modal"
        factory={createEngineSimStage}
        state={engineState}
        interactive="orbit-xy"
        onInteract={handleEngineInteract}
        fallback={
          <EngineSchematicFallback
            rpm={rpm}
            isRunning={isRunning}
            initialStrokeLabel={initialStrokeLabel}
          />
        }
        className="w-full h-[240px] rounded-xl bg-obsidian-surface/60 cursor-grab active:cursor-grabbing"
      />

      {/* RPM controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            sound.playClick();
            setIsRunning(!isRunning);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-cream"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-coral" />}
          <span>{isRunning ? 'Pause Engine' : 'Start Simulation'}</span>
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <span className="text-xs font-mono text-cream/70 whitespace-nowrap">RPM: {rpm}</span>
          <input
            type="range"
            min="600"
            max="4800"
            step="200"
            value={rpm}
            onChange={(e) => setRpm(Number(e.target.value))}
            className="w-full accent-coral cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// 4. PNEUMATIC MOBILITY SCHEMATIC WIDGET
function PneumaticDetailWidget() {
  return (
    <div className="bg-obsidian p-5 rounded-2xl border border-white/15 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-coral font-bold uppercase tracking-wider">
          Pneumatic Telemetry & Control Architecture
        </span>
        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
          Zero Emissions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-cream/80">
        <div className="bg-obsidian-surface p-3 rounded-xl border border-white/10 space-y-1">
          <div className="text-coral font-semibold">1. Regulated Reservoir</div>
          <p className="text-[11px] text-cream/70">
            Compressed air storage vessel (200 PSI) with primary stepped pressure regulator down to 60 PSI for motor intake.
          </p>
        </div>
        <div className="bg-obsidian-surface p-3 rounded-xl border border-white/10 space-y-1">
          <div className="text-coral font-semibold">2. Arduino Solenoid Hub</div>
          <p className="text-[11px] text-cream/70">
            Microcontroller driving high-frequency digital solenoid valves with PWM pulsing based on accelerator hall-effect inputs.
          </p>
        </div>
        <div className="bg-obsidian-surface p-3 rounded-xl border border-white/10 space-y-1">
          <div className="text-coral font-semibold">3. Vane Actuator Drive</div>
          <p className="text-[11px] text-cream/70">
            Rotary pneumatic actuator coupled directly to rear axle with safety directional check valves.
          </p>
        </div>
        <div className="bg-obsidian-surface p-3 rounded-xl border border-white/10 space-y-1">
          <div className="text-coral font-semibold">4. Auto-Cutoff Logic</div>
          <p className="text-[11px] text-cream/70">
            Pressure sensor safety cutoff and thermal relief bypass valve preventing over-expansion or seal leakage.
          </p>
        </div>
      </div>
    </div>
  );
}

// 5. LIVE PRODUCTION WEBSITE SHOWCASE WIDGET
function LiveWebsiteWidget({ project }) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (project.liveUrl) {
      navigator.clipboard.writeText(project.liveUrl);
      setCopied(true);
      sound.playSuccess();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isZisti = project.id === 'zisti';

  return (
    <div className="bg-obsidian rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl space-y-0">
      {/* Mock Browser Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-obsidian-surface border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-cream/50 pl-2">
            Secure Production Environment
          </span>
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1 bg-obsidian rounded-full border border-white/15 text-xs font-mono max-w-full sm:max-w-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 text-[11px] font-semibold">https://</span>
          <span className="text-cream/90 truncate">{project.liveUrl?.replace('https://', '')}</span>
          <button
            onClick={handleCopyUrl}
            title="Copy URL"
            className="ml-1 text-cream/50 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Verified Status Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status: 200 OK Live</span>
        </div>
      </div>

      {/* Showcase Body */}
      <div className="p-6 sm:p-7 space-y-6 bg-gradient-to-b from-obsidian-card via-obsidian-surface to-obsidian">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isZisti ? "India's New Food Delivery Platform" : "Sidereal Vedic Kundli & Booking Hub"}</span>
            </div>
            
            <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {project.title}
            </h4>
            
            <p className="text-cream/75 text-sm leading-relaxed">
              {isZisti
                ? "Experience the live food ordering web application with lightning-fast restaurant discovery, menu exploration, and fluid mobile-first responsiveness."
                : "Explore the live sidereal Vedic astrology portal with real-time Kundli generation, Navamsa computations, interactive cosmic visualizers, and astrologer booking."}
            </p>
          </div>

          {/* Quick-action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playPop()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-0.5"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={handleCopyUrl}
              onMouseEnter={() => sound.playPop()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cream/80 text-xs font-mono border border-white/10 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">URL Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Web Address</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Architecture Spec Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Latency</span>
            </div>
            <div className="font-serif font-bold text-lg text-white">Edge CDN &lt; 100ms</div>
            <p className="text-[11px] font-mono text-cream/60">Sub-second load times & SSL secured</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-coral font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Production</span>
            </div>
            <div className="font-serif font-bold text-lg text-white">Active Users</div>
            <p className="text-[11px] font-mono text-cream/60">Delivering value in commercial production</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Stack</span>
            </div>
            <div className="font-serif font-bold text-lg text-white">{isZisti ? 'React 18 + Vite' : 'Next.js + Ephemeris'}</div>
            <p className="text-[11px] font-mono text-cream/60">Tailwind CSS & Modular UI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
