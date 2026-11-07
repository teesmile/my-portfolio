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

## 2026-11-06 — Codex review 5: three ways the resume pipeline could publish a lie (402fb1b)
Codex challenged: the pre-commit hook generates PDFs from the working tree while committing only the index, so a partially staged `resume.ts` ships a document describing content the commit does not contain; the build-freshness check looks at `resume.ts` alone, so a change to the page component or the print stylesheet prints with the old presentation while a text-only ATS check still passes; and `/resume?variant=ai` renders the AI ordering but its download button always points at the default PDF.
Verdict: AGREE on all three, each confirmed by reading the code and each proven fixed
Because: all three are the same failure in different places — a document that claims to represent something it was not generated from. The first is the worst, because it passes every check: the PDF is internally consistent, the ATS check passes, and the commit is still wrong. The second is the quietest: extraction only sees text, so a stale layout is invisible to it by construction. The third is the one a reader would hit first — downloading from the AI page and getting the general resume.
Changed: the hook refuses a partially staged `resume.ts` rather than resolving the ambiguity on its own (proven: exit 1 with an explanation). Build freshness now takes the newest mtime across all of `src/` plus `next.config.ts`, not one file (proven: touching `globals.css` triggers "source is newer than the build — rebuilding"). The download href comes from the variant (proven: `/resume` serves `Anthony-Ugwuja-Resume.pdf`, `/resume?variant=ai` serves `Anthony-Ugwuja-Resume-AI.pdf`).
One self-inflicted bug surfaced while fixing: adding `pdf.ai` to the content made the checker's `/ai: '...'/` regex match the PDF path instead of the AI title, so the default document was asked to contain the AI title. The regex is now anchored to the titles block.
Study: why "generated from the working tree, committed from the index" is a whole class of bug — the same shape as building from a dirty tree in CI.


## 2026-11-06 — The headline shake was re-rasterisation, not movement (402fb1b)
Decided by: Anthony reported the headline shaking as it rises on a real phone.
Claim: check three suspects — SplitText running before Syne loads, whole pixels instead of yPercent, and masks clipping mid-tween.
Verdict: REPRODUCED by instrumentation; the third explanation was the right one, and none of the three as stated
Because: a logger injected before any page script, sampling every animation frame at 390 wide and DPR 3, cleared two suspects outright — `document.fonts.ready` resolved at 342ms and the split ran at 444ms, so it does wait for the face; the line count stayed at 2 and the masks stayed `overflow: clip` for the whole tween, so nothing re-split or re-clipped. The rise was already `yPercent`, not pixels. What the frames showed instead was `matrix(1, 0, 0, 1, 0, 40.4656)` — a **2D** matrix at fractional pixels. The geometry was perfectly smooth (zero direction reversals), so nothing was moving wrongly: the glyphs were being re-rasterised at a new sub-pixel offset every frame, which at DPR 3 reads as vibration.
Changed: `force3D: true` alone did not fix it — GSAP still wrote a 2D translate — so the lines get `z: 0.01` and `will-change: transform` before the tween, which produces `translate3d(0px, 0px, 0.01px)` and a `matrix3d` computed transform. Both are removed on completion, along with the split itself, so later resizes reflow ordinary text. `autoSplit` is now off, because a re-split on font load or resize would swap the elements mid-tween. The caret blinks on a steady one-second rhythm and pauses when the tab is hidden or the hero scrolls out of view.
Study: why a compositor layer stops text shimmering — the difference between moving a rasterised bitmap and re-rendering glyphs at a fractional offset.


