# Redesign plan

## Audit of the current code (6 Nov 2026) — verified

Verified against the working tree on branch `redesign` at commit `83e8817`, 6 Nov 2026.
Baseline at verification time: `pnpm lint` clean, `pnpm build` clean (5 static routes: `/`, `/resume`, `/icon.svg`, `/_not-found`).
Each finding is marked CONFIRMED, CONFIRMED WITH CORRECTION, or WRONG, with file and line.

### 1. The site reads as the generic generated template — CONFIRMED WITH CORRECTION
- Inter for all text: `src/app/layout.tsx:2`, `:9-12`, applied at `:61` (`inter.className`). Geist Mono is loaded at `:14-17` and never used beyond the CSS variable.
- All-caps tracked eyebrows: "Services" `src/features/services/services-section.tsx:8-10`; "My bio" `src/features/about/about-section.tsx:57-59`; "Skills" `src/features/skills/skills-section.tsx:8-10`; "Get in touch" `src/features/contact/contact-section.tsx:14-16`. Two more the audit missed: the brand pill `src/features/landing/hero.tsx:67` and the project role `src/features/projects/project-card.tsx:39`, plus six on the resume page (`src/app/resume/page.tsx:35,82,98,124,141,174`).
- Gradient-colored single word inside a heading: "Featured *projects.*" `src/features/projects/projects-section.tsx:43`; "About *me.*" `src/features/about/about-section.tsx:61`; "What I *do.*" `src/features/services/services-section.tsx:12`; "Technical *skills.*" `src/features/skills/skills-section.tsx:12`; "Contact *me.*" `src/features/contact/contact-section.tsx:18`; the name in the hero `src/features/landing/hero.tsx:77-79`; the period after the wordmark `src/components/layout/navbar.tsx:45`.
- 01/02/03 markers on three non-sequential services: `src/features/services/services-section.tsx:29-35`.
- Three separate uniform card grids: `src/features/services/services-section.tsx:16,23`, `src/features/skills/skills-section.tsx:20,24`, `src/features/projects/projects-section.tsx:51` + `project-card.tsx:18`.
- Hover-lift: `src/features/projects/project-card.tsx:16`; four buttons at `src/features/contact/contact-section.tsx:46,53,62,72`; hero buttons `src/features/landing/hero.tsx:104,122,130,139`.

CORRECTION, two sub-claims were overstated:
- "fade-and-slide-up on each section" is WRONG. Only the Projects section animates on scroll (`projects-section.tsx:10-29`, consumed at `:35-45` and `:53-61`). About, Services, Skills and Contact are server components with no entrance animation at all. The hero has its own GSAP timeline (`hero.tsx:20-56`). So the problem is not motion-everywhere; it is motion on exactly one section, which reads as arbitrary rather than decorative.
- "identical rounded cards with the same border and shadow" is loose on shadow: project cards carry `shadow-sm` (`project-card.tsx:18`), skills cards carry none (`skills-section.tsx:24`), services cards carry none (`services-section.tsx:23`). The shared tell is `rounded-lg` + a `violet-400/2x` border repeated across all three grids, not the shadow.

Verdict on the headline claim stands: the static frame says Next.js starter.

### 2. Hero copy says nothing memorable — CONFIRMED, worse than stated
"Hi, I am Anthony Ugwuja" at `src/features/landing/hero.tsx:77-80`; the "A seasoned TypeScript-focused Frontend Developer and AI code evaluator…" line at `:83-85`; a third paragraph of bio immediately under it at `:88-93` pulling `portfolioConfig.bio` (`src/config/site.ts:7`), which repeats the same claims in longer form. Three stacked paragraphs before the first button.
Not three competing buttons but four: "View My Work" `:120-127`, "Contact Me" `:129-136`, "Resume" `:137-144`, plus a fifth target in the fixed navbar, "View Resume" `src/components/layout/navbar.tsx:68-73`, visible in the same viewport. Three social links sit above them at `:97-112`.

### 3. The profile image — CONFIRMED
`public/pfpnew.png` is 2,507,195 bytes, 1254x1254, 16-bit/color RGBA. Rendered inside a 320px box (`h-80 w-80`, `src/features/about/about-section.tsx:20`) with `sizes="320px"` `:26`, `quality={100}` `:28` and `unoptimized` `:29`.
Two additions:
- `quality={100}` is dead config. `unoptimized` bypasses the optimizer, so quality is never read and the full 2.4 MB original is served byte-for-byte.
- `public/pfpnew2.png` is a second copy, 1,650,984 bytes, 8-bit, referenced nowhere in `src/`. 4.1 MB of unreferenced PNG sits in `public/`.
- Also unreferenced: `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` (template leftovers).
- Not a blocker for the fix: `sharp@0.34.5` is linked beside Next (`node_modules/.pnpm/next@16.0.10…/node_modules/sharp`), so local optimization works once `unoptimized` comes off.

