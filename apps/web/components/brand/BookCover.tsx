'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface BookCoverProps {
  title: string;
  authorName?: string;
  genre?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  interactive?: boolean;
}

const GENRE_CONFIGS: Record<
  string,
  { bgGradient: string; accentColor: string; motif: string }
> = {
  Fiction: {
    bgGradient: 'from-[#17493A] via-[#1F5F4A] to-[#12362B]',
    accentColor: '#E0A526',
    motif: 'waves',
  },
  Poetry: {
    bgGradient: 'from-[#4A283D] via-[#6B3A57] to-[#3B1F30]',
    accentColor: '#F7D6E0',
    motif: 'botanical',
  },
  'Non-Fiction': {
    bgGradient: 'from-[#1E3A5F] via-[#2A4D7A] to-[#14263E]',
    accentColor: '#88C0D0',
    motif: 'geometric',
  },
  Memoir: {
    bgGradient: 'from-[#5C3D2E] via-[#7B523E] to-[#452D21]',
    accentColor: '#E0A526',
    motif: 'arch',
  },
  Thriller: {
    bgGradient: 'from-[#2B1B17] via-[#4A2821] to-[#1A100E]',
    accentColor: '#C8453A',
    motif: 'diagonal',
  },
  Romance: {
    bgGradient: 'from-[#5E2B3E] via-[#7D3A53] to-[#471E2D]',
    accentColor: '#FFCCD5',
    motif: 'botanical',
  },
  'Self-Help': {
    bgGradient: 'from-[#2A4736] via-[#38634B] to-[#1C3325]',
    accentColor: '#E8B84A',
    motif: 'sunburst',
  },
};

export function BookCover({
  title,
  authorName = 'BookLeaf Author',
  genre = 'Fiction',
  size = 'md',
  className = '',
  interactive = true,
}: BookCoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Spring Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const dimensions = {
    sm: 'w-20 h-28 text-[9px]',
    md: 'w-36 h-52 text-xs',
    lg: 'w-48 h-68 text-sm',
    hero: 'w-60 h-84 text-base',
  }[size];

  const config = GENRE_CONFIGS[genre] || GENRE_CONFIGS.Fiction;

  return (
    <div
      style={{ perspective: 1000 }}
      className={`inline-block select-none ${className}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={interactive ? { scale: 1.04, y: -4 } : {}}
        transition={{ duration: 0.2 }}
        className={`relative ${dimensions} rounded-r-md rounded-l-sm bg-gradient-to-br ${config.bgGradient} p-3.5 text-white shadow-elevated flex flex-col justify-between overflow-hidden border-r-2 border-b-2 border-black/30`}
      >
        {/* Left Book Spine Shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />

        {/* Subtle Paper Texture Overlay */}
        <div className="absolute inset-0 paper-grain opacity-20 pointer-events-none" />

        {/* Decorative Genre Geometric Motif */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
          {config.motif === 'waves' && (
            <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor">
              <path d="M0 25 Q25 15 50 25 T100 25 M0 50 Q25 40 50 50 T100 50 M0 75 Q25 65 50 75 T100 75" strokeWidth="2" />
            </svg>
          )}
          {config.motif === 'botanical' && (
            <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor">
              <path d="M50 85 C30 65 30 35 50 15 C70 35 70 65 50 85z M50 15 v70" strokeWidth="1.5" />
            </svg>
          )}
          {config.motif === 'geometric' && (
            <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor">
              <rect x="20" y="20" width="60" height="60" strokeWidth="1.5" />
              <rect x="30" y="30" width="40" height="40" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="10" strokeWidth="1.5" />
            </svg>
          )}
          {config.motif === 'arch' && (
            <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor">
              <path d="M25 80 V40 A25 25 0 0 1 75 40 V80" strokeWidth="2" />
            </svg>
          )}
          {config.motif === 'sunburst' && (
            <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor">
              <circle cx="50" cy="50" r="18" strokeWidth="1.5" />
              <line x1="50" y1="15" x2="50" y2="28" strokeWidth="2" />
              <line x1="50" y1="72" x2="50" y2="85" strokeWidth="2" />
              <line x1="15" y1="50" x2="28" y2="50" strokeWidth="2" />
              <line x1="72" y1="50" x2="85" y2="50" strokeWidth="2" />
            </svg>
          )}
          {config.motif === 'diagonal' && (
            <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor">
              <line x1="0" y1="0" x2="100" y2="100" strokeWidth="2" />
              <line x1="0" y1="50" x2="100" y2="150" strokeWidth="2" />
            </svg>
          )}
        </div>

        {/* Top Header: Imprint */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono tracking-widest uppercase opacity-80">
          <span>BookLeaf</span>
          <span style={{ color: config.accentColor }}>{genre}</span>
        </div>

        {/* Center: Title in Fraunces */}
        <div className="relative z-10 my-auto text-center px-1">
          <h4 className="font-display font-medium tracking-tight text-white leading-tight line-clamp-3">
            {title}
          </h4>
          <div
            className="w-6 h-0.5 mx-auto mt-2 rounded-full"
            style={{ backgroundColor: config.accentColor }}
          />
        </div>

        {/* Bottom: Author Name */}
        <div className="relative z-10 text-center font-sans font-medium text-[10px] tracking-wide text-white/90 truncate">
          {authorName}
        </div>

        {/* Right Page-Block Edge (Thickness Effect) */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}
