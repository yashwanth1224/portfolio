import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Sparkles, Play, Pause } from 'lucide-react';
import { sound } from '../utils/audio';

const GREETING_SCRIPT = "Hello! I'm Yashwanth. I'm a frontend developer and software engineer. I am passionate about building scalable web applications, responsive interactive user interfaces, and modern digital experiences. Welcome to my portfolio!";
const SCRIPT_WORDS = GREETING_SCRIPT.split(' ');

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
  const walkTriggerRef = useRef(Date.now());

  // Synchronize ref with state
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Procedural Web Audio fallback voice synth (for environments with restricted SpeechSynthesis)
  const playProceduralPhoneme = useCallback((word, index) => {
    try {
      sound.init();
      const ctx = sound.ctx;
      if (!ctx || sound.isMuted()) return;
      const now = ctx.currentTime;

      // Fundamental vocal cord pitch (~125-145Hz male speech)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const baseFreq = 125 + Math.sin(index * 0.7) * 20;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.94, now + 0.16);

      // Vocal formant filter (simulating vocal tract resonance)
      filter.type = 'bandpass';
      const formants = [520, 780, 1120, 1420, 880];
      filter.frequency.setValueAtTime(formants[index % formants.length], now);
      filter.Q.setValueAtTime(3.8, now);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
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

        // Select the most natural English voice available
        const voices = synth.getVoices();
        const englishVoice = voices.find(v =>
          v.lang.startsWith('en') && (
            v.name.includes('Google UK English Male') ||
            v.name.includes('Natural') ||
            v.name.includes('David') ||
            v.name.includes('George') ||
            v.name.includes('Guy') ||
            v.name.includes('Male')
          )
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        utterance.rate = 0.95; // Crisp, charismatic pacing
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          hasStartedSpeechRef.current = true;
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setCurrentWordIndex(0);
        };

        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            const charIdx = e.charIndex;
            const textSoFar = GREETING_SCRIPT.substring(0, charIdx);
            const wordIdx = textSoFar.trim().split(/\s+/).length - 1;
            const safeIdx = Math.max(0, Math.min(wordIdx, SCRIPT_WORDS.length - 1));
            setCurrentWordIndex(safeIdx);
            wordProgressRef.current = safeIdx;
          }
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setCurrentWordIndex(-1);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setCurrentWordIndex(-1);
        };

        // Fallback progress interval to guarantee live caption progression across all browsers
        let simulatedIndex = 0;
        const totalDuration = 10500;
        const intervalTime = totalDuration / SCRIPT_WORDS.length;

        fallbackIntervalRef.current = setInterval(() => {
          simulatedIndex++;
          if (simulatedIndex < SCRIPT_WORDS.length) {
            setCurrentWordIndex(prev => Math.max(prev, simulatedIndex));
            wordProgressRef.current = simulatedIndex;
          } else {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
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
      }, 340);
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

  // Listen for external trigger from Hero.jsx or other buttons
  useEffect(() => {
    const handleExternalTrigger = () => {
      startSpeech(true);
    };

    window.addEventListener('trigger-avatar-speech', handleExternalTrigger);
    return () => {
      window.removeEventListener('trigger-avatar-speech', handleExternalTrigger);
    };
  }, [startSpeech]);

  // Bulletproof Autoplay Handling:
  // 1. Attempt auto-start on load after 700ms (as avatar walks forward)
  // 2. Attach global one-time interaction listeners so ANY click/touch/scroll immediately starts the voice intro
  useEffect(() => {
    // Attempt auto-speech on first visit
    const autoPlayTimer = setTimeout(() => {
      if (!hasStartedSpeechRef.current) {
        try {
          startSpeech(false);
        } catch {
          // Browser autoplay restriction will be unlocked by interaction listener
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
  // Three.js 3D Workspace Scene with Realistic Stylized Anime Yashwanth Avatar
  // =========================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let mainGroup = new THREE.Group();
    let deskGroup = new THREE.Group();
    let monitorsGroup = new THREE.Group();
    let floatingBadges = [];
    let codeTextureCanvas, codeTextureContext, codeTexture;

    // Avatar articulation groups
    let avatarGroup = new THREE.Group();
    let torsoGroup = new THREE.Group();
    let headGroup = new THREE.Group();
    let eyesGroup = new THREE.Group();
    let jawGroup = new THREE.Group();
    let mouthMesh = null;
    let leftArmGroup = new THREE.Group();
    let leftForearmGroup = new THREE.Group();
    let rightArmGroup = new THREE.Group();
    let rightForearmGroup = new THREE.Group();
    let leftLeg = null;
    let rightLeg = null;

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    try {
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 520;

      // 1. Scene & Perspective Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.88, 4.5);
      camera.lookAt(0, 0.62, 0);

      // 2. WebGL Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // 3. Lighting Setup (Crisp Studio & Warm Anime Key Lights)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.90);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.45);
      mainLight.position.set(3, 5, 4);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      scene.add(mainLight);

      // Warm portrait key light focused on Yashwanth's face and shirt
      const keyLight = new THREE.PointLight(0xffedd5, 1.85, 8);
      keyLight.position.set(1.4, 2.1, 1.8);
      scene.add(keyLight);

      // Coral rim light (brand accent glow)
      const rimLightCoral = new THREE.PointLight(0xff5a36, 2.8, 10);
      rimLightCoral.position.set(-3, 2, -1);
      scene.add(rimLightCoral);

      // Cyan rim light (modern digital tech glow)
      const rimLightCyan = new THREE.PointLight(0x00d8ff, 2.4, 10);
      rimLightCyan.position.set(3, 1.5, -1);
      scene.add(rimLightCyan);

      // Soft ground contact shadow plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(7, 5);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.28 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.71;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // ==========================================
      // 4. STANDING DESK & WORKSPACE SETUP
      // ==========================================
      deskGroup.position.set(-0.48, 0, 0);

      // Desk Top Slab
      const deskTopGeo = new THREE.BoxGeometry(3.0, 0.09, 1.5);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x1f232b,
        roughness: 0.35,
        metalness: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
      deskTop.position.set(0, 0.70, 0);
      deskTop.receiveShadow = true;
      deskTop.castShadow = true;
      deskGroup.add(deskTop);

      // Desk Legs (Minimalist dual-beam standing desk)
      const legMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.5, metalness: 0.8 });
      const legGeo = new THREE.BoxGeometry(0.1, 1.4, 0.1);

      const legLeft = new THREE.Mesh(legGeo, legMat);
      legLeft.position.set(-1.25, 0, 0);
      legLeft.castShadow = true;
      deskGroup.add(legLeft);

      const legRight = new THREE.Mesh(legGeo, legMat);
      legRight.position.set(1.25, 0, 0);
      legRight.castShadow = true;
      deskGroup.add(legRight);

      // Desk Feet
      const footGeo = new THREE.BoxGeometry(0.18, 0.04, 1.2);
      const footLeft = new THREE.Mesh(footGeo, legMat);
      footLeft.position.set(-1.25, -0.69, 0);
      deskGroup.add(footLeft);

      const footRight = new THREE.Mesh(footGeo, legMat);
      footRight.position.set(1.25, -0.69, 0);
      deskGroup.add(footRight);

      // ==========================================
      // 5. DUAL MONITORS & LIVE CODE SCREENS
      // ==========================================
      codeTextureCanvas = document.createElement('canvas');
      codeTextureCanvas.width = 512;
      codeTextureCanvas.height = 320;
      codeTextureContext = codeTextureCanvas.getContext('2d');
      codeTexture = new THREE.CanvasTexture(codeTextureCanvas);

      const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x090a0d, roughness: 0.2, metalness: 0.8 });
      const screenMat = new THREE.MeshBasicMaterial({ map: codeTexture });

      // Left Monitor (Curved/Slanted Inwards - Live Code Editor)
      const monitorGeo = new THREE.BoxGeometry(1.25, 0.78, 0.04);
      const leftScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      leftScreen.position.set(-0.65, 1.30, -0.15);
      leftScreen.rotation.y = 0.22;

      const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.20, 0.73), screenMat);
      leftDisplay.position.set(0, 0, 0.021);
      leftScreen.add(leftDisplay);
      monitorsGroup.add(leftScreen);

      // Left Monitor Stand
      const standPoleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.52, 16);
      const standPole = new THREE.Mesh(standPoleGeo, legMat);
      standPole.position.set(-0.65, 0.98, -0.22);
      monitorsGroup.add(standPole);

      // Right Monitor (React UI Preview & Metrics)
      const rightScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      rightScreen.position.set(0.65, 1.30, -0.15);
      rightScreen.rotation.y = -0.22;

      const rightCanvas = document.createElement('canvas');
      rightCanvas.width = 512;
      rightCanvas.height = 320;
      const rightCtx = rightCanvas.getContext('2d');
      rightCtx.fillStyle = '#0f172a';
      rightCtx.fillRect(0, 0, 512, 320);
      rightCtx.fillStyle = '#1e293b';
      rightCtx.fillRect(20, 20, 472, 45);
      rightCtx.fillStyle = '#ff5a36';
      rightCtx.font = 'bold 20px monospace';
      rightCtx.fillText('<React.Component state="running" />', 35, 48);
      // Metric boxes
      rightCtx.fillStyle = '#334155';
      rightCtx.fillRect(20, 80, 140, 80);
      rightCtx.fillRect(180, 80, 140, 80);
      rightCtx.fillRect(340, 80, 150, 80);
      // Chart line
      rightCtx.strokeStyle = '#38bdf8';
      rightCtx.lineWidth = 4;
      rightCtx.beginPath();
      rightCtx.moveTo(30, 260);
      rightCtx.bezierCurveTo(120, 180, 240, 290, 360, 200);
      rightCtx.lineTo(480, 220);
      rightCtx.stroke();
      const rightScreenTexture = new THREE.CanvasTexture(rightCanvas);
      const rightDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(1.20, 0.73),
        new THREE.MeshBasicMaterial({ map: rightScreenTexture })
      );
      rightDisplay.position.set(0, 0, 0.021);
      rightScreen.add(rightDisplay);
      monitorsGroup.add(rightScreen);

      const rightStandPole = new THREE.Mesh(standPoleGeo, legMat);
      rightStandPole.position.set(0.65, 0.98, -0.22);
      monitorsGroup.add(rightStandPole);

      deskGroup.add(monitorsGroup);

      // Keyboard, Mouse, and Terracotta Coffee Mug
      const keyboardGeo = new THREE.BoxGeometry(0.72, 0.02, 0.25);
      const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x1e2129, roughness: 0.4 });
      const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
      keyboard.position.set(-0.15, 0.75, 0.3);
      deskGroup.add(keyboard);

      const mouseGeo = new THREE.BoxGeometry(0.09, 0.025, 0.14);
      const mouse = new THREE.Mesh(mouseGeo, keyboardMat);
      mouse.position.set(0.5, 0.75, 0.3);
      deskGroup.add(mouse);

      const mugGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.15, 24);
      const mugMat = new THREE.MeshStandardMaterial({ color: 0xaf4426, roughness: 0.1 });
      const mug = new THREE.Mesh(mugGeo, mugMat);
      mug.position.set(0.95, 0.82, 0.25);
      deskGroup.add(mug);

      mainGroup.add(deskGroup);

      // =========================================================================
      // 6. REALISTIC HIGH-END ANIME YASHWANTH AVATAR (EXACT REFERENCE REPLICA)
      // =========================================================================
      // Initial starting position: behind/beside desk; will physically walk forward!
      avatarGroup.position.set(1.65, -0.71, -1.05);
      avatarGroup.rotation.y = -0.42;

      // Premium Anime Stylized Materials
      const animeSkinMat = new THREE.MeshStandardMaterial({
        color: 0xF5C2A4, // Warm, soft anime skin tone matching user prompt & photo
        roughness: 0.50,
        metalness: 0.02,
      });
      const animeBlushMat = new THREE.MeshBasicMaterial({
        color: 0xff8a75,
        transparent: true,
        opacity: 0.24,
      });
      const lipsMat = new THREE.MeshStandardMaterial({ color: 0xd98070, roughness: 0.55 });
      const teethMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25 });
      const mouthInnerMat = new THREE.MeshStandardMaterial({ color: 0x220b0b, roughness: 0.6 });
      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x141418, // Yashwanth's rich dark pompadour hair
        roughness: 0.72,
        metalness: 0.15,
      });
      const beardMat = new THREE.MeshStandardMaterial({
        color: 0x18181c, // Neat mustache and trimmed jawline beard
        roughness: 0.85,
        metalness: 0.05,
      });
      const shirtMat = new THREE.MeshStandardMaterial({
        color: 0xfefefe, // Fitted crisp white button-down
        roughness: 0.70,
        metalness: 0.05,
      });
      const shirtDetailMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75 });
      const buttonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.5 });
      const pantsMat = new THREE.MeshStandardMaterial({
        color: 0x1c222e, // Slim cuffed dark navy trousers
        roughness: 0.60,
        metalness: 0.15,
      });
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.5, metalness: 0.2 });
      const buckleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
      const sneakerWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Modern white designer sneakers
        roughness: 0.35,
        metalness: 0.05,
      });
      const sneakerSoleMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.85 });
      const earringMat = new THREE.MeshStandardMaterial({
        color: 0xf0f2f5, // Silver earring stud on left earlobe
        roughness: 0.10,
        metalness: 0.95,
      });
      const watchBandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const watchCaseMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.15, metalness: 0.9 });
      const watchScreenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff }); // Glowing cyan dev screen

      // --- A. ARTICULATED WALKING LEGS & SNEAKERS ---
      const legsGroup = new THREE.Group();

      // Hips & Pelvis
      const hipsGeo = new THREE.BoxGeometry(0.36, 0.16, 0.22);
      const hips = new THREE.Mesh(hipsGeo, pantsMat);
      hips.position.y = 1.02;
      hips.castShadow = true;
      legsGroup.add(hips);

      const beltGeo = new THREE.BoxGeometry(0.37, 0.045, 0.23);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.y = 1.10;
      legsGroup.add(belt);

      const buckleGeo = new THREE.BoxGeometry(0.06, 0.05, 0.015);
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, 1.10, 0.12);
      legsGroup.add(buckle);

      // Hierarchical Leg Builder for Lifelike Strides
      const buildArticulatedLeg = (isLeft) => {
        const hipJoint = new THREE.Group();
        const sign = isLeft ? -1 : 1;
        hipJoint.position.set(sign * 0.12, 0.98, 0);

        // Thigh
        const thighGroup = new THREE.Group();
        const thighGeo = new THREE.CylinderGeometry(0.076, 0.066, 0.44, 16);
        const thighMesh = new THREE.Mesh(thighGeo, pantsMat);
        thighMesh.position.y = -0.22;
        thighMesh.castShadow = true;
        thighGroup.add(thighMesh);

        // Knee Joint
        const kneeJoint = new THREE.Group();
        kneeJoint.position.y = -0.46;

        const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.066, 12, 12), pantsMat);
        kneeJoint.add(kneeMesh);

        // Calf & Trouser Cuff
        const calfGeo = new THREE.CylinderGeometry(0.066, 0.056, 0.38, 16);
        const calfMesh = new THREE.Mesh(calfGeo, pantsMat);
        calfMesh.position.y = -0.19;
        calfMesh.castShadow = true;
        kneeJoint.add(calfMesh);

        // Signature folded pant cuff (matches screenshot!)
        const cuffGeo = new THREE.CylinderGeometry(0.062, 0.059, 0.045, 16);
        const cuff = new THREE.Mesh(cuffGeo, pantsMat);
        cuff.position.y = -0.34;
        kneeJoint.add(cuff);

        // Exposed Ankle Skin above sneakers (exact match to screenshot!)
        const ankleGeo = new THREE.CylinderGeometry(0.046, 0.043, 0.07, 16);
        const ankle = new THREE.Mesh(ankleGeo, animeSkinMat);
        ankle.position.y = -0.39;
        kneeJoint.add(ankle);

        // Foot / Ankle Joint
        const footJoint = new THREE.Group();
        footJoint.position.y = -0.44;

        // Modern White Designer Sneaker
        const shoeGroup = new THREE.Group();
        shoeGroup.position.set(0, -0.01, 0.04);

        // Dark outsole tread
        const soleGeo = new THREE.BoxGeometry(0.134, 0.038, 0.32);
        const sole = new THREE.Mesh(soleGeo, sneakerSoleMat);
        sole.position.y = 0.019;
        sole.castShadow = true;
        shoeGroup.add(sole);

        // Crisp white upper
        const upperGeo = new THREE.BoxGeometry(0.126, 0.082, 0.28);
        const upper = new THREE.Mesh(upperGeo, sneakerWhiteMat);
        upper.position.y = 0.075;
        upper.position.z = -0.01;
        upper.castShadow = true;
        shoeGroup.add(upper);

        // Aerodynamic rounded toe cap
        const toeGeo = new THREE.SphereGeometry(0.060, 14, 14);
        const toe = new THREE.Mesh(toeGeo, sneakerWhiteMat);
        toe.scale.set(1.0, 0.65, 1.25);
        toe.position.set(0, 0.055, 0.11);
        toe.castShadow = true;
        shoeGroup.add(toe);

        // Subtle Coral Accent Stripe
        const stripeGeo = new THREE.BoxGeometry(0.130, 0.012, 0.16);
        const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.4 }));
        stripe.position.set(0, 0.062, -0.01);
        shoeGroup.add(stripe);

        footJoint.add(shoeGroup);
        kneeJoint.add(footJoint);
        thighGroup.add(kneeJoint);
        hipJoint.add(thighGroup);
        legsGroup.add(hipJoint);

        return { hipJoint, thighGroup, kneeJoint, footJoint };
      };

      leftLeg = buildArticulatedLeg(true);
      rightLeg = buildArticulatedLeg(false);
      avatarGroup.add(legsGroup);

      // --- B. TORSO & FITTED WHITE BUTTON-DOWN SHIRT ---
      torsoGroup.position.set(0, 1.12, 0);

      // Shirt Body
      const torsoBodyGeo = new THREE.BoxGeometry(0.40, 0.50, 0.24);
      const torsoBody = new THREE.Mesh(torsoBodyGeo, shirtMat);
      torsoBody.position.y = 0.25;
      torsoBody.castShadow = true;
      torsoGroup.add(torsoBody);

      // Shirt Front Placket (Raised center button strip)
      const placketGeo = new THREE.BoxGeometry(0.045, 0.50, 0.012);
      const placket = new THREE.Mesh(placketGeo, shirtDetailMat);
      placket.position.set(0, 0.25, 0.125);
      torsoGroup.add(placket);

      // Shirt Buttons
      const buttonGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 12);
      [0.10, 0.20, 0.30, 0.40].forEach(bY => {
        const btn = new THREE.Mesh(buttonGeo, buttonMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, bY, 0.134);
        torsoGroup.add(btn);
      });

      // Left Chest Pocket
      const pocketGeo = new THREE.BoxGeometry(0.08, 0.09, 0.008);
      const pocket = new THREE.Mesh(pocketGeo, shirtDetailMat);
      pocket.position.set(-0.10, 0.32, 0.125);
      torsoGroup.add(pocket);

      // Crisp Shirt Collar
      const collarBandGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.05, 16);
      const collarBand = new THREE.Mesh(collarBandGeo, shirtMat);
      collarBand.position.set(0, 0.51, 0);
      torsoGroup.add(collarBand);

      // Folded collar flaps
      const collarFlapGeo = new THREE.BoxGeometry(0.07, 0.075, 0.015);
      const leftCollarFlap = new THREE.Mesh(collarFlapGeo, shirtMat);
      leftCollarFlap.rotation.set(0.2, -0.25, -0.4);
      leftCollarFlap.position.set(-0.06, 0.49, 0.10);
      torsoGroup.add(leftCollarFlap);

      const rightCollarFlap = new THREE.Mesh(collarFlapGeo, shirtMat);
      rightCollarFlap.rotation.set(0.2, 0.25, 0.4);
      rightCollarFlap.position.set(0.06, 0.49, 0.10);
      torsoGroup.add(rightCollarFlap);

      // Neck
      const neckGeo = new THREE.CylinderGeometry(0.065, 0.072, 0.12, 16);
      const neck = new THREE.Mesh(neckGeo, animeSkinMat);
      neck.position.set(0, 0.55, 0);
      neck.castShadow = true;
      torsoGroup.add(neck);

      // --- C. ANIME YASHWANTH HEAD & CHARISMATIC EXPRESSIONS ---
      headGroup.position.set(0, 0.62, 0); // Head pivot

      // Main Head Mesh (Stylized Anime proportions)
      const headCraniumGeo = new THREE.SphereGeometry(0.175, 26, 26);
      const headCranium = new THREE.Mesh(headCraniumGeo, animeSkinMat);
      headCranium.scale.set(0.96, 1.10, 1.02);
      headCranium.position.y = 0.16;
      headCranium.castShadow = true;
      headGroup.add(headCranium);

      // Sculpted masculine jaw & chin
      const jawBoxGeo = new THREE.BoxGeometry(0.165, 0.11, 0.15);
      const jawBox = new THREE.Mesh(jawBoxGeo, animeSkinMat);
      jawBox.position.set(0, 0.07, 0.04);
      headGroup.add(jawBox);

      // Soft anime cheek blush
      const blushGeo = new THREE.SphereGeometry(0.038, 12, 12);
      const leftBlush = new THREE.Mesh(blushGeo, animeBlushMat);
      leftBlush.scale.set(1.0, 0.45, 0.5);
      leftBlush.position.set(-0.09, 0.13, 0.15);
      headGroup.add(leftBlush);

      const rightBlush = new THREE.Mesh(blushGeo, animeBlushMat);
      rightBlush.scale.set(1.0, 0.45, 0.5);
      rightBlush.position.set(0.09, 0.13, 0.15);
      headGroup.add(rightBlush);

      // Ears
      const earGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const leftEar = new THREE.Mesh(earGeo, animeSkinMat);
      leftEar.scale.set(0.35, 1.0, 0.7);
      leftEar.position.set(-0.175, 0.16, -0.01);
      headGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeo, animeSkinMat);
      rightEar.scale.set(0.35, 1.0, 0.7);
      rightEar.position.set(0.175, 0.16, -0.01);
      headGroup.add(rightEar);

      // Silver Earring Stud on Left Ear (Exact match to Yashwanth's portrait photo!)
      const earringGeo = new THREE.SphereGeometry(0.013, 14, 14);
      const earring = new THREE.Mesh(earringGeo, earringMat);
      earring.position.set(-0.184, 0.13, -0.01);
      headGroup.add(earring);

      // Yashwanth's Styled Pompadour Hair with Anime Volume & Silhouette
      const hairCrownGeo = new THREE.SphereGeometry(0.194, 24, 24);
      const hairCrown = new THREE.Mesh(hairCrownGeo, hairMat);
      hairCrown.scale.set(0.98, 1.08, 1.08);
      hairCrown.position.set(0, 0.21, -0.02);
      headGroup.add(hairCrown);

      // Upward swept pompadour quiff
      const quiffGeo = new THREE.BoxGeometry(0.22, 0.11, 0.16);
      const quiff = new THREE.Mesh(quiffGeo, hairMat);
      quiff.rotation.x = -0.34;
      quiff.position.set(0, 0.32, 0.06);
      headGroup.add(quiff);

      const quiffTuftGeo = new THREE.SphereGeometry(0.082, 14, 14);
      const quiffTuft1 = new THREE.Mesh(quiffTuftGeo, hairMat);
      quiffTuft1.scale.set(1.15, 0.75, 1.25);
      quiffTuft1.position.set(-0.05, 0.35, 0.07);
      headGroup.add(quiffTuft1);

      const quiffTuft2 = new THREE.Mesh(quiffTuftGeo, hairMat);
      quiffTuft2.scale.set(1.05, 0.70, 1.20);
      quiffTuft2.position.set(0.05, 0.34, 0.06);
      headGroup.add(quiffTuft2);

      const crestTuft = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), hairMat);
      crestTuft.scale.set(1.2, 0.6, 1.1);
      crestTuft.position.set(0.0, 0.38, 0.02);
      headGroup.add(crestTuft);

      // Eyebrows (Strong, masculine anime arches matching Yashwanth)
      const browGeo = new THREE.BoxGeometry(0.076, 0.020, 0.022);
      const leftBrow = new THREE.Mesh(browGeo, hairMat);
      leftBrow.rotation.set(0, 0.12, -0.08);
      leftBrow.position.set(-0.068, 0.225, 0.168);
      headGroup.add(leftBrow);

      const rightBrow = new THREE.Mesh(browGeo, hairMat);
      rightBrow.rotation.set(0, -0.12, 0.08);
      rightBrow.position.set(0.068, 0.225, 0.168);
      headGroup.add(rightBrow);

      // Charismatic Anime Eyes with Specular Twinkle Catchlights
      eyesGroup.position.set(0, 0.17, 0.155);

      const createAnimeEye = (isLeft) => {
        const eye = new THREE.Group();
        const sign = isLeft ? -1 : 1;
        eye.position.x = sign * 0.068;

        // Crisp white sclera
        const eyeBallGeo = new THREE.SphereGeometry(0.033, 20, 20);
        const eyeBall = new THREE.Mesh(eyeBallGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        eyeBall.scale.set(1.1, 0.95, 0.7);
        eye.add(eyeBall);

        // Dark anime top eyeliner / lash rim
        const lashGeo = new THREE.BoxGeometry(0.064, 0.012, 0.012);
        const lash = new THREE.Mesh(lashGeo, new THREE.MeshBasicMaterial({ color: 0x0f1115 }));
        lash.position.set(0, 0.026, 0.026);
        lash.rotation.z = sign * -0.06;
        eye.add(lash);

        // Large expressive iris (warm amber/espresso ring)
        const irisOuterGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.005, 20);
        const irisOuterMat = new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.2 });
        const irisOuter = new THREE.Mesh(irisOuterGeo, irisOuterMat);
        irisOuter.rotation.x = Math.PI / 2;
        irisOuter.position.z = 0.026;
        eye.add(irisOuter);

        // Deep espresso center
        const irisInnerGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.006, 20);
        const irisInnerMat = new THREE.MeshStandardMaterial({ color: 0x1c110a, roughness: 0.2 });
        const irisInner = new THREE.Mesh(irisInnerGeo, irisInnerMat);
        irisInner.rotation.x = Math.PI / 2;
        irisInner.position.z = 0.027;
        eye.add(irisInner);

        // Pupil
        const pupilGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.007, 20);
        const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
        pupil.rotation.x = Math.PI / 2;
        pupil.position.z = 0.028;
        eye.add(pupil);

        // Primary Specular Twinkle Catchlight (top-right twinkle)
        const twinkle1Geo = new THREE.SphereGeometry(0.0048, 10, 10);
        const twinkle1 = new THREE.Mesh(twinkle1Geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        twinkle1.position.set(sign * 0.006, 0.007, 0.030);
        eye.add(twinkle1);

        // Secondary Twinkle Catchlight (bottom-left star twinkle)
        const twinkle2Geo = new THREE.SphereGeometry(0.0028, 8, 8);
        const twinkle2 = new THREE.Mesh(twinkle2Geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        twinkle2.position.set(-sign * 0.004, -0.005, 0.030);
        eye.add(twinkle2);

        return eye;
      };

      eyesGroup.add(createAnimeEye(true));
      eyesGroup.add(createAnimeEye(false));
      headGroup.add(eyesGroup);

      // Stylized Anime Nose
      const noseGeo = new THREE.ConeGeometry(0.026, 0.065, 8);
      const nose = new THREE.Mesh(noseGeo, animeSkinMat);
      nose.rotation.x = Math.PI;
      nose.position.set(0, 0.135, 0.188);
      headGroup.add(nose);

      // Yashwanth's Neat Mustache (Matching portrait)
      const mustacheWingGeo = new THREE.BoxGeometry(0.058, 0.022, 0.024);
      const leftMustache = new THREE.Mesh(mustacheWingGeo, beardMat);
      leftMustache.rotation.set(0, 0.22, 0.18);
      leftMustache.position.set(-0.038, 0.086, 0.174);
      headGroup.add(leftMustache);

      const rightMustache = new THREE.Mesh(mustacheWingGeo, beardMat);
      rightMustache.rotation.set(0, -0.22, -0.18);
      rightMustache.position.set(0.038, 0.086, 0.174);
      headGroup.add(rightMustache);

      // Trimmed Beard / Chinstrap along Jawline
      const chinBeardGeo = new THREE.BoxGeometry(0.092, 0.052, 0.058);
      const chinBeard = new THREE.Mesh(chinBeardGeo, beardMat);
      chinBeard.position.set(0, 0.015, 0.135);
      headGroup.add(chinBeard);

      const jawBeardGeo = new THREE.BoxGeometry(0.028, 0.045, 0.135);
      const leftJawBeard = new THREE.Mesh(jawBeardGeo, beardMat);
      leftJawBeard.position.set(-0.102, 0.045, 0.032);
      headGroup.add(leftJawBeard);

      const rightJawBeard = new THREE.Mesh(jawBeardGeo, beardMat);
      rightJawBeard.position.set(0.102, 0.045, 0.032);
      headGroup.add(rightJawBeard);

      // Articulated Mouth & Jaw (Opens dynamically during speech!)
      const mouthCavityGeo = new THREE.BoxGeometry(0.082, 0.034, 0.035);
      mouthMesh = new THREE.Mesh(mouthCavityGeo, mouthInnerMat);
      mouthMesh.position.set(0, 0.055, 0.158);

      // Upper white teeth row
      const upperTeethGeo = new THREE.BoxGeometry(0.068, 0.013, 0.015);
      const upperTeeth = new THREE.Mesh(upperTeethGeo, teethMat);
      upperTeeth.position.set(0, 0.065, 0.170);
      headGroup.add(upperTeeth);

      // Lower Jaw & Lip Group (articulated downwards on syllables)
      jawGroup.position.set(0, 0.045, 0.170);

      const lowerTeethGeo = new THREE.BoxGeometry(0.062, 0.011, 0.015);
      const lowerTeeth = new THREE.Mesh(lowerTeethGeo, teethMat);
      lowerTeeth.position.set(0, 0.002, 0);
      jawGroup.add(lowerTeeth);

      const lowerLipGeo = new THREE.BoxGeometry(0.078, 0.016, 0.018);
      const lowerLip = new THREE.Mesh(lowerLipGeo, lipsMat);
      lowerLip.position.set(0, -0.007, 0.002);
      jawGroup.add(lowerLip);

      headGroup.add(mouthMesh);
      headGroup.add(jawGroup);
      torsoGroup.add(headGroup);

      // --- D. LEFT ARM & DEVELOPER SMARTWATCH ---
      leftArmGroup.position.set(-0.25, 0.48, 0); // Left shoulder pivot

      const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), shirtMat);
      leftArmGroup.add(leftShoulder);

      const leftUpperArmGeo = new THREE.CylinderGeometry(0.058, 0.05, 0.28, 16);
      const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, shirtMat);
      leftUpperArm.position.y = -0.14;
      leftArmGroup.add(leftUpperArm);

      // Rolled sleeve cuff (as seen in screenshot!)
      const leftSleeveCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.045, 16), shirtDetailMat);
      leftSleeveCuff.position.y = -0.27;
      leftArmGroup.add(leftSleeveCuff);

      leftForearmGroup.position.y = -0.28;

      // Forearm with bare skin from rolled cuffs
      const leftForearmGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.26, 16);
      const leftForearm = new THREE.Mesh(leftForearmGeo, animeSkinMat);
      leftForearm.position.y = -0.13;
      leftForearmGroup.add(leftForearm);

      // Developer Smartwatch on Left Wrist
      const watchBandGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.035, 16);
      const watchBand = new THREE.Mesh(watchBandGeo, watchBandMat);
      watchBand.position.y = -0.23;
      leftForearmGroup.add(watchBand);

      const watchCaseGeo = new THREE.BoxGeometry(0.038, 0.038, 0.012);
      const watchCase = new THREE.Mesh(watchCaseGeo, watchCaseMat);
      watchCase.position.set(-0.045, -0.23, 0);
      leftForearmGroup.add(watchCase);

      const watchScreenGeo = new THREE.PlaneGeometry(0.026, 0.026);
      const watchScreen = new THREE.Mesh(watchScreenGeo, watchScreenMat);
      watchScreen.rotation.y = -Math.PI / 2;
      watchScreen.position.set(-0.052, -0.23, 0);
      leftForearmGroup.add(watchScreen);

      // Left Hand
      const handGeo = new THREE.BoxGeometry(0.065, 0.085, 0.028);
      const leftHand = new THREE.Mesh(handGeo, animeSkinMat);
      leftHand.position.y = -0.29;
      leftForearmGroup.add(leftHand);

      leftArmGroup.add(leftForearmGroup);
      torsoGroup.add(leftArmGroup);

      // --- E. RIGHT ARM (EXPRESSIVE WELCOMING & TALKING GESTURES) ---
      rightArmGroup.position.set(0.25, 0.48, 0); // Right shoulder pivot

      const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), shirtMat);
      rightArmGroup.add(rightShoulder);

      const rightUpperArm = new THREE.Mesh(leftUpperArmGeo, shirtMat);
      rightUpperArm.position.y = -0.14;
      rightArmGroup.add(rightUpperArm);

      // Rolled sleeve cuff
      const rightSleeveCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.045, 16), shirtDetailMat);
      rightSleeveCuff.position.y = -0.27;
      rightArmGroup.add(rightSleeveCuff);

      rightForearmGroup.position.y = -0.28; // Elbow pivot

      const rightForearm = new THREE.Mesh(leftForearmGeo, animeSkinMat);
      rightForearm.position.y = -0.13;
      rightForearmGroup.add(rightForearm);

      const rightHandMesh = new THREE.Mesh(handGeo, animeSkinMat);
      rightHandMesh.position.y = -0.29;
      rightForearmGroup.add(rightHandMesh);

      const rightThumbGeo = new THREE.BoxGeometry(0.02, 0.04, 0.02);
      const rightThumb = new THREE.Mesh(rightThumbGeo, animeSkinMat);
      rightThumb.position.set(-0.038, -0.28, 0.01);
      rightForearmGroup.add(rightThumb);

      rightArmGroup.add(rightForearmGroup);
      torsoGroup.add(rightArmGroup);

      avatarGroup.add(torsoGroup);
      mainGroup.add(avatarGroup);

      // ==========================================
      // 7. FLOATING TECH PILLS & BADGES
      // ==========================================
      const techItems = [
        { name: 'React', color: 0x61dafb, pos: [-2.1, 2.2, 0.5], scale: 0.20 },
        { name: 'JS', color: 0xf7df1e, pos: [2.3, 2.3, 0.2], scale: 0.17 },
        { name: 'Node', color: 0x68a063, pos: [-1.9, 0.9, 0.8], scale: 0.17 },
        { name: 'Java', color: 0xe76f00, pos: [2.4, 1.0, 0.9], scale: 0.18 },
        { name: 'Tailwind', color: 0x38bdf8, pos: [1.8, 2.7, -0.3], scale: 0.18 },
      ];

      techItems.forEach((item, index) => {
        const sphereGeo = new THREE.IcosahedronGeometry(item.scale, 2);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: item.color,
          roughness: 0.2,
          metalness: 0.5,
          emissive: item.color,
          emissiveIntensity: 0.3,
        });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(...item.pos);
        mesh.userData = {
          baseY: item.pos[1],
          speed: 1.5 + index * 0.4,
          offset: index * 1.2,
        };
        mainGroup.add(mesh);
        floatingBadges.push(mesh);
      });

      scene.add(mainGroup);

      // Parallax mouse tilt
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotationY = x * 0.35;
        targetRotationX = y * 0.20;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Window resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // =========================================================================
      // 8. 60FPS ANIMATION LOOP: WALKING FORWARD, SPEECH LIP-SYNC & GESTURES
      // =========================================================================
      let clock = new THREE.Clock();
      let lineCounter = 0;

      const codeLines = [
        'import React, { useState } from "react";',
        'const YashwanthDev = () => {',
        '  const [crafted, setCrafted] = useState(true);',
        '  const stack = ["React", "Node", "Tailwind"];',
        '  // 60FPS WebGL Interactive Character',
        '  return <Avatar status="speaking" />;',
        '};',
        'export default YashwanthDev;',
        '// Building pixel-perfect modern web apps',
        'const metrics = { accuracy: "98%", fps: 60 };',
      ];

      // Physical Walking Path Parameters
      const WALK_START_POS = new THREE.Vector3(1.65, -0.71, -1.05);
      const WALK_END_POS = new THREE.Vector3(1.26, -0.71, 0.40);
      const WALK_DURATION = 3.2; // seconds for natural, charismatic entrance walk

      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const elapsedTime = clock.getElapsedTime();
        const speakingNow = isSpeakingRef.current;

        // Smooth camera tilt towards mouse
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        mainGroup.rotation.y = currentRotationY;
        mainGroup.rotation.x = currentRotationX;

        // -------------------------------------------------------------
        // A. WALKING AROUND & STEPPING-FORWARD ANIMATION
        // -------------------------------------------------------------
        const walkT = Math.min(1.0, elapsedTime / WALK_DURATION);
        // Ease-out cubic: starts with energetic purposeful stride, smoothly decelerates to charismatic stop
        const easeWalk = walkT < 0.5 
          ? 4 * walkT * walkT * walkT 
          : 1 - Math.pow(-2 * walkT + 2, 3) / 2;

        const isWalking = walkT < 0.98;

        if (isWalking) {
          // Physical forward translation along curved path
          avatarGroup.position.x = THREE.MathUtils.lerp(WALK_START_POS.x, WALK_END_POS.x, easeWalk);
          avatarGroup.position.z = THREE.MathUtils.lerp(WALK_START_POS.z, WALK_END_POS.z, easeWalk);
          avatarGroup.position.y = -0.71;

          // Face slightly along walking direction, turning towards user
          avatarGroup.rotation.y = THREE.MathUtils.lerp(-0.45, -0.24, easeWalk);

          // Stride rhythm (frequency ~8 rad/s)
          const walkStep = elapsedTime * 8.0;
          const strideAmp = (1 - easeWalk * 0.45) * 0.44;

          const legCycle = Math.sin(walkStep);

          // Alternating thigh strides
          if (leftLeg && rightLeg) {
            leftLeg.thighGroup.rotation.x = legCycle * strideAmp;
            rightLeg.thighGroup.rotation.x = -legCycle * strideAmp;

            // Knee bend backwards during swing
            leftLeg.kneeJoint.rotation.x = Math.max(0, -legCycle) * 0.68;
            rightLeg.kneeJoint.rotation.x = Math.max(0, legCycle) * 0.68;

            // Ankle flexion
            leftLeg.footJoint.rotation.x = -legCycle * 0.22;
            rightLeg.footJoint.rotation.x = legCycle * 0.22;
          }

          // Hips & torso vertical bobbing (twice per stride cycle)
          const stepBob = Math.abs(Math.sin(walkStep * 2)) * 0.035;
          torsoGroup.position.y = 1.12 + stepBob;

          // Pelvis sway and weight transfer
          avatarGroup.rotation.z = Math.sin(walkStep) * 0.022;
          torsoGroup.rotation.y = Math.sin(walkStep) * 0.06;
          torsoGroup.rotation.x = 0.08; // subtle forward stride posture

          // Arms swing in counter-rhythm to legs
          leftArmGroup.rotation.x = -legCycle * 0.36;
          rightArmGroup.rotation.x = legCycle * 0.36;
          leftForearmGroup.rotation.x = 0.32 + Math.max(0, -legCycle) * 0.2;
          rightForearmGroup.rotation.x = 0.32 + Math.max(0, legCycle) * 0.2;
        } else {
          // Finished walking: avatar arrives at front-right of desk!
          avatarGroup.position.copy(WALK_END_POS);

          // Settle legs into stable, charismatic standing stance
          if (leftLeg && rightLeg) {
            leftLeg.thighGroup.rotation.x += (-0.08 - leftLeg.thighGroup.rotation.x) * 0.1;
            leftLeg.kneeJoint.rotation.x += (0.10 - leftLeg.kneeJoint.rotation.x) * 0.1;
            leftLeg.footJoint.rotation.x += (0.0 - leftLeg.footJoint.rotation.x) * 0.1;

            rightLeg.thighGroup.rotation.x += (0.10 - rightLeg.thighGroup.rotation.x) * 0.1;
            rightLeg.kneeJoint.rotation.x += (0.06 - rightLeg.kneeJoint.rotation.x) * 0.1;
            rightLeg.footJoint.rotation.x += (0.0 - rightLeg.footJoint.rotation.x) * 0.1;
          }

          // CHARISMATIC REFERENCE POSE (Exact match to user's video screenshot!):
          // Turns warmly toward user and leans charmingly forward (~10° tilt)
          torsoGroup.rotation.x += (0.16 - torsoGroup.rotation.x) * 0.08;
          torsoGroup.rotation.y += (0.0 - torsoGroup.rotation.y) * 0.08;
          avatarGroup.rotation.y += (-0.24 - avatarGroup.rotation.y) * 0.08;

          // Gentle breathing idle
          const breath = Math.sin(elapsedTime * 2.2);
          torsoGroup.position.y += (1.12 + breath * 0.008 - torsoGroup.position.y) * 0.1;
          avatarGroup.rotation.z += (Math.sin(elapsedTime * 0.8) * 0.01 - avatarGroup.rotation.z) * 0.1;

          // -------------------------------------------------------------
          // B. SPEAKING LIP-SYNC ARTICULATION & WELCOMING GESTURES
          // -------------------------------------------------------------
          if (speakingNow) {
            // Dynamic mouth opening and closing synchronized with speech rhythm
            const speechPulse = Math.sin(elapsedTime * 14) * 0.5 + 0.5;
            const syllableMod = Math.sin(elapsedTime * 7.5) * 0.3 + 0.7;
            const openAmount = speechPulse * syllableMod;

            jawGroup.position.y = 0.045 - openAmount * 0.024;
            if (mouthMesh) {
              mouthMesh.scale.y = 1.0 + openAmount * 1.6;
              mouthMesh.position.y = 0.055 - openAmount * 0.012;
            }

            // Head nods naturally with speech cadence
            headGroup.position.y = 0.62 + Math.sin(elapsedTime * 7) * 0.01;

            // Expressive welcoming gesture with right arm
            const gestureWave = Math.sin(elapsedTime * 3.2);
            const gestureWave2 = Math.cos(elapsedTime * 2.8);

            rightArmGroup.rotation.x = -0.55 + gestureWave * 0.12;
            rightArmGroup.rotation.z = -0.35 + gestureWave2 * 0.08;
            rightArmGroup.rotation.y = 0.25 + gestureWave * 0.10;

            rightForearmGroup.rotation.x = 0.55 + gestureWave * 0.15;
            rightForearmGroup.rotation.z = -0.45 + gestureWave2 * 0.10;
            rightForearmGroup.rotation.y = 0.30;

            // Left arm comfortably at side near desk
            leftArmGroup.rotation.x += (0.15 - leftArmGroup.rotation.x) * 0.08;
            leftArmGroup.rotation.z += (0.22 - leftArmGroup.rotation.z) * 0.08;
            leftForearmGroup.rotation.x += (0.42 - leftForearmGroup.rotation.x) * 0.08;
          } else {
            // Reset mouth to warm smile
            jawGroup.position.y += (0.045 - jawGroup.position.y) * 0.15;
            if (mouthMesh) {
              mouthMesh.scale.y += (1.0 - mouthMesh.scale.y) * 0.15;
              mouthMesh.position.y += (0.055 - mouthMesh.position.y) * 0.15;
            }
            headGroup.position.y += (0.62 - headGroup.position.y) * 0.15;

            // Relaxed confident developer posture
            rightArmGroup.rotation.x += (-0.08 - rightArmGroup.rotation.x) * 0.06;
            rightArmGroup.rotation.z += (-0.14 - rightArmGroup.rotation.z) * 0.06;
            rightArmGroup.rotation.y += (0.0 - rightArmGroup.rotation.y) * 0.06;
            rightForearmGroup.rotation.x += (0.20 - rightForearmGroup.rotation.x) * 0.06;
            rightForearmGroup.rotation.z += (-0.08 - rightForearmGroup.rotation.z) * 0.06;

            leftArmGroup.rotation.x += (0.12 - leftArmGroup.rotation.x) * 0.06;
            leftArmGroup.rotation.z += (0.20 - leftArmGroup.rotation.z) * 0.06;
            leftForearmGroup.rotation.x += (0.38 - leftForearmGroup.rotation.x) * 0.06;
          }
        }

        // --- C. HEAD TRACKING & LOOK-AT ---
        const targetHeadY = currentRotationY * 0.8 - 0.12;
        const targetHeadX = -currentRotationX * 0.55;
        headGroup.rotation.y += (targetHeadY - headGroup.rotation.y) * 0.08;
        headGroup.rotation.x += (targetHeadX - headGroup.rotation.x) * 0.08;

        // --- D. ANIME EYE BLINKING (Every 3.6s) ---
        const blinkCycle = elapsedTime % 3.6;
        if (blinkCycle < 0.14) {
          const blinkScale = Math.sin((blinkCycle / 0.14) * Math.PI);
          eyesGroup.scale.y = Math.max(0.08, 1 - blinkScale * 0.92);
        } else {
          eyesGroup.scale.y = 1.0;
        }

        // --- E. FLOATING TECH PILLS BOBBING ---
        floatingBadges.forEach((mesh) => {
          mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.speed + mesh.userData.offset) * 0.12;
          mesh.rotation.y += 0.015;
          mesh.rotation.x += 0.01;
        });

        // --- F. PROCEDURAL CODE EDITOR ANIMATION (Left Screen) ---
        if (codeTextureContext && Math.floor(elapsedTime * 15) !== lineCounter) {
          lineCounter = Math.floor(elapsedTime * 15);
          codeTextureContext.fillStyle = '#0b0e14';
          codeTextureContext.fillRect(0, 0, 512, 320);

          // Editor tab bar
          codeTextureContext.fillStyle = '#161b22';
          codeTextureContext.fillRect(0, 0, 512, 35);
          codeTextureContext.fillStyle = '#ff5a36';
          codeTextureContext.fillRect(20, 10, 14, 14);
          codeTextureContext.fillStyle = '#f7df1e';
          codeTextureContext.fillRect(40, 10, 14, 14);
          codeTextureContext.fillStyle = '#68a063';
          codeTextureContext.fillRect(60, 10, 14, 14);

          codeTextureContext.fillStyle = '#8b949e';
          codeTextureContext.font = '14px monospace';
          codeTextureContext.fillText('YashwanthAvatar3D.jsx', 90, 24);

          // Lines of code
          codeTextureContext.font = '15px monospace';
          const maxVisible = 10;
          const offset = Math.floor(lineCounter * 0.25) % codeLines.length;

          for (let i = 0; i < maxVisible; i++) {
            const line = codeLines[(i + offset) % codeLines.length];
            const y = 65 + i * 24;

            if (line.includes('import') || line.includes('export')) {
              codeTextureContext.fillStyle = '#ff7b72';
            } else if (line.includes('const') || line.includes('return')) {
              codeTextureContext.fillStyle = '#79c0ff';
            } else if (line.includes('//')) {
              codeTextureContext.fillStyle = '#7ee787';
            } else {
              codeTextureContext.fillStyle = '#d2a8ff';
            }

            codeTextureContext.fillText(line, 25, y);
          }

          // Blinking cursor
          if (Math.sin(elapsedTime * 8) > 0) {
            codeTextureContext.fillStyle = '#38bdf8';
            codeTextureContext.fillRect(25, 275, 10, 18);
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
    <div id="workspace-3d-scene" className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] flex items-center justify-center select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Glassmorphism Speech Bubble & Voice Greeting Controls */}
      {showSpeechBubble && (
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 max-w-[280px] sm:max-w-[340px] z-20 transition-all duration-300">
          <div className="relative rounded-2xl bg-black/65 backdrop-blur-xl border border-white/20 p-3.5 sm:p-4 shadow-2xl text-cream">
            {/* Header: Avatar identity + Equalizer bars */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-coral animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-xs font-mono font-bold tracking-wide text-cream">
                  Yashwanth (3D Anime Avatar)
                </span>
              </div>

              {/* Animated Audio Equalizer */}
              <div className="flex items-end gap-1 h-3.5 px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                <span className={`w-0.5 bg-coral rounded-full transition-all duration-150 ${isSpeaking ? 'h-3 animate-pulse' : 'h-1'}`} />
                <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-1.5'}`} style={{ animationDuration: '300ms' }} />
                <span className={`w-0.5 bg-cyan-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-2.5' : 'h-1'}`} style={{ animationDuration: '450ms' }} />
                <span className={`w-0.5 bg-emerald-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-2'}`} style={{ animationDuration: '200ms' }} />
              </div>
            </div>

            {/* Speech Script & Live Word Highlighting */}
            <div className="text-xs sm:text-[13px] leading-relaxed font-sans text-cream/90 max-h-[96px] overflow-y-auto pr-1">
              {isSpeaking ? (
                <span>
                  {SCRIPT_WORDS.map((word, idx) => (
                    <span
                      key={idx}
                      className={`inline-block mr-1 transition-colors duration-150 ${
                        idx === currentWordIndex
                          ? 'text-coral font-bold scale-110 drop-shadow-[0_0_8px_rgba(255,90,54,0.8)]'
                          : idx < currentWordIndex
                          ? 'text-cream font-medium'
                          : 'text-cream/50'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              ) : (
                <p className="text-cream/80 italic">
                  "👋 Hi, I'm Yashwanth! Welcome to my portfolio. Tap below to hear my 3D voice introduction!"
                </p>
              )}
            </div>

            {/* Interactive Action Button: Play/Pause Voice Intro */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleSpeech}
                onMouseEnter={() => sound.playPop()}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md ${
                  isSpeaking
                    ? 'bg-obsidian text-coral border border-coral/40 hover:bg-black'
                    : 'bg-gradient-to-r from-coral to-terracotta hover:from-coral-light hover:to-coral text-white shadow-coral/30 hover:scale-[1.02]'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Pause className="w-3.5 h-3.5 animate-pulse text-coral" />
                    <span>Pause Voice Intro</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>▶ Hear Voice Intro</span>
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
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cream transition-colors border border-white/10"
                title={sound.isMuted() ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Toggle Sound"
              >
                {sound.isMuted() ? <VolumeX className="w-3.5 h-3.5 text-coral" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>

            {/* Bubble tail pointing toward Yashwanth's 3D avatar */}
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-black/65 border-r border-b border-white/20 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Auto-Prompt Callout Badge on Load (First Visit Guidance) */}
      {!hasInteracted && !isSpeaking && (
        <button
          type="button"
          onClick={() => startSpeech(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-coral/95 hover:bg-coral text-white font-mono text-xs sm:text-sm font-semibold shadow-2xl shadow-coral/50 border border-white/30 backdrop-blur-md animate-bounce cursor-pointer z-30 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
          <span>👋 Click anywhere to hear Yashwanth's 3D Voice Intro 🔊</span>
        </button>
      )}

      {/* Fallback if WebGL isn't supported */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-obsidian-surface/80 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-coral mb-4 shadow-xl">
            <img src="./yashwanth.jpg" alt="Yashwanth S" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-serif font-bold text-cream">Yashwanth S</h3>
          <p className="text-sm text-cream/70 max-w-sm mt-1">
            Frontend Developer & Software Engineer passionate about interactive 3D WebGL interfaces and clean code architecture.
          </p>
        </div>
      )}
    </div>
  );
}