### 4. `heroBackground.tsx` is never imported — CONFIRMED, with the cost restated
`grep -rn "heroBackground\|HeroBackground" src/` returns only the declaration, `src/features/landing/heroBackground.tsx:16`. 159 lines, a full particle system with mouse attraction and an O(n²) neighbour loop at `:100-117`.
CORRECTION to the stated lesson: because nothing imports it, it is in no bundle and costs zero bytes to users. The cost is repo clutter and the next reader's confusion. The real lesson is the one the file would have taught if it had been wired up: an uncapped `requestAnimationFrame` loop doing O(n²) distance checks over 100 particles, re-created on every theme change (`:151`), is the exact shape that fails the throttled test.

### 5. No `prefers-reduced-motion` handling anywhere in `src/` — CONFIRMED
The only `matchMedia` call in the tree is `prefers-color-scheme` at `src/providers/theme-provider.tsx:27`. No `gsap.matchMedia`, no reduced-motion media query, in CSS or JS.

### 6. `html` carries `scroll-smooth` — CONFIRMED
`src/app/layout.tsx:60`. Lenis is in `package.json` but imported nowhere in `src/`.

### 7. Projects — CONFIRMED, all four parts
- All four `repo` values are the GitHub profile, not a repository: `src/config/site.ts:125,138,151,164`. Rendered as a "Source" link at `src/features/projects/project-card.tsx:84-91`, so every one of them is a mislabelled link.
- Previews are generated SVGs: `public/projects/todo-productivity.svg`, `ecommerce-product.svg`, `deployment-workflow.svg`, `space-tourism.svg`, wired at `src/config/site.ts:126,139,152,165`.
- "Portfolio Deployment Workflow" `src/config/site.ts:143-155` lists Vercel, DNS, GitHub and Search Console as its tech. It is a deployment chore.
- No case studies: no `src/app/work/` route exists; the card links straight out to the live URL (`project-card.tsx:20-26`).

### 8. Empty `@theme`, hex in class names — CONFIRMED
`src/app/globals.css:6-8` is an empty `@theme { }` block; the whole file is 16 lines. 76 hex literals across `src/`, led by `#5b5cff` (29) and `#8b5cf6` (29), then `#111111` (9), `#202020` (5), `#1b1b1b` (3), `#171717` (2), `#a855f7` (2), and one each of `#fafafa`, `#e879f9`, `#d8b4fe`, `#9CA3AF`, `#6b21a8`, `#191919`, `#181818`, `#050505`. Four different near-blacks are in use for dark surfaces, which is why the dark theme has no readable depth order.

### 9. Padded skills — CONFIRMED
`src/config/site.ts:43` ends with "DOM manipulation"; `:51` lists "VS Code", "npm", "JSON". The same array feeds the resume page at `src/app/resume/page.tsx:86-93`, so the padding appears twice.

### 10. Navbar active state only changes on click — CONFIRMED
State at `src/components/layout/navbar.tsx:12`, set only in `handleNavClick` `:36-39`, called from `:55` and `:176`. No scroll listener, no IntersectionObserver. Two consequences: scrolling past a section never updates the indicator, and landing on `/#about` from a link or a reload shows "Home" active.

### 11. The resume PDF doesn't exist — CONFIRMED, consequence milder than implied
`src/config/site.ts:12` points at `/Anthony-Ugwuja-Resume.pdf`; `public/` contains no PDF. But `src/app/resume/page.tsx:12-20` guards with `fs.existsSync` and renders a "PDF pending" badge at `:62-64` instead of a broken link. So it is a dead end, not a 404 — and "PDF pending" on a hiring portfolio reads worse than no button.

### 12. "Services" is a freelancer section — CONFIRMED, with evidence the audit missed
Data at `src/config/site.ts:19-35`, rendered by `src/features/services/services-section.tsx`, mounted second on the page at `src/app/page.tsx:12`. The section has no `id` and no entry in `navLinks` (`src/config/site.ts:13-18`): it occupies the whole second screen and nothing in the site links to it. Its one genuinely useful claim, code evaluation, is already the hero's and About's subject.

---

## Target structure

