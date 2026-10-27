'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotionSafe } from '../../lib/motion';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const isReduced = useReducedMotionSafe();

  useEffect(() => {
    if (isReduced || typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [isReduced]);

  return <>{children}</>;
}