## 2026-11-06 — One timing scale, and the reveal rule it serves (402fb1b)
Decided by: Anthony — "everything reads too fast".
Claim: define one shared scale of durations and eases, use it everywhere, and give every scrolling view the same reveal behaviour: the first screen arrives on load, everything below enters as it is reached, and scrolling back up reverses it.
Verdict: SHIPPED
Because: `src/lib/motion.ts` is now the only place a duration is chosen, so "slower" is one edit rather than thirty. The numbers are picked so a view's entrance lands between 0.6s and 1s — a 0.5s tween staggered 0.09s over five items finishes at 0.86s. The reveal rule needed two things the obvious implementation lacks. First, the content already on screen at load cannot wait for a scroll event that will never arrive, so it animates as a group immediately and is never left hidden. Second, `onLeaveBack` fires the instant the trigger line is crossed, so a reader resting at the boundary would flicker the element on and off; a second geometric check (the element must fall back past 99% of the viewport) gives an 9% dead band.
Changed: route transition, drawer, clock, case-study morph and reveals all read from the scale. Hidden state is still written in script rather than CSS, so a failed script leaves the page readable.
Study: hysteresis as an interface idea — two thresholds instead of one wherever a boundary can be hovered.

## 2026-11-06 — Batching scroll triggers, found by the gate (402fb1b)
Decided by: measurement, after the reveal rewrite.
Claim: the new reveals and the tool-logo glitch each created one ScrollTrigger per element.
Verdict: REGRESSION, caught and fixed
Because: the gate found it. Scrolling a case study measured a **66.7ms** longest frame at 4x CPU throttle against a **16.8ms** control — the first genuine motion cost of the whole phase, where every earlier number turned out to be React rendering a route. The cause was volume rather than complexity: a case study has dozens of marked nodes and a logo list has twenty, and each trigger does its own bookkeeping on every scroll frame. `ScrollTrigger.batch` shares that work. Re-measured: **16.8ms**, parity with the control. The navigation scenarios still exceed the budget in both configurations, and paired runs show the control sometimes slower than motion (mid-flight cancel: 133.3ms control against 166.6ms with motion, cold navigation 83.4ms against 100.1ms), so the run-to-run variance there is larger than the difference between the two configurations.
Changed: both reveals and the glitch batch their triggers; the glitch staggers 60ms per logo so a row does not fire as one flash.
Study: why per-element scroll listeners scale badly, and what `ScrollTrigger.batch` actually shares.

## 2026-11-06 — The hero's two voices, and the deck as a travelling stack (402fb1b)
Decided by: Anthony.
Claim: split the hero statement into a Syne headline and a monospace line that types itself with a caret and a lint squiggle; make the deck advance by travel rather than shuffle, with drag on touch; print the resume from the page itself.
Verdict: SHIPPED, sizes measured
Because: the second sentence is set in Martian Mono because the implication is an editor, and text appears in an editor by being typed — so it types, the caret blinks twice and leaves rather than looping forever, and a wavy underline draws under "what AI gets wrong" in the warning colour, which is the lint mark the sentence is describing. `/lab/type` re-measured both voices for the two-line layout: the headline ships at **64px/32px** and the mono line at **20px/14px**, the largest sizes that keep the headline inside two lines wide and four narrow, and the typed line to one line wide and three narrow. The deck now sends the read card out to the left and brings the next forward from the right, because nothing physical reorders itself without moving; a drag past a quarter of the card's width or a flick over 450px/s dismisses, anything less springs back, so a fast flick and a slow deliberate push both work. Code lines keep the system monospace: Martian Mono is wide by design, which suits one line and not forty.
Changed: nine cards now, `pnpm resume` prints `public/Anthony-Ugwuja-Resume.pdf` from `/resume` through a print stylesheet, so the document cannot drift from the page it comes from.
Study: why a monospace face reads as "typed" and a proportional one does not, and what `preferCSSPageSize` and print margins do to a printed layout.