Six routes, not one scrolling page. Decided 6 Nov 2026, logged in `docs/decisions.md`.

| Route | What it is |
|---|---|
| `/` | The hero view: the statement, one primary action, and the annotated defect |
| `/work` | The projects as an editorial index |
| `/work/[slug]` | One case study per project |
| `/about` | The story, the dated spine, and the folded-in capabilities and stack |
| `/lab` | Interaction experiments. Phase 5 fills it; it stays out of the nav until it holds one |
| `/contact` | Short by design |
| `/resume` | Already exists |

Four rules follow from the structure, and every later phase is judged against them:
1. **Navigation replaces the whole view.** Phase 1 does it instantly, Phase 2 makes it continuous with the incoming content animating in.
2. **A view scrolls only if its own content is taller than the viewport.** No filler to manufacture scroll.
3. **In a scrolling view, content reveals as you scroll** — never all at once on load.
4. **A short view arrives and stays put.** `/contact` does not reveal, does not scroll, does not animate on a timer.

The story is a pharmacist who moved into frontend and now reviews AI-generated code for a living. `/` says it in one sentence and shows it with a real defect.

---

## Settled questions

### Q1. Does Next 16's View Transitions support cover `/` → `/work/[slug]`, or does Phase 2 need a GSAP overlay? — GSAP overlay. Evidence corrected after Codex review 1.

What's actually installed (`next@16.0.10`, `react@19.2.0`, `react-dom@19.2.0`, `@types/react@19.2.6`):
- `experimental.viewTransition` is a real Next config flag: declared at `node_modules/next/dist/server/config-schema.js:268`, defaulted false at `config-shared.js:187`, documented at `config-shared.d.ts:524`. It also appears inside the compiled app-page runtimes, so the client router does read it.
- `ViewTransition` is exported by Next's vendored React (`next/dist/compiled/react`), and app code's bare `react` import is aliased to that copy (`node_modules/next/dist/build/create-compiler-aliases.js:253`). The npm `react@19.2.0` in `node_modules/react` does not export it.
- **Corrected, Codex was right:** the types do exist. `node_modules/@types/react/canary.d.ts:107` declares `export const ViewTransition: ExoticComponent<ViewTransitionProps>`, with `name` for shared elements, per-type transition classes, and `onEnter`/`onExit`/`onShare`/`onUpdate` callbacks. No cast and no handwritten augmentation: you opt in with `"react/canary"` in the tsconfig `types` array, an `import {} from 'react/canary'`, or one triple-slash reference.
- **Corrected:** "a browser-driven crossfade I cannot stage" was overstated. `name` gives shared-element morphing and the four callbacks give a hook per phase. Reduced motion is handled in CSS on the transition classes.
- Still true, and this is the real cost: the typed `ViewTransitionInstance` in the installed types has exactly one member, `name: string` (`canary.d.ts:37-42`), so actually driving the animation from JS means reaching for pseudo-element APIs yourself, untyped. And the opt-in is project-wide — `canary.d.ts` augments `declare module "."`, so every canary API becomes type-visible everywhere, including ones the installed stable npm react does not export at runtime.

Decision unchanged: Phase 2 builds the transition with GSAP. Reasoning rebuilt on what survived verification:
1. Cost of entry: an experimental Next flag plus a project-wide canary type channel, for the single mechanism every navigation on the site depends on.
2. Ergonomics for this project: Phase 2's learning goal is owning a timeline. GSAP gives one timeline I can stage, cancel and reverse. View Transitions give four callbacks and a one-field instance.
3. One mechanism for motion: the hard rule wants `gsap.matchMedia` plus the CSS query. CSS-side reduced motion for view transitions is real, but it puts motion policy in two places.
4. Cheaply reversible: it is one component and one `Flip` call. If `ViewTransition` lands in `index.d.ts` on a stable React, switching is a day's work.

**No longer reasons** (they were wrong): "no types", "needs a cast", "crossfade only", "no JS control", "no reduced-motion path".

Accepted from Codex regardless of mechanism: the transition has to be tested for delayed navigation, mid-flight cancellation, browser Back, and destination failure. Those are now in Phase 2's gate.

Still not verified: no spike was built on either mechanism. I disagree with building both before settling — the reasoning is in `docs/decisions.md`. Phase 5 is where View Transitions get tried.

### Q2. Work on the home page as a scroll sequence, or a grid that links out? — Superseded 6 Nov 2026: Work is its own route.

