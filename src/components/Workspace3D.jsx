import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Sparkles, MessageSquare, Play, Pause } from 'lucide-react';
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

  // References to share state with Three.js animation loop without re-triggering effects
  const isSpeakingRef = useRef(false);
  const wordProgressRef = useRef(0);
  const speechUtteranceRef = useRef(null);
  const fallbackIntervalRef = useRef(null);

  // Synchronize ref with state
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Procedural Web Audio fallback voice synth (for browsers with restricted or missing SpeechSynthesis)
  const playProceduralPhoneme = useCallback((word, index) => {
    try {
      sound.init();
      const ctx = sound.ctx;
      if (!ctx || sound.isMuted()) return;
      const now = ctx.currentTime;

      // Create fundamental vocal cord oscillator (male speech pitch ~ 120-150Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Pitch variation based on word cadence
      const baseFreq = 125 + Math.sin(index * 0.7) * 22;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.16);

      // Vocal formant filter (simulating open vowel / formant resonance)
      filter.type = 'bandpass';
      const formants = [500, 750, 1100, 1400, 850];
      filter.frequency.setValueAtTime(formants[index % formants.length], now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.04, now);
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
  const startSpeech = useCallback(() => {
    setHasInteracted(true);
    setShowSpeechBubble(true);
    stopSpeech();

    // If muted, unmute for speech
    if (sound.isMuted()) {
      sound.toggleMute();
    }

    if (typeof window === 'undefined') return;

    const synth = window.speechSynthesis;
    let voiceSuccess = false;

    if (synth) {
      try {
        const utterance = new SpeechSynthesisUtterance(GREETING_SCRIPT);
        speechUtteranceRef.current = utterance;

        // Pick natural English voice
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

        utterance.rate = 0.96; // Crisp, natural pacing
        utterance.pitch = 1.0;

        utterance.onstart = () => {
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

        // Fallback interval to guarantee live caption progression on devices where boundary events don't fire
        let simulatedIndex = 0;
        const totalDuration = 10500; // ~10.5s for 29 words
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

    // Procedural voice fallback if SpeechSynthesis unavailable or failed
    if (!voiceSuccess) {
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
      startSpeech();
    }
  }, [isSpeaking, startSpeech, stopSpeech]);

  // Listen for external trigger from Hero.jsx
  useEffect(() => {
    const handleExternalTrigger = () => {
      startSpeech();
    };

    window.addEventListener('trigger-avatar-speech', handleExternalTrigger);
    return () => {
      window.removeEventListener('trigger-avatar-speech', handleExternalTrigger);
    };
  }, [startSpeech]);

  // Three.js 3D Workspace Scene with Full-Body Human Developer Avatar
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let mainGroup = new THREE.Group();
    let deskGroup = new THREE.Group();
    let monitorsGroup = new THREE.Group();
    let floatingBadges = [];
    let codeTextureCanvas, codeTextureContext, codeTexture;

    // Avatar parts for animation
    let avatarGroup = new THREE.Group();
    let torsoGroup = new THREE.Group();
    let headGroup = new THREE.Group();
    let eyesGroup = new THREE.Group();
    let jawGroup = new THREE.Group();
    let mouthMesh = null;
    let rightArmGroup = new THREE.Group();
    let rightForearmGroup = new THREE.Group();
    let rightHandMesh = null;
    let leftArmGroup = new THREE.Group();

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
      camera.position.set(0, 0.9, 4.6);
      camera.lookAt(0, 0.65, 0);

      // 2. WebGL Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // 3. Lighting Setup (Crisp Studio & Warm Key Lights)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
      mainLight.position.set(3, 5, 4);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      scene.add(mainLight);

      // Warm portrait key light focused on Yashwanth's face and shirt
      const keyLight = new THREE.PointLight(0xffeedd, 1.8, 8);
      keyLight.position.set(1.4, 2.0, 1.8);
      scene.add(keyLight);

      // Coral rim light (matching portfolio brand accent)
      const rimLightCoral = new THREE.PointLight(0xff5a36, 2.6, 10);
      rimLightCoral.position.set(-3, 2, -1);
      scene.add(rimLightCoral);

      // Cyan rim light (modern digital tech glow)
      const rimLightCyan = new THREE.PointLight(0x00d8ff, 2.2, 10);
      rimLightCyan.position.set(3, 1.5, -1);
      scene.add(rimLightCyan);

      // Soft ground contact shadow plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(6, 4);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.25 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.71;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // ==========================================
      // 4. STANDING DESK & WORKSPACE SETUP
      // ==========================================
      deskGroup.position.set(-0.45, 0, 0);

      // Desk Top Slab
      const deskTopGeo = new THREE.BoxGeometry(3.0, 0.09, 1.5);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x1f232b,
        roughness: 0.35,
        metalness: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
      deskTop.position.set(0, 0.7, 0);
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

      // ==========================================
      // 6. FULL-BODY 3D DEVELOPER AVATAR (YASHWANTH)
      // ==========================================
      avatarGroup.position.set(1.35, -0.7, 0.35);
      avatarGroup.rotation.y = -0.22; // Angled naturally towards camera and desk

      // Materials for Stylized Developer Character
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2be9f, roughness: 0.65, metalness: 0.05 });
      const lipsMat = new THREE.MeshStandardMaterial({ color: 0xd98b7a, roughness: 0.6 });
      const teethMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const mouthInnerMat = new THREE.MeshStandardMaterial({ color: 0x2b0d0d, roughness: 0.5 });
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x16161a, roughness: 0.85, metalness: 0.1 });
      const beardMat = new THREE.MeshStandardMaterial({ color: 0x18191e, roughness: 0.9, metalness: 0.05 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, metalness: 0.05 });
      const shirtDetailMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
      const buttonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.4 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x232731, roughness: 0.65, metalness: 0.15 });
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.5, metalness: 0.2 });
      const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 });
      const sneakerWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      const sneakerSoleMat = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.8 });
      const earringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });
      const watchBandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const watchCaseMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.8 });
      const watchScreenMat = new THREE.MeshBasicMaterial({ color: 0x00d8ff });

      // --- A. LEGS & SNEAKERS ---
      const legsGroup = new THREE.Group();

      const createLeg = (isLeft) => {
        const leg = new THREE.Group();
        const sign = isLeft ? -1 : 1;
        leg.position.x = sign * 0.13;

        // Thigh
        const thighGeo = new THREE.CylinderGeometry(0.08, 0.072, 0.42, 16);
        const thigh = new THREE.Mesh(thighGeo, pantsMat);
        thigh.position.y = 0.81;
        thigh.castShadow = true;
        leg.add(thigh);

        // Knee
        const kneeGeo = new THREE.SphereGeometry(0.072, 12, 12);
        const knee = new THREE.Mesh(kneeGeo, pantsMat);
        knee.position.y = 0.59;
        leg.add(knee);

        // Calf
        const calfGeo = new THREE.CylinderGeometry(0.072, 0.062, 0.42, 16);
        const calf = new THREE.Mesh(calfGeo, pantsMat);
        calf.position.y = 0.38;
        calf.castShadow = true;
        leg.add(calf);

        // Modern White Designer Sneaker with Dark Sole
        const shoe = new THREE.Group();
        shoe.position.set(0, 0, isLeft ? 0.02 : 0.04);
        if (!isLeft) shoe.rotation.y = 0.08;

        // Dark rubber outsole
        const soleGeo = new THREE.BoxGeometry(0.14, 0.038, 0.32);
        const sole = new THREE.Mesh(soleGeo, sneakerSoleMat);
        sole.position.y = 0.019;
        sole.castShadow = true;
        shoe.add(sole);

        // Crisp white upper
        const upperGeo = new THREE.BoxGeometry(0.132, 0.085, 0.28);
        const upper = new THREE.Mesh(upperGeo, sneakerWhiteMat);
        upper.position.y = 0.075;
        upper.position.z = -0.01;
        upper.castShadow = true;
        shoe.add(upper);

        // Rounded toe cap
        const toeGeo = new THREE.SphereGeometry(0.064, 14, 14);
        const toe = new THREE.Mesh(toeGeo, sneakerWhiteMat);
        toe.scale.set(1.0, 0.65, 1.25);
        toe.position.set(0, 0.055, 0.11);
        toe.castShadow = true;
        shoe.add(toe);

        // Subtle sneaker accent line
        const stripeGeo = new THREE.BoxGeometry(0.136, 0.012, 0.18);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(0, 0.06, -0.01);
        shoe.add(stripe);

        leg.add(shoe);
        return leg;
      };

      legsGroup.add(createLeg(true));  // Left leg
      legsGroup.add(createLeg(false)); // Right leg

      // Pelvis / Hips & Belt
      const hipsGeo = new THREE.BoxGeometry(0.38, 0.18, 0.23);
      const hips = new THREE.Mesh(hipsGeo, pantsMat);
      hips.position.y = 1.05;
      hips.castShadow = true;
      legsGroup.add(hips);

      const beltGeo = new THREE.BoxGeometry(0.39, 0.045, 0.24);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.y = 1.13;
      legsGroup.add(belt);

      const buckleGeo = new THREE.BoxGeometry(0.06, 0.05, 0.015);
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, 1.13, 0.125);
      legsGroup.add(buckle);

      avatarGroup.add(legsGroup);

      // --- B. TORSO & CRISP WHITE BUTTON-DOWN SHIRT ---
      torsoGroup.position.set(0, 1.15, 0);

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
      const buttonPositions = [0.10, 0.20, 0.30, 0.40];
      buttonPositions.forEach(bY => {
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

      // Left and right collar folded points
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
      const neck = new THREE.Mesh(neckGeo, skinMat);
      neck.position.set(0, 0.55, 0);
      neck.castShadow = true;
      torsoGroup.add(neck);

      // --- C. HEAD & FACE MATCHING YASHWANTH'S PORTRAIT ---
      headGroup.position.set(0, 0.62, 0); // Head pivot

      // Main Head Mesh
      const headCraniumGeo = new THREE.SphereGeometry(0.175, 24, 24);
      const headCranium = new THREE.Mesh(headCraniumGeo, skinMat);
      headCranium.scale.set(0.95, 1.12, 1.0);
      headCranium.position.y = 0.16;
      headCranium.castShadow = true;
      headGroup.add(headCranium);

      // Sculpted masculine jaw & chin
      const jawBoxGeo = new THREE.BoxGeometry(0.165, 0.11, 0.15);
      const jawBox = new THREE.Mesh(jawBoxGeo, skinMat);
      jawBox.position.set(0, 0.07, 0.04);
      headGroup.add(jawBox);

      // Ears
      const earGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const leftEar = new THREE.Mesh(earGeo, skinMat);
      leftEar.scale.set(0.35, 1.0, 0.7);
      leftEar.position.set(-0.175, 0.16, -0.01);
      headGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeo, skinMat);
      rightEar.scale.set(0.35, 1.0, 0.7);
      rightEar.position.set(0.175, 0.16, -0.01);
      headGroup.add(rightEar);

      // Silver Earring Stud on Left Ear (Exact match to Yashwanth's portrait photo!)
      const earringGeo = new THREE.SphereGeometry(0.012, 12, 12);
      const earring = new THREE.Mesh(earringGeo, earringMat);
      earring.position.set(-0.182, 0.13, -0.01);
      headGroup.add(earring);

      // Modern Black Hair with Quiff / Pompadour Volume
      const hairCrownGeo = new THREE.SphereGeometry(0.192, 22, 22);
      const hairCrown = new THREE.Mesh(hairCrownGeo, hairMat);
      hairCrown.scale.set(0.98, 1.08, 1.08);
      hairCrown.position.set(0, 0.21, -0.02);
      headGroup.add(hairCrown);

      // Styled upward swept pompadour quiff
      const quiffGeo = new THREE.BoxGeometry(0.20, 0.09, 0.15);
      const quiff = new THREE.Mesh(quiffGeo, hairMat);
      quiff.rotation.x = -0.32;
      quiff.position.set(0, 0.31, 0.06);
      headGroup.add(quiff);

      const quiffTuftGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const quiffTuft1 = new THREE.Mesh(quiffTuftGeo, hairMat);
      quiffTuft1.scale.set(1.1, 0.7, 1.2);
      quiffTuft1.position.set(-0.04, 0.34, 0.07);
      headGroup.add(quiffTuft1);

      const quiffTuft2 = new THREE.Mesh(quiffTuftGeo, hairMat);
      quiffTuft2.scale.set(1.0, 0.65, 1.1);
      quiffTuft2.position.set(0.05, 0.33, 0.06);
      headGroup.add(quiffTuft2);

      // Eyebrows
      const browGeo = new THREE.BoxGeometry(0.072, 0.018, 0.02);
      const leftBrow = new THREE.Mesh(browGeo, hairMat);
      leftBrow.rotation.set(0, 0.12, -0.08);
      leftBrow.position.set(-0.068, 0.22, 0.165);
      headGroup.add(leftBrow);

      const rightBrow = new THREE.Mesh(browGeo, hairMat);
      rightBrow.rotation.set(0, -0.12, 0.08);
      rightBrow.position.set(0.068, 0.22, 0.165);
      headGroup.add(rightBrow);

      // Eyes Group (Allows blinking by scaling Y)
      eyesGroup.position.set(0, 0.17, 0.155);

      const createEye = (isLeft) => {
        const eye = new THREE.Group();
        eye.position.x = isLeft ? -0.065 : 0.065;

        // White eyeball
        const eyeBallGeo = new THREE.SphereGeometry(0.03, 16, 16);
        const eyeBall = new THREE.Mesh(eyeBallGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        eye.add(eyeBall);

        // Warm dark brown iris
        const irisGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.005, 16);
        const irisMat = new THREE.MeshStandardMaterial({ color: 0x1a120c, roughness: 0.2 });
        const iris = new THREE.Mesh(irisGeo, irisMat);
        iris.rotation.x = Math.PI / 2;
        iris.position.z = 0.027;
        eye.add(iris);

        // Pupil
        const pupilGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 16);
        const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
        pupil.rotation.x = Math.PI / 2;
        pupil.position.z = 0.028;
        eye.add(pupil);

        // Catchlight highlight dot
        const highlightGeo = new THREE.SphereGeometry(0.004, 8, 8);
        const highlight = new THREE.Mesh(highlightGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        highlight.position.set(isLeft ? 0.005 : -0.005, 0.007, 0.03);
        eye.add(highlight);

        return eye;
      };

      eyesGroup.add(createEye(true));
      eyesGroup.add(createEye(false));
      headGroup.add(eyesGroup);

      // Nose
      const noseGeo = new THREE.ConeGeometry(0.026, 0.065, 8);
      const nose = new THREE.Mesh(noseGeo, skinMat);
      nose.rotation.x = Math.PI;
      nose.position.set(0, 0.135, 0.185);
      headGroup.add(nose);

      // Trimmed Mustache (Matching Yashwanth's portrait)
      const mustacheWingGeo = new THREE.BoxGeometry(0.055, 0.022, 0.022);
      const leftMustache = new THREE.Mesh(mustacheWingGeo, beardMat);
      leftMustache.rotation.set(0, 0.22, 0.18);
      leftMustache.position.set(-0.038, 0.086, 0.17);
      headGroup.add(leftMustache);

      const rightMustache = new THREE.Mesh(mustacheWingGeo, beardMat);
      rightMustache.rotation.set(0, -0.22, -0.18);
      rightMustache.position.set(0.038, 0.086, 0.17);
      headGroup.add(rightMustache);

      // Trimmed Beard / Chinstrap along Jawline
      const chinBeardGeo = new THREE.BoxGeometry(0.09, 0.05, 0.055);
      const chinBeard = new THREE.Mesh(chinBeardGeo, beardMat);
      chinBeard.position.set(0, 0.015, 0.13);
      headGroup.add(chinBeard);

      const jawBeardGeo = new THREE.BoxGeometry(0.028, 0.045, 0.13);
      const leftJawBeard = new THREE.Mesh(jawBeardGeo, beardMat);
      leftJawBeard.position.set(-0.10, 0.045, 0.03);
      headGroup.add(leftJawBeard);

      const rightJawBeard = new THREE.Mesh(jawBeardGeo, beardMat);
      rightJawBeard.position.set(0.10, 0.045, 0.03);
      headGroup.add(rightJawBeard);

      // Articulated Mouth & Jaw (Opens dynamically when speaking!)
      const mouthCavityGeo = new THREE.BoxGeometry(0.08, 0.032, 0.035);
      mouthMesh = new THREE.Mesh(mouthCavityGeo, mouthInnerMat);
      mouthMesh.position.set(0, 0.055, 0.155);

      // Upper white teeth row
      const upperTeethGeo = new THREE.BoxGeometry(0.065, 0.012, 0.015);
      const upperTeeth = new THREE.Mesh(upperTeethGeo, teethMat);
      upperTeeth.position.set(0, 0.065, 0.168);
      headGroup.add(upperTeeth);

      // Lower Jaw & Lip Group (Moves down on speech)
      jawGroup.position.set(0, 0.045, 0.168);

      const lowerTeethGeo = new THREE.BoxGeometry(0.06, 0.01, 0.015);
      const lowerTeeth = new THREE.Mesh(lowerTeethGeo, teethMat);
      lowerTeeth.position.set(0, 0.002, 0);
      jawGroup.add(lowerTeeth);

      const lowerLipGeo = new THREE.BoxGeometry(0.075, 0.015, 0.018);
      const lowerLip = new THREE.Mesh(lowerLipGeo, lipsMat);
      lowerLip.position.set(0, -0.007, 0.002);
      jawGroup.add(lowerLip);

      headGroup.add(mouthMesh);
      headGroup.add(jawGroup);
      torsoGroup.add(headGroup);

      // --- D. LEFT ARM & SMARTWATCH ---
      leftArmGroup.position.set(-0.25, 0.48, 0); // Left shoulder pivot

      const leftShoulderGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const leftShoulder = new THREE.Mesh(leftShoulderGeo, shirtMat);
      leftArmGroup.add(leftShoulder);

      const leftUpperArmGeo = new THREE.CylinderGeometry(0.058, 0.05, 0.28, 16);
      const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, shirtMat);
      leftUpperArm.position.y = -0.14;
      leftArmGroup.add(leftUpperArm);

      const leftForearmGroup = new THREE.Group();
      leftForearmGroup.position.y = -0.28;

      const leftForearmGeo = new THREE.CylinderGeometry(0.05, 0.044, 0.26, 16);
      const leftForearm = new THREE.Mesh(leftForearmGeo, shirtMat);
      leftForearm.position.y = -0.13;
      leftForearmGroup.add(leftForearm);

      // Smartwatch on Left Wrist
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
      const leftHand = new THREE.Mesh(handGeo, skinMat);
      leftHand.position.y = -0.29;
      leftForearmGroup.add(leftHand);

      // Position left arm naturally resting near the desk edge
      leftArmGroup.rotation.set(0.3, 0.1, 0.25);
      leftForearmGroup.rotation.set(0.4, 0.2, -0.3);
      leftArmGroup.add(leftForearmGroup);
      torsoGroup.add(leftArmGroup);

      // --- E. RIGHT ARM (WAVES & GESTURES TO VIEWER) ---
      rightArmGroup.position.set(0.25, 0.48, 0); // Right shoulder pivot

      const rightShoulder = new THREE.Mesh(leftShoulderGeo, shirtMat);
      rightArmGroup.add(rightShoulder);

      const rightUpperArm = new THREE.Mesh(leftUpperArmGeo, shirtMat);
      rightUpperArm.position.y = -0.14;
      rightArmGroup.add(rightUpperArm);

      rightForearmGroup.position.y = -0.28; // Right elbow pivot

      const rightForearm = new THREE.Mesh(leftForearmGeo, shirtMat);
      rightForearm.position.y = -0.13;
      rightForearmGroup.add(rightForearm);

      rightHandMesh = new THREE.Mesh(handGeo, skinMat);
      rightHandMesh.position.y = -0.29;
      rightForearmGroup.add(rightHandMesh);

      // Thumb
      const thumbGeo = new THREE.BoxGeometry(0.02, 0.04, 0.02);
      const rightThumb = new THREE.Mesh(thumbGeo, skinMat);
      rightThumb.position.set(-0.038, -0.28, 0.01);
      rightForearmGroup.add(rightThumb);

      rightArmGroup.add(rightForearmGroup);
      torsoGroup.add(rightArmGroup);

      avatarGroup.add(torsoGroup);
      mainGroup.add(avatarGroup);

      // ==========================================
      // 7. FLOATING TECH SPHERES / PILLS
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
        targetRotationY = x * 0.4;
        targetRotationX = y * 0.22;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // ==========================================
      // 8. HIGH-PERFORMANCE 60FPS ANIMATION LOOP
      // ==========================================
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

      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const elapsedTime = clock.getElapsedTime();
        const speakingNow = isSpeakingRef.current;

        // Smooth camera tilt towards mouse
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        mainGroup.rotation.y = currentRotationY;
        mainGroup.rotation.x = currentRotationX;

        // --- A. IDLE BREATHING & POSTURE ---
        const breath = Math.sin(elapsedTime * 2.2);
        torsoGroup.position.y = 1.15 + breath * 0.012;
        torsoGroup.scale.set(1 + breath * 0.008, 1 + breath * 0.012, 1 + breath * 0.008);

        // Subtle realistic weight shift
        avatarGroup.rotation.z = Math.sin(elapsedTime * 0.7) * 0.01;

        // --- B. HEAD TRACKING & LOOK-AT ---
        // Smoothly rotate head towards the user's cursor
        const targetHeadY = currentRotationY * 0.8 - 0.15;
        const targetHeadX = -currentRotationX * 0.6;
        headGroup.rotation.y += (targetHeadY - headGroup.rotation.y) * 0.08;
        headGroup.rotation.x += (targetHeadX - headGroup.rotation.x) * 0.08;

        // --- C. BLINKING ANIMATION (Every 3.5s) ---
        const blinkCycle = elapsedTime % 3.6;
        if (blinkCycle < 0.14) {
          const blinkScale = Math.sin((blinkCycle / 0.14) * Math.PI);
          eyesGroup.scale.y = Math.max(0.08, 1 - blinkScale * 0.92);
        } else {
          eyesGroup.scale.y = 1.0;
        }

        // --- D. SPEAKING ARTICULATION & WELCOMING GESTURES ---
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

          // Subtle rhythmic head nodding with speech cadence
          headGroup.position.y = 0.62 + Math.sin(elapsedTime * 7) * 0.01;

          // Welcoming expressive hand gestures while speaking!
          const gestureWave = Math.sin(elapsedTime * 3.2);
          const gestureWave2 = Math.cos(elapsedTime * 2.8);

          // Raise right arm forward into open palm welcoming gesture
          rightArmGroup.rotation.x = -0.55 + gestureWave * 0.12;
          rightArmGroup.rotation.z = -0.35 + gestureWave2 * 0.08;
          rightArmGroup.rotation.y = 0.25 + gestureWave * 0.10;

          rightForearmGroup.rotation.x = 0.55 + gestureWave * 0.15;
          rightForearmGroup.rotation.z = -0.45 + gestureWave2 * 0.10;
          rightForearmGroup.rotation.y = 0.30;
        } else {
          // Reset mouth to gentle warm smile
          jawGroup.position.y += (0.045 - jawGroup.position.y) * 0.15;
          if (mouthMesh) {
            mouthMesh.scale.y += (1.0 - mouthMesh.scale.y) * 0.15;
            mouthMesh.position.y += (0.055 - mouthMesh.position.y) * 0.15;
          }
          headGroup.position.y += (0.62 - headGroup.position.y) * 0.15;

          // Initial friendly welcome wave on page load (first 2.8 seconds)
          if (elapsedTime < 2.8) {
            const waveProgress = Math.min(1, elapsedTime / 0.6);
            rightArmGroup.rotation.x = -1.2 * waveProgress;
            rightArmGroup.rotation.z = -0.9 * waveProgress;
            rightForearmGroup.rotation.z = -0.7 + Math.sin(elapsedTime * 8) * 0.35;
          } else {
            // Natural relaxed idle posture
            rightArmGroup.rotation.x += (-0.1 - rightArmGroup.rotation.x) * 0.06;
            rightArmGroup.rotation.z += (-0.12 - rightArmGroup.rotation.z) * 0.06;
            rightArmGroup.rotation.y += (0 - rightArmGroup.rotation.y) * 0.06;
            rightForearmGroup.rotation.x += (0.15 - rightForearmGroup.rotation.x) * 0.06;
            rightForearmGroup.rotation.z += (-0.05 - rightForearmGroup.rotation.z) * 0.06;
          }
        }

        // --- E. FLOATING TECH PILLS ORBIT & BOBBING ---
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
          <div className="relative rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 p-3.5 sm:p-4 shadow-2xl text-cream">
            {/* Header: Avatar identity + Equalizer bars */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-coral animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-xs font-mono font-bold tracking-wide text-cream">
                  Yashwanth (3D Avatar)
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
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-black/60 border-r border-b border-white/20 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Auto-Prompt Callout Badge on Load */}
      {!hasInteracted && !isSpeaking && (
        <div className="absolute bottom-12 right-6 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral/90 backdrop-blur-md border border-white/30 text-white font-mono text-xs font-semibold shadow-xl shadow-coral/30 animate-bounce z-10 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Click "Hear Voice Intro" to hear Yashwanth speak!</span>
        </div>
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
