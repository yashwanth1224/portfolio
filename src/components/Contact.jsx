import React, { useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Mail, Phone, MapPin, Copy, Check, Send, Github, Linkedin, FileDown, ArrowUp, Sparkles, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [copiedType, setCopiedType] = useState(null);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

    // Simulate immediate client dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      sound.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#AF4426', '#FF5A36', '#F7F5F0', '#10B981']
        });
      } catch {
        // Confetti fallback
      }
    }, 600);
  };

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative bg-obsidian text-cream pt-24 pb-12 overflow-hidden border-t border-white/10">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-terracotta/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-0.5 bg-coral" />
          <span className="font-mono text-xs uppercase tracking-widest text-coral font-semibold">
            GET IN TOUCH
          </span>
        </div>

        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Let’s build something{' '}
            <span className="italic font-normal text-coral">extraordinary together.</span>
          </h2>
          <p className="text-cream/70 text-base sm:text-lg mt-3">
            Whether you are looking to hire a full-time frontend engineer, discuss 3D WebGL architectures, or build a scalable React application, my inbox is always open.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Email Card with 1-click copy */}
            <div
              onMouseEnter={() => sound.playPop()}
              className="p-5 rounded-2xl bg-obsidian-card border border-white/10 hover:border-coral/50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-terracotta/20 text-coral border border-terracotta/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-cream/50">Email Address</div>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="font-medium text-cream group-hover:text-coral transition-colors text-sm sm:text-base break-all"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>

              <button
                onClick={() => handleCopy(personalInfo.email, 'email')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-cream/70 hover:text-white transition-colors border border-white/10"
                title="Copy Email"
                aria-label="Copy Email to Clipboard"
              >
                {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Phone Card with 1-click copy */}
            <div
              onMouseEnter={() => sound.playPop()}
              className="p-5 rounded-2xl bg-obsidian-card border border-white/10 hover:border-coral/50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-terracotta/20 text-coral border border-terracotta/30">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-cream/50">Phone Number</div>
                  <a
                    href={`tel:${personalInfo.phone}`}
                    className="font-medium text-cream group-hover:text-coral transition-colors text-sm sm:text-base"
                  >
                    {personalInfo.phone}
                  </a>
                </div>
              </div>

              <button
                onClick={() => handleCopy(personalInfo.phone, 'phone')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-cream/70 hover:text-white transition-colors border border-white/10"
                title="Copy Phone Number"
                aria-label="Copy Phone Number to Clipboard"
              >
                {copiedType === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Location Card */}
            <div
              onMouseEnter={() => sound.playPop()}
              className="p-5 rounded-2xl bg-obsidian-card border border-white/10 flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-terracotta/20 text-coral border border-terracotta/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-cream/50">Location</div>
                <div className="font-medium text-cream text-sm sm:text-base">
                  {personalInfo.location} — {personalInfo.postalCode}
                </div>
              </div>
            </div>

            {/* Resume Download CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-dark border border-white/20 text-cream shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h4 className="font-serif font-bold text-lg">Looking for my full resume?</h4>
              </div>
              <p className="text-xs sm:text-sm text-cream/85">
                Download my verified CV with academic records, complete project index, and technical certifications.
              </p>
              <a
                href="./Yashwanth_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Yashwanth_Resume.pdf"
                onClick={() => {
                  sound.playSuccess();
                  try {
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                  } catch {
                    // Fallback
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-terracotta-dark font-semibold text-xs font-mono uppercase tracking-wider shadow-md hover:bg-cream transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Resume (PDF)</span>
              </a>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-obsidian-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Message Dispatched Successfully!
                </h3>
                <p className="text-cream/70 text-sm max-w-md mx-auto">
                  Thank you for reaching out, {formState.name}! I will review your note and respond back promptly at <strong className="text-coral">{formState.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    setSubmitted(false);
                    setFormState({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cream text-xs font-mono uppercase tracking-wider"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-coral" />
                  <h3 className="font-serif text-xl font-bold text-white">Direct Dispatch Message</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-cream/70 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full bg-obsidian-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-coral transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-cream/70 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-obsidian-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-coral transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-cream/70 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer Opportunity / Project Inquiry"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full bg-obsidian-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-coral transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-cream/70 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell me about your project, team, or opportunity..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-obsidian-surface border border-white/15 rounded-xl p-4 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-coral transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={() => sound.playPop()}
                  className="w-full py-3.5 rounded-xl bg-terracotta hover:bg-coral text-cream font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shadow-terracotta/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Message...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-cream/60">
          <div>
            © {new Date().getFullYear()} Yashwanth S. Built with React 18, Three.js & Tailwind CSS.
          </div>

          <div className="flex items-center gap-4">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              className="hover:text-coral transition-colors"
            >
              GitHub
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              className="hover:text-coral transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={scrollToTop}
              onMouseEnter={() => sound.playPop()}
              className="flex items-center gap-1 hover:text-coral transition-colors ml-2"
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
