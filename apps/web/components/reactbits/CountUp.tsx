'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotionSafe } from '../../lib/motion';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  duration = 1.2,
  delay = 0,
  prefix = '',
  suffix = '',
  formatter,
  className = '',
}: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isReduced = useReducedMotionSafe();

  useEffect(() => {
    if (!nodeRef.current) return;

    if (isReduced) {
      const formatted = formatter ? formatter(to) : Math.round(to).toLocaleString();
      nodeRef.current.textContent = `${prefix}${formatted}${suffix}`;
      return;
    }

    const state = { val: from };
    const tween = gsap.to(state, {
      val: to,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        if (!nodeRef.current) return;
        const formatted = formatter
          ? formatter(Math.round(state.val))
          : Math.round(state.val).toLocaleString();
        nodeRef.current.textContent = `${prefix}${formatted}${suffix}`;
      },
    });

    return () => {
      tween.kill();
    };
  }, [to, from, duration, delay, prefix, suffix, formatter, isReduced]);

  const initialText = formatter
    ? formatter(from)
    : Math.round(from).toLocaleString();

  return (
    <span ref={nodeRef} className={`tabular-nums ${className}`}>
      {prefix}
      {initialText}
      {suffix}
    </span>
  );
}
