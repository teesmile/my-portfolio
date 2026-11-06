# Decisions

Every Codex review ends with one entry here. Newest at the top. Keep each entry under 15 lines; link to the commit.

## Entry format

```
## YYYY-MM-DD — <feature or change> (<commit>)
Codex challenged: <the point, one or two lines>
Verdict: AGREE | DISAGREE
Because: <the reasoning, written for me>
Changed: <what moved in the code, or "nothing">
Study: <one concept, with a link or a search term>
```

---

## 2026-11-06 — Codex review 3: menu state, mobile overflow, share metadata (6288a72)
Codex challenged: three defects — the mobile drawer stays open and keeps the body scroll locked when the wordmark navigates home; the contact email overflows the viewport at 320px; and articles and case studies publish the homepage's OpenGraph title and URL because Next merges metadata shallowly.
Verdict: AGREE on all three, each reproduced before fixing
Because: measured, not assumed. The drawer: `isMenuOpen` was component state with nothing resetting it on navigation, and the earlier `useEffect` that did reset it had been removed to satisfy `react-hooks/set-state-in-effect`. The email: at 320px the document measured `scrollWidth` 337 against `clientWidth` 320, with the link 313.3px wide at 22px and no break opportunity in an address. The metadata: the built HTML for both articles carried `og:url` `https://anthonyugwuja.dev` and the homepage title.
Changed: menu state is now derived — it stores the path it was opened on, so any navigation including Back closes it with no effect syncing state; the email wraps with `overflow-wrap: anywhere` inside a `min-w-0` parent; `src/lib/metadata.ts` builds per-route OpenGraph and Twitter fields, applied to writing entries and case studies. Verified after: menu false and overflow cleared on wordmark and Back, `scrollWidth` 320 at 320px, and `og:url` now ends `/writing/what-unoptimized-turns-off`.
Study: how Next merges `metadata` across segments — a child that sets only `title` inherits the parent's whole `openGraph` block.

## 2026-11-06 — The scroll spy was broken, but not for the stated reason (6288a72)
Codex challenged: the on-this-page indicator never tracks because `rootMargin` percentages resolve against width per the IntersectionObserver spec, so `-60%` removed 864px at 1440x900 and collapsed the observation region.
Verdict: AGREE the spy was broken, DISAGREE on the cause
Because: I ran the experiment. Three observers on the same probe, `-60%` versus `-540px` (60% of the 900px height) versus `-864px` (60% of the 1440px width): the percentage matched the height value and not the width one, so the band was `[96, 360]`, not collapsed. The real defect was mine, in the selection rule — I sorted intersecting sections by `rect.top` and took the first, and a tall section you have already scrolled past keeps touching the band, so the rail always named the section above the one being read. A probe confirmed the observer fired on every scroll and that the component agreed with its own rule.
Changed: the rule now takes the last section whose top has crossed a reading line a quarter of the way down the viewport, computed in pixels from `innerHeight` and rebuilt on resize, with a bottom-of-document case for a final section too short to reach the line. Verified across both articles: every section that can be reached highlights correctly; the last two share a scroll position because the page is already at `maxScroll`, so the rail correctly names the section occupying the line.
Study: IntersectionObserver `rootMargin` percentage resolution, and why "topmost intersecting element" is the wrong primitive for a reading indicator.


## 2026-11-06 — Amber-gold replaces cyan as the single accent (6288a72)
Decided by: Anthony.
Claim: drop the cyan. One amber-gold accent: bright gold on dark, a darker bronze-gold for link text on light, both measured; buttons and focus rings use the bright gold with ink text in both modes. Electric blue stays documented as a fallback and nothing more.
Verdict: ADOPTED, with one measured addition
Because: the values are `--accent` `#f0b429` on dark (10.43:1 on surface, 9.63:1 on raised) and `#7a4f08` on light (6.58:1 on surface, 7.12:1 on raised). `--accent-strong` is `#f0b429` in both modes so a button looks identical either way, with `--accent-ink` `#0c0d0f` on top at 10.43:1. Documented fallback, unused: `#6fb4ff` dark (8.93:1) and `#0b5fc2` light (5.66:1).
The addition: bright gold against the light surface measures **1.72:1**, well under the 3:1 WCAG 1.4.11 asks of a focus indicator. The ring is still gold as specified; in light mode it carries a 1px ink halo (`--focus-halo`) so it stays visible. Remove the halo and the ring fails on light — flagging rather than quietly deciding.
Changed: colour tokens in `globals.css`, OG card rule, `--code-*` tokens deleted (Shiki owns code colour now).
Study: WCAG 1.4.11 non-text contrast — why a focus ring is held to 3:1 against *adjacent* colours rather than 4.5:1.

