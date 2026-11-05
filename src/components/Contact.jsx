import React, { useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Mail, Phone, MapPin, Copy, Check, Send, Github, Linkedin, FileDown, ArrowUp, Sparkles, MessageSquare, SendHorizontal } from 'lucide-react';

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
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#0B1B2B', '#38BDF8', '#0284C7', '#2563EB', '#FFFFFF', '#10B981']
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
      {/* Background glow in Cyan & Royal Blue */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Banner in Resume Silver-Slate Format */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slateBanner border border-slateBanner-border text-navy font-mono text-xs uppercase tracking-widest font-bold mb-6 shadow-sm">
          <SendHorizontal className="w-3.5 h-3.5 text-accent-royal" />
          <span>GET IN TOUCH</span>
        </div>

        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Let’s build something{' '}
            <span className="italic font-normal text-accent">extraordinary together.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mt-3">
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
              className="p-5 rounded-2xl bg-obsidian-card border border-white/10 hover:border-accent/50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-navy-light/80 text-accent border border-accent/25">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Email Address</div>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="font-medium text-cream group-hover:text-accent transition-colors text-sm sm:text-base break-all"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>

              <button
                onClick={() => handleCopy(personalInfo.email, 'email')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors border border-white/10"
                title="Copy Email"
                aria-label="Copy Email to Clipboard"
              >
                {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Phone Card with 1-click copy */}
            <div
              onMouseEnter={() => sound.playPop()}
              className="p-5 rounded-2xl bg-obsidian-card border border-white/10 hover:border-accent/50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-navy-light/80 text-accent border border-accent/25">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Phone Number</div>
                  <a
                    href={`tel:${personalInfo.phone}`}
                    className="font-medium text-cream group-hover:text-accent transition-colors text-sm sm:text-base"
                  >
                    {personalInfo.phone}
                  </a>
                </div>
              </div>

              <button
                onClick={() => handleCopy(personalInfo.phone, 'phone')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors border border-white/10"
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
              <div className="p-3 rounded-xl bg-navy-light/80 text-accent border border-accent/25">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Location</div>
                <div className="font-medium text-cream text-sm sm:text-base">
                  {personalInfo.location} — {personalInfo.postalCode}
                </div>
              </div>
            </div>

            {/* Resume Download CTA (Deep Midnight Navy with Crisp White Button) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-navy via-navy-light to-navy-dark border border-sky-400/30 text-cream shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-300" />
                <h4 className="font-serif font-bold text-lg text-white">Looking for my full resume?</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
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
                    confetti({
                      particleCount: 55,
                      spread: 65,
                      origin: { y: 0.8 },
                      colors: ['#0B1B2B', '#38BDF8', '#0284C7', '#2563EB', '#FFFFFF']
                    });
                  } catch {
                    // Fallback
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-navy font-bold text-xs font-mono uppercase tracking-wider shadow-md hover:bg-slate-100 transition-colors border border-sky-400/30"
              >
                <FileDown className="w-4 h-4 text-accent-royal" />
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
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you for reaching out, {formState.name}! I will review your note and respond back promptly at <strong className="text-accent">{formState.email}</strong>.
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
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-xl font-bold text-white">Direct Dispatch Message</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full bg-obsidian-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-obsidian-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer Opportunity / Project Inquiry"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full bg-obsidian-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell me about your project, team, or opportunity..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-obsidian-surface border border-white/15 rounded-xl p-4 text-sm text-cream placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={() => sound.playPop()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Message...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} Yashwanth S. Built with React 18, Three.js & Tailwind CSS.
          </div>

          <div className="flex items-center gap-4">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              className="hover:text-accent transition-colors"
            >
              GitHub
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playPop()}
              className="hover:text-accent transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={scrollToTop}
              onMouseEnter={() => sound.playPop()}
              className="flex items-center gap-1 hover:text-accent transition-colors ml-2"
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