The original answer was an asymmetric editorial layout on the home page linking to `/work/[slug]`, with the pinned choreography moved to the case study. The route-per-view decision makes the question moot — there is no home page Work section to place. `/work` *is* that editorial layout, as a view of its own.

What survives from the original reasoning, and still governs `/work`:
1. No uniform card grid. The layout is asymmetric and type-led, so the view holds up as a still frame (bar 1).
2. No pinned, scrubbed sequence. `/work` reveals its entries as you scroll if it is taller than the viewport, and does nothing if it is not (structure rule 3 and 4).
3. The expensive choreography belongs on `/work/[slug]`, where one case study justifies it, not on an index a reader is scanning.
4. Continuity comes from the card-to-header transition into the case study, which is now the same mechanism as every other navigation rather than a special case.

What changed: "one orchestrated moment per page" is now literally per view, and the moment is the transition into the view rather than a section entrance inside it.

---

## Phases

Each phase ends with: `pnpm lint && pnpm build`, the DevTools throttled scroll test (CPU 4x, Fast 3G), `/codex:adversarial-review --base main`, Claude's AGREE/DISAGREE reply, a `docs/decisions.md` entry, a commit.

Owner column: **Claude** = plumbing, types, wiring, mechanical edits. **Anthony** = `TODO(human)`, taste and truth claims only I can make.

### Phase 0 — Clear the ground (half a day)

Why: nothing below adds value, and the image alone fails the performance bar.

| # | Task | Files | Owner |
|---|---|---|---|
| 0.1 | Delete the dead particle system | `src/features/landing/heroBackground.tsx` (delete file) | Claude |
| 0.2 | Convert the portrait: `convert public/pfpnew.png -resize 640x640 -strip -quality 82 public/profile.webp`, target under 150 KB (ImageMagick `convert` is installed; `cwebp` is not). Then delete `public/pfpnew.png` and `public/pfpnew2.png` | `public/` | Claude |
| 0.3 | Point the image at the WebP, drop `unoptimized` and `quality={100}`, set `sizes="(min-width: 768px) 320px, 240px"` | `src/features/about/about-section.tsx:6`, `:22-31` | Claude |
| 0.4 | Delete the `fs.existsSync` guard and its imports. The file is committed; the guard buys a build-time filesystem call and silently hides a missing asset behind an "AU" monogram | `src/features/about/about-section.tsx:1-2`, `:8-10`, `:13`, `:21`, `:32-36` | Claude |
| 0.5 | Delete the unreferenced template SVGs (verified: no reference in `src/`) | `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` | Claude |
| 0.6 | Replace the four profile-URL `repo` values with real repository URLs — or say which projects have no public repo | `src/config/site.ts:125`, `:138`, `:151`, `:164` | **Anthony** |
| 0.7 | Make `repo` optional in the data shape and hide the "Source" link when it's absent, so a missing repo is never a mislabelled link | `src/config/site.ts`, `src/features/projects/project-card.tsx:84-91` | Claude |
| 0.8 | Cut the padding: remove "DOM manipulation" from Frontend, and "JSON", "npm", "VS Code" from Tools. Note the same array renders on `/resume` | `src/config/site.ts:43`, `:51` (consumer: `src/app/resume/page.tsx:86-93`) | Claude |
| 0.9 | Drop the deployment-workflow entry and its preview. `/resume` takes `projects.slice(0, 3)`, which stays valid with three left | `src/config/site.ts:143-155`, `public/projects/deployment-workflow.svg` | Claude |
| 0.10 | Turn on `typedRoutes: true` (stable in Next 16, `config-shared.d.ts:710`; the `experimental` variant is deprecated at `:416-419`). A `<Link href>` to a route that does not exist becomes a type error, so the Phase 1/2/3 ordering cannot ship a dead link by accident | `next.config.ts` | Claude |

Moved out of Phase 0:
- **`scroll-smooth` removal → Phase 2.** `CLAUDE.md` says remove it when Lenis lands, and that rule wins over this plan's earlier wording. Removing it now buys nothing and makes every anchor click a hard cut for the length of Phase 1 — a regression against bar 3 for two or three days. It comes off in the same commit that adds the Lenis provider.
- **`framer-motion` → `motion` rename → end of Phase 2.** Today it would touch five files (`hero.tsx`, `projects-section.tsx`, `project-card.tsx`, `navbar.tsx`, `footer.tsx`), four of which Phase 1 rewrites or deletes anyway. By the end of Phase 2 the only framer-specific features left in the tree are `AnimatePresence` exit animations in the mobile drawer (`navbar.tsx:138-190`) and the footer tooltip (`footer.tsx:21-39`). The real question then is whether to keep a second animation library at all, which is a better question than what to call it.

