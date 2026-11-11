import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, FileDown, Layers, Box } from 'lucide-react';
import { sound } from '../utils/audio';
import { STUDIO_STATIONS } from '../three/studioStations.js';
import confetti from 'canvas-confetti';

const NAV_LINKS = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Projects', href: '#projects', id: 'projects' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

/**
 * Segmented Dual-Mode switcher toggling between 3D Scroll and 3D Studio Showroom.
 *
 * @param {Object} props
 * @param {'scroll' | 'studio'} props.viewMode
 * @param {boolean} props.isLightSection
 * @param {(mode: 'scroll' | 'studio') => void} [props.onChangeViewMode]
 * @param {() => void} [props.onAfterSelect]
 * @param {boolean} [props.fullWidth=false]
 */
function ViewModeToggle({
  viewMode,
  isLightSection,
  onChangeViewMode,
  onAfterSelect,
  fullWidth = false,
}) {
  const modes = [
    { id: 'scroll', shortLabel: 'Scroll', fullLabel: '3D Scroll', Icon: Layers },
    { id: 'studio', shortLabel: 'Studio', fullLabel: '3D Studio', Icon: Box },
  ];

  return (
    <div
      role="group"
      aria-label="Portfolio view mode"
      className={`inline-flex items-center p-1 rounded-xl border transition-colors shrink-0 ${
        fullWidth ? 'w-full' : ''
      } ${
        isLightSection
          ? 'bg-[#1A1A1A]/5 border-[#1A1A1A]/10'
          : 'bg-white/5 border-white/10'
      }`}
    >
      {modes.map(({ id, shortLabel, fullLabel, Icon }) => {
        const isActive = viewMode === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onMouseEnter={() => sound.playPop()}
            onClick={() => {
              sound.playClick();
              if (!isActive) {
                onChangeViewMode?.(id);
              }
              onAfterSelect?.();
            }}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              fullWidth ? 'flex-1 py-2' : ''
            } ${
              isActive
                ? 'bg-[#D95D39] text-white shadow-sm shadow-[#D95D39]/25'
                : isLightSection
                ? 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                : 'text-white/75 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {fullWidth ? (
              <span>{fullLabel}</span>
            ) : (
              <span>
                <span className="hidden lg:inline">3D </span>
                {shortLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Sticky adaptive navigation bar supporting both 3D Scroll and 3D Studio Showroom modes.
 *
 * @param {Object} props
 * @param {'scroll' | 'studio'} [props.viewMode='scroll']
 * @param {string} [props.activeStudioStationId='overview']
 * @param {(mode: 'scroll' | 'studio') => void} [props.onChangeViewMode]
 * @param {(sectionId: string) => void} [props.onSelectStudioSection]
 */
export default function Navbar({
  viewMode = 'scroll',
  activeStudioStationId = 'overview',
  onChangeViewMode,
  onSelectStudioSection,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    return sound.subscribe((muted) => setIsMuted(muted));
  }, []);

  // Track scroll and detect active section for dynamic text color shifting
  useEffect(() => {
    if (viewMode === 'studio') {
      setIsScrolled(false);
      return undefined;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // FadeInSection wrappers apply CSS transforms that turn them into offsetParents (offsetTop === 0);
      // measure viewport-relative top via getBoundingClientRect() so active-section tracking stays accurate.
      const sections = [
        'hero',
        'about',
        'experience',
        'projects',
        'skills',
        'achievements',
        'contact',
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [viewMode]);

  const isLightSection =
    viewMode !== 'studio' && (activeSection === 'about' || activeSection === 'experience');

  const currentSection =
    viewMode === 'studio'
      ? STUDIO_STATIONS.find((station) => station.id === activeStudioStationId)?.navSectionId ?? null
      : activeSection;

  const handleSoundToggle = () => {
    sound.toggleMute();
  };

  const handleSectionClick = (e, sectionId, soundLabel) => {
    if (viewMode === 'studio') {
      e.preventDefault();
      sound.playNavChime(soundLabel);
      onSelectStudioSection?.(sectionId);
      setMobileMenuOpen(false);
      return;
    }

    if (sectionId === 'hero') {
      sound.playClick();
    } else {
      sound.playNavChime(soundLabel);
    }
    setMobileMenuOpen(false);
  };

  const handleResumeClick = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.15, x: 0.85 },
        colors: ['#D95D39', '#1A1A1A', '#F5F2EB', '#E8DEC9', '#FFFFFF']
      });
    } catch {
      // Fallback
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        viewMode === 'studio'
          ? 'bg-[#141414]/85 backdrop-blur-md border-b border-white/10 shadow-lg py-3.5'
          : isScrolled
          ? isLightSection
            ? 'bg-[#F5F2EB]/90 backdrop-blur-md border-b border-[#1A1A1A]/10 shadow-sm py-3.5'
            : 'bg-[#1A1A1A]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Identity */}
          <a
            href="#hero"
            onMouseEnter={() => sound.playPop()}
            onClick={(e) => handleSectionClick(e, 'hero', 'hero')}
            className="flex items-center gap-3 group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#D95D39] flex items-center justify-center text-white font-heading font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-200">
              Y
            </div>
            <div className="flex flex-col">
              <span
                className={`font-heading font-bold text-base sm:text-lg tracking-tight transition-colors duration-200 ${
                  isLightSection ? 'text-[#1A1A1A] group-hover:text-[#D95D39]' : 'text-white group-hover:text-[#D95D39]'
                }`}
              >
                Yashwanth S
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D95D39] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D95D39]"></span>
                </span>
                <span
                  className={`font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold ${
                    isLightSection ? 'text-[#1A1A1A]/70' : 'text-[#F5F2EB]/70'
                  }`}
                >
                  Frontend Developer
                </span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = currentSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => sound.playPop()}
                  onClick={(e) => handleSectionClick(e, link.id, link.label)}
                  className={`px-2.5 lg:px-3.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 relative whitespace-nowrap ${
                    isActive
                      ? 'text-[#D95D39] font-semibold'
                      : isLightSection
                      ? 'text-[#1A1A1A]/80 hover:text-[#D95D39] hover:bg-[#1A1A1A]/5'
                      : 'text-white/80 hover:text-[#D95D39] hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#D95D39] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions: Dual-Mode Toggle, Audio Toggle & Resume */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            <ViewModeToggle
              viewMode={viewMode}
              isLightSection={isLightSection}
              onChangeViewMode={onChangeViewMode}
            />

            <button
              type="button"
              onClick={handleSoundToggle}
              onMouseEnter={() => sound.playPop()}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className={`p-2 rounded-xl transition-all border focus:outline-none ${
                isLightSection
                  ? 'bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] border-[#1A1A1A]/10'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
              aria-label="Toggle Sound Effects"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 opacity-50" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#D95D39] animate-pulse" />
              )}
            </button>

            <a
              href="./Yashwanth_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Yashwanth_Resume.pdf"
              onClick={handleResumeClick}
              onMouseEnter={() => sound.playPop()}
              className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold bg-[#D95D39] hover:bg-[#C04D2B] text-white transition-all duration-200 shadow-md shadow-[#D95D39]/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <FileDown className="w-4 h-4" />
              <span>Resume</span>
            </a>
          </div>

          {/* Mobile menu triggers */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl border ${
                isLightSection
                  ? 'bg-[#1A1A1A]/5 text-[#1A1A1A] border-[#1A1A1A]/10'
                  : 'bg-white/5 text-white border-white/10'
              }`}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 opacity-50" /> : <Volume2 className="w-4 h-4 text-[#D95D39]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`p-2 rounded-xl border focus:outline-none ${
                isLightSection
                  ? 'bg-[#1A1A1A]/5 text-[#1A1A1A] border-[#1A1A1A]/10'
                  : 'bg-white/5 text-white border-white/10'
              }`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-3 pb-6 space-y-3 transition-colors ${
            isLightSection
              ? 'bg-[#F5F2EB]/98 backdrop-blur-xl border-[#1A1A1A]/10 text-[#1A1A1A]'
              : 'bg-[#1A1A1A]/98 backdrop-blur-xl border-white/10 text-white'
          }`}
        >
          <ViewModeToggle
            viewMode={viewMode}
            isLightSection={isLightSection}
            onChangeViewMode={onChangeViewMode}
            onAfterSelect={() => setMobileMenuOpen(false)}
            fullWidth
          />

          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSectionClick(e, link.id, link.label)}
                className={`px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                  currentSection === link.id
                    ? 'text-[#D95D39] font-bold bg-[#D95D39]/10'
                    : isLightSection
                    ? 'text-[#1A1A1A]/80 hover:text-[#D95D39]'
                    : 'text-white/80 hover:text-[#D95D39]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div
            className={`pt-2 border-t flex flex-col gap-2 ${
              isLightSection ? 'border-[#1A1A1A]/10' : 'border-white/10'
            }`}
          >
            <a
              href="./Yashwanth_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Yashwanth_Resume.pdf"
              onClick={() => {
                handleResumeClick();
                setMobileMenuOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#D95D39] hover:bg-[#C04D2B] text-white shadow-md"
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
