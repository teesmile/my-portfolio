'use client';

import { useLayoutEffect } from 'react';
import { REVEAL, prefersReducedMotion } from '@/lib/motion';

/**
 * Scroll reveals that replay, built so that text can never stay hidden.
 *
 * The states, all CSS (globals.css):
 *
 *   (empty)  the entrance, from first paint: every item rises and fades in
 *            as soon as it is painted, with no JavaScript involved. That is
 *            what a reload shows for the first screen, and what the page is
 *            if nothing below ever runs.
 *   wait     entirely below the viewport: hidden and lowered until it
 *            arrives. Only this component sets it, and only on items the
 *            reader cannot see.
 *   in       arriving: the same finite animation, delayed a step for items
 *            arriving together so a heading leads its section and a list
 *            enters one item after another.
 *   done     landed, plain again.
 *   rise     the page's largest text: it rises from first paint but never
 *            starts invisible, so the largest paint is not delayed.
 *
 * Replaying: an item that drops back below the viewport (the reader has
 * scrolled up past it) goes back to wait, so it rises in again on the way
 * down. It is only ever re-hidden while it is entirely off screen, so
 * nothing a reader can see ever vanishes.
 *
 * Why an IntersectionObserver: it reports what is on screen now, on every
 * kind of scroll (touch, fling, keyboard, URL-bar resize, anchor jump,
 * scroll restore), and it delivers an initial reading for every element
 * the moment it is observed. The previous version kept three pieces of
 * state that had to agree (an arming gate, each trigger's remembered
 * progress and a one-off sweep), and when they disagreed the item stayed
 * at opacity 0.
 *
 * The safety net: a sweep every second shows any waiting item whose box is
 * inside the viewport, whatever the observers did, and it also runs on
 * resize, on return to the tab and on back/forward restores. Hiding is a
 * single attribute write and showing is a finite CSS animation that ends
 * visible, so there is no tween to kill, overwrite or leave half way.
 *
 * Home page: the sections below the hero use content-visibility: auto and
 * are below the fold by construction (data-reveal-far on the section).
 * Their items are put to wait without being measured, which would force
 * the browser to lay those sections out during the hero's entrance, and
 * they are only observed once the section itself is near the viewport.
 */

/* Items count as arrived once their top is above this line, as a fraction
   of the viewport from the top: the bottom 12% is the margin. */
const ENTER_LINE = 0.88;
/* Between items arriving together, in ms, and the most steps any one item
   waits behind the others, so a fast fling never leaves the screen waiting
   on a long queue. */
const STEP_MS = Math.round(REVEAL.stagger * 1000);
const MAX_STEPS = 5;
const SWEEP_MS = 1000;

/* The first mount in this JavaScript's life is a cold load: the first
   screen is already painted and already animating from the markup's own
   state, and must not be restarted. Every later mount is a client-side
   navigation, where this runs before the new page paints. */
let mounts = 0;

export default function Reveals() {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const coldLoad = mounts === 0;
    mounts += 1;
    return setup(coldLoad);
  }, []);

  return null;
}

