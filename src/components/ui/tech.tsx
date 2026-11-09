import {
  siAngular, siCloudflare, siCss, siDjango, siFramer, siGit, siGithub, siHtml5,
  siJavascript, siLinux, siNextdotjs, siNodedotjs, siPnpm, siPython, siReact,
  siPostgresql, siSupabase, siTailwindcss, siTypescript, siVercel, siVite, siZod,
} from "simple-icons";
import { cn } from "@/lib/utils";

type Icon = { hex: string; path: string };

const icons: Record<string, Icon> = {
  "React": siReact, "TypeScript": siTypescript, "JavaScript": siJavascript,
  "Tailwind CSS": siTailwindcss, "Vite": siVite, "Git": siGit,
  "GitHub": siGithub, "Vercel": siVercel, "pnpm": siPnpm, "Linux": siLinux,
  "Linux/Ubuntu": siLinux, "Node.js": siNodedotjs, "HTML": siHtml5,
  "CSS": siCss, "Next.js": siNextdotjs, "Zod": siZod,
  "Framer Motion": siFramer, "Angular": siAngular, "DNS": siCloudflare,
  "Python": siPython, "Django": siDjango,
  "Supabase": siSupabase, "PostgreSQL": siPostgresql,
};

function luminance(hex: string) {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/* Logos carry their brand colour at rest. GitHub, Vercel and Next.js are
   black, so on the dark surface they fall back to ink rather than disappearing
   into the background. */
function darkSafe(hex: string) {
  const contrast = (luminance(hex) + 0.05) / (luminance("0c0d0f") + 0.05);
  return contrast >= 3 ? `#${hex}` : "var(--ink)";
}

export function TechList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-2xs text-muted", className)}>
      {items.map((item) => {
        const icon = icons[item];

        return (
          <li
            key={item}
            className="inline-flex items-center gap-1.5"
            style={
              icon
                ? ({
                    "--brand": `#${icon.hex}`,
                    "--brand-dark": darkSafe(icon.hex),
                  } as React.CSSProperties)
                : undefined
            }
          >
            {icon ? (
              <span
                data-tech-mark
                className="tech-mark relative inline-block h-3 w-3 shrink-0"
              >
                <svg viewBox="0 0 24 24" className="absolute inset-0 fill-current" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
                {/* Two tinted copies, invisible until the split runs. */}
                <svg data-ghost="r" viewBox="0 0 24 24" className="absolute inset-0 fill-[#ff3b30] opacity-0" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
                <svg data-ghost="c" viewBox="0 0 24 24" className="absolute inset-0 fill-[#00e5ff] opacity-0" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
              </span>
            ) : null}
            {item}
          </li>
        );
      })}
    </ul>
  );
}
