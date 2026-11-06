# Redesign plan

## Audit of the current code (6 Nov 2026)

Claude Code: verify each finding against the repo before planning. Mark each one CONFIRMED or WRONG with the file and line.

1. The site reads as the generic generated template. Inter for all text; all-caps tracked eyebrow labels above every heading ("Services", "My bio", "Skills", "Get in touch"); a gradient-colored single word inside every heading ("Featured *projects.*", "About *me.*", "What I *do.*"); 01/02/03 markers on three services that aren't a sequence; identical rounded cards with the same border and shadow; fade-and-slide-up on each section; hover-lift on every card. A screenshot of the hero with motion removed doesn't say "Anthony", it says "Next.js starter".
2. Hero copy says nothing memorable: "Hi, I am Anthony Ugwuja" plus "A seasoned TypeScript-focused Frontend Developer and AI code evaluator turning ideas into reliable digital experiences." Three buttons compete for the same click.
3. Performance: `public/pfpnew.png` is a 2.5 MB 16-bit PNG, rendered at 320px with `unoptimized` and `quality={100}` in `src/features/about/about-section.tsx`. That single image is bigger than the rest of the site combined.
4. `src/features/landing/heroBackground.tsx` is never imported. Dead code with a full particle system in it.
5. No `prefers-reduced-motion` handling anywhere in `src/`.
6. `html` carries `scroll-smooth`, which will fight Lenis once it's added.
7. Projects: all four `repo` links in `src/config/site.ts` point at the GitHub profile, not a repository. Previews are generated SVGs, not screenshots. "Portfolio Deployment Workflow" is a task, not a project. There are no case studies.
8. Tailwind 4 `@theme` block in `globals.css` is empty. Colors are hex values typed into class names (`#5b5cff`, `#8b5cf6`, `#111111`, `#1b1b1b`, `#202020`) across every component.
9. Skills list is padded with JSON, npm, VS Code and "DOM manipulation". Recruiters read that as thin.
10. Navbar active state in `src/components/layout/navbar.tsx` changes only on click, never on scroll.
11. `/resume` references `public/Anthony-Ugwuja-Resume.pdf`, which doesn't exist.
12. "Services" is a freelancer section. For a hiring portfolio it dilutes; its content belongs in the hero and about copy.

## Target structure

Hero → Work → About → Lab → Contact, one page, plus `/work/[slug]` case-study pages and `/resume`. Services and Skills fold into About. The story is a pharmacist who moved into frontend and now reviews AI-generated code for a living; that's the angle nobody else in the pile has, and the copy should say it in the first screen.

## Phases

Each phase ends with: `pnpm lint && pnpm build`, the DevTools throttled scroll test (CPU 4×, Fast 3G), `/codex:adversarial-review --base main`, Claude's AGREE/DISAGREE reply, a `docs/decisions.md` entry, a commit.

### Phase 0 — Clear the ground (half a day)
What: delete `heroBackground.tsx`; convert `pfpnew.png` to WebP at 640px and under 150 KB, drop `unoptimized`; remove `scroll-smooth` from `<html>`; fix the four `repo` links to real repositories; cut the padded skills; drop the "Portfolio Deployment Workflow" project; optionally swap `framer-motion` for `motion` (`pnpm remove framer-motion && pnpm add motion`, imports become `motion/react`).
Why: nothing above adds value, and the image alone fails the performance bar.
I learn: how next/image optimizes, what `unoptimized` actually bypasses, the cost of a dead client component.

### Phase 1 — Art direction and tokens (2 to 3 days)
What: pick one display family and one text family (never Inter/Geist/Roboto) and justify the choice in `docs/decisions.md`; define `@theme` tokens for color (4 to 6 named values), type scale, spacing and radii; rewrite the hero as one specific statement with one primary action; rebuild sections to the target structure; remove eyebrows, gradient words, numbered markers and the identical-card grid; design light and dark from the tokens, not per-section hex.
Why: the juror's first test is the static frame. This phase decides whether the site looks made on purpose.
I learn: Tailwind 4 `@theme`, building a type scale, layout grids with a point of view, how one bold element and a quiet surround beats decoration everywhere.

### Phase 2 — Motion system (3 to 4 days)
What: a `SmoothScroll` provider wiring Lenis to `gsap.ticker` and `ScrollTrigger.update`; one orchestrated hero reveal using SplitText; scroll choreography for the Work section (pinned, scrubbed, one idea per project); continuous page transitions between `/` and `/work/[slug]`; `gsap.matchMedia()` so mobile and reduced-motion get their own logic; everything else stays still.
Why: choreographed motion is the second juror test, and this is the skill that separates a frontend dev from a template user.
I learn: the ticker/raf sync, ScrollTrigger pin and scrub, SplitText, matchMedia, why you never animate width/height/top/left. The choreography timelines are mine to write (`TODO(human)`).

### Phase 3 — Work as case studies (1 to 2 weeks, runs alongside the flagship build)
What: `/work/[slug]` pages generated from a `projects` data file with problem, decisions, trade-offs, result and real screenshots; the first flagship is a new app in its own repo, a pharmacy inventory and dispensing tool with email+password and OAuth sign-in, pharmacist/attendant roles, protected routes, expiry alerts and an audit log; its `docs/decisions.md` feeds the case study.
Why: project proof is the biggest gap, and an auth app with roles is what interviewers poke at.
I learn: dynamic routes and `generateStaticParams`, sessions and role-based access, server-side route protection, writing a case study that reads like engineering.

### Phase 4 — Performance and accessibility pass (2 days)
What: Lighthouse at 95+ on mobile for performance and accessibility; the throttled test on the whole page; reduced-motion audit of every timeline; visible focus states; nav active state via IntersectionObserver; OG image regenerated from the new design; the resume PDF added or the button removed.
Why: the third juror test, and the one most "nice" sites fail.
I learn: profiling in DevTools, reading a flame chart, what actually moves Lighthouse numbers.

### Phase 5 — Lab (optional, after everything above passes)
What: a `/lab` page of small interaction experiments, one per week. three.js is allowed here and only here.
Why: this is where "filled" comes from without padding, and it shows a developer who keeps shipping.
I learn: whatever each experiment demands.

## Open questions for Claude Code to settle in the audit
- Does Next 16's View Transitions support cover the `/` to `/work/[slug]` transition, or does Phase 2 need a GSAP overlay? Check the installed version's docs, don't guess.
- Should the Work section stay on the home page as a scroll sequence, or be a grid that links out? Decide against the bar, log the reasoning.
