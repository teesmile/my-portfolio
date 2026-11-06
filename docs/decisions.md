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

## 2026-11-06 — Phase 1 Work links pointed at a route Phase 3 creates (pending commit, `redesign`)
Codex challenged: Task 1.12 links every Work entry to `/work/[slug]`, but that route is only scheduled for Phase 3, so Phase 1 ships 404s and Phase 2 has no destination to animate into. Lint and build do not prove a link resolves.
Verdict: AGREE
Because: it is a straight sequencing error of mine, and the gate I wrote could not catch it — `next build` has no opinion about a `<Link href>` string. Codex's own fix ("verify every Work link") is a discipline, and disciplines rot. The stronger fix is that `typedRoutes` is stable in Next 16 (`config-shared.d.ts:710`), so a link to a route that does not exist becomes a compiler error. Q2 had the same bug one layer down: it moved the scroll choreography onto `/work/[slug]` too, so Phase 2 had two tasks depending on a Phase 3 route.
Changed: Phase 1 entries keep their live-project URLs (task 1.12). New task 0.10 turns on `typedRoutes: true`. New task 2.0 creates the route and switches the links in one commit, and Phase 3 now deepens those pages rather than creating them.
Study: Next 16 typed routes — search "nextjs typedRoutes" — and the general shape, which is making an invariant the compiler's job instead of the reviewer's.

## 2026-11-06 — GSAP Flip would have animated width and height (pending commit, `redesign`)
Codex challenged: the card-to-header Flip is not transform-only by default. `Flip.js:695-712` animates `width` and `height` in px unless `scale: true` is passed, which contradicts the plan's own prohibition on animating layout properties.
Verdict: AGREE
Because: I read the file and it is exactly that — `if (scale) { tweenVars.scaleX/scaleY } else { tweenVars.width/height + autoRound }`. I wrote a hard rule against animating width/height and then specified a tool whose default does it. Width/height changes force layout and paint on every frame; `scaleX`/`scaleY` are composited. On a 4x-throttled mid-range Android that is the difference between a transition and a slideshow. The catch I would have hit in week three of Phase 2, blaming Lenis.
Changed: task 2.3 now makes `scale: true` mandatory, Flips the image only, and cross-fades the heading on its own tween, because scaled text blurs and its metrics lie.
Study: why `transform` and `opacity` are the only two cheap properties — search "CSS triggers layout paint composite" — and `scale` in the GSAP Flip docs.

## 2026-11-06 — The new art direction would have shipped with Inter inside the artwork (pending commit, `redesign`)
Codex challenged: the surviving template element is the Work imagery. The preview SVGs are generated mock interfaces, real screenshots are deferred to Phase 3, and the Phase 1 gate ("looks deliberate") would let a generic editorial developer portfolio pass.
Verdict: AGREE
Because: sharper than my own audit, which only called the previews "generated SVGs, not screenshots". All four hardcode `font-family="Inter"` and the two banned gradient stops `#5b5cff`/`#8b5cf6` — so the banned typeface and the banned gradient would survive Phase 1 inside the largest images on the page, where the token grep could never see them. And my acceptance test was unfalsifiable: "looks deliberate" is not something a screenshot can fail.
Changed: task 1.17 replaces the SVGs with real captures in Phase 1 and the token/typeface greps now cover `public/work`. Task 1.18 requires one element a stranger could not reuse with a name swap, with three candidates to pick from or reject. The "Done when" list is now eight checkable lines.
Study: the difference between a checkable acceptance criterion and a hopeful one — search "falsifiable acceptance criteria" — plus `prefers-color-scheme` behaviour of baked-in image colours.

## 2026-11-06 — Skipping React View Transitions for a GSAP overlay (pending commit, `redesign`)
Codex challenged: Q1 rejects View Transitions on wrong evidence. `@types/react/canary.d.ts` declares `ViewTransition`, a TSX check passes with the documented `react/canary` reference and no cast, and shared-element transitions, JS animation control and reduced motion are all documented. Compare minimal implementations before settling the architecture.
Verdict: AGREE on the evidence, DISAGREE on reopening the decision
Because: Codex is right and I was wrong — `canary.d.ts:107` declares the component, the four lifecycle callbacks are typed, and "crossfade only / needs a cast / no reduced-motion path" were all false. I corrected Q1 to say so. What survives is the cost, not a capability gap: the typed `ViewTransitionInstance` has one member, `name: string` (`canary.d.ts:37-42`), so driving it from JS means untyped pseudo-element work; `canary.d.ts` augments `declare module "."`, so the opt-in is project-wide and makes canary APIs type-visible that the installed stable npm react does not export; and it needs an experimental Next flag for the one mechanism every navigation depends on. I decline the build-both spike concretely: it doubles the most expensive phase to choose between mechanisms, when the choice is one component and one `Flip` call to reverse, and Phase 2's stated purpose is learning to own a timeline. A one-field instance and four callbacks teaches less than a timeline I can stage, cancel and reverse.
Changed: Q1's evidence rewritten with the corrections marked, the reasoning rebuilt on cost and ergonomics, and Codex's robustness checks adopted for whichever mechanism ships — delayed navigation, mid-flight cancellation, browser Back, and destination failure are now in Phase 2's recorded gate alongside the frame-time budget.
Study: React's `<ViewTransition>` reference at https://react.dev/reference/react/ViewTransition, and how TypeScript release channels work in `@types/react` (`canary.d.ts` vs `experimental.d.ts` vs `index.d.ts`).

