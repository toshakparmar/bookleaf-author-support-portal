'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../lib/gsap';
import { useReducedMotionSafe } from '../../lib/motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export function SplitText({
  text,
  className = '',
  delay = 0.1,
  duration = 0.6,
  stagger = 0.03,
}: SplitTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const isReduced = useReducedMotionSafe();

  useGSAP(
    () => {
      if (!containerRef.current || isReduced) return;
      const letters = containerRef.current.querySelectorAll('.split-char');

      gsap.fromTo(
        letters,
        {
          opacity: 0,
          y: 16,
          rotateX: -20,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration,
          stagger,
          delay,
          ease: 'power3.out',
        }
      );
    },
    { scope: containerRef, dependencies: [text, isReduced] }
  );

  const words = text.split(' ');

  return (
    <h1 ref={containerRef} className={`inline-block overflow-hidden ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              className={`split-char inline-block ${isReduced ? 'opacity-100' : 'opacity-0'}`}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
