'use client';

import React, { useRef } from 'react';
import { useReducedMotionSafe } from '../../lib/motion';

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  sparkRadius?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ClickSpark({
  children,
  sparkColor = '#1F5F4A',
  sparkCount = 8,
  sparkRadius = 25,
  className = '',
  onClick,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotionSafe();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    if (isReduced || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      const angle = (i * 2 * Math.PI) / sparkCount;
      const destX = Math.cos(angle) * sparkRadius;
      const destY = Math.sin(angle) * sparkRadius;

      spark.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        border-radius: 9999px;
        background: ${sparkColor};
        pointer-events: none;
        z-index: 50;
        transition: transform 0.5s ease-out, opacity 0.5s ease-out;
      `;

      containerRef.current.appendChild(spark);

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => {
        spark.remove();
      }, 550);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative inline-block overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
