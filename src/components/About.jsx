import React, { useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { CheckCircle2, Compass, Cpu, Layers, Sparkles, Award, User } from 'lucide-react';

export default function About() {
  const [photoMode, setPhotoMode] = useState('avatar'); // 'avatar' | 'real'
  const pillars = [
    {
      icon: Cpu,
      title: "Analytical Rigor",
      desc: "Trained in mechanical systems and thermodynamics at EWIT (VTU), bringing mathematical discipline and architectural structure to modern frontend applications."
    },
    {
      icon: Layers,
      title: "Component Architecture",
      desc: "Specializing in modular React 18, composable state patterns, and clean separation of concerns for maintainable enterprise scale."
    },
    {
      icon: Compass,
      title: "Pixel-Perfect Precision",
      desc: "Obsessed with responsive layouts, micro-interactions, silky smooth 60fps animations, and tactile user feedback."
    },
    {
      icon: Award,
      title: "Athletic Tenacity",
      desc: "National Tug-of-War championship athlete representing Karnataka; bringing unmatched stamina, team synergy, and resilience under deadlines."
    }
  ];

  return (
    <section id="about" className="relative bg-cream text-slate-800 py-24 lg:py-32 overflow-hidden border-b border-slateBanner-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Resume-Style Section Header Banner (Soft Silver-Slate Banner with Bold Navy Text) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slateBanner border border-slateBanner-border text-navy font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <User className="w-3.5 h-3.5 text-accent-royal" />
          <span>ABOUT YASHWANTH S</span>
        </div>

        {/* Heading in Deep Charcoal Navy */}
        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-navy leading-[1.18] mb-6">
            From responsive interactive layouts to{' '}
            <span className="text-accent-royal italic font-normal">pixel-perfect code.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            I don’t just write code; I engineer digital experiences where interface fluidity, responsive architecture, and bulletproof logic meet.
          </p>
        </div>

        {/* Main Grid: Polaroid Profile + Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Framed Polaroid Photo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Decorative tape sticker effect */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/90 backdrop-blur-md border border-slateBanner-border shadow-sm rotate-2 z-20 pointer-events-none rounded-sm" />

              {/* Polaroid Outer Frame */}
              <div 
                onMouseEnter={() => sound.playPop()}
                className="bg-white p-4 sm:p-5 pb-7 rounded-2xl shadow-2xl border border-slateBanner-border -rotate-1 group-hover:rotate-0 transition-all duration-500 transform hover:-translate-y-1.5"
              >
                {/* Interactive Toggle Switch: 3D Avatar vs Real Photo */}
                <div className="flex items-center justify-center mb-3">
                  <div className="inline-flex p-1 bg-slateBanner/80 rounded-full border border-slateBanner-border shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setPhotoMode('avatar');
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                        photoMode === 'avatar'
                          ? 'bg-navy text-accent shadow-sm'
                          : 'text-slate-600 hover:text-navy'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span>3D Avatar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setPhotoMode('real');
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                        photoMode === 'real'
                          ? 'bg-navy text-cream shadow-sm'
                          : 'text-slate-600 hover:text-navy'
                      }`}
                    >
                      <User className="w-3 h-3 text-accent-royal" />
                      <span>Real Photo</span>
                    </button>
                  </div>
                </div>

                {/* Photo Container */}
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-navy border border-slate-100 shadow-inner">
                  {photoMode === 'avatar' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0B1B2B] via-[#07111A] to-[#03070D] overflow-hidden">
                      {/* Holographic Concentric Cyan Glow behind 3D avatar */}
                      <div className="absolute w-44 h-44 rounded-full border border-sky-400/30 bg-sky-500/10 blur-sm animate-pulse pointer-events-none" />
                      <div className="absolute w-56 h-56 rounded-full border border-blue-500/20 pointer-events-none" />
                      
                      <img
                        src={personalInfo.avatarPath || "./avatar-3d.png"}
                        alt="Yashwanth S - 3D Avatar"
                        className="relative z-10 w-full h-full object-contain p-2 filter drop-shadow-[0_12px_24px_rgba(56,189,248,0.25)] group-hover:scale-105 transition-all duration-500"
                      />
                      
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-sky-400/30 text-[10px] font-mono text-sky-300 uppercase tracking-wider z-20">
                        3D Cutout Render
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={personalInfo.photoPath || "./yashwanth.jpg"}
                        alt="Yashwanth S"
                        className="w-full h-full object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                      {/* Subtle lighting gradient over photo */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-mono text-cream/80 uppercase tracking-wider z-20">
                        Portrait Photo
                      </div>
                    </div>
                  )}
                </div>

                {/* Polaroid Bottom Caption */}
                <div className="mt-4 pt-2 text-center border-t border-slateBanner">
                  <h4 className="font-serif font-bold text-lg text-navy">Yashwanth S</h4>
                  <p className="text-xs font-mono text-accent-blue tracking-wider uppercase mt-0.5 font-semibold">
                    Bengaluru, India • Frontend & Software Engineer
                  </p>
                </div>
              </div>

              {/* Decorative background shadow glow in Navy/Cyan */}
              <div className="absolute -inset-4 bg-sky-500/10 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>

          {/* Right Column: Bio Narrative & Stat Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-8">
            
            <div className="space-y-4 text-slate-700 text-base sm:text-lg leading-relaxed">
              <p>
                My journey began in the mechanical engineering labs at{' '}
                <strong className="text-navy font-semibold">East West Institute of Technology (VTU)</strong>, where I developed a deep appreciation for mathematical rigor, fluid dynamics, and systematic tolerances.
              </p>
              <p>
                Recognizing the boundless creativity of the web, I transitioned into software development, undergoing over{' '}
                <strong className="text-accent-royal font-semibold">400+ hours of full-stack engineering at JSPIDERS Bengaluru</strong>. Here, I mastered Java object-oriented principles, SQL schemas, and the modern React ecosystem.
              </p>
              <p>
                I build software that solves real problems—from live production applications like <strong className="text-navy font-semibold">Zisti</strong> (India's food delivery platform) and <strong className="text-navy font-semibold">Astrovedic Jyotishya Kendra</strong> (sidereal astrology & consultation system) to 3D WebGL mechanism simulators and real-time NLP engines.
              </p>
            </div>

            {/* Stat Counters Grid in Crisp White & Soft Slate */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slateBanner-border">
              {personalInfo.stats.map((stat, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => sound.playPop()}
                  className="bg-white p-4 rounded-xl border border-slateBanner-border shadow-sm hover:border-accent-royal/50 transition-colors"
                >
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-navy mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Four Core Pillars in Silver-Slate & Navy Accent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {pillars.map((pillar, i) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => sound.playPop()}
                    className="p-4 rounded-xl bg-white border border-slateBanner-border hover:shadow-md hover:border-accent/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-slateBanner text-accent-royal flex items-center justify-center font-bold">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-navy">{pillar.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
