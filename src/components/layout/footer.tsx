
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { portfolioConfig } from '@/config/site';
import { socialIcons } from '@/components/ui/icons';

const SocialLink = ({ name, url, icon }: { name: string; url: string; icon: React.ReactNode }) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group p-2 flex items-center justify-center"
      initial="initial"
      whileHover="hover"
      aria-label={name}
    >
      {/* Tooltip */}
      <motion.div
        variants={{
          initial: { opacity: 0, y: 5, scale: 0.9 },
          hover: { opacity: 1, y: -35, scale: 1 }
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-violet-400/20 bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-lg dark:bg-[#202020] dark:text-zinc-100"
      >
        {name}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-violet-400/20 bg-white dark:bg-[#202020]"></div>
      </motion.div>

      {/* Icon */}
      <motion.div
        variants={{
          initial: { color: "#9CA3AF", scale: 1 },
          hover: { color: "#e879f9", scale: 1.12 }
        }}
        className="text-zinc-500 transition-colors group-hover:text-violet-300"
      >
        {icon}
      </motion.div>
    </motion.a>
  );
};

export default function Footer() {
  return (
    <footer id="footer" className="w-full scroll-mt-24 border-t border-zinc-200 bg-white px-4 py-12 dark:border-white/10 dark:bg-[#1b1b1b]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <p className="text-xl font-bold text-zinc-950 dark:text-white">
          {portfolioConfig.brandName}<span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">.</span>
        </p>
        <div className="flex gap-4">
          {portfolioConfig.socials.map((social) => (
            <SocialLink 
              key={social.name}
              name={social.name}
              url={social.url}
              icon={socialIcons[social.iconKey]}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-zinc-500">
          © {new Date().getFullYear()} {portfolioConfig.name}.
        </p>
      </div>
    </footer>
  );
}
