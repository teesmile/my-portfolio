
'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion'; // For Interactions
import gsap from 'gsap'; // For Sequencing
import { useGSAP } from '@gsap/react';
import { portfolioConfig } from '@/config/site';
import { socialIcons } from '@/components/ui/icons';

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    const bioRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);

    // --- GSAP: The Cinematic Entrance ---
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Initial State (Hidden)
        gsap.set([pillRef.current, titleRef.current, subtitleRef.current, bioRef.current, buttonsRef.current], {
            y: 50,
            opacity: 0
        });

        // 2. The Sequence
        tl.to(pillRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.6,
        })
        .to(titleRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
        }, "-=0.3")
        .to(subtitleRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.7,
        }, "-=0.6")
        .to(bioRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.7,
        }, "-=0.6")
        .to(buttonsRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.7,
        }, "-=0.6");

    }, { scope: containerRef });

    return (
        <section id="home" ref={containerRef} className="relative flex min-h-[720px] items-center justify-center overflow-hidden scroll-mt-24 bg-zinc-50 px-6 pt-16 dark:bg-[#050505]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(91,92,255,0.12),transparent_30%),linear-gradient(to_bottom,rgba(250,250,250,0.7),#fafafa)] dark:bg-[radial-gradient(circle_at_center,rgba(91,92,255,0.14),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.65),#111111)]" />
            <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,transparent_0_42%,rgba(91,92,255,0.3)_42%_43%,transparent_43%_100%),linear-gradient(rgba(24,24,27,0.12)_1px,transparent_1px)] [background-size:260px_100%,100%_34px] dark:opacity-[0.14] dark:[background-image:linear-gradient(90deg,transparent_0_42%,rgba(139,92,246,0.32)_42%_43%,transparent_43%_100%),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-white dark:to-[#171717]" />
            
            <div className="relative z-10 mx-auto max-w-4xl text-center">
                {/* Greeting Pill - GSAP Controlled Entrance */}
                <div ref={pillRef} className="mb-8 flex justify-center">
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                    {portfolioConfig.brandName}
                    </div>
                </div>

                {/* Main Title - GSAP Controlled Entrance */}
                <h1 
                    ref={titleRef}
                    className="mb-5 text-4xl font-semibold tracking-normal text-zinc-950 dark:text-white md:text-6xl"
                >
                   Hi, I am <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                        {portfolioConfig.name}
                   </span>
                </h1>

                 {/* Subtitle - GSAP Controlled Entrance */}
                <div ref={subtitleRef} className="mx-auto mb-4 max-w-3xl text-lg font-medium leading-8 text-zinc-700 dark:text-zinc-300 md:text-2xl">
                    A seasoned <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">TypeScript-focused Frontend Developer</span> and AI code evaluator turning ideas into reliable digital experiences.
                </div>

                {/* Bio - GSAP Controlled Entrance */}
                <p 
                    ref={bioRef}
                    className="mx-auto mb-10 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-400"
                >
                    {portfolioConfig.bio}
                </p>

                {/* Buttons Container - GSAP Controlled Entrance */}
                <div ref={buttonsRef} className="flex flex-col items-center gap-8">
                    <div className="flex justify-center gap-4">
                        {portfolioConfig.socials.map((social) => (
                            <motion.a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.96 }}
                                aria-label={social.name}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#111111] shadow-sm ring-1 ring-zinc-200 transition hover:bg-violet-400 dark:bg-zinc-100 dark:ring-0"
                            >
                                {socialIcons[social.iconKey]}
                            </motion.a>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                    
                    {/* 
                        --- Framer Motion: The Interactive Feel ---
                        We use motion.a here because Framer's `whileHover` and `whileTap` 
                        are much easier to implement for simple physics than writing GSAP mouse events.
                    */}
                    <motion.a 
                        href="#projects"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer rounded-sm bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:brightness-110"
                    >
                        View My Work
                    </motion.a>
                    
                    <motion.a 
                        href="#contact"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer rounded-sm border border-violet-400/30 bg-white/70 px-8 py-3 font-semibold text-zinc-950 transition-colors hover:border-violet-300 hover:text-violet-700 dark:bg-white/[0.03] dark:text-white dark:hover:text-violet-300"
                    >
                        Contact Me
                    </motion.a>
                    <motion.a 
                        href="/resume"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer rounded-sm border border-violet-400/30 bg-white/70 px-8 py-3 font-semibold text-zinc-950 transition-colors hover:border-violet-300 hover:text-violet-700 dark:bg-white/[0.03] dark:text-white dark:hover:text-violet-300"
                    >
                        Resume
                    </motion.a>
                </div>
                </div>
            </div>
        </section>
    );
}
