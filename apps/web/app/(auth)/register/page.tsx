'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fetchApi } from '../../../lib/api';
import { gsap } from '../../../lib/gsap';
import { SplitText } from '../../../components/reactbits/SplitText';
import { CountUp } from '../../../components/reactbits/CountUp';
import { Logo } from '../../../components/brand/Logo';
import { BookCover } from '../../../components/brand/BookCover';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Home,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  User,
  MapPin,
  Phone,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

const AtmosphericBackground = dynamic(
  () =>
    import('../../../components/reactbits/AtmosphericBackground').then(
      (mod) => mod.AtmosphericBackground
    ),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [initialBookTitle, setInitialBookTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formCardRef = useRef<HTMLDivElement>(null);

  const triggerErrorShake = () => {
    if (!formCardRef.current) return;
    gsap.fromTo(
      formCardRef.current,
      { x: -10 },
      {
        x: 10,
        duration: 0.08,
        repeat: 3,
        yoyo: true,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(formCardRef.current, { x: 0 });
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          city: city || undefined,
          phone: phone || undefined,
          initialBookTitle: initialBookTitle || 'My Debut Manuscript',
        }),
      });

      router.push('/author/books');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Registration could not be completed. Please verify your details.'
      );
      triggerErrorShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left editorial brand panel */}
      <div className="relative lg:w-1/2 bg-[#17493A] text-[#FFFDF8] flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Real photo overlay with duotone effect */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/images/hero-book-desk.jpg"
            alt="Warm editorial studio desk"
            fill
            priority
            className="object-cover opacity-20 mix-blend-luminosity scale-105"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-[#17493A]/80 mix-blend-multiply" />
        </div>

        {/* Atmospheric silk canvas overlay */}
        <AtmosphericBackground />

        {/* Paper texture overlay */}
        <div className="absolute inset-0 paper-grain pointer-events-none opacity-20" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition group"
            title="Return to BookLeaf Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-[#E0A526]" />
            <span>bookleaf.in</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-widest text-[#E0A526]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Author Portal Onboarding</span>
          </div>
        </div>

        {/* Editorial headline and mission */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl">
          <SplitText
            text="Join India's premier author-first publishing house."
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.15] text-[#FFFDF8]"
            delay={0.2}
          />
          <p className="mt-6 text-sm sm:text-base text-white/80 leading-relaxed font-sans font-light">
            Create your author account to track ISBN registrations, print runs, nationwide retail distribution across Amazon &amp; Flipkart, and receive transparent quarterly royalties.
          </p>

          {/* Floating procedural book-cover pair */}
          <div className="hidden xl:flex items-center gap-6 mt-8 pt-6 border-t border-white/15">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookCover
                title="The Silent Horizon"
                authorName={name || 'New Author'}
                genre="Literary Fiction"
                size="sm"
                className="shadow-2xl"
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
              <BookCover
                title="Echoes of the Valley"
                authorName="BookLeaf Press"
                genre="Poetry & Prose"
                size="sm"
                className="shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Trust stats */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-medium text-[#FFFDF8]">
                <CountUp to={22000} suffix="+" duration={1.5} />
              </div>
              <span className="text-[11px] text-white/70 font-mono uppercase tracking-wider block mt-1">
                Published Titles
              </span>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-medium text-[#FFFDF8]">
                80%
              </div>
              <span className="text-[11px] text-white/70 font-mono uppercase tracking-wider block mt-1">
                Net Profit Split
              </span>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-medium text-[#E0A526]">
                <CountUp to={48} suffix="h" duration={1.2} />
              </div>
              <span className="text-[11px] text-white/70 font-mono uppercase tracking-wider block mt-1">
                Response SLA
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/50 font-mono">
          <span>BookLeaf Publishing House &middot; Author Portal</span>
        </div>
      </div>

      {/* Right clean registration form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-background">
        <div
          ref={formCardRef}
          className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-subtle"
        >
          {/* Back to Home Button */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-all group py-1.5 px-3 rounded-lg bg-muted/60 hover:bg-muted border border-border/60 shadow-sm"
              title="Return to BookLeaf Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-primary" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Landing Page</span>
            </Link>
          </div>

          <div className="mb-6">
            <Link href="/" title="BookLeaf Home" className="inline-block hover:opacity-90 transition">
              <Logo size="md" />
            </Link>
            <h2 className="mt-4 font-display text-2xl font-medium text-foreground tracking-tight">
              Register as an Author
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground font-sans">
              Enter your publishing details to access your author catalog, royalty ledger, and support tickets.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Author Full Name
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  placeholder="e.g. Vikram Seth"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  placeholder="author@bookleafpublishing.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Password
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  City
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Phone (Optional)
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    placeholder="+91..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Book Title (Debut Manuscript)
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={initialBookTitle}
                  onChange={(e) => setInitialBookTitle(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  placeholder="e.g. The Silent Horizon (or leave blank)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full !mt-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
            >
              {loading ? 'Registering Author...' : 'Complete Author Registration'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Switch to Login Link */}
          <div className="mt-6 pt-5 border-t border-border text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Already have an author account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in to your account
              </Link>
            </p>

            {/* Note for Operations Staff */}
            <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-left flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3E6FA8] shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">BookLeaf Operations Staff:</span> Admin accounts are provisioned internally. Please sign in with your staff credentials on the{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Login page
                </Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
