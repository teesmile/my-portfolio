# Redesign plan

## Audit of the current code (6 Nov 2026) — verified

Verified against the working tree on branch `redesign` at commit `3e6ea4a`, 6 Nov 2026.
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

Hero → Work → About → Contact, one page, plus `/work/[slug]` case-study pages and `/resume`. Lab arrives in Phase 5. Services and Skills fold into About. The story is a pharmacist who moved into frontend and now reviews AI-generated code for a living; that's the angle nobody else in the pile has, and the copy should say it in the first screen.

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

### Q2. Work on the home page as a scroll sequence, or a grid that links out? — Neither. An editorial layout that links out; the choreography lives on the case-study page.

Decision: the home page's Work section is a deliberately asymmetric, scannable layout (varying column spans and image sizes, type doing the hierarchy, no uniform card grid) where each entry links to `/work/[slug]`. The pinned, scrubbed sequence moves to the case-study page.
Reasoning, against the bar:
1. Bar 2 says one orchestrated moment per page. The home page's moment is the hero reveal. A pinned, scrubbed Work sequence in the same scroll would be a second, competing moment.
2. Bar 1 says the static frame has to hold up. A pinned sequence hides the design in motion the screenshot doesn't capture; an asymmetric editorial layout is art direction visible in a still frame.
3. Bar 4 is where a pin most likely fails. Pinning plus scrubbing four items, each with an image, on a mid-range Android at 4x CPU throttle, is the single most expensive thing in the whole plan. Spending that budget on the page a recruiter may never reach is the wrong trade.
4. Reader behaviour: a pinned sequence puts items 2-4 behind scroll distance and makes "show me the pharmacy app" a scroll hunt. A layout shows all of it at once and gets the click.
5. Bar 3 is still satisfied, and better: continuity comes from the card-to-header Flip transition into `/work/[slug]`, which is a stronger continuous moment than a pin.
Consequence: Phase 2's wording below is amended — Work choreography is scoped to the case-study page, and the home Work section gets layout only.

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

**1a. Type**

| # | Task | Files | Owner |
|---|---|---|---|
| 1.1 | Pick one display family and one text family, two maximum, never Inter/Geist/Roboto, and write the justification in `docs/decisions.md`. Three starting points: **(A)** Instrument Serif display + IBM Plex Sans text — editorial, suits long case studies, lowest taste risk; **(B)** Bricolage Grotesque display + Source Serif 4 text — the braver inversion, grotesque headline over serif body, most memorable, hardest to keep tidy; **(C)** IBM Plex Sans + IBM Plex Mono — engineering-forward and on-message for code evaluation, but the least distinctive. Recommendation: A, with B as the one to try if you want the site to be remembered | `docs/decisions.md` | **Anthony** |
| 1.2 | Wire the choice: load the two families, delete `Inter` and the unused `Geist_Mono`, apply via token not class | `src/app/layout.tsx:2`, `:9-17`, `:61` | Claude |
| 1.3 | `@theme` type tokens: `--font-display`, `--font-text`, and a type scale of 7 steps with paired line-heights and tracking | `src/app/globals.css:6-8` | Claude |

**1b. Tokens**

| # | Task | Files | Owner |
|---|---|---|---|
| 1.4 | Decide the accent hue and whether the identity keeps a gradient at all. My recommendation: one solid accent, no two-stop gradient — 58 of the 76 hex literals in the tree are the two gradient stops, and the gradient is the single loudest template tell | `docs/decisions.md` | **Anthony** |
| 1.5 | `@theme` color tokens: 4 to 6 named roles (surface, raised, ink, muted, accent, line), each defined once for light and once for dark, replacing the four competing near-blacks | `src/app/globals.css` | Claude |
| 1.6 | `@theme` spacing and radii tokens; one radius scale instead of `rounded-lg`/`rounded-sm`/`rounded-full` chosen ad hoc | `src/app/globals.css` | Claude |
| 1.7 | Replace every hex literal in class names with tokens | `src/app/layout.tsx:61`; `src/features/landing/hero.tsx:59-62,67,77,84,107,124,133,141`; `src/features/about/about-section.tsx:16,20,41,61`; `src/features/projects/projects-section.tsx:32,43`; `src/features/projects/project-card.tsx:18,39,68`; `src/features/contact/contact-section.tsx:11,18,26,32,46`; `src/components/layout/navbar.tsx:42,45,58,70,160`; `src/components/layout/footer.tsx:27,30,36-37`; `src/app/resume/page.tsx` (12 occurrences) | Claude |