## 2026-11-06 — Syne is the display family (6288a72)
Decided by: Anthony, after the `/lab/type` measurement.
Claim: Syne at leading 1.05, 44px for the hero statement on desktop, mobile size taken from the lab. Body stays Source Serif 4, Bricolage leaves the build.
Verdict: ADOPTED
Because: re-running `/lab/type` with leading 1.05 and a lower size sweep, Syne passes at desktop 52px and mobile 22px — "largest that fits five lines at 360" is 22px, so `--text-statement` is 44px/1.05 and `--text-statement-sm` is 22px/1.05. The 44px desktop size sits inside the passing range. Three lines at 1280 is only reachable with the statement at full container width; a `max-w` cap on the h1 pushes it to four and was removed twice before this stuck.
Changed: `--font-display` now resolves to Syne, Bricolage dropped from `layout.tsx` and its WOFF deleted, OG card re-rendered in Syne (its own 28 KB WOFF, since Satori cannot read WOFF2), favicon apex sharpened to match Syne's pointed A — verified at 16, 32 and 64px beside the real letterform.
Study: optical sizing and why a display face set at 44px needs different leading than the same face at 16px.

## 2026-11-06 — Phase 1 fixes, and three standing decisions (6288a72)
Decided by: Anthony.
Claim: keep `prefers-color-scheme` as the default with no forcing; `/lab` stays out of the nav until Phase 2 puts a real piece there; the archive is generated from `gh repo list teesmile` once six repos are transferred.
Verdict: ADOPTED, archive blocked on the transfer
Because: the mobile drawer had no background for a reason worth recording — it sets `bg-surface`, but it lived inside `<nav>`, which carries `backdrop-blur`. A `backdrop-filter` establishes a containing block for `position: fixed` descendants, so the drawer was being clipped to the 64px bar. Moving it out of the blurred element fixed it; adding more background never would have.
Changed: nav active state is now colour and underline colour only, proved shift-free by `/lab/nav-metrics` (identical width, height and offset for all five items in both states); Shiki replaces the hand-rolled tokenizer, emitting both themes as CSS variables so code re-colours with the site and no highlighter ships to the browser; simple-icons sit monochrome beside each tech name with brand colour on hover, falling back to ink for the near-black brands; Notes renamed to Writing with a date, reading-time and on-this-page rail.
Study: `backdrop-filter` and `transform` as containing blocks for fixed positioning — the most common cause of "my fixed overlay is invisible".


## 2026-11-06 — Route per view replaces the single scrolling page (6288a72)
Decided by: Anthony. Not a Codex challenge — logged here because it changes the shape of every phase after it.
Claim: anchor scrolling on one long page is the wrong container. Each section becomes a route — `/`, `/work`, `/work/[slug]`, `/about`, `/lab`, `/contact` — and navigation replaces the whole view with a continuous transition. A view scrolls only if its own content exceeds the viewport; in those views content reveals as you scroll; short views arrive and stay put.
Verdict: ADOPTED
Because: one long document forced motion to be decorative — every section needed an entrance because every section was just more of the same scroll. Routes make each view a composition with one job, which is exactly what the static-frame test rewards, and they turn the transition into the site's one orchestrated moment instead of a per-section tic. Two bugs die by construction: nav active state becomes `usePathname()` rather than scroll position (audit finding 10, so Phase 4's IntersectionObserver task is now unnecessary), and each view gets its own `metadata` instead of one page claiming to be everything.
Costs accepted: the transition is now load-bearing rather than a flourish, so Phase 2 carries more weight; six routes need six real reasons to exist, which means `/lab` must not ship as an empty promise (it stays out of the nav until it holds one experiment).
Changed: `docs/plan.md` — Target structure rewritten, Q2 superseded, Phase 1 rebuilt around routes with instant navigation, Phase 2 rebuilt around view transitions and in-view reveals, Phase 4's nav task removed.
Study: `template.tsx` vs `layout.tsx` in the App Router — a template re-mounts on every navigation, which is what a per-view enter animation needs and what a layout deliberately refuses to do.

