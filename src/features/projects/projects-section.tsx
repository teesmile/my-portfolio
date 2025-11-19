
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
        <section id="projects" className="max-w-5xl mx-auto px-6 py-20 scroll-mt-24">
            <div>
                {/* Section Header with Animation */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={headerVariants} 
                    className="flex items-center gap-4 mb-12"
                >
                    <div className="h-px bg-fuchsia-200 dark:bg-fuchsia-900/50 flex-grow transition-colors duration-300"></div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Recent Projects</h3>
                    <div className="h-px bg-fuchsia-200 dark:bg-fuchsia-900/50 flex-grow transition-colors duration-300"></div>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
