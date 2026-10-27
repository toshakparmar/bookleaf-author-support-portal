'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../lib/gsap';
import { useReducedMotionSafe } from '../../lib/motion';
import { Check } from 'lucide-react';

const STAGES = [
  'Manuscript Received',
  'Editing',
  'Cover Design',
  'Typesetting',
  'Proofreading',
  'ISBN Assignment',
  'Printing',
  'Distribution Setup',
  'Published & Live',
];

interface ProductionStepperProps {
  currentStageName: string;
  className?: string;
}

export function ProductionStepper({
  currentStageName,
  className = '',
}: ProductionStepperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotionSafe();

  const getStageIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('manuscript')) return 0;
    if (s.includes('editing')) return 1;
    if (s.includes('cover')) return 2;
    if (s.includes('typesetting')) return 3;
    if (s.includes('proofreading') || s.includes('proof')) return 4;
    if (s.includes('isbn')) return 5;
    if (s.includes('printing')) return 6;
    if (s.includes('distribution')) return 7;
    if (s.includes('published') || s.includes('live')) return 8;
    return 2; // fallback default
  };

  const currentIndex = getStageIndex(currentStageName);
  const progressPercent = (currentIndex / (STAGES.length - 1)) * 100;

  useGSAP(
    () => {
      if (!lineRef.current || isReduced) return;
      gsap.fromTo(
        lineRef.current,
        { width: '0%' },
        {
          width: `${progressPercent}%`,
          duration: 0.9,
          ease: 'power2.out',
        }
      );
    },
    { scope: containerRef, dependencies: [progressPercent, isReduced] }
  );

  return (
    <div ref={containerRef} className={`w-full py-3 ${className}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="font-mono text-[11px] uppercase tracking-wider">
          Production Stage {currentIndex + 1} of {STAGES.length}
        </span>
        <span className="font-medium text-foreground">
          {STAGES[currentIndex]}
        </span>
      </div>

      {/* Progress track */}
      <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          ref={lineRef}
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          style={{ width: isReduced ? `${progressPercent}%` : '0%' }}
        />
      </div>

      {/* Stage Dots / Labels (horizontal scrollable on mobile) */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 text-[11px] scrollbar-none gap-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={stage}
              className={`flex flex-col items-center shrink-0 text-center w-16 transition-opacity ${
                isCurrent
                  ? 'text-foreground font-medium'
                  : isDone
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1.5 border transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/20 scale-110'
                    : isDone
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground/40'
                }`}
              >
                {isDone ? (
                  <Check className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className="leading-tight line-clamp-2">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