Done when: `pnpm lint && pnpm build` pass, `du -sh public` is under 500 KB, the About portrait is served as WebP under 150 KB (DevTools Network, check the `_next/image` response), and `grep -rn "unoptimized" src/` is empty.

I learn: what `unoptimized` actually bypasses (and why `quality` next to it is dead config), how `sizes` picks a candidate from the generated srcset, and why an unimported client component costs nothing at runtime but still costs the next reader.

### Phase 1 — Art direction and tokens (2 to 3 days)

Why: the juror's first test is the static frame. This phase decides whether the site looks made on purpose. Phase 1 ends with a site that has **no motion at all** — every existing animation comes out here, so the static frame is judged honestly and Phase 2 adds motion deliberately rather than inheriting it.

Decisions 1.1, 1.4, 1.8 and 1.18 were settled by Anthony on 6 Nov 2026 and are recorded, not asked.

**1a. Type, tokens, palette**

| # | Task | Files | Owner |
|---|---|---|---|
| 1.1 | **Decided:** Bricolage Grotesque (display, variable, `opsz`/`wdth` axes) over Source Serif 4 (body, variable). The inverted pairing — grotesque headline, serif body — is the deliberate half of the options, and a serif body is better for case-study reading | — | **Anthony**, done |
| 1.2 | Load both families, delete `Inter` and the unused `Geist_Mono`, apply through tokens rather than a class | `src/app/layout.tsx` | Claude |
| 1.3 | `@theme` type tokens and a 7-step scale with paired line-heights | `src/app/globals.css` | Claude |
| 1.4 | **Decided:** colour as a rule, not a value. Dark is the primary mode and light is built from the same tokens. Surfaces are cold neutral, never cream. Exactly one cold saturated hue, reserved for interaction — links, focus rings, the primary action — and never decoration. Accent is ice-cyan `#58D0E0` on dark (10.66:1) and `#046277` on light (6.43:1), both measured past AA; azure `#6FB4FF`/`#0B5FC2` (8.93:1/5.66:1) is the runner-up and a one-token swap | — | **Anthony**, done |
| 1.5 | Colour tokens with `@theme inline` over CSS variables that flip on `:root` (dark) and `.light`, so no `dark:` utility is needed anywhere. Delete `@variant dark` and invert the theme provider: dark is the default, `.light` is the opt-in | `src/app/globals.css`, `src/providers/theme-provider.tsx`, `src/components/layout/theme-toggle.tsx` | Claude |
| 1.6 | Spacing and radii tokens; one radius scale replacing ad-hoc `rounded-lg`/`rounded-sm`/`rounded-full` | `src/app/globals.css` | Claude |
| 1.7 | Replace every hex literal in class names with tokens across the tree | all of `src/` | Claude |

**1b. Routes, with instant navigation. No transitions, no motion — Phase 2 adds both.**

| # | Task | Files | Owner |
|---|---|---|---|
| 1.8 | **Decided:** the hero statement is *"I trained as a pharmacist. Now I build React interfaces — and get paid to find what's wrong with AI-written code."* | — | **Anthony**, done |
| 1.9 | Route skeleton with per-route `metadata`, each view a composition with one job | `src/app/page.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/about/page.tsx`, `src/app/lab/page.tsx`, `src/app/contact/page.tsx` | Claude |
| 1.10 | Rewrite the nav: route links instead of anchors, active state from `usePathname()` (this is audit finding 10 fixed by construction), drop the duplicate resume CTA. `/lab` stays out of the nav until it holds one experiment | `src/components/layout/navbar.tsx`, `src/config/site.ts` | Claude |
| 1.11 | `/` — the statement, one primary action, and the annotated defect beside it. Fits one screen on desktop; scrolls on small screens, which rule 2 allows | `src/app/page.tsx`, `src/features/landing/*` | Claude |
| 1.12 | `/work` — asymmetric editorial index, type-led, no card grid, each entry linking to its case study | `src/features/work/work-section.tsx`, `src/features/work/work-card.tsx` | Claude |
| 1.13 | `/work/[slug]` — case study from the `projects` data with `generateStaticParams`. Thin but honest in this phase; Phase 3 deepens it | `src/app/work/[slug]/page.tsx` | Claude |
| 1.14 | `/about` — Services and Skills folded in as prose plus a condensed stack, and the dated spine (pharmacy → AltSchool → frontend → evaluation) as typographic structure, not an icon row | `src/app/about/page.tsx`, `src/features/about/*`, `src/config/site.ts` | Claude |
| 1.15 | `/contact` — short view that arrives and stays. No panel, no four stacked buttons | `src/app/contact/page.tsx`, `src/features/contact/*` | Claude |
| 1.16 | `/lab` — the route exists and says honestly what it is for; Phase 5 fills it | `src/app/lab/page.tsx` | Claude |
| 1.17 | Delete the old one-page sections and the now-unused `services` data. Keep `skills`, which `/resume` consumes | delete `src/features/services/`, `src/features/skills/`; `src/config/site.ts` | Claude |

