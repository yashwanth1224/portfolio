import React from 'react';
import {
  Check,
  ChevronRight,
  Copy,
  Cpu,
  ExternalLink,
  FileDown,
  Flame,
  Github,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import {
  certifications,
  education,
  experiences,
  personalInfo,
  projects,
  skillCategories,
} from '../../data/portfolioData.js';
import { sound } from '../../utils/audio.js';

/**
 * Station 1 detail panel: Avatar, voice greeting trigger, resume download, and quick stats.
 *
 * @param {Object} props
 * @param {() => void} props.onVoiceGreeting
 * @param {boolean} props.isSpeaking
 */
export function StationHeroAvatarContent({ onVoiceGreeting, isSpeaking }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D95D39]/15 border border-[#D95D39]/30 text-[#D95D39] text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{personalInfo.status}</span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-white">{personalInfo.name}</h3>
        <p className="font-mono text-xs text-[#D95D39]">{personalInfo.role}</p>
        <p className="text-sm text-[#F5F2EB]/80 leading-relaxed pt-1">{personalInfo.bio}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onVoiceGreeting}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-md ${
            isSpeaking
              ? 'bg-[#D95D39] text-white animate-pulse'
              : 'bg-[#D95D39] hover:bg-[#c44e2c] text-white shadow-[#D95D39]/25'
          }`}
        >
          <span>{isSpeaking ? 'Speaking...' : 'Play Voice Greeting'}</span>
        </button>

        <a
          href={personalInfo.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          download="Yashwanth_Resume.pdf"
          onClick={() => sound.playSuccess()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-medium transition-colors border border-white/10"
        >
          <FileDown className="w-4 h-4 text-[#D95D39]" />
          <span>Resume PDF</span>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {personalInfo.stats.map((s) => (
          <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-[#F5F2EB]/60 uppercase">{s.label}</span>
            <div className="font-serif text-sm font-bold text-white">{s.value}</div>
            <div className="text-[11px] font-mono text-[#D95D39]">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Station 2 detail panel: Engineering background, education milestones, and hardware capstones.
 */
export function StationAboutLabContent() {
  const primaryDegree = education[0];
  const liveCount = projects.filter((p) => Boolean(p.liveUrl)).length;
  const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);
  const capstones = projects.filter(
    (p) => p.id === 'pneumatic-mobility' || p.id === 'engine-3d-sim'
  );

  const labMetrics = [
    {
      value: primaryDegree?.period || '2021 — July 2025',
      label: primaryDegree?.badge || 'B.E. Mechanical',
      accentClass: 'text-[#D95D39]',
    },
    {
      value: `${liveCount} Live`,
      label: 'Commercial Platforms',
      accentClass: 'text-emerald-400',
    },
    {
      value: `${projects.length} Built`,
      label: 'Web & Hardware Works',
      accentClass: 'text-amber-400',
    },
    {
      value: `${totalSkills}+`,
      label: 'Core Technologies',
      accentClass: 'text-sky-400',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>{primaryDegree?.degree || 'B.E. Mechanical'} → Modern React</span>
        </div>
        <p className="text-sm text-[#F5F2EB]/80 leading-relaxed">{personalInfo.bio}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {labMetrics.map((metric) => (
          <div
            key={metric.label}
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5"
          >
            <div className={`font-serif text-lg sm:text-xl font-bold ${metric.accentClass}`}>
              {metric.value}
            </div>
            <div className="text-[11px] font-mono text-[#F5F2EB]/70">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <h4 className="font-mono text-xs font-bold text-[#D95D39] uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic Foundations</span>
        </h4>
        <div className="space-y-3">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="space-y-1 border-b border-white/10 last:border-b-0 pb-2.5 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-serif text-sm font-bold text-white">{edu.degree}</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#F5F2EB]/80 shrink-0">
                  {edu.period}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#D95D39]">{edu.institution}</div>
              {edu.highlights[0] && (
                <p className="text-xs text-[#F5F2EB]/75 leading-relaxed">{edu.highlights[0]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
        <h4 className="font-mono text-xs font-bold text-[#D95D39] uppercase tracking-wider">
          Engineering Capstones
        </h4>
        <ul className="space-y-2 text-xs text-[#F5F2EB]/80">
          {capstones.map((cap) => (
            <li key={cap.id} className="flex items-start gap-2">
              <span className="text-[#D95D39] font-bold">•</span>
              <span>
                <strong>{cap.title}:</strong> {cap.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Station 3 detail panel: Reverse-chronological experience and academic milestones.
 */
export function StationExperienceHelixContent() {
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-[#D95D39] uppercase tracking-wider font-semibold">
        Reverse-Chronological Milestones
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-serif text-base font-bold text-white">{exp.role}</h4>
                <div className="font-mono text-xs text-[#D95D39]">{exp.company}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#F5F2EB]/80 shrink-0">
                {exp.period}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-[#F5F2EB]/75">
              {exp.highlights.slice(0, 3).map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#D95D39] font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {exp.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#F5F2EB]/70 border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Station 4 detail panel: Shipped platforms and interactive simulators with modal launch triggers.
 *
 * @param {Object} props
 * @param {(project: Object) => void} props.onOpenProject
 */
export function StationProjectGalleryContent({ onOpenProject }) {
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-[#D95D39] uppercase tracking-wider font-semibold">
        Shipped Platforms & Interactive Simulators
      </div>

      <div className="space-y-4">
        {projects.map((proj) => (
          <div key={proj.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      proj.liveUrl ? 'bg-emerald-400' : 'bg-[#D95D39]'
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] uppercase font-bold ${
                      proj.liveUrl ? 'text-emerald-400' : 'text-[#D95D39]'
                    }`}
                  >
                    {proj.tag}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-white mt-0.5">{proj.title}</h4>
                <p className="text-xs text-[#F5F2EB]/70 leading-relaxed mt-1 line-clamp-2">
                  {proj.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenProject(proj);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D95D39] hover:bg-[#c44e2c] text-white font-mono text-xs font-semibold tracking-wide uppercase transition-colors shadow-sm"
              >
                <span>Open Interactive Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-mono text-xs transition-colors border border-emerald-500/40"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Site</span>
                </a>
              )}

              {proj.githubUrl && (
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  aria-label={`${proj.title} GitHub repository`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F2EB]/80 font-mono text-xs transition-colors border border-white/10"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Station 5 detail panel: Technical skills matrix synced with the 3D Skills Reactor stage.
 *
 * @param {Object} props
 * @param {number} props.activeCategory
 * @param {(index: number) => void} props.onSelectCategory
 */
export function StationSkillsReactorContent({ activeCategory, onSelectCategory }) {
  const currentCat = skillCategories[activeCategory] || skillCategories[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
        {skillCategories.map((cat, idx) => (
          <button
            key={cat.category}
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectCategory(idx);
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              activeCategory === idx
                ? 'bg-[#D95D39] text-white shadow-sm font-semibold'
                : 'text-[#F5F2EB]/70 hover:text-white'
            }`}
          >
            {cat.category.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <div>
          <h4 className="font-serif text-base font-bold text-white">{currentCat.category}</h4>
          <p className="text-xs font-mono text-[#D95D39]">{currentCat.description}</p>
        </div>

        <div className="space-y-2.5 pt-2">
          {currentCat.skills.map((skill) => (
            <div key={skill.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-medium">{skill.name}</span>
                <span className="text-[#D95D39] font-bold">{skill.level}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D95D39] to-amber-400"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50">{skill.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
        <h5 className="font-mono text-xs font-bold text-[#F5F2EB]/70 uppercase">
          Languages & Interests
        </h5>
        <div className="flex flex-wrap gap-1.5">
          {personalInfo.languages.map((l) => (
            <span
              key={l.name}
              className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-mono text-white border border-white/10"
            >
              {l.name} ({l.tag})
            </span>
          ))}
          {personalInfo.interests.map((it) => (
            <span
              key={it.name}
              className="px-2.5 py-1 rounded-md bg-[#D95D39]/15 text-[11px] font-mono text-[#D95D39] border border-[#D95D39]/30"
            >
              {it.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Station 6 detail panel: Athletic, academic, and technical distinctions.
 */
export function StationAchievementsContent() {
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-[#D95D39] uppercase tracking-wider font-semibold">
        Athletic & Engineering Credentials
      </div>

      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#D95D39]">
                  {cert.badge}
                </span>
                <h4 className="font-serif text-sm sm:text-base font-bold text-white mt-0.5">
                  {cert.title}
                </h4>
                <div className="font-mono text-xs text-[#F5F2EB]/60">{cert.issuer}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white shrink-0">
                {cert.year}
              </span>
            </div>

            <p className="text-xs text-[#F5F2EB]/75 leading-relaxed">{cert.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Station 7 detail panel: Direct contact channels, clipboard copy actions, and social links.
 *
 * @param {Object} props
 * @param {string | null} props.copiedField
 * @param {(field: string, text: string) => void} props.onCopy
 */
export function StationContactTerminalContent({ copiedField, onCopy }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>{personalInfo.status}</span>
        </div>
        <p className="text-sm text-[#F5F2EB]/80 leading-relaxed">
          {personalInfo.role} based in {personalInfo.location}. {personalInfo.tagline}
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#D95D39]" />
            <div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50 uppercase">Email Address</div>
              <div className="font-mono text-xs text-white font-medium">{personalInfo.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCopy('email', personalInfo.email)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Copy email"
          >
            {copiedField === 'email' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#D95D39]" />
            <div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50 uppercase">Phone & WhatsApp</div>
              <div className="font-mono text-xs text-white font-medium">{personalInfo.phone}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCopy('phone', personalInfo.phone)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Copy phone"
          >
            {copiedField === 'phone' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#D95D39]" />
            <div>
              <div className="text-[10px] font-mono text-[#F5F2EB]/50 uppercase">Base Coordinates</div>
              <div className="font-mono text-xs text-white font-medium">
                {personalInfo.location} (PIN {personalInfo.postalCode})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <a
          href={personalInfo.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white transition-colors"
        >
          <span>LinkedIn</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D95D39]" />
        </a>

        <a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub</span>
        </a>
      </div>

      <a
        href={`mailto:${personalInfo.email}?subject=${encodeURIComponent(
          `Frontend Developer Inquiry - ${personalInfo.name}`
        )}`}
        onClick={() => sound.playSuccess()}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D95D39] hover:bg-[#c44e2c] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#D95D39]/25"
      >
        <Mail className="w-4 h-4" />
        <span>Dispatch Direct Email</span>
      </a>
    </div>
  );
}

/**
 * Dispatches the appropriate detail panel for an active Studio Diorama station.
 *
 * @param {Object} props
 * @param {string} props.stationId
 * @param {() => void} props.onVoiceGreeting
 * @param {boolean} props.isSpeaking
 * @param {(project: Object) => void} props.onOpenProject
 * @param {number} props.activeSkillCategory
 * @param {(index: number) => void} props.onSelectSkillCategory
 * @param {string | null} props.copiedField
 * @param {(field: string, text: string) => void} props.onCopy
 */
export function StationPanelContent({
  stationId,
  onVoiceGreeting,
  isSpeaking,
  onOpenProject,
  activeSkillCategory,
  onSelectSkillCategory,
  copiedField,
  onCopy,
}) {
  switch (stationId) {
    case 'hero-avatar':
      return <StationHeroAvatarContent onVoiceGreeting={onVoiceGreeting} isSpeaking={isSpeaking} />;
    case 'about-lab':
      return <StationAboutLabContent />;
    case 'experience-helix':
      return <StationExperienceHelixContent />;
    case 'project-gallery':
      return <StationProjectGalleryContent onOpenProject={onOpenProject} />;
    case 'skills-reactor':
      return (
        <StationSkillsReactorContent
          activeCategory={activeSkillCategory}
          onSelectCategory={onSelectSkillCategory}
        />
      );
    case 'achievements-vitrine':
      return <StationAchievementsContent />;
    case 'contact-terminal':
      return <StationContactTerminalContent copiedField={copiedField} onCopy={onCopy} />;
    default:
      return null;
  }
}
