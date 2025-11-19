
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
        className="absolute px-3 py-1.5 bg-white dark:bg-fuchsia-950 text-xs text-fuchsia-900 dark:text-fuchsia-100 font-medium rounded-md shadow-lg border border-fuchsia-200 dark:border-fuchsia-800 whitespace-nowrap pointer-events-none z-10"
      >
        {name}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-fuchsia-950 border-b border-r border-fuchsia-200 dark:border-fuchsia-800 rotate-45"></div>
      </motion.div>

      {/* Icon */}
      <motion.div
        variants={{
          initial: { color: "#9CA3AF", scale: 1 },
          hover: { color: "#e879f9", scale: 1.2 }
        }}
        className="text-gray-400 dark:text-gray-400 group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400 transition-colors"
      >
        {icon}
      </motion.div>
    </motion.a>
  );
};

export default function Footer() {
  return (
    <footer id="footer" className="w-full py-12 px-4 border-t border-gray-200 dark:border-white/5 mt-20 bg-white/40 dark:bg-black/20 backdrop-blur-sm scroll-mt-24">
      <div className="flex flex-col items-center gap-6">
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
        <p className="text-sm italic text-gray-600 dark:text-gray-500 font-medium">
          © {new Date().getFullYear()} {portfolioConfig.name}.
        </p>
      </div>
    </footer>
  );
}