// Web Audio API Synthesizer for UI sound effects (Zero external audio files)

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('yashwanth_portfolio_sound') === 'false';
    this.subscribers = new Set();
    this.lastClickTime = 0;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('yashwanth_portfolio_sound', (!this.muted).toString());
    this.notify();
    if (!this.muted) {
      this.playPop();
    }
    return this.muted;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.muted));
  }

  // Check if an element is an interactive target or inside an interactive card/modal
  isInteractiveElement(target) {
    if (!target) return false;
    const el = target.nodeType === 3 ? target.parentElement : target;
    if (!el || typeof el.closest !== 'function') return false;

    const interactiveSelector = [
      'button',
      'a',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="tab"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="switch"]',
      'label',
      'summary',
      '.interactive-element',
      '.interactive-card',
      '[data-interactive="true"]',
      '.cursor-pointer',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    try {
      if (el.closest(interactiveSelector)) return true;
      if (el.closest('[role="dialog"], [id*="modal"], [class*="modal"], [class*="drawer"]')) {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  // Crisp, high-tech, satisfying tactile haptic click for interactive elements (dual oscillator)
  playInteractiveClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Snappy 1200Hz transient click
      const oscTransient = this.ctx.createOscillator();
      const gainTransient = this.ctx.createGain();
      oscTransient.type = 'sine';
      oscTransient.frequency.setValueAtTime(1200, now);
      oscTransient.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      gainTransient.gain.setValueAtTime(0.08, now);
      gainTransient.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      oscTransient.connect(gainTransient);
      gainTransient.connect(this.ctx.destination);
      oscTransient.start(now);
      oscTransient.stop(now + 0.03);

      // Warm 320Hz body
      const oscBody = this.ctx.createOscillator();
      const gainBody = this.ctx.createGain();
      oscBody.type = 'triangle';
      oscBody.frequency.setValueAtTime(320, now);
      oscBody.frequency.exponentialRampToValueAtTime(140, now + 0.055);

      gainBody.gain.setValueAtTime(0.07, now);
      gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      oscBody.connect(gainBody);
      gainBody.connect(this.ctx.destination);
      oscBody.start(now);
      oscBody.stop(now + 0.065);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Ultra-subtle, clean glass touch tap for general page clicks & background (800Hz transient)
  playGlassTouch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.035);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Universal touch voice / click dispatcher for every click and tap
  playTouchClick(target) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const isInteractive = this.isInteractiveElement(target);
      if (isInteractive) {
        this.playInteractiveClick();
      } else {
        this.playGlassTouch();
      }
      this.lastClickTime = Date.now();
    } catch {
      // AudioContext policy fallback
    }
  }

  // Subtle melodic 2-note chime when clicking navigation items
  playNavChime(label = '') {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const chimeFrequencies = {
        about: [659.25, 880.00],        // E5 -> A5
        experience: [739.99, 987.77],   // F#5 -> B5
        projects: [783.99, 1046.50],    // G5 -> C6
        skills: [880.00, 1174.66],      // A5 -> D6
        achievements: [987.77, 1318.51],// B5 -> E6
        certificates: [987.77, 1318.51],// B5 -> E6
        contact: [1046.50, 1396.91]     // C6 -> F6
      };

      const key = (label || '').toLowerCase().trim();
      const notes = chimeFrequencies[key] || [783.99, 1046.50];

      notes.forEach((freq, index) => {
        const start = this.ctx.currentTime + (index * 0.08);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.045, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.23);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Soft high-frequency bubble/wood pop for hover
  playPop() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Crisp mechanical click for taps/buttons (with debounce against pointerdown)
  playClick() {
    if (this.muted) return;
    if (Date.now() - this.lastClickTime < 100) return;
    this.lastClickTime = Date.now();
    this.playInteractiveClick();
  }

  // Ascending musical chime for success actions (copy, submit, download)
  playSuccess() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + (idx * 0.07);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.07, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Soft low chime for tab/filter switch
  playChime() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // AudioContext policy fallback
    }
  }
}

export const sound = new SoundFX();