**1c. Structure and copy**

| # | Task | Files | Owner |
|---|---|---|---|
| 1.8 | Write the hero statement: one sentence, specific, pharmacist → frontend → AI code evaluation, no "seasoned", no "turning ideas into". Two drafts to react to or reject: *"I'm Anthony. I left pharmacy for frontend, and now I get paid to find what's wrong with AI-written code."* / *"Pharmacist turned frontend developer. I build React interfaces, and I review AI-generated code for a living."* Marked `TODO(human)` in the file; what it must do: say the thing nobody else in the pile can say, in one screen, without a second paragraph | `src/features/landing/hero.tsx`, `src/config/site.ts:6-7` | **Anthony** |
| 1.9 | Rebuild the hero structure around that statement and one primary action. Delete the brand pill, the gradient name span, the duplicate bio paragraph, and the three-button row; one primary link to Work plus one quiet text link; socials stay in the footer only. Delete the GSAP timeline — Phase 2 rebuilds it | `src/features/landing/hero.tsx:20-56`, `:64-146` | Claude |
| 1.10 | Restructure the page to Hero → Work → About → Contact | `src/app/page.tsx` | Claude |
| 1.11 | Rename the feature folder to match the structure: `src/features/projects/` → `src/features/work/`, `projects-section.tsx` → `work-section.tsx`, `project-card.tsx` → `work-card.tsx`; update imports | `src/features/work/*`, `src/app/page.tsx:4` | Claude |
| 1.12 | Rebuild Work as the asymmetric editorial layout settled in Q2 — varying spans, type-led hierarchy, no uniform card grid. **Entries keep linking to the live project URL in this phase**; the switch to `/work/[slug]` happens in task 2.0, in the same commit that creates the route. Strip the two framer variants and the hover-lift | `src/features/work/work-section.tsx:10-29,35-45,51-63`, `src/features/work/work-card.tsx:15-19` | Claude |
| 1.13 | Fold Services and Skills into About: one short capability line and one condensed stack line in About prose; delete both sections and the now-unused `services` data. Keep the `skills` array — `/resume` consumes it | delete `src/features/services/services-section.tsx` and `src/features/skills/skills-section.tsx`; edit `src/features/about/about-section.tsx:56-76`; `src/config/site.ts:19-35` | Claude |
| 1.14 | Remove every banned pattern that survives: eyebrows at `about-section.tsx:57-59`, `contact-section.tsx:14-16`, `work-card.tsx:39`, `resume/page.tsx:35,82,98,124,141,174`; gradient words at `hero.tsx:77`, `work-section.tsx:43`, `about-section.tsx:61`, `contact-section.tsx:18`, `navbar.tsx:45`; the 01/02/03 markers leave with the Services file; hover-lift at `contact-section.tsx:46,53,62,72` | as listed | Claude |
| 1.15 | Rework the About portrait frame: the double ring plus four floating `JS`/`TS`/`React`/`CSS` bubbles is the same template vocabulary as the card grids | `src/features/about/about-section.tsx:18-53` | Claude |
| 1.16 | Fix the three nav labels that read as section headings rather than navigation ("Featured projects", "About me", "Contact me" → "Work", "About", "Contact") and drop the duplicate resume CTA now that the hero has one primary action | `src/config/site.ts:13-18`, `src/components/layout/navbar.tsx:68-73` | Claude |
| 1.17 | Replace the mock preview artwork with real captures of the three live projects. The existing SVGs are not neutral placeholders: all four hardcode `font-family="Inter"` and the two banned gradient stops `#5b5cff`/`#8b5cf6`, so leaving them in would put the old typeface and the old gradient inside the largest images of the new design. I can capture them in Chrome; framing and crop are your call | `public/projects/*.svg` (delete), new WebP captures in `public/work/`, `src/config/site.ts:126,139,152,165` | Claude captures, **Anthony** approves |
| 1.18 | Add one visual element that could only be on your site. The acceptance test is not "looks deliberate" — it is that a stranger could not swap the name out and reuse the page. Candidates, your pick: an annotated screenshot of a real interface defect next to your correction (the code-evaluation job made visible); the pharmacy-to-frontend move as a dated two-line timeline; your own handwriting or signature as the single display accent. Reject all three and propose your own, but Phase 1 does not pass without one | `src/features/landing/hero.tsx`, `src/features/about/about-section.tsx` | **Anthony** decides, Claude builds |

