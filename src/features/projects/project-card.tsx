
'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { portfolioConfig } from '@/config/site';
import { socialIcons } from '@/components/ui/icons';

interface ProjectCardProps {
  project: typeof portfolioConfig.projects[0];
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
    const ref = useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const yParallax = useTransform(
        scrollYProgress,
        [0, 1],
        index % 2 === 0 ? [0, -50] : [0, -20] 
    );

    return (
        <div ref={ref} className="h-full">
            <motion.div 
                style={{ y: yParallax }} 
                className="group relative bg-white/60 dark:bg-purple-900/20 hover:bg-white/80 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-fuchsia-900/30 hover:border-fuchsia-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-fuchsia-500/20 hover:-translate-y-1 flex flex-col h-full backdrop-blur-sm"
            >
                {/* Project Preview Image Container */}
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="block h-48 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <div className="absolute inset-0 bg-fuchsia-100/20 dark:bg-fuchsia-900/20 z-10 group-hover:bg-transparent transition-colors duration-300"></div>
                    
                    {/* Image */}
                    <img 
                        src={project.preview} 
                        alt={`${project.title} preview`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 dark:opacity-80 group-hover:opacity-100"
                    />
                    
                    {/* External Link Overlay */}
                    <div className="absolute top-3 right-3 z-20 bg-white/80 dark:bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm border border-gray-200 dark:border-white/10">
                        <div className="text-gray-800 dark:text-white">
                            {socialIcons.externalLink}
                        </div>
                    </div>
                </a>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition-colors">
                            {project.title}
                        </h4>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                        {project.description}
                    </p>
                    
                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tech.map((tech) => (
                            <span 
                                key={tech} 
                                className="px-2.5 py-1 text-xs font-medium bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-200/90 rounded-full border border-fuchsia-200 dark:border-fuchsia-700/30 group-hover:border-fuchsia-300 dark:group-hover:border-fuchsia-500/40 transition-colors"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
