'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { portfolioConfig } from '@/config/site';

interface ProjectCardProps {
  project: typeof portfolioConfig.projects[0];
  index: number;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-violet-400/20 bg-white shadow-sm transition-colors duration-300 hover:border-violet-300/70 dark:bg-[#191919]"
        >
            <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-64 overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                aria-label={`Open ${project.title} live project`}
            >
                <div className="absolute inset-0 z-10 bg-black/10 transition-colors duration-300 group-hover:bg-transparent" />
                <Image
                    src={project.preview}
                    alt={`${project.title} preview`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                />
            </a>

            <div className="flex flex-grow flex-col p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <p className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-xs font-semibold uppercase tracking-[0.2em] text-transparent">
                        {project.role}
                    </p>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                        {project.year}
                    </span>
                </div>

                <h4 className="text-2xl font-semibold text-zinc-950 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
                    {project.title}
                </h4>

                <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {project.description}
                </p>

                <ul className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {project.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                            <span>{highlight}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                        <span
                            key={tech}
                            className="rounded-full border border-violet-400/20 bg-violet-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors group-hover:border-violet-300/50 dark:bg-white/[0.03] dark:text-zinc-300"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex gap-4 pt-8">
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-zinc-950 transition hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                    >
                        Live demo
                    </a>
                    <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-zinc-500 transition hover:text-violet-300"
                    >
                        Source
                    </a>
                </div>
            </div>
        </motion.article>
    );
}