Done when, every line checkable:
- `pnpm lint && pnpm build` pass.
- `grep -rn "#[0-9a-fA-F]\{3,8\}" src/ public/work | grep -v globals.css` returns nothing — the path now includes the artwork, which is where the banned gradient was hiding.
- `grep -rniE "inter|geist|roboto" src/ public/work` returns nothing.
- `grep -rn "framer-motion\|useGSAP\|from 'gsap'" src/` returns only `navbar.tsx` and `footer.tsx`.
- Every Work image is a capture of a screen that exists. Zero generated mock interfaces remain.
- Task 1.18 shipped: one element on the page that cannot be reused by another developer with a name swap.
- At 360x640 the hero statement fits three lines or fewer and the primary action is above the fold.
- Light and dark full-page screenshots with motion disabled, viewed side by side, read as one design in two palettes rather than two designs.

I learn: Tailwind 4 `@theme` and how a token becomes a utility class, building a type scale that holds at 360px and 1440px, laying out an asymmetric grid with a point of view, and why one bold element with a quiet surround beats decoration everywhere.

### Phase 2 — Motion system (3 to 4 days)

Amended by Q1, Q2 and Codex review 1 (6 Nov 2026). The ordering rule for this phase: **nothing links to or animates into a route that does not exist yet.**

| # | Task | Files | Owner |
|---|---|---|---|
| 2.0 | Create `/work/[slug]` with `generateStaticParams` from the existing `projects` data, and switch the Work entries from live URLs to the route **in the same commit**. Content stays thin here — role, year, tech, highlights, live link — and Phase 3 turns it into a real case study. This also unblocks 2.3 and 2.4, which both need a destination to exist | `src/app/work/[slug]/page.tsx`, `src/features/work/work-section.tsx`, `src/config/site.ts` | Claude |
| 2.1 | `SmoothScroll` provider: Lenis driven from `gsap.ticker`, `ScrollTrigger.update` on the Lenis scroll event, and `scroll-smooth` deleted from `src/app/layout.tsx:60` in the same commit | `src/providers/smooth-scroll.tsx`, `src/app/layout.tsx:60`, `src/app/page.tsx` | Claude |
| 2.2 | The hero reveal with SplitText (`node_modules/gsap/SplitText.js` ships with 3.13). What it must do: one statement arriving as one gesture, finished inside 1.2s, with the primary action readable the whole time. How you'll know it works: disable JS and the hero still reads; set reduced motion and the text is simply there | `src/features/landing/hero.tsx` | **Anthony** `TODO(human)`, Claude scaffolds |
| 2.3 | Card-to-header transition: GSAP overlay plus `Flip`. **`scale: true` is mandatory** — without it `node_modules/gsap/Flip.js:695-712` sets `tweenVars.width` and `tweenVars.height` in px, which is exactly what the hard rule forbids. Flip the image only; never Flip text, because scaling type blurs it and its metrics lie — cross-fade the heading on its own tween instead | `src/features/work/work-card.tsx`, `src/app/work/[slug]/page.tsx`, `src/lib/transition.ts` | Claude plumbing, timeline `TODO(human)` |
| 2.4 | Case-study scroll choreography (pinned, scrubbed) with an explicit fallback per branch of `gsap.matchMedia()`, because moving the pin off the home page does not make it cheap — it just moves the cost. `(min-width: 768px)` gets the pinned sequence; `(max-width: 767px)` gets ordinary document flow with one short reveal per section and **no pin and no scrub**; `(prefers-reduced-motion: reduce)` gets no timeline at all, final states only | `src/app/work/[slug]/page.tsx`, `src/features/work/case-study-choreography.ts` | **Anthony** timelines, Claude matchMedia scaffold |
| 2.5 | Settle whether `framer-motion` stays. By now its only remaining users are the mobile drawer's `AnimatePresence` exit (`navbar.tsx:138-190`) and the footer tooltip (`footer.tsx:21-39`). Either port both to GSAP and drop the dependency, or keep it and rename to `motion` (`pnpm remove framer-motion && pnpm add motion`, imports become `motion/react`) | `src/components/layout/navbar.tsx`, `src/components/layout/footer.tsx`, `package.json` | Claude recommends, **Anthony** decides |

