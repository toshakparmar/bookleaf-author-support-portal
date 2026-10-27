'use client';

import { useEffect, useState } from 'react';
import { gsap } from './gsap';

export const MOTION = {
  durations: {
    micro: 0.15, // 120-180ms
    standard: 0.3, // 250-350ms
    emphasis: 0.75, // 600-900ms
  },
  easings: {
    entrance: 'power3.out',
    transition: 'power2.inOut',
    pop: 'back.out(1.4)',
  },
} as const;

/**
 * Hook to detect prefers-reduced-motion in client components.
 */
export function useReducedMotionSafe(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Page or card entrance animation: staggered fade + subtle rise (12px)
 */
export function animateEntrance(
  targets: gsap.DOMTarget,
  options?: { delay?: number; duration?: number; y?: number }
) {
  if (typeof window === 'undefined') return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) {
    return gsap.set(targets, { opacity: 1, y: 0 });
  }

  return gsap.fromTo(
    targets,
    { opacity: 0, y: options?.y ?? 12 },
    {
      opacity: 1,
      y: 0,
      duration: options?.duration ?? MOTION.durations.standard,
      ease: MOTION.easings.entrance,
      delay: options?.delay ?? 0,
    }
  );
}

/**
 * List stagger for items (caps at max 12 items animated)
 */
export function animateListStagger(
  targets: gsap.DOMTarget,
  options?: { stagger?: number; delay?: number }
) {
  if (typeof window === 'undefined') return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) {
    return gsap.set(targets, { opacity: 1, y: 0 });
  }

  return gsap.fromTo(
    targets,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      stagger: options?.stagger ?? 0.04,
      duration: MOTION.durations.standard,
      ease: MOTION.easings.entrance,
      delay: options?.delay ?? 0,
    }
  );
}