## 2026-11-06 — Flip earns its cost on the case study and not in the deck (131de59)
Decided by: measurement, during the Phase 2 gate.
Claim: the brief asked for Flip in both places — the work card morphing into the case-study hero, and the deck bringing the next card forward.
Verdict: KEPT on the case study, REPLACED in the deck
Because: Flip measures layout for every element before animating, and that measurement is what you are paying for. On the case study it is unavoidable and worth it: the card lives on another route and unmounts the moment navigation happens, so the arriving hero has no way to know where it came from except from a recorded state. In the deck the slots are a pure function of position — I already know every start and end transform — so the measurement pass buys nothing. Measured at 4x CPU throttle: the Flip version produced a **33.4ms** frame against a **16.8ms** control; direct tweens to the known slot transforms measure **16.8ms**, at parity with doing nothing.
Changed: deck reordering is now `gsap.to` per card with React owning order and z-index while GSAP owns transforms — if both wrote `style.transform` they would overwrite each other mid-tween. The case study keeps `Flip.from` with `scale: true`, the image only, and the heading cross-fading on its own tween. One gotcha cost a round of debugging and is worth recording: `Flip.from(state, vars)` falls back to `state.targets`, which are the elements that just unmounted, so the new element has to be passed explicitly as `vars.targets` for Flip to pair them by `data-flip-id`.
Study: when a layout-reading animation is worth its forced reflow — the answer is "when you cannot compute the geometry yourself".

## 2026-11-06 — The Phase 2 gate, and what the budget actually measures (131de59)
Decided by: the five recorded traces in `docs/plan.md`, run with `pnpm frames` at 4x CPU throttle.
Claim: every scenario must keep its longest frame under 16.7ms.
Verdict: MOTION PASSES; the navigation scenarios exceed the budget for reasons motion cannot fix
Because: the first run had all five over budget, which would normally mean simplifying the animation. Running the identical five with `prefers-reduced-motion` forced — every animation off — produced the same misses and a *worse* cold navigation (150.0ms against 83.3ms). The long frames are React rendering a new route under 4x throttle, not animation. The frame times are also quantised to multiples of ~16.65ms, which is the signature of skipped frames rather than one frame doing 83ms of work. Isolating the in-page animations against the same control settles it: hover tilt 16.8ms versus 16.8ms, idle 16.8ms versus 16.8ms, deck advance 16.8ms versus 16.8ms after the Flip change. Motion is at parity with doing nothing.
Changed: `scripts/measure-frames.mjs` is now `pnpm frames`, with a `--reduced` control flag, because a performance number without a control is not evidence. Nothing in the offline trace is left stranded: template opacity 1, no scroll lock, no open drawer.
Study: why a control run belongs in every performance measurement — without one, any number invites you to optimise the wrong thing.

## 2026-11-06 — Reveals, and keeping the hidden state out of CSS (131de59)
Decided by: Claude, per the rule that non-trivial motion ships with its reasoning.
Claim: long views reveal their content as it comes into view, subtly, once.
Verdict: SHIPPED
Because: `ScrollTrigger.batch` gives dozens of marked nodes one shared trigger and one tween per group rather than dozens of each, and `once: true` kills the trigger after it fires so scrolling back up costs nothing and no paragraph arrives twice. The hidden state is set in JavaScript rather than CSS on purpose — a page whose script fails is then merely unanimated instead of invisible, which is the failure mode worth choosing. Reduced motion is handled by omission: neither matchMedia branch matches, so nothing is hidden and nothing animates. The contact clock's entrance carries a ref guard because the component re-renders every second; without it the digits would replay their arrival on every tick.
Study: `ScrollTrigger.batch` versus per-element triggers, and why progressive enhancement means hiding things in script rather than in stylesheets.


## 2026-11-06 — Codex review 4: the clock was a hydration bug, not a warning (241c2b3)
Codex challenged: `/contact` is prerendered, so `useState(readClock)` renders build-time digits into static HTML while the client initialises from the visitor's clock. `suppressHydrationWarning` on the parent does not cover text inside the child spans, so cold loads hit a real hydration failure and re-render, not a hidden warning. Separately, the copy button silently no-ops when the Clipboard API is denied, and the mailto link my comment promised had been removed in the rewrite.
Verdict: AGREE on both, reproduced before fixing
Because: the built HTML carried `22:48:30` — hours stale for anyone loading later — and `grep mailto` over the same file returned nothing. I was wrong twice: wrong that the choice was "warning versus flash" when it was actually a failed hydration, and wrong in a comment that described a fallback the page did not have.
Changed: the clock moved to `useSyncExternalStore`, whose third argument exists exactly for this — the server snapshot renders `--:--`, hydration uses that same value so the markup matches by construction, and the real time arrives on the first client tick. The address is now a real `mailto:` link with a separate Copy button beside it, so it works with JavaScript off and when the clipboard is blocked, and failures are announced through a live region. Verified: prerendered HTML contains `--`, the mailto is present, the clock reads real time after hydration, and the console is clean where it previously logged a mismatch.
Study: `useSyncExternalStore` and why its `getServerSnapshot` is the correct tool for anything whose value is time-dependent.

