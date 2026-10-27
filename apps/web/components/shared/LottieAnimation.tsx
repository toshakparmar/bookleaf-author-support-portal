'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface LottieAnimationProps {
  type: 'success' | 'ai-thinking' | 'empty-inbox' | 'uploading' | 'reconnecting';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LottieAnimation({
  type,
  size = 'md',
  className = '',
}: LottieAnimationProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }[size];

  if (type === 'success') {
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-full rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-1/2 h-1/2 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            />
          </motion.svg>
        </motion.div>
      </div>
    );
  }

  if (type === 'ai-thinking') {
    return (
      <div className={`flex items-center justify-center gap-1.5 ${sizeClasses} ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'empty-inbox') {
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full text-muted-foreground/40"
        >
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full">
            <rect x="8" y="16" width="48" height="36" rx="6" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M8 38h14c2 0 4 3 6 3h8c2 0 4-3 6-3h14" strokeWidth="2" />
            <circle cx="32" cy="28" r="6" stroke="hsl(var(--primary))" strokeWidth="2" />
          </svg>
        </motion.div>
      </div>
    );
  }

  if (type === 'uploading') {
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full text-primary flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2/3 h-2/3">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </motion.div>
      </div>
    );
  }

  // Reconnecting
  return (
    <div className={`flex items-center justify-center ${sizeClasses} ${className}`}>
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-3 h-3 rounded-full bg-accent"
      />
    </div>
  );
}