Why: choreographed motion is the second juror test, and this is the skill that separates a frontend dev from a template user.

Gate for this phase, in addition to the standard one. Recorded in the DevTools Performance panel at CPU 4x and Fast 3G, and on the real mid-range Android if one is to hand — not eyeballed:
1. Cold `/` → `/work/[slug]`.
2. Browser Back out of a case study.
3. Mid-flight cancellation: start the transition, then immediately navigate away or hit Back.
4. Case-study scroll, top to bottom.
5. Destination failure: go offline mid-navigation and confirm the overlay resolves instead of stranding a fixed element over the page.

Pass means: longest frame under 16.7 ms in each trace, no layout or recalc entries attributable to the transition, no stranded overlay, and reduced motion verified by toggling the OS setting rather than by reading the code. Anything that misses the budget gets simplified, not shipped.

I learn: the ticker/rAF sync, ScrollTrigger pin and scrub, SplitText, `Flip` and why its `scale` option is the difference between transform-only and per-frame layout, matchMedia as a fallback mechanism rather than a switch, and why you never animate width/height/top/left.

### Phase 3 — Work as case studies (1 to 2 weeks, runs alongside the flagship build)

What: deepen the `/work/[slug]` pages created in task 2.0 into real case studies — problem, decisions, trade-offs, result, and the screenshots captured in task 1.17; the first flagship is a new app in its own repo, a pharmacy inventory and dispensing tool with email+password and OAuth sign-in, pharmacist/attendant roles, protected routes, expiry alerts and an audit log; its `docs/decisions.md` feeds the case study.

Why: project proof is the biggest gap, and an auth app with roles is what interviewers poke at.

I learn: dynamic routes and `generateStaticParams`, sessions and role-based access, server-side route protection, writing a case study that reads like engineering.

### Phase 4 — Performance and accessibility pass (2 days)

What: Lighthouse at 95+ on mobile for performance and accessibility; the throttled test on the whole page; reduced-motion audit of every timeline; visible focus states; the nav active state rebuilt on IntersectionObserver so it tracks scroll and survives a deep link (audit finding 10); OG image regenerated from the new design (`public/previewimg.png`, used at `src/app/layout.tsx:36,50`); and the resume decision — either `public/Anthony-Ugwuja-Resume.pdf` exists or `resumePdf` and the "PDF pending" badge come out (`src/config/site.ts:12`, `src/app/resume/page.tsx:53-65`).

Why: the third juror test, and the one most "nice" sites fail.

I learn: profiling in DevTools, reading a flame chart, what actually moves Lighthouse numbers.

### Phase 5 — Lab (optional, after everything above passes)

What: a `/lab` page of small interaction experiments, one per week. three.js is allowed here and only here. React `ViewTransition` is allowed here as an experiment too, once it is stable and typed (see Q1).

Why: this is where "filled" comes from without padding, and it shows a developer who keeps shipping.

I learn: whatever each experiment demands.
