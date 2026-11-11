'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, REVEAL, STAGGER, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Where an item must reach to count as arrived, as a fraction of the viewport. */
const ENTER = 0.88;
/** It only counts as gone once it falls back past here — the gap is the
 *  hysteresis, so a reader resting at the boundary gets nothing. */
const LEAVE = 0.99;

/**
 * One reveal rule for every scrolling view.
 *
 * On load, exactly two things animate: the page heading and the first item.
 * Not "whatever happens to be on the first screen" — that depended on
 * viewport height and on images having loaded, so a tall screen or a slow
 * image made the whole page arrive at once.
 *
 * Everything else waits, enters as it is scrolled to, and reverses out when
 * the reader scrolls back up past it (onLeaveBack — the item going back down
 * past the bottom edge, not off the top).
 *
 * Triggers are armed only after the first scroll. Without that, ScrollTrigger
 * fires onEnter during its initial refresh for anything already in view,
 * which is exactly the "everything at once" behaviour this rule exists to
 * prevent. Arming also sweeps anything already past the line, so nothing can
 * get stuck invisible.
 */
export default function Reveals({ initial = 2 }: { initial?: number }) {
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    /* With nothing to reveal on load, there is nothing to measure on load
       either. Setting up means hiding every target and building triggers
       that read their positions, and on the home page that forced the
       browser to lay out sections it was otherwise skipping
       (content-visibility: auto) in the middle of the hero entrance. So the
       whole rule waits for the first scroll, then sweeps what is in view. */
    if (initial === 0) {
      let teardown: (() => void) | undefined;
      const start = () => {
        teardown = setupReveals(initial, true);
      };
      window.addEventListener('scroll', start, { once: true, passive: true });
      return () => {
        window.removeEventListener('scroll', start);
        teardown?.();
      };
    }

    return setupReveals(initial, false);
  });

  return null;
}

/** The rule itself. Returns its cleanup. */
function setupReveals(initial: number, armNow: boolean) {
  const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  /* `initial` is 0 on the home page: the hero already has its own
     entrance, and the page's one orchestrated moment should not share the
     first second with a second one. */
  const onLoad = targets.slice(0, initial);
  const rest = targets.slice(initial);

  /* Two entrances. What is on screen when the page loads keeps the quick,
     short one: it includes the page's largest paint, and a longer rise there
     measurably delayed LCP (mobile Lighthouse fell from 97-99 to 86-88 on /
     and /work). What the reader scrolls to gets the fuller rise; it is never
     the largest paint, and it is where scrolling felt static. */
  const LOAD_RISE = 14;
  const showOnLoad = (els: HTMLElement[]) =>
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.out,
      stagger: STAGGER.tight,
      overwrite: 'auto',
    });
  const show = (els: HTMLElement[]) =>
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: REVEAL.duration,
      ease: REVEAL.ease,
      stagger: REVEAL.stagger,
      overwrite: 'auto',
    });

  const hide = (els: HTMLElement[]) =>
    gsap.to(els, {
      opacity: 0,
      y: REVEAL.distance,
      duration: DURATION.fast,
      ease: EASE.in,
      overwrite: 'auto',
    });

  const onScreen = (el: HTMLElement) => el.getBoundingClientRect().top < window.innerHeight * ENTER;
  const firstScreen = rest.filter(onScreen);
  gsap.set([...onLoad, ...firstScreen], { opacity: 0, y: LOAD_RISE });
  gsap.set(rest.filter((el) => !firstScreen.includes(el)), { opacity: 0, y: REVEAL.distance });
  gsap.to(onLoad, {
    opacity: 1,
    y: 0,
    duration: DURATION.base,
    ease: EASE.out,
    stagger: STAGGER.base,
  });

  let armed = false;
  /* ?markers paints ScrollTrigger's start/end lines on the page, which is
     the only way to see why a trigger fired where it did. */
  const markers = new URLSearchParams(window.location.search).has('markers');

  /* `markers` is honoured at runtime but missing from BatchVars in the
     types, so it is spread in and each object cast once. */
  const debug = markers ? { markers: true } : {};

  /* Two thresholds, not one check at a single threshold.
     ScrollTrigger fires onLeaveBack the moment the start line is crossed,
     where the element's top is by definition at that line — so testing
     "is it below a lower line yet" inside that callback can only ever
     answer no, and nothing was ever reversed. Entering uses the 88% line,
     leaving uses the 99% line, and the gap between them is the hysteresis
     a reader resting at the boundary falls into. */
  const entering = ScrollTrigger.batch(rest, {
    ...debug,
    start: `top ${ENTER * 100}%`,
    onEnter: (batch) => {
      if (armed) show(batch as HTMLElement[]);
    },
    onEnterBack: (batch) => {
      if (armed) show(batch as HTMLElement[]);
    },
  } as ScrollTrigger.BatchVars);

  const leaving = ScrollTrigger.batch(rest, {
    start: `top ${LEAVE * 100}%`,
    onLeaveBack: (batch) => hide(batch as HTMLElement[]),
  } as ScrollTrigger.BatchVars);

  const triggers = [...entering, ...leaving];

  const arm = () => {
    armed = true;
    /* The sweep of what is already on screen uses the quick entrance: on
       a page nobody scrolls, this is what reveals the first screen. */
    const reached = rest.filter(onScreen);
    if (reached.length) showOnLoad(reached);
  };

  window.addEventListener('scroll', arm, { once: true, passive: true });

  /* Arming on first scroll is what stops everything arriving at once — but
     a page with nothing to scroll would then never arm at all, and a reader
     who simply does not scroll would sit in front of a half-empty page. So:
     arm immediately if there is no scrolling to be done, and after a second
     regardless. Both sweep whatever is already in view. */
  const canScroll = () =>
    document.documentElement.scrollHeight > window.innerHeight + 2;

  if (armNow || !canScroll()) arm();
  const patience = gsap.delayedCall(1, () => {
    if (!armed) arm();
  });

  /* Start positions measured before fonts and images settle are wrong, and
     wrong start positions make every trigger fire at once. Refresh when
     each of those finishes, and once more after the route transition has
     stopped moving the view. */
  const refresh = () => ScrollTrigger.refresh();
  document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  const afterTransition = gsap.delayedCall(DURATION.base + 0.15, refresh);

  return () => {
    patience.kill();
    window.removeEventListener('scroll', arm);
    window.removeEventListener('load', refresh);
    afterTransition.kill();
    triggers.forEach((trigger) => trigger.kill());
  };
}
