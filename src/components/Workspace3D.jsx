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
  const [hasInteracted, setHasInteracted] = useState(false);

  const isSpeakingRef = useRef(false);
  const wordProgressRef = useRef(0);
  const speechUtteranceRef = useRef(null);
  const fallbackIntervalRef = useRef(null);
  const hasStartedSpeechRef = useRef(false);
  const voicesRef = useRef([]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

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
    if (isUserInitiated) {
      setHasInteracted(true);
    }
    stopSpeech();

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

        let simulatedIndex = 0;
        const totalDuration = 12500;
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

  // Three.js Scene Setup
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
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 580;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.45, 4.4);
      camera.lookAt(0, 0.25, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Warm Amber / Terracotta Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.05);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffedd5, 1.45);
      mainLight.position.set(2.5, 5, 4);
      mainLight.castShadow = true;
      scene.add(mainLight);

      const rimLightCobalt = new THREE.PointLight(0x2563eb, 2.5, 10);
      rimLightCobalt.position.set(-3, 2, -1);
      scene.add(rimLightCobalt);

      const rimLightCyan = new THREE.PointLight(0x38bdf8, 2.6, 10);
      rimLightCyan.position.set(3, 1.5, -0.5);
      scene.add(rimLightCyan);

      const rimLightOrange = new THREE.PointLight(0xD95D39, 3.8, 8);
      rimLightOrange.position.set(0, -0.5, 2.2);
      scene.add(rimLightOrange);

      // Ambient Particles
      const particleCount = 120;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 8;
        particlePositions[i + 1] = (Math.random() - 0.5) * 5 + 0.5;
        particlePositions[i + 2] = (Math.random() - 0.5) * 5 - 1;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xffb099,
        size: 0.034,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      particlesMesh = new THREE.Points(particleGeo, particleMat);
      scene.add(particlesMesh);

      // Coding Workspace: Desk & Dual Monitors
      deskGroup.position.set(0, -0.45, -0.55);

      const deskTopGeo = new THREE.BoxGeometry(2.8, 0.08, 1.1);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x141824,
        roughness: 0.35,
        metalness: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
      deskTop.position.set(0, 0.25, 0);
      deskGroup.add(deskTop);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x090b10, roughness: 0.5, metalness: 0.8 });
      const legGeo = new THREE.BoxGeometry(0.08, 1.1, 0.08);
      const legLeft = new THREE.Mesh(legGeo, legMat);
      legLeft.position.set(-1.25, -0.3, 0);
      deskGroup.add(legLeft);

      const legRight = new THREE.Mesh(legGeo, legMat);
      legRight.position.set(1.25, -0.3, 0);
      deskGroup.add(legRight);

      // Dual Monitors
      const monitorsGroup = new THREE.Group();
      codeTextureCanvas = document.createElement('canvas');
      codeTextureCanvas.width = 512;
      codeTextureCanvas.height = 320;
      codeTextureContext = codeTextureCanvas.getContext('2d');
      codeTexture = new THREE.CanvasTexture(codeTextureCanvas);

      const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x07090e, roughness: 0.2, metalness: 0.85 });
      const screenMat = new THREE.MeshBasicMaterial({ map: codeTexture });

      const monitorGeo = new THREE.BoxGeometry(1.15, 0.72, 0.03);
      const leftScreen = new THREE.Mesh(monitorGeo, screenBezelMat);
      leftScreen.position.set(-1.08, 0.82, -0.1);
      leftScreen.rotation.y = 0.32;

      const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.10, 0.67), screenMat);
      leftDisplay.position.set(0, 0, 0.016);
      leftScreen.add(leftDisplay);
      monitorsGroup.add(leftScreen);

      const standPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
      const standPoleLeft = new THREE.Mesh(standPoleGeo, legMat);
      standPoleLeft.position.set(-1.08, 0.52, -0.15);
      monitorsGroup.add(standPoleLeft);

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

      // Pedestal
      pedestalGroup.position.set(0, -0.95, 0.1);
      const ringMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const ringMatCobalt = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ringMatOuter = new THREE.MeshBasicMaterial({ color: 0xD95D39, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });

      const innerRingGeo = new THREE.RingGeometry(0.52, 0.60, 64);
      const innerRing = new THREE.Mesh(innerRingGeo, ringMatCyan);
      innerRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(innerRing);

      const middleRingGeo = new THREE.RingGeometry(0.74, 0.83, 64);
      const middleRing = new THREE.Mesh(middleRingGeo, ringMatCobalt);
      middleRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(middleRing);

      const outerRingGeo = new THREE.RingGeometry(0.98, 1.08, 64);
      const outerRing = new THREE.Mesh(outerRingGeo, ringMatOuter);
      outerRing.rotation.x = -Math.PI / 2;
      pedestalGroup.add(outerRing);

      mainGroup.add(pedestalGroup);

      // Official 3D Avatar (Standing with Laptop)
      avatarGroup.position.set(0, -0.95, 0.1);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        './avatar-3d.png',
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;

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

      // Acoustic Waveform Aura Rings
      acousticRingsGroup.position.set(0, 1.40, 0.06);

      const auraMat1 = new THREE.MeshBasicMaterial({ color: 0xD95D39, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const auraMat2 = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const auraMat3 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const auraMat4 = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });

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

      // Floating Tech Orbs
      const techOrbsData = [
        { name: 'React', color: 0x00d8ff, hex: '#00d8ff', bg: '#082f49', pos: [-1.55, 1.35, 0.3], speed: 1.4, offset: 0 },
        { name: 'JavaScript', color: 0xf7df1e, hex: '#f7df1e', bg: '#422006', pos: [-1.45, 0.25, 0.4], speed: 1.8, offset: 1.2 },
        { name: 'Node.js', color: 0x4ade80, hex: '#4ade80', bg: '#052e16', pos: [1.55, 1.45, 0.3], speed: 1.6, offset: 2.1 },
        { name: 'Java', color: 0xfb923c, hex: '#fb923c', bg: '#431407', pos: [1.65, 0.4, 0.4], speed: 2.0, offset: 3.0 },
      ];

      techOrbsData.forEach((tech) => {
        const orbGroup = new THREE.Group();
        orbGroup.position.set(...tech.pos);

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

        const ringGeo = new THREE.TorusGeometry(0.14, 0.01, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: tech.color, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
        const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
        orbitalRing.rotation.x = Math.PI / 3;
        orbGroup.add(orbitalRing);

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

        orbGroup.userData = { initialY: tech.pos[1], speed: tech.speed, offset: tech.offset, orbitalRing };
        mainGroup.add(orbGroup);
        floatingTechOrbs.push(orbGroup);
      });

      scene.add(mainGroup);

      // Mouse tracking
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) - 0.5;
        const normY = ((e.clientY - rect.top) / rect.height) - 0.5;

        targetRotationY = normX * 0.40;
        targetRotationX = -normY * 0.28;
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
        resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(container);
      }

      // 60FPS Loop
      const clock = new THREE.Clock();

      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const elapsedTime = clock.getElapsedTime();
        const speakingNow = isSpeakingRef.current;

        currentRotationX += (targetRotationX - currentRotationX) * 0.06;
        currentRotationY += (targetRotationY - currentRotationY) * 0.06;

        mainGroup.rotation.y = currentRotationY;
        mainGroup.rotation.x = currentRotationX;
        mainGroup.position.x = currentRotationY * 0.22;

        const avatarMesh = avatarGroup.getObjectByName("officialAvatarMesh");
        if (avatarMesh) {
          const breath = Math.sin(elapsedTime * 2.2) * 0.012;
          const speechPulse = speakingNow ? Math.sin(elapsedTime * 12) * 0.015 : 0;
          avatarMesh.position.y = 1.38 + breath + speechPulse;
          avatarMesh.rotation.y = currentRotationY * 0.22;
        }

        middleRing.rotation.z = -elapsedTime * 0.4;
        innerRing.rotation.z = elapsedTime * 0.5;
        const pulseScale = 1.0 + Math.sin(elapsedTime * 3) * 0.06;
        outerRing.scale.set(pulseScale, pulseScale, pulseScale);
        outerRing.material.opacity = 0.35 + Math.sin(elapsedTime * 3) * 0.15;

        floatingTechOrbs.forEach((orb) => {
          const { initialY, speed, offset, orbitalRing } = orb.userData;
          orb.position.y = initialY + Math.sin(elapsedTime * speed + offset) * 0.08;
          orb.rotation.y = currentRotationY * 0.5;
          if (orbitalRing) {
            orbitalRing.rotation.x += 0.02;
            orbitalRing.rotation.y += 0.03;
          }
        });

        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.02;
          particlesMesh.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;
        }

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
      console.warn("WebGL initialization failed:", err);
      setLoadError(true);
    }
  }, []);

  return (
    <div id="workspace-3d-scene" className="relative w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Prominent Floating Audio Unmute / Replay Trigger Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-auto">
        <button
          type="button"
          onClick={toggleSpeech}
          onMouseEnter={() => sound.playPop()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#1e0d08]/90 hover:bg-[#2b140b] text-white text-xs font-mono font-bold border border-[#D95D39]/40 hover:border-[#D95D39] shadow-xl shadow-black/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[#D95D39] animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
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
              <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-[#D95D39] animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-xs font-mono font-bold tracking-wide text-white">
                Yashwanth (3D Avatar)
              </span>
            </div>

            {/* Bouncing Equalizer Bars */}
            <div className="flex items-end gap-1 h-3.5 px-2 py-0.5 rounded bg-black/60 border border-white/10">
              <span className={`w-0.5 bg-[#D95D39] rounded-full transition-all duration-150 ${isSpeaking ? 'h-3 animate-pulse' : 'h-1'}`} />
              <span className={`w-0.5 bg-orange-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-1.5'}`} />
              <span className={`w-0.5 bg-amber-300 rounded-full transition-all duration-150 ${isSpeaking ? 'h-2.5' : 'h-1'}`} />
              <span className={`w-0.5 bg-emerald-400 rounded-full transition-all duration-150 ${isSpeaking ? 'h-3.5' : 'h-2'}`} />
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
              title={sound.isMuted() ? 'Unmute Audio' : 'Mute Audio'}
            >
              {sound.isMuted() ? (
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