**1c. The things that make it Anthony's**

| # | Task | Files | Owner |
|---|---|---|---|
| 1.18 | **Decided:** the annotated defect — a real bug in model-generated code shown next to the correction. Built from an example generated for the purpose, never from paid evaluation work, so there is no NDA question. The dated spine goes on `/about` as the secondary device | — | **Anthony**, done |
| 1.19 | Build the defect composition: the snippet, the marked line, and one sentence of why it is wrong. It has to be a real bug that a reader can verify by reading | `src/features/landing/*` | Claude builds, **Anthony** approves the example |
| 1.20 | Replace the mock preview artwork with real captures of the three live projects. The existing SVGs hardcode `font-family="Inter"` and the two banned gradient stops, so they would smuggle the old identity into the new design | `public/projects/*.svg` (delete), captures in `public/work/`, `src/config/site.ts` | Claude captures, **Anthony** approves |
| 1.21 | Redesign the site mark from the display face — a letterform or a shape from its terminals, never a geometric badge. Must read at 16px in a browser tab: no hairlines, no gradient. Keep the `prefers-color-scheme` swap using token values. `icon.svg` is a standalone document with no access to `@theme`, so its two colours are hand-copied | `src/app/icon.svg` | Claude drafts 2-3, **Anthony** picks |
| 1.22 | Regenerate the OG image from the new design, preferring `opengraph-image.tsx` with `ImageResponse` over a static PNG so it rebuilds with the design. Note `ImageResponse` supports a flexbox CSS subset, cannot read `@theme` tokens, and needs the font as an `ArrayBuffer`; the file convention wires the metadata itself, so the hand-written `images` entries come out of `layout.tsx`. Also fix the lie: `previewimg.png` is 872x531 while `layout.tsx` declares it 1200x630 | `src/app/opengraph-image.tsx` (new), `public/previewimg.png` (delete), `src/app/layout.tsx` | Claude |
| 1.23 | Strip every banned pattern and all remaining motion, so Phase 1 ends with a site that does not move: eyebrows, gradient words, the 01/02/03 markers, hover-lift, the framer entrance variants and the hero GSAP timeline | across `src/` | Claude |
| 1.24 | `/lab/type` — the hero statement set in Bricolage at `wdth` 80 with tighter leading, Bricolage at `wdth` 100 (current), Syne, and Big Shoulders (Google merged "Big Shoulders Display" into "Big Shoulders"), each at two line-heights, in both themes. The page measures itself and reports pass/fail, so the choice is settled by the rule rather than by taste. **Decision rule:** ship the first in that order whose statement fits three lines at 1280 and five at 360, with leading between 0.95 and 1.05 and no mid-word breaks | `src/app/lab/type/page.tsx` | Claude builds and runs it, **Anthony** confirms |
| 1.25 | The defect block becomes a deck of four cards, fanned slightly, top card fully visible, with a restrained syntax palette (now permitted — `CLAUDE.md` allows colour inside content). Static in this phase. Cards: a React `.sort()` mutation, a Django N+1, a SQL injection in a raw query, an async race in a fetch | `src/features/landing/defect-deck.tsx`, `src/lib/highlight.ts`, `src/config/site.ts` | Claude |
| 1.26 | `/about` gains an Experience timeline listing the tech used in each role, built from the resume data already in `site.ts` — no new claims, only what the existing bullets name | `src/app/about/page.tsx`, `src/config/site.ts` | Claude |
| 1.27 | `/work/archive` — a plain table of every other project: year, stack, links, with the 2020–2022 training work labelled as training. Explicit non-goals: no colophon, and no talks, sponsors or testimonials until they exist | `src/app/work/archive/page.tsx`, `src/config/site.ts` | Claude builds, **Anthony** supplies the rows |
| 1.28 | Generate the archive rows from GitHub once `zuristack`, `whatsApp-bot`, `drf-api`, `react-blog-app`, `Altschool` and `miniapps` are transferred into `teesmile`: `gh repo list teesmile --json name,description,primaryLanguage,createdAt,url` feeds year, stack and description, each row classified **project**, **training** or **experiment**, left for Anthony to review before it ships. Blocked until the transfer | `scripts/archive-from-gh.mjs`, `src/config/site.ts` | Claude, **blocked** |

