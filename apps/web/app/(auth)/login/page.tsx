'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fetchApi } from '../../../lib/api';
import { gsap } from '../../../lib/gsap';
import { SplitText } from '../../../components/reactbits/SplitText';
import { CountUp } from '../../../components/reactbits/CountUp';
import { Logo } from '../../../components/brand/Logo';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookCover } from '../../../components/brand/BookCover';
import { LottieAnimation } from '../../../components/shared/LottieAnimation';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const AtmosphericBackground = dynamic(
  () =>
    import('../../../components/reactbits/AtmosphericBackground').then(
      (mod) => mod.AtmosphericBackground
    ),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('priya.sharma@email.com');
  const [password, setPassword] = useState('Author@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  const formCardRef = useRef<HTMLDivElement>(null);

  const quickDemoAccounts = [
    {
      label: 'Priya Sharma (2 Books)',
      email: 'priya.sharma@email.com',
      pass: 'Author@123',
      role: 'AUTHOR',
    },
    {
      label: 'Sneha Kulkarni (In Production)',
      email: 'sneha.kulkarni@email.com',
      pass: 'Author@123',
      role: 'AUTHOR',
    },
    {
      label: 'Kavita Deshmukh (₹850 Rollover)',
      email: 'kavita.deshmukh@email.com',
      pass: 'Author@123',
      role: 'AUTHOR',
    },
    {
      label: 'Support Lead Admin',
      email: 'admin@bookleaf.test',
      pass: 'Admin@123',
      role: 'ADMIN',
    },
    {
      label: 'Operations Admin',
      email: 'ops@bookleaf.test',
      pass: 'Admin@123',
      role: 'ADMIN',
    },
  ];

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
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.user?.role === 'ADMIN') {
        router.push('/admin/tickets');
      } else {
        router.push('/author/books');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'That email or password does not match. Please verify and try again.'
      );
      triggerErrorShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    setShowDemoPicker(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left editorial brand panel */}
      <div className="relative lg:w-1/2 bg-[#17493A] text-[#FFFDF8] flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Real photo overlay with duotone effect and Ken Burns animation */}
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
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-widest text-[#E0A526]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Author Portal &amp; Ops Triage</span>
          </div>
        </div>

        {/* Editorial headline and mission */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl">
          <SplitText
            text="Where great writing meets attentive publishing."
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.15] text-[#FFFDF8]"
            delay={0.2}
          />
          <p className="mt-6 text-sm sm:text-base text-white/80 leading-relaxed font-sans font-light">
            BookLeaf handles manuscript editing, typesetting, global distribution,
            and transparent quarterly royalties with an unwavering 48-hour response promise.
          </p>

          {/* Floating procedural book-cover pair */}
          <div className="hidden xl:flex items-center gap-6 mt-8 pt-6 border-t border-white/15">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookCover
                title="The Silence of Pines"
                authorName="Priya Sharma"
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
                title="Whispers in the Mist"
                authorName="Sneha Kulkarni"
                genre="Poetry"
                size="sm"
                className="shadow-2xl"
              />
            </motion.div>
          </div>

          {/* 3 Quiet trust stats with CountUp */}
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
                <span>IN &amp; US</span>
              </div>
              <span className="text-[11px] text-white/70 font-mono uppercase tracking-wider block mt-1">
                Global Imprints
              </span>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-medium text-[#E0A526]">
                <CountUp to={48} suffix="h" duration={1.2} />
              </div>
              <span className="text-[11px] text-white/70 font-mono uppercase tracking-wider block mt-1">
                Escalation SLA
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/50 font-mono">
          <span>BookLeaf Publishing House &middot; Confidential Ops Portal</span>
        </div>
      </div>

      {/* Right clean form card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-background">
        <div
          ref={formCardRef}
          className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-subtle"
        >
          <div className="mb-8">
            <Logo size="md" />
            <h2 className="mt-4 font-display text-2xl font-medium text-foreground tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground font-sans">
              Enter your publishing email and password to access your catalog or support queue.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
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
                  className="block w-full pl-9 pr-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  placeholder="author@bookleaf.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* New Account / Register Link */}
          <div className="mt-5 text-center">
            <p className="text-xs text-muted-foreground">
              New author or team member?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Collapsed demo account popover */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">
                Testing or evaluating?
              </span>
              <button
                type="button"
                onClick={() => setShowDemoPicker(!showDemoPicker)}
                className="text-xs font-mono text-primary hover:underline"
              >
                {showDemoPicker ? 'Hide demo accounts' : 'Use demo account'}
              </button>
            </div>

            {showDemoPicker && (
              <div className="mt-3 space-y-1.5 p-2 rounded-lg bg-muted/40 border border-border text-xs">
                {quickDemoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email, acc.pass)}
                    className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-md transition ${
                      email === acc.email
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-card text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {acc.role === 'ADMIN' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3E6FA8]" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span className="font-medium">{acc.label}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
