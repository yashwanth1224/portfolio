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
  // 1. Attempt auto-start on load after 900ms
  // 2. Attach global one-time interaction listeners so ANY click/touch/scroll immediately starts the voice intro
  useEffect(() => {
    const autoPlayTimer = setTimeout(() => {
      if (!hasStartedSpeechRef.current) {
        try {
          startSpeech(false);
        } catch {
          // Handled by interaction listener
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
  // Three.js 3D Interactive Stage with Official 3D Avatar & Parallax Depth
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
    let floatingBadges = [];
    let codeTextureCanvas, codeTextureContext, codeTexture;
    let particlesMesh;

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
      camera.position.set(0, 0.45, 4.4);
      camera.lookAt(0, 0.25, 0);

      // 2. WebGL Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // 3. Lighting Setup (Atmospheric Deep Navy, Crisp Key Light, Cyan & Cobalt Rims)
      const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.95);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
      mainLight.position.set(3, 5, 4);
      mainLight.castShadow = true;
      scene.add(mainLight);

      // Cobalt blue rim light (Brand accent glow)
      const rimLightCobalt = new THREE.PointLight(0x2563eb, 3.5, 10);
      rimLightCobalt.position.set(-3, 2, -1);
      scene.add(rimLightCobalt);

      // Cyan rim light (Modern digital tech glow)
      const rimLightCyan = new THREE.PointLight(0x38bdf8, 3.2, 10);
      rimLightCyan.position.set(3, 1.5, -0.5);
      scene.add(rimLightCyan);

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
      // 5. MODERN MINIMALIST WORKSPACE (DESK & LIVE MONITORS)
      // ==========================================
      deskGroup.position.set(-0.75, -0.35, -0.3);

      // Standing Desk Top Slab
      const deskTopGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
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
      legLeft.position.set(-1.0, -0.3, 0);
      deskGroup.add(legLeft);

      const legRight = new THREE.Mesh(legGeo, legMat);
      legRight.position.set(1.0, -0.3, 0);
      deskGroup.add(legRight);

      // Dual Monitors Setup
      const monitorsGroup = new THREE.Group();
      codeTextureCanvas = document.createElement('canvas');
      codeTextureCanvas.width = 512;
      codeTextureCanvas.height = 320;
      codeTextureContext = codeTextureCanvas.getContext('2d');
      codeTexture = new THREE.CanvasTexture(codeTextureCanvas);

      const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x07090e, roughness: 0.2, metalness: 0.85 });
      const screenMat = new THREE.MeshBasicMaterial({ map: codeTexture });

      // Left Monitor (Curved slightly towards Yashwanth - Live Code Editor)
      const monitorGeo = new THREE.BoxGeometry(1.15, 0.72, 0.03);
      const leftScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      leftScreen.position.set(-0.55, 0.78, -0.15);
      leftScreen.rotation.y = 0.24;

      const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.10, 0.67), screenMat);
      leftDisplay.position.set(0, 0, 0.016);
      leftScreen.add(leftDisplay);
      monitorsGroup.add(leftScreen);

      // Left Monitor Stand
      const standPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
      const standPole = new THREE.Mesh(standPoleGeo, legMat);
      standPole.position.set(-0.55, 0.48, -0.2);
      monitorsGroup.add(standPole);

      // Right Monitor (React UI Preview & Metrics)
      const rightScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      rightScreen.position.set(0.55, 0.78, -0.15);
      rightScreen.rotation.y = -0.24;

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
      rightCtx.fillStyle = '#2563eb';
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

      const rightStandPole = new THREE.Mesh(standPoleGeo, legMat);
      rightStandPole.position.set(0.55, 0.48, -0.2);
      monitorsGroup.add(rightStandPole);

      deskGroup.add(monitorsGroup);
      mainGroup.add(deskGroup);

      // ==========================================
      // 6. FUTURISTIC HOLOGRAPHIC PEDESTAL
      // ==========================================
      pedestalGroup.position.set(0.55, -0.92, 0.15);

      // Concentric Cyan & Cobalt Rings
      const ringMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const ringMatCobalt = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
      const ringMatOuter = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });

      // Inner ring
      const innerRingGeo = new THREE.RingGeometry(0.46, 0.52, 48);
      const innerRing = new THREE.Mesh(innerRingGeo, ringMatCyan);
      innerRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(innerRing);

      // Middle cobalt ring
      const middleRingGeo = new THREE.RingGeometry(0.66, 0.73, 48);
      const middleRing = new THREE.Mesh(middleRingGeo, ringMatCobalt);
      middleRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(middleRing);

      // Outer glowing pulse ring
      const outerRingGeo = new THREE.RingGeometry(0.86, 0.92, 48);
      const outerRing = new THREE.Mesh(outerRingGeo, ringMatOuter);
      outerRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(outerRing);

      // Upward vertical holographic beam cylinder
      const holoCylinderGeo = new THREE.CylinderGeometry(0.82, 0.65, 0.45, 32, 1, true);
      const holoCylinderMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const holoCylinder = new THREE.Mesh(holoCylinderGeo, holoCylinderMat);
      holoCylinder.position.y = 0.22;
      pedestalGroup.add(holoCylinder);

      mainGroup.add(pedestalGroup);

      // ==========================================
      // 7. OFFICIAL 3D AVATAR (CUTOUT RENDER)
      // ==========================================
      avatarGroup.position.set(0.55, -0.92, 0.15);

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

      // Dynamic Audio Waveform Acoustic Aura (around laptop/chest area)
      acousticRingsGroup.position.set(0, 1.45, 0.08);
      const auraRingMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const auraRingMat2 = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const auraRingMat3 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });

      const auraMesh1 = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.38, 36), auraRingMat1);
      const auraMesh2 = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.58, 36), auraRingMat2);
      const auraMesh3 = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.78, 36), auraRingMat3);
      acousticRingsGroup.add(auraMesh1);
      acousticRingsGroup.add(auraMesh2);
      acousticRingsGroup.add(auraMesh3);
      avatarGroup.add(acousticRingsGroup);

      mainGroup.add(avatarGroup);

      // ==========================================
      // 8. FLOATING 3D TECH BADGES
      // ==========================================
      const techBadges = [
        { name: 'React', color: '#00d8ff', bg: '#082f49', pos: [-1.4, 1.3, 0.4], speed: 1.4, offset: 0 },
        { name: 'JavaScript', color: '#f7df1e', bg: '#422006', pos: [-1.2, 0.2, 0.5], speed: 1.8, offset: 1.2 },
        { name: 'Node.js', color: '#4ade80', bg: '#052e16', pos: [1.5, 1.5, 0.3], speed: 1.6, offset: 2.1 },
        { name: 'Java', color: '#fb923c', bg: '#431407', pos: [1.7, 0.5, 0.4], speed: 2.0, offset: 3.0 },
        { name: 'Tailwind', color: '#38bdf8', bg: '#0c4a6e', pos: [0.0, 1.8, -0.2], speed: 1.5, offset: 4.2 },
      ];

      techBadges.forEach((tech) => {
        const badgeCanvas = document.createElement('canvas');
        badgeCanvas.width = 256;
        badgeCanvas.height = 96;
        const bCtx = badgeCanvas.getContext('2d');

        // Rounded pill background
        bCtx.fillStyle = tech.bg;
        bCtx.strokeStyle = tech.color;
        bCtx.lineWidth = 4;
        bCtx.beginPath();
        bCtx.roundRect(8, 8, 240, 80, 40);
        bCtx.fill();
        bCtx.stroke();

        // Text
        bCtx.fillStyle = '#ffffff';
        bCtx.font = 'bold 30px monospace';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(tech.name, 128, 48);

        const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
        const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true, side: THREE.DoubleSide });
        const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.21), badgeMat);
        badgeMesh.position.set(...tech.pos);
        badgeMesh.userData = { initialY: tech.pos[1], speed: tech.speed, offset: tech.offset };
        mainGroup.add(badgeMesh);
        floatingBadges.push(badgeMesh);
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
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('resize', handleResize);

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

        // Holographic pedestal rings rotation
        middleRing.rotation.z = -elapsedTime * 0.4;
        innerRing.rotation.z = elapsedTime * 0.5;
        const pulseScale = 1.0 + Math.sin(elapsedTime * 3) * 0.06;
        outerRing.scale.set(pulseScale, pulseScale, pulseScale);
        outerRing.material.opacity = 0.3 + Math.sin(elapsedTime * 3) * 0.15;
        holoCylinder.material.opacity = 0.08 + Math.sin(elapsedTime * 4) * 0.04;

        // Floating tech badges sinusoidal bobbing
        floatingBadges.forEach((badge) => {
          const { initialY, speed, offset } = badge.userData;
          badge.position.y = initialY + Math.sin(elapsedTime * speed + offset) * 0.08;
          badge.rotation.y = currentRotationY * 0.6;
        });

        // Ambient particles drift
        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.02;
          particlesMesh.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;
        }

        // Dynamic Acoustic Aura Rings (Waveform pulses when speaking)
        if (speakingNow) {
          const wave1 = (elapsedTime * 3.5) % 1;
          const wave2 = ((elapsedTime * 3.5) + 0.33) % 1;
          const wave3 = ((elapsedTime * 3.5) + 0.66) % 1;

          auraMesh1.scale.set(1 + wave1 * 1.2, 1 + wave1 * 1.2, 1);
          auraRingMat1.opacity = (1 - wave1) * 0.8;

          auraMesh2.scale.set(1 + wave2 * 1.2, 1 + wave2 * 1.2, 1);
          auraRingMat2.opacity = (1 - wave2) * 0.7;

          auraMesh3.scale.set(1 + wave3 * 1.2, 1 + wave3 * 1.2, 1);
          auraRingMat3.opacity = (1 - wave3) * 0.6;
        } else {
          auraRingMat1.opacity += (0 - auraRingMat1.opacity) * 0.1;
          auraRingMat2.opacity += (0 - auraRingMat2.opacity) * 0.1;
          auraRingMat3.opacity += (0 - auraRingMat3.opacity) * 0.1;
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
            { text: "  const [focus] = useState('Architecture');", color: '#fbbf24' },
            { text: "  return (", color: '#f472b6' },
            { text: "    <InteractiveStage fps={60}>", color: '#4ade80' },
            { text: "      <HolographicPedestal cyan rings />", color: '#38bdf8' },
            { text: "      <VoiceSynthesizer active={true} />", color: '#a78bfa' },
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
          <div className="relative rounded-2xl bg-[#07111A]/90 backdrop-blur-xl border border-sky-400/30 p-3.5 sm:p-4 shadow-2xl text-cream">
            {/* Header: Avatar identity + Equalizer bars */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-sky-400 animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-xs font-mono font-bold tracking-wide text-cream">
                  Yashwanth (3D Avatar)
                </span>
              </div>

              {/* Animated Audio Equalizer with Cyan and Blue Bars */}
              <div className="flex items-end gap-1 h-3.5 px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
                <span className={`w-0.5 bg-sky-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3 animate-pulse' : 'h-1'}`} />
                <span className={`w-0.5 bg-blue-500 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-1.5'}`} style={{ animationDuration: '300ms' }} />
                <span className={`w-0.5 bg-cyan-300 rounded-full transition-all duration-150 ${isSpeaking ? 'h-2.5' : 'h-1'}`} style={{ animationDuration: '450ms' }} />
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
                          ? 'text-sky-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
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
                    ? 'bg-navy-dark text-sky-400 border border-sky-400/40 hover:bg-black'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25 hover:scale-[1.02]'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Pause className="w-3.5 h-3.5 animate-pulse text-sky-400" />
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
                {sound.isMuted() ? <VolumeX className="w-3.5 h-3.5 text-sky-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>

            {/* Bubble tail pointing toward Yashwanth's 3D avatar */}
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-[#07111A]/90 border-r border-b border-sky-400/30 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Auto-Prompt Callout Badge on Load (First Visit Guidance) */}
      {!hasInteracted && !isSpeaking && (
        <button
          type="button"
          onClick={() => startSpeech(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono text-xs sm:text-sm font-semibold shadow-2xl shadow-sky-500/50 border border-white/30 backdrop-blur-md animate-bounce cursor-pointer z-30 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-sky-200 animate-spin" style={{ animationDuration: '3s' }} />
          <span>👋 Click anywhere to hear Yashwanth's 3D Voice Intro 🔊</span>
        </button>
      )}

      {/* Fallback if WebGL isn't supported */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-obsidian-surface/80 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sky-400 mb-4 shadow-xl">
            <img src="./avatar-3d.png" alt="Yashwanth S - 3D Avatar" className="w-full h-full object-contain" />
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
