
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { portfolioConfig } from '@/config/site';
import ProjectCard from './project-card';

export default function ProjectsSection() {
    const headerVariants: Variants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const cardWrapperVariants: Variants = {
        hidden: { opacity: 0, y: 50 }, 
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <section id="projects" className="scroll-mt-24 bg-zinc-50 px-6 py-24 dark:bg-[#111111]">
            <div className="mx-auto max-w-6xl">
                {/* Section Header with Animation */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={headerVariants} 
                    className="mb-8 flex items-center gap-4"
                >
                    <div className="h-px flex-grow bg-violet-400/20 transition-colors duration-300"></div>
                    <h3 className="text-2xl font-semibold text-zinc-950 transition-colors duration-300 dark:text-white md:text-3xl">Featured <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">projects.</span></h3>
                    <div className="h-px flex-grow bg-violet-400/20 transition-colors duration-300"></div>
                </motion.div>
                <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-8 text-zinc-600 dark:text-zinc-400">
                    A focused set of interfaces that show responsive execution,
                    product thinking, and attention to interaction details.
                </p>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {portfolioConfig.projects.map((project, index) => (
                        <motion.div 
                            key={project.id} 
                            variants={cardWrapperVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }} 
                        >
                            <ProjectCard project={project} index={index} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