## 2026-11-06 — The drawer blink, found on the second attempt (241c2b3)
Decided by: Anthony reported the blink persisted on a real phone after the first fix.
Claim: reproduce in dark mode with a mobile user agent, touch emulation and DPR 3, and check three suspects the first run could not see — a mount flash, the panel resizing when the browser bar hides, and an icon crossfade.
Verdict: REPRODUCED and fixed; my first fix had been incomplete, not wrong
Because: 60ms screenshot sampling cannot see a one-frame event. Driving the page with `Page.startScreencast` plus a per-animation-frame logger of computed opacity found it: opening climbed `0 → 0.9926` and then **dropped to 0 for a single frame** at 426.9ms before settling at 1; closing fell to `0.0144` and **jumped back to 1 for one frame** at 2059.8ms, immediately before unmount. Both are framer-motion handing off between its animated value and the committed style. The other two suspects were cleared by the same run: at `vh` 788 the panel resized to 724 with `top` still 64 — no gap, no flash — and the icon does not crossfade, though the Menu/Close label was changing the button width by 1.7px and nudging the row.
Changed: framer-motion removed from the drawer entirely — with no animation there is no handoff to flash — and the button given a fixed width. Re-measured: the panel goes absent → opacity 1 → absent with no intermediate frame, and the screencast shows two steady states (71.26 closed, 14.47 open) with nothing in between. `src/` now has zero framer-motion imports, so Phase 2's task 2.5 is a straight removal of the dependency.
Study: why a single-frame visual defect needs frame-rate instrumentation — any sampling slower than the display cannot prove absence.


## 2026-11-06 — The drawer blink was the backdrop, not the icon (241c2b3)
Decided by: measurement, after Anthony reported a blink on open and close.
Claim: the mobile drawer flickers on a phone; find the cause before fixing it.
Verdict: FIXED, cause identified by frame capture
Because: I drove Chromium over CDP at 390x844, captured a screenshot every 60ms through open and close, and took the mean brightness of each frame. Opening went 239.5 → **228.9** → 243.6; closing went 243.6 → **225.3** → 239.4. A dark frame at both ends. The cause: the `bg-ink/40` backdrop and the opaque `bg-surface` panel faded independently, and since the panel covers the whole viewport below the nav, the backdrop was only ever visible *during* the fade. It dimmed nothing and existed only to produce the flash. The icon swap and the `backdrop-blur` repaint were both innocent.
Changed: backdrop deleted; the panel keeps its own short fade. Re-measured: 239.4 → 243.5 → 244.5 opening and the reverse closing, monotonic, no dip below either steady state. The drawer links now have three distinct states (muted, hover/pressed ink with accent underline, active held), and the hamburger is a bordered button labelled Menu/Close.
Study: compositing order for overlapping animated layers — when two layers cross-fade, the one underneath is visible for exactly the duration of the transition.

