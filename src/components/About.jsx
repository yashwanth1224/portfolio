import React from 'react';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import { CheckCircle2, Compass, Cpu, Layers, Sparkles, Award } from 'lucide-react';

export default function About() {
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
    <section id="about" className="relative bg-cream text-obsidian py-24 lg:py-32 overflow-hidden">
      {/* Subtle background noise texture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-0.5 bg-terracotta" />
          <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
            ABOUT YASHWANTH S
          </span>
        </div>

        {/* Heading (Video frames 11-13 replica) */}
        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-obsidian leading-[1.18] mb-6">
            From responsive interactive layouts to{' '}
            <span className="text-terracotta italic font-normal">pixel-perfect code.</span>
          </h2>
          <p className="text-obsidian/75 text-base sm:text-lg leading-relaxed">
            I don’t just write code; I engineer digital experiences where interface fluidity, responsive architecture, and bulletproof logic meet.
          </p>
        </div>

        {/* Main Grid: Polaroid Profile + Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Framed Polaroid Photo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Decorative tape sticker effect */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/70 backdrop-blur-md border border-neutral-300 shadow-sm rotate-2 z-20 pointer-events-none rounded-sm" />

              {/* Polaroid Outer Frame */}
              <div 
                onMouseEnter={() => sound.playPop()}
                className="bg-white p-4 sm:p-5 pb-7 rounded-2xl shadow-2xl border border-neutral-200/80 -rotate-1 group-hover:rotate-0 transition-all duration-500 transform hover:-translate-y-1.5"
              >
                {/* Photo Container */}
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-neutral-900 border border-neutral-100 shadow-inner">
                  <img
                    src="./yashwanth.jpg"
                    alt="Yashwanth S"
                    className="w-full h-full object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  {/* Subtle lighting gradient over photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent opacity-60" />
                </div>

                {/* Polaroid Bottom Caption */}
                <div className="mt-4 pt-2 text-center border-t border-neutral-100">
                  <h4 className="font-serif font-bold text-lg text-obsidian">Yashwanth S</h4>
                  <p className="text-xs font-mono text-terracotta tracking-wider uppercase mt-0.5">
                    Bengaluru, India • Frontend & Software Engineer
                  </p>
                </div>
              </div>

              {/* Decorative background shadow glow */}
              <div className="absolute -inset-4 bg-terracotta/10 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>

          {/* Right Column: Bio Narrative & Stat Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-8">
            
            <div className="space-y-4 text-obsidian/85 text-base sm:text-lg leading-relaxed">
              <p>
                My journey began in the mechanical engineering labs at{' '}
                <strong className="text-obsidian font-semibold">East West Institute of Technology (VTU)</strong>, where I developed a deep appreciation for mathematical rigor, fluid dynamics, and systematic tolerances.
              </p>
              <p>
                Recognizing the boundless creativity of the web, I transitioned into software development, undergoing over{' '}
                <strong className="text-terracotta font-semibold">400+ hours of full-stack engineering at JSPIDERS Bengaluru</strong>. Here, I mastered Java object-oriented principles, SQL schemas, and the modern React ecosystem.
              </p>
              <p>
                Whether crafting high-speed sentiment analysis engines, 3D WebGL mechanisms, or high-conversion user interfaces, I believe in building software that is as sturdy underneath as it is stunning on the surface.
              </p>
            </div>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-300">
              {personalInfo.stats.map((stat, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => sound.playPop()}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/90 shadow-sm hover:border-terracotta/40 transition-colors"
                >
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-terracotta tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-obsidian mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-obsidian/60 mt-0.5">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Four Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {pillars.map((pillar, i) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => sound.playPop()}
                    className="p-4 rounded-xl bg-white/70 border border-neutral-200 hover:shadow-md hover:border-terracotta/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-obsidian">{pillar.title}</h4>
                    </div>
                    <p className="text-xs text-obsidian/70 leading-normal">
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