## 2026-11-06 — Phase 1 art direction settled (6288a72)
Decided by: Anthony, from four option sets.
Claim: Bricolage Grotesque display over Source Serif 4 body; colour as a rule rather than a value, dark primary with light from the same tokens, cold-neutral surfaces and one cold hue reserved for interaction; hero statement "I trained as a pharmacist. Now I build React interfaces — and get paid to find what's wrong with AI-written code."; the Anthony-specific composition is the annotated defect, built from a self-generated example, with the dated spine on `/about`.
Verdict: ADOPTED
Because: the inverted pairing (grotesque headline, serif body) is the unusual half of the four options and reads as a decision rather than a default, and a serif body is genuinely better for case-study reading. Colour-as-a-rule replaces 58 gradient hex literals with a policy that survives changing the hue later. The accent is ice-cyan `#58D0E0` on dark (10.66:1) and `#046277` on light (6.43:1), measured, both past AA; azure `#6FB4FF`/`#0B5FC2` (8.93:1/5.66:1) was the runner-up and is a one-token swap. Self-generating the defect example avoids any NDA question about paid evaluation work and is just as true a demonstration.
Changed: Phase 1 rows 1.1, 1.4, 1.8 and 1.18 now record decisions instead of asking for them.
Study: WCAG relative luminance — why a single hue rarely clears 4.5:1 on both a near-black and a near-white, and why themed accents are two values rather than one.


## 2026-11-06 — Phase 0, clear the ground (6ded612)
Codex challenged: nothing. Adversarial review of the working tree returned approve with no material findings; lint and tsc passed in its sandbox, and it flagged only that the build was unverified there (read-only workspace) and that profile.webp needed staging. Both were already handled here: `pnpm lint && pnpm build` pass locally and the image is in the commit.
Verdict: AGREE (nothing to contest)
Because: an empty review is only worth logging for what it does not cover. It read the working tree, so it never saw the one judgement call worth a second opinion — removing the four profile URLs before you supplied real ones, which traded four mislabelled "Source" links for no link at all. You confirmed the real URLs afterwards and all three return 200. The first `--base main` run also returned approve on a diff that excluded every Phase 0 file, which is a reminder that an approve verdict is scoped to what was actually diffed.
Changed: nothing from this review. Phase 0's ten tasks are in 6ded612.
Study: why a review's scope matters more than its verdict — compare `git diff main...HEAD` with `git diff HEAD` and note which one contains your uncommitted work.

Not done for Phase 0: the throttled DevTools scroll test in the phase gate. Phase 0 touched no motion code, so the frame budget is unchanged; the first real measurement is the Phase 1 static frame and the Phase 2 motion gate. Flagging it rather than quietly skipping it.


## 2026-11-06 — Phase 1 Work links pointed at a route Phase 3 creates (e02cf8c)
Codex challenged: Task 1.12 links every Work entry to `/work/[slug]`, but that route is only scheduled for Phase 3, so Phase 1 ships 404s and Phase 2 has no destination to animate into. Lint and build do not prove a link resolves.
Verdict: AGREE
Because: it is a straight sequencing error of mine, and the gate I wrote could not catch it — `next build` has no opinion about a `<Link href>` string. Codex's own fix ("verify every Work link") is a discipline, and disciplines rot. The stronger fix is that `typedRoutes` is stable in Next 16 (`config-shared.d.ts:710`), so a link to a route that does not exist becomes a compiler error. Q2 had the same bug one layer down: it moved the scroll choreography onto `/work/[slug]` too, so Phase 2 had two tasks depending on a Phase 3 route.
Changed: Phase 1 entries keep their live-project URLs (task 1.12). New task 0.10 turns on `typedRoutes: true`. New task 2.0 creates the route and switches the links in one commit, and Phase 3 now deepens those pages rather than creating them.
Study: Next 16 typed routes — search "nextjs typedRoutes" — and the general shape, which is making an invariant the compiler's job instead of the reviewer's.