## 2026-11-06 — Contact state: a clock that renders on the server, a copy button that forgets (241c2b3)
Decided by: Claude, per the new rule that non-trivial state ships with its reasoning.
Claim: the contact view needs a live Lagos clock, a copy-to-clipboard email that says "Copied" for two seconds, and no scrollbar at 1280x800 or 390x844.
Verdict: SHIPPED
Because: the clock computes real time during render and marks the output `suppressHydrationWarning`. The alternative — render blank until mount — avoids a warning nobody sees at the cost of a visible flash on every load, so the warning is the cheaper thing to suppress. `Intl.DateTimeFormat` with `timeZone: 'Africa/Lagos'` does the zone conversion, which means no offset arithmetic and no DST assumptions baked into the code. The copy button holds its timeout in a ref so a second tap restarts the timer instead of stacking timeouts, and clears it on unmount so a quick navigation cannot leave a timer holding a `setState` for a component that no longer exists.
Changed: the view measured 116px too tall at 390x844; mobile-only rhythm trims brought it to exactly 0 overflow at both sizes, with the desktop composition untouched.
Study: `Intl.DateTimeFormat.formatToParts` as a way to read a time zone without a date library.

## 2026-11-06 — Hero statement, writing topics and inline figures (241c2b3)
Decided by: Anthony chose the statement and the rules; the sizes came from the lab.
Claim: ship the first of two candidate statements that passes the type rule; give every Writing piece a topic with a filter; every piece carries inline diagrams where the explanation happens.
Verdict: SHIPPED
Because: "Pharmacist by training, engineer by choice. I ship across the stack and catch what AI gets wrong." is first in order and passes, so it ships — and because it is shorter than the previous statement it also passes at larger sizes, so `--text-statement` moved from 44px to **56px** and the mobile step from 22px to **28px**, both measured as the largest that fit. Topics are a fixed five-value union rather than free tags, so the filter row stays short and a new piece has to pick a lane; filtering runs in the client because the whole list is already in the payload and a round trip would lose the scroll position. Only topics with pieces get a button — a filter that always returns nothing is worse than no filter. Counts describing output are gone from the copy, because "three things I built" expires the day the fourth ships.
Changed: six inline figures across the two pieces, drawn from tokens; per-piece share images for `/writing/[slug]` and `/work/[slug]` from one shared renderer so an article and a case study cannot drift apart.
Study: why a closed vocabulary beats free tagging on a small site — the filter row is the user-visible consequence of the type.


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


## 2026-11-06 — The resume printed two pages because I measured a document I was not printing
Challenge to myself: the resume had to come down to one page. Compressed print metrics, a tightened licensure line and a measurement run that reported `overflowPx: -30` — thirty pixels of room to spare — and `pnpm resume` still said two pages. Three further compressions changed nothing.
Verdict: AGREE that it was a real defect; DISAGREE with every cause I proposed before measuring the right thing.
Because: the measurement harness printed with 0.38/0.32/0.45in margins and `scripts/resume-pdf.mjs` printed with 0.55in on all four sides. Margins decide page count twice over — they take height off the page and they narrow the column, so the narrower text wraps more and grows taller. Every measurement was honest and every conclusion was wrong, because the harness and the artifact were not the same document. Two real bugs surfaced on the way: the print run waited a fixed 3.5s rather than for `document.fonts.ready`, so a cold `next start` could print in fallback metrics (wider, longer, and a page count that changed between runs on identical input); and `body { min-h-dvh }` resolves `dvh` against the *page box* in paged media, making body exactly one page tall so the first trailing margin after it opens a second page — invisible to any viewport measurement, where `dvh` is the viewport.
Changed: the script's margins are now the measured ones with the numbers in a comment; it waits on `document.fonts.ready` and a settled layout instead of a guess; `@media print` resets `html, body` to `min-height: 0`. The contact line now breaks only at its separators — holding "Abuja, Nigeria" together lengthened the line until `github.com/teesmile` split into `github.co` + `m/teesmile`, which the second extractor caught. All three variants print one page and pass both extractors.
Study: how `vh`/`dvh` resolve in paged media — search "CSS paged media viewport units page box" — and why a measurement rig that does not share a code path with the artifact gives confident wrong answers.

