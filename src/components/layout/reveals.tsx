'use client';

import { useLayoutEffect } from 'react';
import { REVEAL, prefersReducedMotion } from '@/lib/motion';

/**
 * Scroll reveals, built so that text can never stay hidden.
 *
 * The rule, in order of importance:
 *
 *   1. Everything is visible by default. The server renders no hidden
 *      state, and this component only ever hides what is entirely below
 *      the viewport when the page mounts (data-reveal="wait"). Without
 *      JavaScript, with reduced motion, or if anything here fails, the
 *      page is simply its resting self.
 *   2. The animation only adds. Arriving is an attribute flip to
 *      data-reveal="in", which runs a CSS animation (globals.css) that is
 *      finite and ends at opacity 1: there is no tween to kill, overwrite
 *      or leave mid-way. Nothing is ever hidden again on the way back up.
 *   3. It starts again on every page change. The page's template re-mounts
 *      this component with the new document, and the observer below reads
 *      real intersection, not a remembered state.
 *   4. Anything still hidden after a moment is shown. A sweep every second
 *      reveals any waiting item whose box is inside the viewport, whatever
 *      the observer did, and the sweep also runs on resize, on return to
 *      the tab and on back/forward restores.
 *
 * Why an IntersectionObserver rather than ScrollTrigger: it reports what
 * is on screen now, on every kind of scroll (touch, fling, keyboard, URL-bar
 * resize, anchor jump, scroll restore), and it delivers an initial reading
 * for every element the moment it is observed. The previous version kept
 * three pieces of state that had to agree (an arming gate, each trigger's
 * remembered progress and a one-off sweep), and when they disagreed the
 * item stayed at opacity 0.
 *
 * Choreography: items that arrive in the same frame are revealed in page
 * order, a step apart, so a heading leads its section and a row of cards
 * or a list enters one after another. The step is capped so a fast fling
 * never leaves the screen waiting on a long queue.
 *
 * Home page: the sections below the hero use content-visibility: auto and
 * are below the fold by construction (data-reveal-far on the section). Their
 * items are put to wait without being measured, which would force the
 * browser to lay those sections out during the hero's entrance, and they
 * are only observed once the section itself is near the viewport.
 */

/* Items count as arrived once their top is above this line, as a fraction
   of the viewport from the top: the bottom 12% is the margin. */
const ENTER_LINE = 0.88;
/* Between items arriving together, in ms, and the most steps any one item
   waits behind the others. */
const STEP_MS = Math.round(REVEAL.stagger * 1000);
const MAX_STEPS = 5;
const SWEEP_MS = 1000;

export default function Reveals() {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    return setup();
  }, []);

  return null;
}

function setup() {
  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  /* Only the unmarked ones: "load" and "rise" are the first screen's own
     CSS entrances, and anything already "in" or "done" belongs to a
     previous run on this document (a filter re-render, say). */
  const candidates = all.filter((el) => el.dataset.reveal === '');
  if (candidates.length === 0) return;

  const viewportBottom = window.innerHeight;
  const waiting = new Set<HTMLElement>();
  const far = new Map<Element, HTMLElement[]>();

  for (const el of candidates) {
    const section = el.closest('[data-reveal-far]');
    if (section) {
      waiting.add(el);
      el.dataset.reveal = 'wait';
      const list = far.get(section) ?? [];
      list.push(el);
      far.set(section, list);
      continue;
    }
    /* Entirely below the viewport: hide it until it arrives. Anything
       partly on screen stays as it is, so nothing a reader can already
       see ever blinks. */
    if (el.getBoundingClientRect().top >= viewportBottom) {
      waiting.add(el);
      el.dataset.reveal = 'wait';
    }
  }

  const done = (event: Event) => {
    const el = event.currentTarget as HTMLElement;
    if (event.target !== el) return;
    /* Back to a plain element once it has landed: no filled animation to
       keep a compositor layer alive, and nothing left to override. */
    el.dataset.reveal = 'done';
    el.style.removeProperty('--reveal-delay');
    el.removeEventListener('animationend', done);
  };

  const reveal = (batch: HTMLElement[]) => {
    const arriving = batch
      .filter((el) => waiting.has(el))
      .map((el) => ({ el, top: el.getBoundingClientRect().top }))
      .sort((a, b) => a.top - b.top);
    arriving.forEach(({ el }, index) => {
      waiting.delete(el);
      observer.unobserve(el);
      const step = Math.min(index, MAX_STEPS);
      if (step > 0) el.style.setProperty('--reveal-delay', `${step * STEP_MS}ms`);
      el.addEventListener('animationend', done);
      el.dataset.reveal = 'in';
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      reveal(entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement));
    },
    { rootMargin: `0px 0px -${Math.round((1 - ENTER_LINE) * 100)}% 0px`, threshold: 0 },
  );

  for (const el of waiting) {
    if (!el.closest('[data-reveal-far]')) observer.observe(el);
  }

  /* The far sections: watch the section, and only start watching its
     items once the browser will have laid them out. */
  const near = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        near.unobserve(entry.target);
        far.get(entry.target)?.forEach((el) => {
          if (waiting.has(el)) observer.observe(el);
        });
        far.delete(entry.target);
      }
    },
    { rootMargin: '25% 0px 25% 0px', threshold: 0 },
  );
  far.forEach((_, section) => near.observe(section));

  /* The safety net: whatever is waiting and inside the viewport is shown,
     in order, with no help from the observer. Sections not yet near are
     left alone so the sweep never forces their layout. */
  const sweep = () => {
    if (waiting.size === 0) return;
    const onScreen: HTMLElement[] = [];
    for (const el of waiting) {
      const section = el.closest('[data-reveal-far]');
      if (section && far.has(section)) continue;
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) onScreen.push(el);
    }
    if (onScreen.length) reveal(onScreen);
  };

  const timer = window.setInterval(sweep, SWEEP_MS);
  const onShow = () => sweep();
  window.addEventListener('resize', onShow);
  window.addEventListener('pageshow', onShow);
  document.addEventListener('visibilitychange', onShow);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener('resize', onShow);
    window.removeEventListener('pageshow', onShow);
    document.removeEventListener('visibilitychange', onShow);
    observer.disconnect();
    near.disconnect();
    /* Leaving: whatever is still waiting on this document becomes plain
       again, so a kept element (the same page re-rendered) is never left
       hidden by a run that is no longer watching it. */
    for (const el of waiting) {
      el.dataset.reveal = '';
      el.style.removeProperty('--reveal-delay');
    }
    waiting.clear();
  };
}
