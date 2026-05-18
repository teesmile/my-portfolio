# Anthony Ugwuja Portfolio

Personal portfolio for **Anthony Ugwuja**, an AI Training Evaluator and TypeScript / Frontend Developer. The site is built with Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP, and a small custom design system.

Live domain target: [anthonyugwuja.dev](https://anthonyugwuja.dev)

## What This Iteration Explored

This branch is a redesign and portfolio-hardening pass. The goal was to move from a nickname-led animated landing page toward a more complete professional portfolio that communicates identity, frontend capability, AI code evaluation experience, project work, and resume readiness.

Key areas explored:

- Real-name professional positioning: `Anthony Ugwuja` became the primary identity, with `Teesmile` kept as a secondary personal brand.
- Resume-first credibility: added a `/resume` page with structured CV content, contact details, skills, experience, selected projects, and education.
- Stronger homepage structure: added Hero, Services, Featured Projects, About, Skills, Contact, Footer, and Resume flows.
- Design direction: moved through a few visual systems, then settled on a dark/light portfolio with a quieter blue-violet gradient accent.
- Project presentation: replaced generic stock previews with local project preview graphics and redesigned cards with project role, year, stack, highlights, live demo, and source links.
- Navigation stability: fixed hash navigation issues by using stable absolute section links and `next/link`.
- Light/dark mode: restored theme toggling and added light/dark styles across core sections.
- Image quality: updated the profile image rendering to use the local `public/pfpnew.png` asset at a larger display size with high-quality rendering.
- Build quality: fixed lint issues, replaced plain image usage with `next/image`, and configured remote image support while moving previews local.

## What I Learned

- A strong portfolio is not just visual polish. It needs positioning, evidence, navigation, resume flow, and a clear contact path.
- Real project screenshots or strong custom previews are more credible than generic images.
- Animation should support the interface, not become the product.
- A design reference is useful for direction, but copying accent colors or section structure too literally can weaken personal brand fit.
- Navigation should use stable app-aware links in Next.js. Bare hash links can behave poorly when moving between pages.
- Light/dark mode has to be designed at the section level. A toggle alone is not enough.
- Profile images can look soft when displayed too small or when optimization changes output quality; sizing and image rendering matter.
- Documentation is part of the product. Capturing the reasoning helps future improvements stay intentional.

## Current Features

- Responsive Next.js App Router portfolio.
- Dark and light theme support.
- Professional hero section with social links and primary calls to action.
- Services/capabilities section.
- Featured projects section with local preview artwork.
- About section with profile image.
- Technical skills section grouped by capability.
- Contact section with email, phone, location, LinkedIn, and GitHub.
- Resume page with structured CV content.
- Project metadata stored centrally in `src/config/site.ts`.
- Production build and lint verification.

## Future Improvements

- Replace the generated local project preview graphics with real screenshots from each deployed project.
- Add exact GitHub repository links for each project instead of profile-level placeholders.
- Add project detail pages with mini case studies: problem, approach, technical decisions, tradeoffs, and outcome.
- Add an ATS-friendly PDF resume at `public/Anthony-Ugwuja-Resume.pdf`.
- Add a contact form only if it has a real backend or email service integration.
- Improve active nav state with an Intersection Observer instead of click-only state.
- Add reduced-motion support for users who prefer minimal animation.
- Run Lighthouse checks and tune accessibility, SEO, and performance.
- Consider adding a separate design/content section only if those skills support the roles being targeted.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
pnpm lint
pnpm build
```

Note: production builds fetch Google Fonts through `next/font`. In restricted environments, the build may need network access for Google Fonts.