## 2026-11-06 — GSAP Flip would have animated width and height (e02cf8c)
Codex challenged: the card-to-header Flip is not transform-only by default. `Flip.js:695-712` animates `width` and `height` in px unless `scale: true` is passed, which contradicts the plan's own prohibition on animating layout properties.
Verdict: AGREE
Because: I read the file and it is exactly that — `if (scale) { tweenVars.scaleX/scaleY } else { tweenVars.width/height + autoRound }`. I wrote a hard rule against animating width/height and then specified a tool whose default does it. Width/height changes force layout and paint on every frame; `scaleX`/`scaleY` are composited. On a 4x-throttled mid-range Android that is the difference between a transition and a slideshow. The catch I would have hit in week three of Phase 2, blaming Lenis.
Changed: task 2.3 now makes `scale: true` mandatory, Flips the image only, and cross-fades the heading on its own tween, because scaled text blurs and its metrics lie.
Study: why `transform` and `opacity` are the only two cheap properties — search "CSS triggers layout paint composite" — and `scale` in the GSAP Flip docs.

## 2026-11-06 — The new art direction would have shipped with Inter inside the artwork (e02cf8c)
Codex challenged: the surviving template element is the Work imagery. The preview SVGs are generated mock interfaces, real screenshots are deferred to Phase 3, and the Phase 1 gate ("looks deliberate") would let a generic editorial developer portfolio pass.
Verdict: AGREE
Because: sharper than my own audit, which only called the previews "generated SVGs, not screenshots". All four hardcode `font-family="Inter"` and the two banned gradient stops `#5b5cff`/`#8b5cf6` — so the banned typeface and the banned gradient would survive Phase 1 inside the largest images on the page, where the token grep could never see them. And my acceptance test was unfalsifiable: "looks deliberate" is not something a screenshot can fail.
Changed: task 1.17 replaces the SVGs with real captures in Phase 1 and the token/typeface greps now cover `public/work`. Task 1.18 requires one element a stranger could not reuse with a name swap, with three candidates to pick from or reject. The "Done when" list is now eight checkable lines.
Study: the difference between a checkable acceptance criterion and a hopeful one — search "falsifiable acceptance criteria" — plus `prefers-color-scheme` behaviour of baked-in image colours.

## 2026-11-06 — Skipping React View Transitions for a GSAP overlay (e02cf8c)
Codex challenged: Q1 rejects View Transitions on wrong evidence. `@types/react/canary.d.ts` declares `ViewTransition`, a TSX check passes with the documented `react/canary` reference and no cast, and shared-element transitions, JS animation control and reduced motion are all documented. Compare minimal implementations before settling the architecture.
Verdict: AGREE on the evidence, DISAGREE on reopening the decision
Because: Codex is right and I was wrong — `canary.d.ts:107` declares the component, the four lifecycle callbacks are typed, and "crossfade only / needs a cast / no reduced-motion path" were all false. I corrected Q1 to say so. What survives is the cost, not a capability gap: the typed `ViewTransitionInstance` has one member, `name: string` (`canary.d.ts:37-42`), so driving it from JS means untyped pseudo-element work; `canary.d.ts` augments `declare module "."`, so the opt-in is project-wide and makes canary APIs type-visible that the installed stable npm react does not export; and it needs an experimental Next flag for the one mechanism every navigation depends on. I decline the build-both spike concretely: it doubles the most expensive phase to choose between mechanisms, when the choice is one component and one `Flip` call to reverse, and Phase 2's stated purpose is learning to own a timeline. A one-field instance and four callbacks teaches less than a timeline I can stage, cancel and reverse.
Changed: Q1's evidence rewritten with the corrections marked, the reasoning rebuilt on cost and ergonomics, and Codex's robustness checks adopted for whichever mechanism ships — delayed navigation, mid-flight cancellation, browser Back, and destination failure are now in Phase 2's recorded gate alongside the frame-time budget.
Study: React's `<ViewTransition>` reference at https://react.dev/reference/react/ViewTransition, and how TypeScript release channels work in `@types/react` (`canary.d.ts` vs `experimental.d.ts` vs `index.d.ts`).