Done when, every line checkable:
- `pnpm lint && pnpm build` pass.
- `grep -rn "#[0-9a-fA-F]\{3,8\}" src/ public/work | grep -v globals.css | grep -v icon.svg` returns nothing. `icon.svg` and `opengraph-image.tsx` are the two allowed exceptions: a standalone SVG document and a Satori render both run outside the browser, so neither can read `@theme` tokens and both carry hand-copied values that must be updated with the palette.
- `grep -rniE "inter|geist|roboto" src/ public/work` returns nothing.
- `grep -rn "framer-motion\|useGSAP\|from 'gsap'" src/` returns only `navbar.tsx` and `footer.tsx`.
- Every route in the table above resolves, and `typedRoutes` proves it at build time rather than by clicking.
- Every Work image is a capture of a screen that exists.
- `/contact` does not scroll at 1280x800. `/work` and `/about` scroll only because their content is genuinely taller.
- At 360x640 the hero statement fits three lines or fewer and the primary action is above the fold.
- The mark is legible at 16px in a real browser tab and carries no gradient.
- Light and dark screenshots of each view, side by side, read as one design in two palettes rather than two designs.

I learn: Tailwind 4 `@theme` and how a token becomes a utility class, building a type scale that holds at 360px and 1440px, laying out an asymmetric grid with a point of view, and why one bold element with a quiet surround beats decoration everywhere.

### Phase 2 — Motion system (3 to 4 days)

Rebuilt 6 Nov 2026 for the route-per-view structure. Phase 1 left every route working with instant navigation; this phase makes navigation continuous and teaches tall views to reveal as they scroll. Nothing else moves.

| # | Task | Files | Owner |
|---|---|---|---|
| 2.0 | `SmoothScroll` provider: Lenis driven from `gsap.ticker`, `ScrollTrigger.update` on the Lenis scroll event, and `scroll-smooth` deleted from `layout.tsx` in the same commit. It only has work to do on views that actually scroll | `src/providers/smooth-scroll.tsx`, `src/app/layout.tsx` | Claude |
| 2.1 | The view transition itself — the one orchestrated moment. A `template.tsx` re-mounts per navigation (a `layout.tsx` deliberately does not), which is the hook for the incoming view's content to animate in. The outgoing view leaves, the incoming content arrives choreographed, and there is never a frame where the page is simply blank | `src/app/template.tsx`, `src/lib/transition.ts` | Claude plumbs, timeline is `TODO(human)` |
| 2.2 | The `/` statement reveal with SplitText, as part of the arrival rather than a separate entrance. What it must do: one gesture, done inside 1.2s, the primary action readable throughout. How you know it works: with JS disabled the statement still reads; with reduced motion it is simply there | `src/features/landing/*` | **Anthony** `TODO(human)` |
| 2.3 | `/work` → `/work/[slug]`: the entry's image becomes the case-study header via `Flip`. **`scale: true` is mandatory** — without it `node_modules/gsap/Flip.js:695-712` animates `width`/`height` in px, the exact thing the hard rules forbid. Flip the image only; cross-fade the heading separately, because scaled text blurs and its metrics lie | `src/features/work/*`, `src/app/work/[slug]/page.tsx` | Claude plumbs, timeline `TODO(human)` |
| 2.4 | In-view scroll reveals for tall views only (`/work`, `/work/[slug]`, `/about`), with `ScrollTrigger.batch` so entries reveal in groups rather than one timeline per element. Short views are explicitly excluded — `/contact` arrives and stays. Branch with `gsap.matchMedia()`: desktop gets the full reveal, `(max-width: 767px)` gets a shorter one with no pin and no scrub, `(prefers-reduced-motion: reduce)` gets final states and no timeline | `src/features/**`, `src/lib/reveal.ts` | **Anthony** writes the reveal, Claude scaffolds matchMedia |
| 2.5 | Settle whether `framer-motion` stays. By then its only users are the mobile drawer's `AnimatePresence` and the footer tooltip — either port both to GSAP and drop the dependency, or rename to `motion` | `src/components/layout/*`, `package.json` | Claude recommends, **Anthony** decides |
| 2.6 | The defect deck becomes interactive: scroll or click brings the next card to the front with `Flip`, the fan re-settling behind it. Same `scale: true` rule as 2.3. The timeline is Anthony's to write | `src/features/landing/defect-deck.tsx` | **Anthony** `TODO(human)`, Claude scaffolds |
| 2.7 | Hero statement reveal: a masked line reveal with SplitText — each line rising out of its own clipping box. Explicitly not a typewriter, which spells rather than arrives and reads as a gimmick at hero size | `src/features/landing/hero.tsx` | Claude |
| 2.8 | Deck input: tap to advance on desktop, swipe on mobile, both landing through the same `Flip` state so the two inputs cannot drift apart | `src/features/landing/defect-deck.tsx` | Claude |
| 2.9 | Deck hover: a small tilt toward the cursor, with the code line under the pointer raised to ink while the rest stays muted — the card reacts to where you are reading, not just that you are there | `src/features/landing/defect-deck.tsx` | Claude |
| 2.10 | Contact clock: digits animate on arrival, each place settling into position, and the seconds keep ticking without re-running the entrance | `src/features/contact/local-clock.tsx` | Claude |

