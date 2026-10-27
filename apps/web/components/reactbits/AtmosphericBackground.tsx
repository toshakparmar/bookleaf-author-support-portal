'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotionSafe } from '../../lib/motion';

interface AtmosphericBackgroundProps {
  className?: string;
}

export function AtmosphericBackground({ className = '' }: AtmosphericBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Threads / Silk curves parameters
    const threads = [
      { yOffset: 0.3, amplitude: 45, frequency: 0.002, speed: 0.0008, color: 'rgba(31, 95, 74, 0.35)' },
      { yOffset: 0.5, amplitude: 65, frequency: 0.0015, speed: 0.0005, color: 'rgba(23, 73, 58, 0.45)' },
      { yOffset: 0.7, amplitude: 50, frequency: 0.0025, speed: 0.001, color: 'rgba(224, 165, 38, 0.2)' },
    ];

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      threads.forEach((t) => {
        ctx.beginPath();
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.5;

        for (let x = 0; x <= width; x += 10) {
          const y =
            height * t.yOffset +
            Math.sin(x * t.frequency + step * t.speed) * t.amplitude +
            Math.cos(x * 0.001 + step * 0.0006) * (t.amplitude * 0.5);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      if (!isReduced) {
        step += 1;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReduced]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-60 ${className}`}
    />
  );
}
