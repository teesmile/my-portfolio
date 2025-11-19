
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { portfolioConfig } from '@/config/site';
import HeroBackground from '@/features/landing/heroBackground';

export default function Hero() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section id="home" className="relative min-h-[85vh] flex items-center justify-center scroll-mt-24 overflow-hidden">
            <HeroBackground />
            <motion.div 
                className="max-w-3xl mx-auto px-6 text-center md:text-left relative z-10 pointer-events-none"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <motion.h1 
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-gray-900 dark:text-gray-100 pointer-events-auto transition-colors duration-300"
                    variants={itemVariants}
                >
                   I am <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-purple-600 dark:from-fuchsia-300 dark:to-purple-500">{portfolioConfig.name}</span>..
                </motion.h1>
                <motion.p
                    className="text-xl md:text-2xl font-medium text-fuchsia-600 dark:text-fuchsia-300 mb-6 pointer-events-auto transition-colors duration-300"
                    variants={itemVariants}
                >
                    {portfolioConfig.title}
                </motion.p>
                <motion.p 
                    className="text-base md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl pointer-events-auto transition-colors duration-300"
                    variants={itemVariants}
                >
                    {portfolioConfig.bio}
                </motion.p>
            </motion.div>
        </section>
    );
}
