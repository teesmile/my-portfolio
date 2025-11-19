
'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion'; // For Interactions
import gsap from 'gsap'; // For Sequencing
import { useGSAP } from '@gsap/react';
import { portfolioConfig } from '@/config/site';
import HeroBackground from '@/features/landing/heroBackground';

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
            duration: 0.8,
            ease: "back.out(1.7)" // Premium bounce effect
        })
        .to(titleRef.current, {
            y: 0,
            opacity: 1,
            duration: 1,
        }, "-=0.4") // Overlap by 0.4s
        .to(subtitleRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
        }, "-=0.6")
        .to(bioRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
        }, "-=0.6")
        .to(buttonsRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.2)"
        }, "-=0.6");

    }, { scope: containerRef });

    return (
        <section id="home" ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center scroll-mt-24 overflow-hidden">
            <HeroBackground />
            
            <div className="max-w-4xl mx-auto px-6 text-center md:text-left relative z-10">
                {/* Greeting Pill - GSAP Controlled Entrance */}
                <div ref={pillRef} className="flex justify-center md:justify-start mb-6">
                    <div className="px-4 py-1.5 rounded-full bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-fuchsia-600 dark:text-fuchsia-300 backdrop-blur-sm shadow-sm">
                    Portfolio
                    </div>
                </div>

                {/* Main Title - GSAP Controlled Entrance */}
                <h1 
                    ref={titleRef}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 text-gray-900 dark:text-white"
                >
                   I am <span className="bg-clip-text text-transparent bg-linear-to-r from-fuchsia-600 via-purple-600 to-indigo-600 dark:from-fuchsia-300 dark:via-purple-400 dark:to-indigo-300">
                        {portfolioConfig.name}
                   </span>
                </h1>

                 {/* Subtitle - GSAP Controlled Entrance */}
                <div ref={subtitleRef} className="text-xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 mb-8 h-8 md:h-10 flex justify-center md:justify-start items-center">
                    {portfolioConfig.title}
                </div>

                {/* Bio - GSAP Controlled Entrance */}
                <p 
                    ref={bioRef}
                    className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto md:mx-0 mb-10"
                >
                    {portfolioConfig.bio}
                </p>

                {/* Buttons Container - GSAP Controlled Entrance */}
                <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-center">
                    
                    {/* 
                        --- Framer Motion: The Interactive Feel ---
                        We use motion.a here because Framer's `whileHover` and `whileTap` 
                        are much easier to implement for simple physics than writing GSAP mouse events.
                    */}
                    <motion.a 
                        href="#projects"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold shadow-lg shadow-fuchsia-500/25 dark:shadow-purple-500/20 cursor-pointer"
                    >
                        View My Work
                    </motion.a>
                    
                    <motion.a 
                        href="#footer"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 rounded-full bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-semibold transition-colors cursor-pointer"
                    >
                        Contact Me
                    </motion.a>
                </div>
            </div>
        </section>
    );
}