## 2026-11-06 — One resume source, three versions, and a check that reads the page instead of the file
Feature: the full history merged into `src/content/resume.ts`, with the master as the default and two targeted one-page versions.
Verdict: AGREE with the structure; the interesting part is what it forced.
Because: the old model was "same facts, reordered" — every entry carried an `aiRank` and nothing was ever left out. The new requirement breaks that: the locum and administrative roles belong to the general version only, the pharmacy-and-chemistry bullet is the differentiator for health AI and dead weight on a fintech desk, and the languages line is the point of one version and the line that costs the general version its single page. So inclusion and order became one field, `place: Partial<Record<Variant, number>>` — a missing key means "not in this version", a present key is its rank. The same field sits on bullets and notes, not just on roles, because the rule is that each *line* earns its space, and a role can be worth keeping when one of its lines is not.
That broke the ATS check, and the break was informative. The check scraped every string literal out of `resume.ts` and demanded each one appear in the PDF — a proxy for "the document says what the data says" that could not survive a version carrying less than the file. It now reads `main`'s `innerText` from the live page in print media and checks the extraction against that. Stronger as well as variant-aware: it compares the document against what the page actually renders, and the print stylesheet has already hidden everything that is not meant to be on paper.
Three real defects surfaced on the way. The print URL hardcoded `variant === "ai"`, so `--variant general` printed the *default* page and failed only on page count — a wrong document, not a long one. The credentials separator was a `<span class="mx-2">|</span>`, so the page read "Nigeria|AI" and the paper read "Nigeria | AI": margins are not text, and the two sides stopped matching. And "terminal-based" breaking at its hyphen extracted as two words, which is typography rather than a fusion, so normalisation now closes a hyphen followed by a space on both sides.
Changed: the master prints at 9pt rather than the 7.9pt it had been squeezed to while the print margins were still wrong, and takes the second page it is allowed; both targeted versions are one page. `pnpm resume --variant general` joins the other two, the pre-commit hook regenerates all three public PDFs, and `--private` still writes the phone-number copies to the gitignored folder.
Study: why an acceptance check should compare the artifact against the rendered output rather than against the source it was built from — the same reason an end-to-end test beats asserting on a template string.

## 2026-11-06 — One address, declared rather than implied
Feature: Google ranked `teesmile.vercel.app` above the real domain and named it the canonical.
Verdict: AGREE, and the cause was measurable in four curls.
Because: `teesmile.vercel.app`, `teesmilex.vercel.app` and `www.anthonyugwuja.dev` all returned 200 with byte-identical HTML, and not one of them carried a `<link rel="canonical">`. The only signal was `og:url`, which Google treats as a hint it may ignore. Given three equal copies and no declaration, it picked one — and it picked the host with the older index history. Nothing was broken; nothing had ever been stated.
Changed: 308 redirects from both old production hosts to the same path on the one address, matched on `has: { type: "host" }` with the dots escaped, because Next compiles that value into `new RegExp(`^${value}$`)` and an unescaped `.` matches any character. Exact hosts only, so `teesmile-git-<branch>.vercel.app` previews still serve their own branch — a preview that redirected to production could not be reviewed. Every route now declares its canonical through `pageMetadata`, which resolves a relative path against `metadataBase`, so a canonical cannot name a host the site does not own. The canonical deliberately does *not* live on the root layout: metadata is inherited, so one route forgetting its own would silently publish the homepage's canonical, and a wrong canonical tells a crawler to drop the page — strictly worse than no canonical at all. `robots.ts` returns `Disallow: /` whenever `VERCEL_ENV` is not "production", which closes the hole that created this: every preview deployment is a full copy of the site on a crawlable host.
Resolved 2026-11-06, verified live: the apex was returning 301 to `www`, the reverse of the intended direction, which would have pointed every canonical at an address that redirects. Vercel has since been reconfigured and `curl` confirms the chains — `anthonyugwuja.dev` returns 200, and `www.anthonyugwuja.dev`, `anthonyugwuja.xyz` and `www.anthonyugwuja.xyz` each return a single-hop 308 to `https://anthonyugwuja.dev/`, with the path preserved (`www.anthonyugwuja.dev/resume` → `anthonyugwuja.dev/resume`). The `.xyz` pair is handled at the platform level rather than in `next.config.ts`, which only owns the two `.vercel.app` hosts.
Study: why `rel="canonical"` is advisory and a 308 is not — search "Google canonicalization signals consolidation" — and the difference between `og:url` and a canonical link.

