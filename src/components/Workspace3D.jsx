import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Sparkles, Play, Pause } from 'lucide-react';
import { sound } from '../utils/audio';

const GREETING_SCRIPT = "Hi there! I'm Yashwanth, a frontend developer and software engineer based in Bengaluru. I craft high-performance, pixel-perfect web applications and have delivered live commercial platforms like Zisti and Astrovedic Jyotishya Kendra. Explore my work below!";
const SCRIPT_WORDS = GREETING_SCRIPT.split(/\s+/);

export default function Workspace3D() {
  const mountRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // References to synchronize state with Three.js 60fps animation loop
  const isSpeakingRef = useRef(false);
  const wordProgressRef = useRef(0);
  const speechUtteranceRef = useRef(null);
  const fallbackIntervalRef = useRef(null);
  const hasStartedSpeechRef = useRef(false);
  const voicesRef = useRef([]);

  // Synchronize ref with state
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Load and cache voices when SpeechSynthesis is available
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

  // Enhanced Procedural Web Audio fallback voice synth (with male formant filters & vocal tract resonance)
  const playProceduralPhoneme = useCallback((word, index) => {
    try {
      sound.init();
      const ctx = sound.ctx;
      if (!ctx || sound.isMuted()) return;
      const now = ctx.currentTime;

      // Natural male vocal cord fundamental pitch (~120Hz to 140Hz)
      const baseFreq = 120 + Math.sin(index * 0.8) * 16;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.18);

      // Male vocal formant filter F1 (Vocal tract resonance: 450Hz - 700Hz)
      const formantF1 = ctx.createBiquadFilter();
      formantF1.type = 'bandpass';
      const f1Frequencies = [500, 680, 420, 560, 620];
      formantF1.frequency.setValueAtTime(f1Frequencies[index % f1Frequencies.length], now);
      formantF1.Q.setValueAtTime(4.2, now);

      // Male vocal formant filter F2 (Oral cavity resonance: 1100Hz - 1800Hz)
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

  // Stop speaking helper
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

  // Start speaking greeting
  const startSpeech = useCallback((isUserInitiated = true) => {
    if (isUserInitiated) {
      setHasInteracted(true);
    }
    setShowSpeechBubble(true);
    stopSpeech();

    // Ensure audio context is ready
    if (sound.isMuted()) {
      sound.toggleMute();
    } else {
      sound.init();
    }

    if (typeof window === 'undefined') return;

    const synth = window.speechSynthesis;
    let voiceSuccess = false;

    if (synth) {
      try {
        const utterance = new SpeechSynthesisUtterance(GREETING_SCRIPT);
        speechUtteranceRef.current = utterance;

        // Enhanced natural male voice selection across platforms
        const availableVoices = (voicesRef.current && voicesRef.current.length > 0)
          ? voicesRef.current
          : synth.getVoices();

        const englishVoices = availableVoices.filter(v => v.lang && v.lang.startsWith('en'));

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
          'male'
        ];

        let chosenVoice = null;
        for (const pref of preferredMaleNames) {
          const match = englishVoices.find(v => v.name.toLowerCase().includes(pref));
          if (match) {
            chosenVoice = match;
            break;
          }
        }

        if (!chosenVoice) {
          chosenVoice = englishVoices.find(v => v.name.toLowerCase().includes('male'))
            || englishVoices[0]
            || availableVoices[0];
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        // Charismatic 0.95 pacing & natural male pitch
        utterance.rate = 0.95;
        utterance.pitch = 0.98;

        let hasFiredBoundary = false;

        utterance.onstart = () => {
          hasStartedSpeechRef.current = true;
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setCurrentWordIndex(0);
          wordProgressRef.current = 0;
        };

        // Synchronize karaoke word highlighting on speech boundary
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            hasFiredBoundary = true;
            const charIdx = e.charIndex;
            const textSoFar = GREETING_SCRIPT.substring(0, charIdx);
            const wordIdx = textSoFar.trim() === '' ? 0 : textSoFar.trim().split(/\s+/).length - 1;
            const safeIdx = Math.max(0, Math.min(wordIdx, SCRIPT_WORDS.length - 1));
            setCurrentWordIndex(safeIdx);
            wordProgressRef.current = safeIdx;
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

        // Fallback progress interval: if onboundary is not supported by browser, advance smoothly
        let simulatedIndex = 0;
        const totalDuration = 12500; // ~12.5 seconds for ~36 words at 0.95 rate
        const intervalTime = totalDuration / SCRIPT_WORDS.length;

        fallbackIntervalRef.current = setInterval(() => {
          if (!hasFiredBoundary) {
            simulatedIndex++;
            if (simulatedIndex < SCRIPT_WORDS.length) {
              setCurrentWordIndex(simulatedIndex);
              wordProgressRef.current = simulatedIndex;
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

    // Procedural voice fallback if SpeechSynthesis is not supported or was blocked
    if (!voiceSuccess) {
      hasStartedSpeechRef.current = true;
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      let wordIdx = 0;

      fallbackIntervalRef.current = setInterval(() => {
        if (wordIdx < SCRIPT_WORDS.length) {
          setCurrentWordIndex(wordIdx);
          wordProgressRef.current = wordIdx;
          playProceduralPhoneme(SCRIPT_WORDS[wordIdx], wordIdx);
          wordIdx++;
        } else {
          stopSpeech();
        }
      }, 360);
    }
  }, [stopSpeech, playProceduralPhoneme]);

  // Toggle speech greeting
  const toggleSpeech = useCallback(() => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      startSpeech(true);
    }
  }, [isSpeaking, startSpeech, stopSpeech]);

  // Listen for external trigger from Hero.jsx action buttons
  useEffect(() => {
    const handleExternalTrigger = () => {
      startSpeech(true);
    };

    window.addEventListener('trigger-avatar-speech', handleExternalTrigger);
    return () => {
      window.removeEventListener('trigger-avatar-speech', handleExternalTrigger);
    };
  }, [startSpeech]);

  // Autoplay Handling with interaction listeners
  useEffect(() => {
    const autoPlayTimer = setTimeout(() => {
      if (!hasStartedSpeechRef.current) {
        try {
          startSpeech(false);
        } catch {
          // Handled by user interaction
        }
      }
    }, 900);

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

  // =========================================================================
  // Three.js 3D Interactive Stage with Centered 3D Avatar & Futuristic Pedestal
  // =========================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let mainGroup = new THREE.Group();
    let deskGroup = new THREE.Group();
    let pedestalGroup = new THREE.Group();
    let avatarGroup = new THREE.Group();
    let acousticRingsGroup = new THREE.Group();
    let floatingTechOrbs = [];
    let codeTextureCanvas, codeTextureContext, codeTexture;
    let particlesMesh;
    let resizeObserver;

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    try {
      const width = container.clientWidth || 700;
      const height = container.clientHeight || 560;

      // 1. Scene & Perspective Camera (Centered Stage)
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.45, 4.4);
      camera.lookAt(0, 0.25, 0);

      // 2. WebGL Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // 3. Lighting Setup (Atmospheric Key, Cyan & Cobalt Rims, Burnt Orange Accent)
      const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.95);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
      mainLight.position.set(2.5, 5, 4);
      mainLight.castShadow = true;
      scene.add(mainLight);

      // Cobalt blue rim light
      const rimLightCobalt = new THREE.PointLight(0x2563eb, 3.5, 10);
      rimLightCobalt.position.set(-3, 2, -1);
      scene.add(rimLightCobalt);

      // Cyan rim light
      const rimLightCyan = new THREE.PointLight(0x38bdf8, 3.2, 10);
      rimLightCyan.position.set(3, 1.5, -0.5);
      scene.add(rimLightCyan);

      // Burnt orange rim light (Brand accent)
      const rimLightOrange = new THREE.PointLight(0xD95D39, 2.8, 8);
      rimLightOrange.position.set(0, -1, 2.2);
      scene.add(rimLightOrange);

      // Front focus light
      const frontLight = new THREE.PointLight(0xffffff, 1.1, 8);
      frontLight.position.set(0, 1.2, 3);
      scene.add(frontLight);

      // 4. Ambient Particle Constellation (140 glowing cyan/white particles)
      const particleCount = 140;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 8;
        particlePositions[i + 1] = (Math.random() - 0.5) * 5 + 0.5;
        particlePositions[i + 2] = (Math.random() - 0.5) * 5 - 1;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.038,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      particlesMesh = new THREE.Points(particleGeo, particleMat);
      scene.add(particlesMesh);

      // ==========================================
      // 5. CODING WORKSPACE: FLANKING MONITORS & DESK
      // ==========================================
      deskGroup.position.set(0, -0.45, -0.55);

      // Standing Desk Top Slab
      const deskTopGeo = new THREE.BoxGeometry(2.8, 0.08, 1.1);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x141824,
        roughness: 0.35,
        metalness: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
      deskTop.position.set(0, 0.25, 0);
      deskGroup.add(deskTop);

      // Dual Desk Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x090b10, roughness: 0.5, metalness: 0.8 });
      const legGeo = new THREE.BoxGeometry(0.08, 1.1, 0.08);
      const legLeft = new THREE.Mesh(legGeo, legMat);
      legLeft.position.set(-1.25, -0.3, 0);
      deskGroup.add(legLeft);

      const legRight = new THREE.Mesh(legGeo, legMat);
      legRight.position.set(1.25, -0.3, 0);
      deskGroup.add(legRight);

      // Dual High-Tech Coding Monitors Setup
      const monitorsGroup = new THREE.Group();
      codeTextureCanvas = document.createElement('canvas');
      codeTextureCanvas.width = 512;
      codeTextureCanvas.height = 320;
      codeTextureContext = codeTextureCanvas.getContext('2d');
      codeTexture = new THREE.CanvasTexture(codeTextureCanvas);

      const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x07090e, roughness: 0.2, metalness: 0.85 });
      const screenMat = new THREE.MeshBasicMaterial({ map: codeTexture });

      // Left Monitor (Angled towards Yashwanth - Live Code Editor)
      const monitorGeo = new THREE.BoxGeometry(1.15, 0.72, 0.03);
      const leftScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      leftScreen.position.set(-1.08, 0.82, -0.1);
      leftScreen.rotation.y = 0.32;

      const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.10, 0.67), screenMat);
      leftDisplay.position.set(0, 0, 0.016);
      leftScreen.add(leftDisplay);
      monitorsGroup.add(leftScreen);

      // Left Monitor Stand
      const standPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
      const standPoleLeft = new THREE.Mesh(standPoleGeo, legMat);
      standPoleLeft.position.set(-1.08, 0.52, -0.15);
      monitorsGroup.add(standPoleLeft);

      // Right Monitor (Angled towards Yashwanth - React Engine Telemetry)
      const rightScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      rightScreen.position.set(1.08, 0.82, -0.1);
      rightScreen.rotation.y = -0.32;

      const rightCanvas = document.createElement('canvas');
      rightCanvas.width = 512;
      rightCanvas.height = 320;
      const rightCtx = rightCanvas.getContext('2d');
      rightCtx.fillStyle = '#0a101d';
      rightCtx.fillRect(0, 0, 512, 320);
      rightCtx.fillStyle = '#111b2f';
      rightCtx.fillRect(16, 16, 480, 42);
      rightCtx.fillStyle = '#38bdf8';
      rightCtx.font = 'bold 18px monospace';
      rightCtx.fillText('<React.Engine status="Production" />', 30, 44);
      // Metric boxes
      rightCtx.fillStyle = '#1e293b';
      rightCtx.fillRect(16, 74, 145, 75);
      rightCtx.fillRect(181, 74, 145, 75);
      rightCtx.fillRect(346, 74, 150, 75);
      rightCtx.fillStyle = '#94a3b8';
      rightCtx.font = '12px monospace';
      rightCtx.fillText('BUNDLE: OPTIMIZED', 24, 100);
      rightCtx.fillText('LATENCY: 12ms', 190, 100);
      rightCtx.fillText('FPS: 60 LOCKED', 356, 100);
      rightCtx.fillStyle = '#38bdf8';
      rightCtx.fillText('99.98%', 24, 128);
      rightCtx.fillStyle = '#10b981';
      rightCtx.fillText('HEALTHY', 190, 128);
      rightCtx.fillStyle = '#D95D39';
      rightCtx.fillText('STABLE', 356, 128);
      // Chart Line
      rightCtx.strokeStyle = '#38bdf8';
      rightCtx.lineWidth = 3.5;
      rightCtx.beginPath();
      rightCtx.moveTo(25, 260);
      rightCtx.bezierCurveTo(120, 180, 240, 280, 360, 195);
      rightCtx.lineTo(485, 215);
      rightCtx.stroke();
      const rightScreenTexture = new THREE.CanvasTexture(rightCanvas);
      const rightDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(1.10, 0.67),
        new THREE.MeshBasicMaterial({ map: rightScreenTexture })
      );
      rightDisplay.position.set(0, 0, 0.016);
      rightScreen.add(rightDisplay);
      monitorsGroup.add(rightScreen);

      const standPoleRight = new THREE.Mesh(standPoleGeo, legMat);
      standPoleRight.position.set(1.08, 0.52, -0.15);
      monitorsGroup.add(standPoleRight);

      deskGroup.add(monitorsGroup);
      mainGroup.add(deskGroup);

      // ==========================================
      // 6. ILLUMINATED CIRCULAR PEDESTAL (CENTERED)
      // ==========================================
      pedestalGroup.position.set(0, -0.95, 0.1);

      // Concentric Cyan, Cobalt & Brand Rings
      const ringMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const ringMatCobalt = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ringMatOuter = new THREE.MeshBasicMaterial({ color: 0xD95D39, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });

      // Inner cyan ring
      const innerRingGeo = new THREE.RingGeometry(0.52, 0.60, 64);
      const innerRing = new THREE.Mesh(innerRingGeo, ringMatCyan);
      innerRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(innerRing);

      // Middle cobalt ring
      const middleRingGeo = new THREE.RingGeometry(0.74, 0.83, 64);
      const middleRing = new THREE.Mesh(middleRingGeo, ringMatCobalt);
      middleRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(middleRing);

      // Outer glowing pulse ring
      const outerRingGeo = new THREE.RingGeometry(0.98, 1.08, 64);
      const outerRing = new THREE.Mesh(outerRingGeo, ringMatOuter);
      outerRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(outerRing);

      // Upward vertical holographic beam cylinder
      const holoCylinderGeo = new THREE.CylinderGeometry(0.95, 0.72, 0.45, 32, 1, true);
      const holoCylinderMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const holoCylinder = new THREE.Mesh(holoCylinderGeo, holoCylinderMat);
      holoCylinder.position.y = 0.22;
      pedestalGroup.add(holoCylinder);

      mainGroup.add(pedestalGroup);

      // ==========================================
      // 7. OFFICIAL 3D AVATAR (CENTER STAGE)
      // ==========================================
      avatarGroup.position.set(0, -0.95, 0.1);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        './avatar-3d.png',
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;

          // Yashwanth 3D Avatar Plane (Aspect ratio matches official render: ~1.65 x 2.75)
          const avatarPlaneGeo = new THREE.PlaneGeometry(1.65, 2.75);
          const avatarPlaneMat = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01,
            roughness: 0.35,
            metalness: 0.05,
            side: THREE.DoubleSide
          });

          const avatarMesh = new THREE.Mesh(avatarPlaneGeo, avatarPlaneMat);
          avatarMesh.position.set(0, 1.38, 0.02);
          avatarMesh.castShadow = true;
          avatarMesh.name = "officialAvatarMesh";
          avatarGroup.add(avatarMesh);
        },
        undefined,
        (err) => {
          console.warn("Avatar texture load error, rendering fallback:", err);
          setLoadError(true);
        }
      );

      // =========================================================================
      // DYNAMIC ACOUSTIC WAVEFORM AURA RINGS (Around chest/laptop area)
      // =========================================================================
      acousticRingsGroup.position.set(0, 1.40, 0.06);

      const auraMat1 = new THREE.MeshBasicMaterial({
        color: 0xD95D39, // Burnt orange brand glow
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const auraMat2 = new THREE.MeshBasicMaterial({
        color: 0x38bdf8, // Electric cyan tech glow
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const auraMat3 = new THREE.MeshBasicMaterial({
        color: 0x2563eb, // Cobalt blue accent
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const auraMat4 = new THREE.MeshBasicMaterial({
        color: 0xf97316, // Amber orange warmth
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });

      const auraMesh1 = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.34, 48), auraMat1);
      const auraMesh2 = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.55, 48), auraMat2);
      const auraMesh3 = new THREE.Mesh(new THREE.RingGeometry(0.70, 0.78, 48), auraMat3);
      const auraMesh4 = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.02, 48), auraMat4);

      acousticRingsGroup.add(auraMesh1);
      acousticRingsGroup.add(auraMesh2);
      acousticRingsGroup.add(auraMesh3);
      acousticRingsGroup.add(auraMesh4);
      avatarGroup.add(acousticRingsGroup);

      mainGroup.add(avatarGroup);

      // ==========================================
      // 8. FLOATING 3D TECH ORBS WITH SPINNING RINGS
      // ==========================================
      const techOrbsData = [
        { name: 'React', color: 0x00d8ff, hex: '#00d8ff', bg: '#082f49', pos: [-1.55, 1.35, 0.3], speed: 1.4, offset: 0 },
        { name: 'JavaScript', color: 0xf7df1e, hex: '#f7df1e', bg: '#422006', pos: [-1.45, 0.25, 0.4], speed: 1.8, offset: 1.2 },
        { name: 'Node.js', color: 0x4ade80, hex: '#4ade80', bg: '#052e16', pos: [1.55, 1.45, 0.3], speed: 1.6, offset: 2.1 },
        { name: 'Java', color: 0xfb923c, hex: '#fb923c', bg: '#431407', pos: [1.65, 0.4, 0.4], speed: 2.0, offset: 3.0 },
        { name: 'Tailwind', color: 0x38bdf8, hex: '#38bdf8', bg: '#0c4a6e', pos: [0.0, 1.95, -0.3], speed: 1.5, offset: 4.2 },
      ];

      techOrbsData.forEach((tech) => {
        const orbGroup = new THREE.Group();
        orbGroup.position.set(...tech.pos);

        // 1. Glowing central sphere
        const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: tech.color,
          emissive: tech.color,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        orbGroup.add(sphere);

        // 2. Orbital spinning ring
        const ringGeo = new THREE.TorusGeometry(0.14, 0.01, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: tech.color,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        });
        const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
        orbitalRing.rotation.x = Math.PI / 3;
        orbGroup.add(orbitalRing);

        // 3. Tech Badge Label
        const badgeCanvas = document.createElement('canvas');
        badgeCanvas.width = 256;
        badgeCanvas.height = 80;
        const bCtx = badgeCanvas.getContext('2d');
        bCtx.fillStyle = tech.bg;
        bCtx.strokeStyle = tech.hex;
        bCtx.lineWidth = 3;
        bCtx.beginPath();
        bCtx.roundRect(6, 6, 244, 68, 34);
        bCtx.fill();
        bCtx.stroke();
        bCtx.fillStyle = '#ffffff';
        bCtx.font = 'bold 28px monospace';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(tech.name, 128, 40);

        const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
        const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true, side: THREE.DoubleSide });
        const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), badgeMat);
        badgeMesh.position.set(0, -0.16, 0);
        orbGroup.add(badgeMesh);

        orbGroup.userData = {
          initialY: tech.pos[1],
          speed: tech.speed,
          offset: tech.offset,
          orbitalRing: orbitalRing
        };

        mainGroup.add(orbGroup);
        floatingTechOrbs.push(orbGroup);
      });

      scene.add(mainGroup);

      // ==========================================
      // 9. 3D MOUSE PARALLAX TRACKING
      // ==========================================
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) - 0.5;
        const normY = ((e.clientY - rect.top) / rect.height) - 0.5;

        targetRotationY = normX * 0.42;
        targetRotationX = -normY * 0.32;
      };

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('resize', handleResize);

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(container);
      }

      // ==========================================
      // 10. 60FPS THREE.JS ANIMATION LOOP
      // ==========================================
      const clock = new THREE.Clock();

      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const elapsedTime = clock.getElapsedTime();
        const speakingNow = isSpeakingRef.current;

        // Smooth mouse parallax lerp
        currentRotationX += (targetRotationX - currentRotationX) * 0.06;
        currentRotationY += (targetRotationY - currentRotationY) * 0.06;

        mainGroup.rotation.y = currentRotationY;
        mainGroup.rotation.x = currentRotationX;
        mainGroup.position.x = currentRotationY * 0.25;

        // Idle avatar breathing & speaking subtle gesture
        const avatarMesh = avatarGroup.getObjectByName("officialAvatarMesh");
        if (avatarMesh) {
          const breath = Math.sin(elapsedTime * 2.2) * 0.012;
          const speechPulse = speakingNow ? Math.sin(elapsedTime * 12) * 0.015 : 0;
          avatarMesh.position.y = 1.38 + breath + speechPulse;
          avatarMesh.rotation.y = currentRotationY * 0.25;
        }

        // Concentric futuristic pedestal rings rotation
        middleRing.rotation.z = -elapsedTime * 0.4;
        innerRing.rotation.z = elapsedTime * 0.5;
        const pulseScale = 1.0 + Math.sin(elapsedTime * 3) * 0.06;
        outerRing.scale.set(pulseScale, pulseScale, pulseScale);
        outerRing.material.opacity = 0.35 + Math.sin(elapsedTime * 3) * 0.15;
        holoCylinder.material.opacity = 0.10 + Math.sin(elapsedTime * 4) * 0.04;

        // Floating tech orbs sinusoidal bobbing & ring spin
        floatingTechOrbs.forEach((orb) => {
          const { initialY, speed, offset, orbitalRing } = orb.userData;
          orb.position.y = initialY + Math.sin(elapsedTime * speed + offset) * 0.08;
          orb.rotation.y = currentRotationY * 0.5;
          if (orbitalRing) {
            orbitalRing.rotation.x += 0.02;
            orbitalRing.rotation.y += 0.03;
          }
        });

        // Ambient particles drift
        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.02;
          particlesMesh.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;
        }

        // Dynamic Acoustic Aura Rings (Waveform pulses when speaking)
        if (speakingNow) {
          const speed = 3.6;
          const wave1 = (elapsedTime * speed) % 1;
          const wave2 = (elapsedTime * speed + 0.25) % 1;
          const wave3 = (elapsedTime * speed + 0.5) % 1;
          const wave4 = (elapsedTime * speed + 0.75) % 1;

          auraMesh1.scale.set(1 + wave1 * 1.4, 1 + wave1 * 1.4, 1);
          auraMat1.opacity = (1 - wave1) * 0.85;

          auraMesh2.scale.set(1 + wave2 * 1.4, 1 + wave2 * 1.4, 1);
          auraMat2.opacity = (1 - wave2) * 0.75;

          auraMesh3.scale.set(1 + wave3 * 1.4, 1 + wave3 * 1.4, 1);
          auraMat3.opacity = (1 - wave3) * 0.65;

          auraMesh4.scale.set(1 + wave4 * 1.4, 1 + wave4 * 1.4, 1);
          auraMat4.opacity = (1 - wave4) * 0.55;
        } else {
          auraMat1.opacity += (0 - auraMat1.opacity) * 0.15;
          auraMat2.opacity += (0 - auraMat2.opacity) * 0.15;
          auraMat3.opacity += (0 - auraMat3.opacity) * 0.15;
          auraMat4.opacity += (0 - auraMat4.opacity) * 0.15;
        }

        // Live code editor line scrolling on Left Monitor
        if (codeTextureContext && codeTexture) {
          codeTextureContext.fillStyle = '#080d17';
          codeTextureContext.fillRect(0, 0, 512, 320);

          codeTextureContext.fillStyle = '#1e293b';
          codeTextureContext.fillRect(0, 0, 512, 28);
          codeTextureContext.fillStyle = '#ef4444';
          codeTextureContext.beginPath(); codeTextureContext.arc(16, 14, 5, 0, Math.PI * 2); codeTextureContext.fill();
          codeTextureContext.fillStyle = '#eab308';
          codeTextureContext.beginPath(); codeTextureContext.arc(32, 14, 5, 0, Math.PI * 2); codeTextureContext.fill();
          codeTextureContext.fillStyle = '#22c55e';
          codeTextureContext.beginPath(); codeTextureContext.arc(48, 14, 5, 0, Math.PI * 2); codeTextureContext.fill();

          codeTextureContext.fillStyle = '#64748b';
          codeTextureContext.font = '11px monospace';
          codeTextureContext.fillText('Workspace3D.jsx — Yashwanth Portfolio', 68, 18);

          const lines = [
            { text: "import React, { useState } from 'react';", color: '#93c5fd' },
            { text: "import { Canvas } from '@three/engine';", color: '#93c5fd' },
            { text: "export function YashwanthAvatar() {", color: '#38bdf8' },
            { text: "  const [focus] = useState('Frontend & Systems');", color: '#fbbf24' },
            { text: "  return (", color: '#f472b6' },
            { text: "    <InteractiveStage fps={60}>", color: '#4ade80' },
            { text: "      <HolographicPedestal burntOrange />", color: '#D95D39' },
            { text: "      <VoiceSynthesizer active={speaking} />", color: '#a78bfa' },
            { text: "    </InteractiveStage>", color: '#4ade80' },
            { text: "  );", color: '#f472b6' },
            { text: "}", color: '#38bdf8' }
          ];

          const scrollOffset = (elapsedTime * 14) % 18;
          lines.forEach((l, idx) => {
            codeTextureContext.fillStyle = l.color;
            codeTextureContext.font = '13px monospace';
            codeTextureContext.fillText(l.text, 20, 52 + idx * 22 - scrollOffset);
          });

          // Blinking cyan cursor
          if (Math.sin(elapsedTime * 6) > 0) {
            codeTextureContext.fillStyle = '#38bdf8';
            codeTextureContext.fillRect(20, 275, 8, 14);
          }

          codeTexture.needsUpdate = true;
        }

        renderer.render(scene, camera);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) resizeObserver.disconnect();
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn("WebGL initialization failed, rendering clean fallback:", err);
      setLoadError(true);
    }
  }, []);

  return (
    <div id="workspace-3d-scene" className="relative w-full h-full min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] flex items-center justify-center select-none overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Glassmorphism Speech Bubble & Voice Greeting Controls */}
      {showSpeechBubble && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 max-w-[280px] sm:max-w-[340px] z-20 transition-all duration-300">
          <div className="relative rounded-2xl bg-[#0a0f18]/92 backdrop-blur-xl border border-[#D95D39]/30 p-3 sm:p-3.5 shadow-2xl text-[#F5F2EB]">
            {/* Header: Avatar identity + Equalizer bars */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-[#D95D39] animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-xs font-mono font-bold tracking-wide text-white">
                  Yashwanth (3D Avatar)
                </span>
              </div>

              {/* Animated Audio Equalizer with Burnt Orange and Cyan Bars */}
              <div className="flex items-end gap-1 h-3.5 px-1.5 py-0.5 rounded bg-black/60 border border-white/10">
                <span className={`w-0.5 bg-[#D95D39] rounded-full transition-all duration-150 ${isSpeaking ? 'h-3 animate-pulse' : 'h-1'}`} />
                <span className={`w-0.5 bg-sky-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-1.5'}`} style={{ animationDuration: '300ms' }} />
                <span className={`w-0.5 bg-orange-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-2.5' : 'h-1'}`} style={{ animationDuration: '450ms' }} />
                <span className={`w-0.5 bg-emerald-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-2'}`} style={{ animationDuration: '200ms' }} />
              </div>
            </div>

            {/* Speech Script & Synchronized Karaoke Word Highlighting */}
            <div className="text-xs leading-relaxed font-sans max-h-[110px] overflow-y-auto pr-1 select-text">
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
                  "👋 Hi, I'm Yashwanth! Welcome to my portfolio. Tap below to hear my 3D voice introduction!"
                </p>
              )}
            </div>

            {/* Interactive Action Button: Play/Pause Voice Intro */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleSpeech}
                onMouseEnter={() => sound.playPop()}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 shadow-md cursor-pointer ${
                  isSpeaking
                    ? 'bg-black/60 text-[#D95D39] border border-[#D95D39]/40 hover:bg-black'
                    : 'bg-gradient-to-r from-[#D95D39] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white shadow-[#D95D39]/30 hover:scale-[1.02]'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Pause className="w-3.5 h-3.5 animate-pulse text-[#D95D39]" />
                    <span>Pause Voice Intro</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>▶ Play Voice Intro</span>
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
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F2EB] transition-colors border border-white/10 cursor-pointer"
                title={sound.isMuted() ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Toggle Sound"
              >
                {sound.isMuted() ? <VolumeX className="w-3.5 h-3.5 text-[#D95D39]" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>

            {/* Bubble tail */}
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-[#0a0f18]/92 border-r border-b border-[#D95D39]/30 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Auto-Prompt Callout Badge on Load (First Visit Guidance) */}
      {!hasInteracted && !isSpeaking && (
        <button
          type="button"
          onClick={() => startSpeech(true)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#D95D39] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-mono text-xs font-semibold shadow-xl shadow-[#D95D39]/40 border border-white/20 backdrop-blur-md animate-bounce cursor-pointer z-30 transition-all hover:scale-105 active:scale-95 text-center whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-200" />
          <span>👋 Hear Yashwanth's 3D Voice Intro 🔊</span>
        </button>
      )}

      {/* Fallback if WebGL isn't supported */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#141414]/90 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#D95D39] mb-4 shadow-xl">
            <img src="./avatar-3d.png" alt="Yashwanth S - 3D Avatar" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-heading font-bold text-white">Yashwanth S</h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-sm mt-1">
            Frontend Developer & Software Engineer passionate about interactive 3D WebGL interfaces and clean code architecture.
          </p>
        </div>
      )}
    </div>
  );
}
