# my-portfolio — working rules for Claude Code

## Owner
Anthony (Toni) Ugwuja. Frontend dev (React / Next.js / TypeScript) coming back after a pause. Explain decisions like I'm a dev, not a beginner. Package manager is pnpm, never npm.

## What this repo is
Next.js 16 App Router, React 19, Tailwind 4, TypeScript. Content lives in `src/config/site.ts`; page sections live in `src/features/<name>/`; shared chrome in `src/components/layout/`. GSAP + @gsap/react are installed. framer-motion is installed under its old package name. The plan and audit are in `docs/plan.md`; the decision log is `docs/decisions.md`.

## The bar (judge every change against all four)
1. Art direction with a point of view: a screenshot of the hero with motion removed must still look like someone made it on purpose.
2. Motion that's choreographed, not decorated: one orchestrated moment per page, never fade-and-slide-up on every section and hover-lift on every card.
3. Transitions that are continuous, never hard cuts.
4. 60fps on a mid-range Android, tested with CPU throttled 4× in DevTools.

## Hard rules
- Every animation ships with a prefers-reduced-motion path (gsap.matchMedia plus the CSS media query).
- No all-caps eyebrow labels, no gradient-colored single word inside a heading, no 01/02/03 markers on content that isn't a sequence, no grid of identical rounded cards with the same shadow.
- Typeface is never Inter, Geist or Roboto. Pick one or two families deliberately and define them as Tailwind `@theme` tokens in `globals.css`, with a type scale.
- Colors, spacing and radii come from `@theme` tokens, not hex values typed into class names.
- Colour is permitted inside content — screenshots, code samples, images, anything that is the work itself. Chrome is never coloured: nav, buttons, surfaces, rules and type stay neutral apart from the single interaction accent.
- Rules and borders never take the accent. One stated exception: `/resume`, where a thin accent rule opens each section, because the page is read as a document rather than navigated and the rules are what separate its parts.
- Every Writing piece carries its explanation visually: inline diagrams, figures and arrows at the point in the text where the thing is being explained, drawn from the `@theme` tokens. The rail illustration is a summary of the piece, never its only visual.
- Images: never `unoptimized`. Photos go through next/image as WebP or AVIF and stay under 300 KB.
- No three.js until phases 0–4 in `docs/plan.md` are done and the throttled test passes.
- Lenis is driven from `gsap.ticker`, and `ScrollTrigger.update` runs on the Lenis scroll event. Remove `scroll-smooth` from `<html>` when Lenis lands.
- Run `pnpm lint && pnpm build` before calling any task done.

## Codex review protocol
When Codex reviews a change:
- Answer each point with AGREE or DISAGREE and the reason.
- Fix only what you agree with; defend every disagreement with a concrete case.
- Append to `docs/decisions.md` using its entry format: feature, Codex's challenge, verdict, reasoning and one concept for me to study.
- Explain every trade-off in plain terms before writing code.

## How work gets explained
Claude writes everything. There is no `TODO(human)`: nothing is left half-built as an exercise.

In exchange, every non-trivial piece of motion, state or architecture ships with a short explanation — what it does, why this approach, and what the alternative was and why it lost. That explanation goes in two places: the Insight block in the reply, and an entry in `docs/decisions.md` when the choice is one I would otherwise have to reconstruct later. A timeline, a state machine, a caching decision and a layout system all qualify. A rename does not.