## 2026-11-06 — Fitting the master on one page by sweeping, not guessing
Feature: the master resume had to come down from two pages, with spacing and a merged summary tried before any content was cut.
Verdict: AGREE, and the method mattered more than the values.
Because: page two held nine lines and page one had thirteen pixels free — about twelve lines to find. Guessing at a font size and rebuilding takes two minutes a try and tells you one thing. Instead the candidates were injected as a `<style>` into the already-loaded page under print emulation and printed through `Page.printToPDF` each time, so seven combinations of type size, leading and four spacing values were measured against real paged output in one pass, each reporting its page count and the pixels left over. 8.3pt/1.30 was the largest that fits, with 9px to spare; 8.4pt/1.22 fits with 19px but reads tighter, and leading matters more to a reader than a tenth of a point of glyph.
The sweep also exposed a bug worth more than the tuning: education titles were printing *larger* than the role titles. They are `<span class="text-sm">` inside a one-line paragraph, not headings, so every `h3` rule in the print block missed them and they kept the screen's 14px. They are entry titles like the others and now take the same 9.7pt.
Changed: one summary paragraph instead of two — the second was a second claim about the same person, and at this width each wrapped to two lines. Experience now runs strict reverse chronological in the master, while the two targeted versions still lead with the role their reader is hiring for. All six documents are one page and pass both extractors. The master's hard limit stays two pages, but going over one now prints a warning: a second page should be a decision, not a surprise.
Study: why a parameter sweep belongs in the loop rather than in a sequence of commits — and how `Page.printToPDF` can be driven against a live DOM you are mutating.

## 2026-11-06 — Codex review: a query parameter is not an authorisation (phase-2)
Codex challenged three things: `/resume?private=1` discloses the phone number to anyone who types it; the sticky hero truncates article titles on mobile; and the canonical rollout names a host that redirects.
Verdict: AGREE on all three. Two were mine to fix, the third was already fixed in Vercel and is now verified.

**1. The private view.** AGREE, and it was the worst kind of defect: the privacy rule is written down — the public PDF, `/resume` and `/contact` show email only — and I enforced it everywhere except the one place a stranger controls. The PDFs were gitignored, the site never linked the parameter, and none of that matters when the HTML response obeys the URL. The fix inverts who decides: `?private=1` is now only honoured when the *server* was started with `RESUME_ALLOW_PRIVATE=1`, which only `pnpm resume --private` does, on a localhost server it spawns and kills. A deployed instance never has the variable, so the parameter does nothing. Verified: four parameter combinations against a deployed-style server return no phone number; the same request against the generator's own server returns it.

**2. The truncated titles.** AGREE, and worse than reported. At 390px the long article title rendered 554px of text into a 275px box — more than half of it hidden, with the full text nowhere else in the document; even the short title clipped by 2px. The cause was not the `truncate` class, it was the magic number the class existed to protect: the mobile sticky offset was `calc(var(--nav-height) - 62.5vw + 4.75rem)`, and 4.75rem is the height of a band whose title is exactly one line. Clipping the title was paying for a hardcoded measurement with the reader's comprehension. The band's height is now measured with a ResizeObserver — which also covers the webfont landing and the phone rotating — and written to `--band-height`, so the title wraps to whatever it needs. Verified at 390px: nothing clipped on any route, the three-line title produces a 161px band and a -10.75px offset, the one-line case 95px and -76.75px, and after scrolling the band sits flush under the nav in both. Fixing it exposed a second bug: the frame's gradient is sized to the frame, so a band that now reaches higher had artwork showing through the heading. The band carries its own scrim.

**3. The redirecting canonical.** AGREE it was a genuine blocker; it is resolved and verified above.

Study: why "it is not linked anywhere" is not an access control — search "forced browsing OWASP" — and why a layout constant derived from a measurement should be measured rather than written down.
