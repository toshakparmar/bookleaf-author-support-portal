'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Logo } from '../components/brand/Logo';
import { BookCover } from '../components/brand/BookCover';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { SplitText } from '../components/reactbits/SplitText';
import { CountUp } from '../components/reactbits/CountUp';
import { Magnet } from '../components/reactbits/Magnet';
import { Marquee } from '../components/reactbits/Marquee';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { LottieAnimation } from '../components/shared/LottieAnimation';
import { SmoothScroll } from '../components/landing/SmoothScroll';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Coins,
  Barcode,
  Printer,
  Globe2,
  ChevronDown,
  BookOpen,
  HelpCircle,
  FileText,
} from 'lucide-react';

const AtmosphericBackground = dynamic(
  () =>
    import('../components/reactbits/AtmosphericBackground').then(
      (mod) => mod.AtmosphericBackground
    ),
  { ssr: false }
);

export default function PublicLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'When and how are book royalties paid out?',
      a: 'Royalties are calculated quarterly and paid within 45 days of quarter end directly to your linked bank account. The split is 80% of net profits (MRP minus printing costs, platform commission, and shipping) to the author.',
    },
    {
      q: 'What happens if my quarterly royalty is below ₹1,000?',
      a: 'BookLeaf enforces a minimum payout threshold of ₹1,000. If your pending balance is under ₹1,000, it safely rolls over and accumulates into the following quarter.',
    },
    {
      q: 'How does BookLeaf handle defective author copies or print errors?',
      a: 'We stand by our print partners. If copies arrive with misprints, blurry typography, or binding flaws, attach photos to a support ticket for a free reprint verified within 5–7 business days.',
    },
    {
      q: 'Why does my book show "Currently Unavailable" on Amazon or Flipkart?',
      a: 'This usually indicates a stock synchronization issue between retail warehouses and distributor feeds. Once raised, our operations team triggers an inventory re-sync within 24–48 hours.',
    },
    {
      q: 'Can I update my book description or blurb after launch?',
      a: 'Yes. You can raise a metadata update query through this portal. Once reviewed by our editorial desk, updated metadata reflects across retail platforms within 3–5 business days.',
    },
  ];

  const publishingStages = [
    'Manuscript Received',
    'Editing (if opted)',
    'Cover Design',
    'Typesetting',
    'Proofreading',
    'ISBN Assignment',
    'Printing',
    'Distribution Setup',
    'Published & Live',
  ];

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground paper-grain selection:bg-primary selection:text-primary-foreground font-sans">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Logo href="/" size="md" />

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition">
                How Support Works
              </a>
              <a href="#features" className="hover:text-foreground transition">
                Features
              </a>
              <a href="#pipeline" className="hover:text-foreground transition">
                Publishing Pipeline
              </a>
              <a href="#faq" className="hover:text-foreground transition">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-subtle transition"
              >
                <span>Open Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border">
          {/* Generative atmospheric silk canvas overlay */}
          <AtmosphericBackground />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Editorial Headline & Actions (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono uppercase tracking-widest text-primary">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Author Care &middot; Powered by Precision AI</span>
                </div>

                <div className="space-y-4">
                  <SplitText
                    text="Publishing care that never leaves you guessing."
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.12]"
                    delay={0.1}
                  />
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl font-sans font-light">
                    BookLeaf Publishing handles manuscript editing, typesetting, global retail distribution,
                    and transparent quarterly royalties with an unwavering 48-hour response guarantee.
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex items-center gap-3.5 pt-2 flex-wrap">
                  <Magnet strength={0.2}>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-elevated transition"
                    >
                      <span>Author Portal Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Magnet>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-xs font-medium transition"
                  >
                    <span>Operations Console</span>
                  </Link>
                </div>

                {/* Quiet Trust Metrics */}
                <div className="pt-6 border-t border-border/80 grid grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-medium text-foreground">
                      <CountUp to={22000} suffix="+" duration={1.5} />
                    </div>
                    <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider block mt-0.5">
                      Published Titles
                    </span>
                  </div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-medium text-foreground">
                      <CountUp to={1200} suffix="+" duration={1.5} />
                    </div>
                    <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider block mt-0.5">
                      Monthly Releases
                    </span>
                  </div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-medium text-accent">
                      <CountUp to={48} suffix="h" duration={1.2} />
                    </div>
                    <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider block mt-0.5">
                      Response SLA
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Layered Photography & Procedural 3D Book Cover Stack (5 Cols) */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-elevated bg-card">
                  {/* Real Editorial Photography with Duotone Overlay */}
                  <Image
                    src="/images/hero-book-desk.jpg"
                    alt="Hardcover book open on wooden desk with warm morning light"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                  {/* Floating Procedural Book Cover Stack */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <motion.div
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex items-center gap-3"
                    >
                      <BookCover
                        title="Startup Sutra"
                        authorName="Priya Sharma"
                        genre="Non-Fiction"
                        size="md"
                      />
                      <BookCover
                        title="Whispers of the Ghats"
                        authorName="Vikram Roy"
                        genre="Fiction"
                        size="md"
                        className="hidden sm:inline-block -ml-8 rotate-6 shadow-2xl"
                      />
                    </motion.div>

                    {/* Live Floating Ticket Status Pill */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 p-3 rounded-xl bg-card/95 border border-border/80 backdrop-blur-md shadow-elevated text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-mono text-[11px] text-muted-foreground">BL-1042</span>
                        <span className="font-medium text-foreground">Q4 Royalty Review</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        In Progress
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Retail Distribution Marquee */}
        <section className="py-6 border-b border-border bg-card/40">
          <div className="max-w-6xl mx-auto px-4 mb-2 text-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Official Global Print &amp; Retail Availability
            </span>
          </div>
          <Marquee speed={30}>
            {[
              'Amazon India',
              'Flipkart',
              'Amazon US',
              'Amazon UK',
              'BookLeaf Store',
              'Repro India Print Partner',
              'Epitome Books Network',
              'Google Play Books',
            ].map((partner) => (
              <span
                key={partner}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span>{partner}</span>
              </span>
            ))}
          </Marquee>
        </section>

        {/* How Support Works (4-Step Pipeline) */}
        <section id="how-it-works" className="py-20 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Operational Transparency
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight mt-1.5">
                How every author inquiry is answered
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Combining grounded database facts with editorial staff expertise for rapid, definitive resolutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Raise a Query',
                  desc: 'Select your book title or general account. Live royalty statements and ISBN data attach automatically.',
                  icon: BookOpen,
                },
                {
                  step: '02',
                  title: 'AI Triage & Classification',
                  desc: 'Inquiries are categorized across 6 publishing domains with deterministic priority safety nets.',
                  icon: Sparkles,
                },
                {
                  step: '03',
                  title: 'Human Ops Review',
                  desc: 'Publishing desk specialists review AI response drafts, verifying bank payouts and reprint files.',
                  icon: ShieldCheck,
                },
                {
                  step: '04',
                  title: 'Real-Time Resolution',
                  desc: 'Responses dispatch immediately over live streams. Authors see updates with zero page refreshes.',
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <SpotlightCard key={item.step} className="p-6 bg-card border-border">
                    <span className="font-mono text-xs font-semibold text-primary block mb-3">
                      Step {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4 border border-border">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display text-lg font-medium text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Bento Grid with Real Photography */}
        <section id="features" className="py-20 border-b border-border bg-card/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Designed for Publishing Ops
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight mt-1.5">
                Features built for real author partnerships
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Tile 1: Royalty Clarity (7 cols) */}
              <div className="md:col-span-7 bg-card rounded-2xl border border-border p-8 shadow-subtle flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 max-w-md">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-accent mb-4">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                    Transparent Royalty Accounting
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans mb-6">
                    80% of net profits paid quarterly within 45 days. Automatic rollover alerts for balances below ₹1,000, and computed deadline visibility on every book.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-border grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Author Split</span>
                    <strong className="text-foreground text-sm font-display">80% Share</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Payout Cycle</span>
                    <strong className="text-foreground text-sm font-display">Quarterly</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Min Threshold</span>
                    <strong className="text-accent text-sm font-display">₹1,000</strong>
                  </div>
                </div>

                {/* Subtle Photography Accent on Hover */}
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                  <Image
                    src="/images/author-writing.jpg"
                    alt="Author writing with fountain pen"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Tile 2: Real-time Ticket Updates (5 cols) */}
              <div className="md:col-span-5 bg-card rounded-2xl border border-border p-8 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                    Live Real-Time Stream
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans mb-6">
                    Powered by Server-Sent Events with automatic 5-second polling fallback. Status changes and staff replies arrive instantly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span>SSE Stream Connected</span>
                    </span>
                    <span>Active</span>
                  </div>
                  <p className="text-foreground font-medium">
                    &ldquo;Our production desk has approved the cover reprint.&rdquo;
                  </p>
                </div>
              </div>

              {/* Tile 3: Production Pipeline Tracking (5 cols) */}
              <div className="md:col-span-5 bg-card rounded-2xl border border-border p-8 shadow-subtle flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4 border border-border">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                    9-Stage Production Stepper
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans mb-4">
                    Watch your manuscript advance from Cover Design to ISBN registration, proofing, and global store setup.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs font-mono text-primary font-medium">
                  <span>Cover Design &rarr; Typesetting</span>
                </div>

                <div className="absolute right-0 bottom-0 w-full h-1/2 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                  <Image
                    src="/images/printing-press.jpg"
                    alt="Letterpress printing blocks"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Tile 4: Print & Quality Assurance (7 cols) */}
              <div className="md:col-span-7 bg-card rounded-2xl border border-border p-8 shadow-subtle flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 max-w-md">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4 border border-border">
                    <Printer className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                    In-House &amp; Partner Printing Quality
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans mb-6">
                    Delhi in-house production alongside Repro India and Epitome Books. Turnaround within 5&ndash;7 business days and free reprints on verified binding defects.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-border flex items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Turnaround</span>
                    <strong className="text-foreground text-sm font-display">5–7 Days</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Print Facilities</span>
                    <strong className="text-foreground text-sm font-display">Delhi &middot; Mumbai</strong>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                  <Image
                    src="/images/printing-binding.jpg"
                    alt="Close up of bookbinding and printed page leaves"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Production Timeline Section */}
        <section id="pipeline" className="py-20 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                End-to-End Workflow
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight mt-1.5">
                The 9 stages of BookLeaf publication
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 text-center">
              {publishingStages.map((stg, idx) => (
                <div
                  key={stg}
                  className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-col items-center justify-between min-h-[110px]"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-semibold flex items-center justify-center mb-2">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground leading-snug">
                    {stg}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1">
                    Stage {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section with Policy Facts */}
        <section id="faq" className="py-20 border-b border-border bg-card/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Frequently Asked Questions
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight mt-1.5">
                Clear policies. No fine print.
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border rounded-xl bg-card overflow-hidden shadow-subtle transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-medium text-foreground"
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Band with Photography Background */}
        <section className="relative overflow-hidden py-20 border-b border-border bg-[#17493A] text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <Image
              src="/images/bookstore-library.jpg"
              alt="Bookstore library shelves"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-widest text-[#E0A526]">
              Publishing House Operations
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight">
              Ready to view your catalog or resolve an author query?
            </h2>

            <p className="text-sm text-white/80 max-w-xl mx-auto leading-relaxed font-sans font-light">
              Log in to review live sales numbers, check production approvals, or communicate directly with Team BookLeaf.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
              <Magnet strength={0.25}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E0A526] hover:bg-[#c9921f] text-slate-950 text-xs font-semibold uppercase tracking-wider shadow-elevated transition"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Magnet>
            </div>
          </div>
        </section>

        {/* Public Footer */}
        <footer className="py-12 bg-background border-t border-border text-xs text-muted-foreground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="hidden sm:inline">&middot;</span>
              <span>Operations in New Delhi &middot; Delaware, USA</span>
            </div>

            <div className="flex items-center gap-6 font-mono text-[11px]">
              <Link href="/login" className="hover:text-foreground transition">
                Portal Login
              </Link>
              <a href="#faq" className="hover:text-foreground transition">
                Support Policies
              </a>
              <span className="text-muted-foreground/60">
                Asset Register: <strong className="text-foreground">docs/ASSETS.md</strong>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
