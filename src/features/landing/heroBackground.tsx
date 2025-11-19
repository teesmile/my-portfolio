
'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/providers/theme-provider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouse = { x: -1000, y: -1000 };

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
            
            for (let i = 0; i < particleCount; i++) {
                // Dark mode: light particles. Light mode: dark particles.
                const isDark = theme === 'dark';
                const color1 = isDark ? 'rgba(216, 180, 254, 0.5)' : 'rgba(107, 33, 168, 0.3)'; // Light Purple vs Dark Purple
                const color2 = isDark ? 'rgba(232, 121, 249, 0.5)' : 'rgba(192, 38, 211, 0.3)'; // Light Fuchsia vs Dark Fuchsia

                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 2,
                    color: Math.random() > 0.5 ? color1 : color2
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw particles
            particles.forEach((p, i) => {
                // Mouse attraction
                const dx_m = p.x - mouse.x;
                const dy_m = p.y - mouse.y;
                const dist_m = Math.sqrt(dx_m * dx_m + dy_m * dy_m);
                
                if (dist_m < 200) {
                    const forceDirectionX = dx_m / dist_m;
                    const forceDirectionY = dy_m / dist_m;
                    const force = (200 - dist_m) / 200;
                    const directionX = forceDirectionX * force * 0.5;
                    const directionY = forceDirectionY * force * 0.5;
                    p.vx -= directionX;
                    p.vy -= directionY;
                }

                // Friction
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Minimum movement
                if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.01;
                if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.01;

                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw Dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Connect close particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        const isDark = theme === 'dark';
                        // Line color dependent on theme
                        const lineRgb = isDark ? '192, 132, 252' : '126, 34, 206';
                        ctx.strokeStyle = `rgba(${lineRgb}, ${0.15 * (1 - dist / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                if (dist_m < 150) {
                     ctx.beginPath();
                     const isDark = theme === 'dark';
                     const mouseLineRgb = isDark ? '240, 171, 252' : '162, 28, 175';
                     ctx.strokeStyle = `rgba(${mouseLineRgb}, ${0.3 * (1 - dist_m / 150)})`; 
                     ctx.moveTo(p.x, p.y);
                     ctx.lineTo(mouse.x, mouse.y);
                     ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full -z-10 opacity-60 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500"
        />
    );
}
