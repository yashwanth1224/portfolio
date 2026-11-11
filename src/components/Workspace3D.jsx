import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { sound } from '../utils/audio';
import ThreeStage from '../three/ThreeStage.jsx';
import { createHeroWorkspaceStage } from '../three/stages/heroWorkspaceStage.js';

const GREETING_SCRIPT = "Hi there! I'm Yashwanth, a frontend developer and software engineer based in Bengaluru. I craft high-performance, pixel-perfect web applications and have delivered live commercial platforms like Zisti and Astrovedic Jyotishya Kendra. Explore my work below!";
const SCRIPT_WORDS = GREETING_SCRIPT.split(/\s+/);

export default function Workspace3D() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const isSpeakingRef = useRef(false);
  const speechUtteranceRef = useRef(null);
  const fallbackIntervalRef = useRef(null);
  const hasStartedSpeechRef = useRef(false);
  const voicesRef = useRef([]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    return sound.subscribe(setIsMuted);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          voicesRef.current = availableVoices;
        }
      } catch {
        // Silently catch
      }
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  const playProceduralPhoneme = useCallback((word, index) => {
    try {
      sound.init();
      const ctx = sound.ctx;
      if (!ctx || sound.isMuted()) return;
      const now = ctx.currentTime;

      const baseFreq = 120 + Math.sin(index * 0.8) * 16;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.18);

      const formantF1 = ctx.createBiquadFilter();
      formantF1.type = 'bandpass';
      const f1Frequencies = [500, 680, 420, 560, 620];
      formantF1.frequency.setValueAtTime(f1Frequencies[index % f1Frequencies.length], now);
      formantF1.Q.setValueAtTime(4.2, now);

      const formantF2 = ctx.createBiquadFilter();
      formantF2.type = 'bandpass';
      const f2Frequencies = [1150, 1550, 1850, 1350, 1650];
      formantF2.frequency.setValueAtTime(f2Frequencies[index % f2Frequencies.length], now);
      formantF2.Q.setValueAtTime(5.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.042, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);

      osc.connect(formantF1);
      formantF1.connect(gain);
      osc.connect(formantF2);
      formantF2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.20);
    } catch {
      // AudioContext policy fallback
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentWordIndex(-1);
  }, []);

  const startSpeech = useCallback((isUserInitiated = true) => {
    stopSpeech();

    if (isUserInitiated && sound.isMuted()) {
      sound.toggleMute();
    } else if (!sound.isMuted()) {
      sound.init();
    }

    if (typeof window === 'undefined') return;

    const synth = window.speechSynthesis;
    let voiceSuccess = false;

    if (synth) {
      try {
        const utterance = new SpeechSynthesisUtterance(GREETING_SCRIPT);
        speechUtteranceRef.current = utterance;

        const availableVoices = (voicesRef.current && voicesRef.current.length > 0)
          ? voicesRef.current
          : synth.getVoices();

        const englishVoices = availableVoices.filter((v) => v.lang && v.lang.startsWith('en'));

        const preferredMaleNames = [
          'google uk english male',
          'microsoft guy online (natural)',
          'microsoft guy',
          'microsoft david online (natural)',
          'microsoft david',
          'microsoft mark online (natural)',
          'microsoft mark',
          'google us english',
          'english (america)+natural',
          'daniel',
          'alex',
          'en-us-neural2-d',
          'en-us-standard-b',
          'male',
        ];

        let chosenVoice = null;
        for (const pref of preferredMaleNames) {
          const match = englishVoices.find((v) => v.name.toLowerCase().includes(pref));
          if (match) {
            chosenVoice = match;
            break;
          }
        }

        if (!chosenVoice) {
          chosenVoice = englishVoices.find((v) => v.name.toLowerCase().includes('male'))
            || englishVoices[0]
            || availableVoices[0];
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        utterance.rate = 0.95;
        utterance.pitch = 0.98;

        let hasFiredBoundary = false;

        utterance.onstart = () => {
          hasStartedSpeechRef.current = true;
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setCurrentWordIndex(0);
        };

        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            hasFiredBoundary = true;
            const charIdx = e.charIndex;
            const textSoFar = GREETING_SCRIPT.substring(0, charIdx);
            const wordIdx = textSoFar.trim() === '' ? 0 : textSoFar.trim().split(/\s+/).length - 1;
            const safeIdx = Math.max(0, Math.min(wordIdx, SCRIPT_WORDS.length - 1));
            setCurrentWordIndex(safeIdx);
          }
        };

        utterance.onend = () => {
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
          }
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setCurrentWordIndex(-1);
        };

        utterance.onerror = () => {
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
          }
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setCurrentWordIndex(-1);
        };

        let simulatedIndex = 0;
        const totalDuration = 12500;
        const intervalTime = totalDuration / SCRIPT_WORDS.length;

        fallbackIntervalRef.current = setInterval(() => {
          if (!hasFiredBoundary) {
            simulatedIndex++;
            if (simulatedIndex < SCRIPT_WORDS.length) {
              setCurrentWordIndex(simulatedIndex);
            } else {
              if (fallbackIntervalRef.current) {
                clearInterval(fallbackIntervalRef.current);
                fallbackIntervalRef.current = null;
              }
            }
          }
        }, intervalTime);

        synth.speak(utterance);
        voiceSuccess = true;
      } catch (err) {
        console.warn('SpeechSynthesis error, using procedural fallback:', err);
      }
    }

    if (!voiceSuccess) {
      hasStartedSpeechRef.current = true;
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      let wordIdx = 0;

      fallbackIntervalRef.current = setInterval(() => {
        if (wordIdx < SCRIPT_WORDS.length) {
          setCurrentWordIndex(wordIdx);
          playProceduralPhoneme(SCRIPT_WORDS[wordIdx], wordIdx);
          wordIdx++;
        } else {
          stopSpeech();
        }
      }, 360);
    }
  }, [stopSpeech, playProceduralPhoneme]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const toggleSpeech = useCallback(() => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      startSpeech(true);
    }
  }, [isSpeaking, startSpeech, stopSpeech]);

  useEffect(() => {
    const handleExternalTrigger = () => {
      startSpeech(true);
    };

    window.addEventListener('trigger-avatar-speech', handleExternalTrigger);
    return () => {
      window.removeEventListener('trigger-avatar-speech', handleExternalTrigger);
    };
  }, [startSpeech]);

  useEffect(() => {
    const autoPlayTimer = setTimeout(() => {
      if (!hasStartedSpeechRef.current) {
        try {
          startSpeech(false);
        } catch {
          // Handled by user interaction
        }
      }
    }, 1000);

    const handleFirstGlobalInteraction = () => {
      if (!hasStartedSpeechRef.current) {
        startSpeech(true);
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', handleFirstGlobalInteraction);
      window.removeEventListener('pointerdown', handleFirstGlobalInteraction);
      window.removeEventListener('touchstart', handleFirstGlobalInteraction);
      window.removeEventListener('scroll', handleFirstGlobalInteraction);
      window.removeEventListener('keydown', handleFirstGlobalInteraction);
    };

    window.addEventListener('click', handleFirstGlobalInteraction, { passive: true });
    window.addEventListener('pointerdown', handleFirstGlobalInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstGlobalInteraction, { passive: true });
    window.addEventListener('scroll', handleFirstGlobalInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstGlobalInteraction, { passive: true });

    return () => {
      clearTimeout(autoPlayTimer);
      cleanupListeners();
    };
  }, [startSpeech]);

  const stageState = useMemo(
    () => ({
      isSpeaking,
      currentWordIndex,
    }),
    [isSpeaking, currentWordIndex]
  );

  return (
    <div
      id="workspace-3d-scene"
      className="relative w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* 3D Canvas Container routed through ScissorEngine */}
      <ThreeStage
        stageId="hero-workspace"
        factory={createHeroWorkspaceStage}
        state={stageState}
        interactive="parallax"
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="./avatar-3d.png"
              alt="Yashwanth S 3D Avatar"
              className="max-h-[85%] object-contain drop-shadow-2xl"
            />
          </div>
        }
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Prominent Floating Audio Unmute / Replay Trigger Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-auto">
        <button
          type="button"
          onClick={toggleSpeech}
          onMouseEnter={() => sound.playPop()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#1e0d08]/90 hover:bg-[#2b140b] text-white text-xs font-mono font-bold border border-[#D95D39]/40 hover:border-[#D95D39] shadow-xl shadow-black/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-[#D95D39] animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <Volume2 className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>
            {isSpeaking
              ? '🔊 Yashwanth is speaking • Click to pause'
              : '🔊 Yashwanth is speaking • Click to unmute / replay'}
          </span>
        </button>
      </div>

      {/* Synchronized Karaoke Word Subtitles & Equalizer Badge */}
      <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-4 z-20 transition-all duration-300">
        <div className="rounded-2xl bg-[#140b08]/92 backdrop-blur-xl border border-[#D95D39]/30 p-3 sm:p-3.5 shadow-2xl text-white">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSpeaking ? 'bg-[#D95D39] animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-mono font-bold tracking-wide text-white">
                Yashwanth (3D Avatar)
              </span>
            </div>

            {/* Bouncing Equalizer Bars */}
            <div className="flex items-end gap-1 h-3.5 px-2 py-0.5 rounded bg-black/60 border border-white/10">
              <span
                className={`w-0.5 bg-[#D95D39] rounded-full transition-all duration-150 ${
                  isSpeaking ? 'h-3 animate-pulse' : 'h-1'
                }`}
              />
              <span
                className={`w-0.5 bg-orange-400 rounded-full transition-all duration-150 ${
                  isSpeaking ? 'h-3.5' : 'h-1.5'
                }`}
              />
              <span
                className={`w-0.5 bg-amber-300 rounded-full transition-all duration-150 ${
                  isSpeaking ? 'h-2.5' : 'h-1'
                }`}
              />
              <span
                className={`w-0.5 bg-emerald-400 rounded-full transition-all duration-150 ${
                  isSpeaking ? 'h-3.5' : 'h-2'
                }`}
              />
            </div>
          </div>

          {/* Karaoke Subtitles */}
          <div className="text-xs leading-relaxed font-sans max-h-[85px] overflow-y-auto pr-1 select-text">
            {isSpeaking ? (
              <div className="flex flex-wrap">
                {SCRIPT_WORDS.map((word, idx) => {
                  const isCurrent = idx === currentWordIndex;
                  const isPast = idx < currentWordIndex;
                  return (
                    <span
                      key={idx}
                      className={`inline-block mr-1 my-0.5 transition-all duration-150 ${
                        isCurrent
                          ? 'text-white font-extrabold px-1.5 py-0.5 rounded-md bg-[#D95D39] shadow-[0_0_12px_rgba(217,93,57,0.9)] scale-105'
                          : isPast
                          ? 'text-white font-medium'
                          : 'text-white/40'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/80 italic text-xs leading-relaxed">
                "{GREETING_SCRIPT}"
              </p>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleSpeech}
              onMouseEnter={() => sound.playPop()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D95D39] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white shadow-md cursor-pointer transition-all active:scale-95"
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶ Play / Replay Voice</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.toggleMute();
                if (isSpeaking && sound.isMuted()) {
                  stopSpeech();
                }
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/50" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#D95D39]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