function setup(coldLoad: boolean) {
  /* A bare attribute in JSX renders as "true"; both spellings are the
     plain state. */
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal=""], [data-reveal="true"]'));
  if (candidates.length === 0) return;

  const viewportBottom = window.innerHeight;
  const waiting = new Set<HTMLElement>();
  const onScreenNow: HTMLElement[] = [];
  const far = new Map<Element, HTMLElement[]>();
  /* Each item's far section, if it has one, read once. */
  const sectionOf = new Map<HTMLElement, Element>();

  const done = (event: Event) => {
    const el = event.currentTarget as HTMLElement;
    if (event.target !== el) return;
    /* Plain again once it has landed: no filled animation to keep a
       compositor layer alive, and nothing left to override. */
    if (el.dataset.reveal !== 'wait') el.dataset.reveal = 'done';
    el.style.removeProperty('--reveal-delay');
  };

  const hide = (el: HTMLElement) => {
    waiting.add(el);
    el.style.removeProperty('--reveal-delay');
    el.dataset.reveal = 'wait';
  };

  for (const el of candidates) {
    el.addEventListener('animationend', done);
    const section = el.closest('[data-reveal-far]');
    if (section) {
      sectionOf.set(el, section);
      hide(el);
      const list = far.get(section) ?? [];
      list.push(el);
      far.set(section, list);
      continue;
    }
    /* Entirely below the viewport: hide it until it arrives. Anything
       partly on screen is the first screen, and keeps its entrance. */
    if (el.getBoundingClientRect().top >= viewportBottom) hide(el);
    else onScreenNow.push(el);
  }

  /* Reveal, in page order, a step apart. */
  const reveal = (batch: HTMLElement[]) => {
    const arriving = batch
      .filter((el) => waiting.has(el))
      .map((el) => ({ el, top: el.getBoundingClientRect().top }))
      .sort((a, b) => a.top - b.top);
    arriving.forEach(({ el }, index) => {
      waiting.delete(el);
      const step = Math.min(index, MAX_STEPS);
      if (step > 0) el.style.setProperty('--reveal-delay', `${step * STEP_MS}ms`);
      el.dataset.reveal = 'in';
    });
  };

  /* On a client-side navigation the first screen has not painted yet, so
     its items take the staggered entrance from here rather than all at
     once from the markup. On a cold load they are left as they are. */
  if (!coldLoad && onScreenNow.length) {
    for (const el of onScreenNow) waiting.add(el);
    reveal(onScreenNow);
  } else {
    /* A cold load that hydrated after the entrance had already finished:
       those items are landed, and are marked so. */
    for (const el of onScreenNow) {
      const animations = el.getAnimations();
      if (animations.length && animations.every((animation) => animation.playState === 'finished')) el.dataset.reveal = 'done';
    }
  }

  const entering = new IntersectionObserver(
    (entries) => {
      reveal(entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement));
    },
    { rootMargin: `0px 0px -${Math.round((1 - ENTER_LINE) * 100)}% 0px`, threshold: 0 },
  );

  /* The way back: once an item is entirely below the viewport again (not
     above: scrolling down past it is reading, not leaving), it is put back
     to wait so it can rise in a second time. */
  const leaving = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || !entry.rootBounds) continue;
        if (entry.boundingClientRect.top < entry.rootBounds.bottom) continue;
        const el = entry.target as HTMLElement;
        if (!waiting.has(el)) hide(el);
      }
    },
    { threshold: 0 },
  );

  const watch = (el: HTMLElement) => {
    entering.observe(el);
    leaving.observe(el);
  };

  for (const el of candidates) {
    if (!sectionOf.has(el)) watch(el);
  }

  /* The far sections: watch the section, and only start watching its
     items once the browser will have laid them out. */
  const near = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        near.unobserve(entry.target);
        far.get(entry.target)?.forEach(watch);
        far.delete(entry.target);
      }
    },
    { rootMargin: '25% 0px 25% 0px', threshold: 0 },
  );
  far.forEach((_, section) => near.observe(section));

  /* The safety net, both ways: whatever is waiting and inside the viewport
     is shown, in order, and whatever has landed and is entirely below the
     viewport is re-armed, with no help from the observers. The observers
     only report a change of intersection, so an item that jumps straight
     from above the screen to below it (a jump to the top, an anchor, a
     keyboard Home) never reaches them; this does. All the reads come
     before any write. Sections not yet near are left alone so the sweep
     never forces their layout. */
  const sweep = () => {
    const onScreen: HTMLElement[] = [];
    const below: HTMLElement[] = [];
    const height = window.innerHeight;
    for (const el of candidates) {
      const section = sectionOf.get(el);
      if (section && far.has(section)) continue;
      const box = el.getBoundingClientRect();
      if (waiting.has(el)) {
        if (box.top < height && box.bottom > 0) onScreen.push(el);
      } else if (box.top >= height) {
        below.push(el);
      }
    }
    below.forEach(hide);
    if (onScreen.length) reveal(onScreen);
  };

  /* Once per frame while scrolling, and once more when it stops. */
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      sweep();
    });
  };

  const timer = window.setInterval(sweep, SWEEP_MS);
  const onShow = () => sweep();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', onShow);
  window.addEventListener('resize', onShow);
  window.addEventListener('pageshow', onShow);
  document.addEventListener('visibilitychange', onShow);

  return () => {
    window.clearInterval(timer);
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('scrollend', onShow);
    window.removeEventListener('resize', onShow);
    window.removeEventListener('pageshow', onShow);
    document.removeEventListener('visibilitychange', onShow);
    entering.disconnect();
    leaving.disconnect();
    near.disconnect();
    /* Leaving: whatever is still waiting on this document becomes plain
       again, so a kept element (the same page re-rendered) is never left
       hidden by a run that is no longer watching it. */
    for (const el of candidates) el.removeEventListener('animationend', done);
    for (const el of waiting) {
      el.dataset.reveal = '';
      el.style.removeProperty('--reveal-delay');
    }
    waiting.clear();
  };
}