Why: the transition is now load-bearing. With six routes, a hard cut between views is the most visible flaw the site could have, and a choreographed arrival is the single thing a juror will remember.

Gate for this phase, recorded in the DevTools Performance panel at CPU 4x and Fast 3G, not eyeballed:
1. Every navigation in the nav, cold.
2. `/work` → `/work/[slug]` and browser Back out of it.
3. Mid-flight cancellation: start a navigation, immediately trigger another.
4. Scrolling `/work/[slug]` top to bottom.
5. Destination failure: go offline mid-navigation and confirm nothing is left stranded mid-transition.

Pass means: longest frame under 16.7 ms in every trace, no layout or recalc entries attributable to the transition, no stranded overlay, and reduced motion verified by toggling the OS setting rather than by reading the code.

I learn: the ticker/rAF sync, `template.tsx` versus `layout.tsx` and why re-mounting is the hook for per-view animation, `ScrollTrigger.batch`, SplitText, `Flip` and why its `scale` option is the difference between transform-only and per-frame layout, matchMedia as a fallback mechanism rather than a switch.

### Phase 3 — Work as case studies (1 to 2 weeks, runs alongside the flagship build)

What: deepen the `/work/[slug]` pages created in task 2.0 into real case studies — problem, decisions, trade-offs, result, and the screenshots captured in task 1.17; the first flagship is a new app in its own repo, a pharmacy inventory and dispensing tool with email+password and OAuth sign-in, pharmacist/attendant roles, protected routes, expiry alerts and an audit log; its `docs/decisions.md` feeds the case study.

The flagship is also what fills the **Architecture** block in the case-study template (`data model, API, auth, hosting`). The block ships empty in Phase 1 and says so plainly on every frontend-only project; it stays that way until a project has a server.

Why: project proof is the biggest gap, and an auth app with roles is what interviewers poke at.

Also in this phase: **Writing.** `/writing` carries decision-log entries rewritten as short public write-ups — the reasoning behind a choice, in plain language, as engineering writing rather than a changelog. The route and the first two pieces landed in Phase 1; Phase 3 keeps converting entries as they accumulate.

I learn: dynamic routes and `generateStaticParams`, sessions and role-based access, server-side route protection, writing a case study that reads like engineering.

### Phase 4 — Performance and accessibility pass (2 days)

What: Lighthouse at 95+ on mobile for performance and accessibility; the throttled test on the whole page; reduced-motion audit of every timeline; visible focus states; (audit finding 10 is already fixed by the route structure — nav state comes from `usePathname()`, so there is no IntersectionObserver to build); and the resume decision — either `public/Anthony-Ugwuja-Resume.pdf` exists or `resumePdf` and the "PDF pending" badge come out (`src/config/site.ts:12`, `src/app/resume/page.tsx:53-65`).

Why: the third juror test, and the one most "nice" sites fail.

I learn: profiling in DevTools, reading a flame chart, what actually moves Lighthouse numbers.

### Phase 5 — Lab (optional, after everything above passes)

What: a `/lab` page of small interaction experiments, one per week. three.js is allowed here and only here. React `ViewTransition` is allowed here as an experiment too, once it is stable and typed (see Q1).

Why: this is where "filled" comes from without padding, and it shows a developer who keeps shipping.

I learn: whatever each experiment demands.
