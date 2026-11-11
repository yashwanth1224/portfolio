import React, { useState, useMemo } from 'react';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import ThreeStage from '../three/ThreeStage.jsx';
import { createContactBeaconStage } from '../three/stages/contactBeaconStage.js';
import DepthCard3D from './DepthCard3D.jsx';
import { Mail, Phone, MapPin, Copy, Check, Send, Github, Linkedin, FileDown, ArrowUp, SendHorizontal, MessageSquare, ExternalLink } from 'lucide-react';

export default function Contact() {
  const [copiedType, setCopiedType] = useState(null);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const beaconState = useMemo(
    () => ({ isSubmitting, submitted }),
    [isSubmitting, submitted]
  );

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    sound.playSuccess();
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    sound.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      sound.playSuccess();
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#D95D39', '#1A1A1A', '#F5F2EB', '#E8DEC9', '#FFFFFF']
        });
      } catch {
        // Fallback
      }
    }, 600);
  };

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const beaconFallback = (
    <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#161616] rounded-2xl overflow-hidden">
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-[#D95D39]/30 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full border border-[#D95D39]/50 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#D95D39]" />
          </div>
        </div>
        <div className="absolute text-[10px] font-mono text-white/60 tracking-wider -bottom-6 whitespace-nowrap">
          BENGALURU • 12.97°N, 77.59°E
        </div>
      </div>
    </div>
  );

  return (
    <footer
      id="contact"
      className="relative bg-[#1A1A1A] text-[#F5F2EB] pt-24 pb-12 overflow-hidden border-t border-white/10 font-sans"
    >
      {/* Background subtle burnt orange glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D95D39]/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5F2EB] font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <SendHorizontal className="w-3.5 h-3.5 text-[#D95D39]" />
          <span>GET IN TOUCH</span>
        </div>

        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Let’s build something{' '}
            <span className="text-[#D95D39]">great together.</span>
          </h2>
          <p className="text-[#F5F2EB]/75 text-base sm:text-lg mt-3.5">
            Whether you are looking to hire a dedicated frontend engineer, build responsive web applications, or discuss modern React architectures, my inbox is always open.
          </p>
        </div>

        {/* Contact Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          
          {/* Left Column: 3D Geodesic Beacon + Direct Info Cards & Quick Links */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 3D Contact Beacon Interactive Stage */}
            <ThreeStage
              stageId="contact-beacon"
              factory={createContactBeaconStage}
              state={beaconState}
              interactive="orbit-xy"
              fallback={beaconFallback}
              className="w-full h-[220px] rounded-2xl bg-[#161616] border border-white/10 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
            />

            {/* Email Card with 1-click copy & mailto link */}
            <DepthCard3D intensity={4}>
              <div
                className="p-5 rounded-2xl bg-[#222222] border border-white/10 hover:border-[#D95D39] transition-all duration-300 flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#D95D39]/15 text-[#D95D39] border border-[#D95D39]/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-white/50">Email Address</div>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="font-medium text-[#F5F2EB] group-hover:text-[#D95D39] transition-colors text-sm sm:text-base break-all"
                    >
                      {personalInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(personalInfo.email, 'email')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10"
                    title="Copy Email to Clipboard"
                    aria-label="Copy Email to Clipboard"
                  >
                    {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-[#D95D39] text-white/70 hover:text-white transition-colors border border-white/10"
                    title="Open Mail Client"
                    aria-label="Open Mail Client"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </DepthCard3D>

            {/* Phone Card with 1-click copy */}
            <DepthCard3D intensity={4}>
              <div
                className="p-5 rounded-2xl bg-[#222222] border border-white/10 hover:border-[#D95D39] transition-all duration-300 flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#D95D39]/15 text-[#D95D39] border border-[#D95D39]/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-white/50">Phone Number</div>
                    <a
                      href={`tel:${personalInfo.phone}`}
                      className="font-medium text-[#F5F2EB] group-hover:text-[#D95D39] transition-colors text-sm sm:text-base"
                    >
                      {personalInfo.phone}
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(personalInfo.phone, 'phone')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10"
                  title="Copy Phone Number"
                  aria-label="Copy Phone Number"
                >
                  {copiedType === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </DepthCard3D>

            {/* Location Card */}
            <DepthCard3D intensity={4}>
              <div
                className="p-5 rounded-2xl bg-[#222222] border border-white/10 flex items-center gap-4 shadow-lg"
              >
                <div className="p-3 rounded-xl bg-[#D95D39]/15 text-[#D95D39] border border-[#D95D39]/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-white/50">Location</div>
                  <div className="font-medium text-[#F5F2EB] text-sm sm:text-base">
                    {personalInfo.location} — {personalInfo.postalCode}
                  </div>
                </div>
              </div>
            </DepthCard3D>

            {/* LinkedIn & GitHub Direct Connections */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <DepthCard3D intensity={4}>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#222222] border border-white/10 hover:border-[#D95D39] flex items-center gap-3 group transition-all h-full"
                >
                  <div className="p-2 rounded-lg bg-white/5 text-[#D95D39] group-hover:bg-[#D95D39] group-hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-white/50 uppercase">Connect on</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#D95D39] transition-colors">LinkedIn</div>
                  </div>
                </a>
              </DepthCard3D>

              <DepthCard3D intensity={4}>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#222222] border border-white/10 hover:border-[#D95D39] flex items-center gap-3 group transition-all h-full"
                >
                  <div className="p-2 rounded-lg bg-white/5 text-[#D95D39] group-hover:bg-[#D95D39] group-hover:text-white transition-colors">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-white/50 uppercase">Explore Code</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#D95D39] transition-colors">GitHub</div>
                  </div>
                </a>
              </DepthCard3D>
            </div>

            {/* Resume Download CTA Box */}
            <DepthCard3D intensity={4}>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#262626] to-[#1c1c1c] border border-white/15 text-[#F5F2EB] shadow-xl space-y-3">
                <h4 className="font-heading font-bold text-lg text-white">Need a verified CV?</h4>
                <p className="text-xs sm:text-sm text-[#F5F2EB]/70">
                  Download my comprehensive resume with academic credentials, production deployments, and certifications.
                </p>
                <a
                  href="./Yashwanth_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Yashwanth_Resume.pdf"
                  onClick={() => {
                    sound.playSuccess();
                    try {
                      confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.8 },
                        colors: ['#D95D39', '#FFFFFF', '#F5F2EB']
                      });
                    } catch {
                      // Fallback
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D95D39] hover:bg-[#C04D2B] text-white font-bold text-xs font-mono uppercase tracking-wider shadow-md transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Resume (PDF)</span>
                </a>
              </div>
            </DepthCard3D>

          </div>

          {/* Right Column: Direct Dispatch Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#222222] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">
                      Message Dispatched Successfully!
                    </h3>
                    <p className="text-[#F5F2EB]/80 text-sm max-w-md mx-auto">
                      Thank you for reaching out, {formState.name}! I will review your note and respond back promptly at <strong className="text-[#D95D39]">{formState.email}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setSubmitted(false);
                        setFormState({ name: '', email: '', subject: '', message: '' });
                      }}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-[#D95D39]" />
                      <h3 className="font-heading text-xl font-bold text-white">Direct Dispatch Message</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hiring Manager / Collaborator"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D95D39] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. manager@company.com"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D95D39] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Engineer Role / Collaboration Inquiry"
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D95D39] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                        Your Message *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell me about your product, team, or opportunity..."
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full bg-[#1A1A1A] border border-white/15 rounded-xl p-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D95D39] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      onMouseEnter={() => sound.playPop()}
                      className="w-full py-3.5 rounded-xl bg-[#D95D39] hover:bg-[#C04D2B] text-white font-heading text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shadow-[#D95D39]/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.99]"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Transmitting Message...' : 'Send Message Now'}</span>
                    </button>
                  </form>
                )}
              </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/60">
          <div>
            © {new Date().getFullYear()} Yashwanth S. Built with React 18, Three.js & Tailwind CSS.
          </div>

          <div className="flex items-center gap-4">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              className="hover:text-[#D95D39] transition-colors"
            >
              GitHub
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              className="hover:text-[#D95D39] transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={scrollToTop}
              onMouseEnter={() => sound.playPop()}
              className="flex items-center gap-1 hover:text-[#D95D39] transition-colors ml-2"
              title="Back to Top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
