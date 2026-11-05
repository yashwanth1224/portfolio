import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, FileDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = sound.subscribe((muted) => setIsMuted(muted));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleSoundToggle = () => {
    sound.toggleMute();
  };

  const handleResumeClick = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.2, x: 0.8 },
        colors: ['#0B1B2B', '#38BDF8', '#0284C7', '#2563EB', '#FFFFFF']
      });
    } catch {
      // Confetti fallback
    }
  };

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-navy-dark/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Status Indicator */}
          <a
            href="#"
            onMouseEnter={() => sound.playPop()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-200 border border-sky-400/30">
              Y
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-accent transition-colors">
                Yashwanth S
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[11px] tracking-wide text-emerald-400 font-medium">AVAILABLE FOR WORK</span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={() => sound.playPop()}
                onClick={() => sound.playClick()}
                className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions: Audio Toggle & Resume */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleSoundToggle}
              onMouseEnter={() => sound.playPop()}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-accent transition-all border border-white/10 focus:outline-none"
              aria-label="Toggle Sound Effects"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-accent animate-pulse" />}
            </button>

            <a
              href="./Yashwanth_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Yashwanth_Resume.pdf"
              onClick={handleResumeClick}
              onMouseEnter={() => sound.playPop()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition-all duration-300 shadow-lg shadow-sky-500/25 hover:-translate-y-0.5 active:translate-y-0 border border-white/15"
            >
              <FileDown className="w-4 h-4" />
              <span>Resume</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleSoundToggle}
              className="p-2 rounded-lg bg-white/5 text-slate-300 border border-white/10"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-accent" />}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 rounded-lg bg-white/5 text-cream border border-white/10 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-dark/95 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  sound.playClick();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-base font-medium text-slate-200 hover:text-accent hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href="./Yashwanth_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Yashwanth_Resume.pdf"
              onClick={() => {
                handleResumeClick();
                setMobileMenuOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Resume PDF</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
