'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion';
import { subscribe, want, whenSettled } from '@/lib/motion-lease';

gsap.registerPlugin(Observer, useGSAP);

type Card = { context: string; verdict: string; html: string };

/** How far back a card sits at depth n. Only the top few are worth drawing. */
const slot = (index: number) => ({
  x: index * 8,
  y: index * 12,
  rotate: index * 1.4,
  zIndex: 60 - index,
  opacity: index > 3 ? 0 : 1,
});

/** Past this fraction of the card's width, a drag becomes a dismissal. */
const DRAG_RATIO = 0.25;
const FLICK_VELOCITY = 450;
/* The deck's first move comes 3s after the hero entrance settles, then
   every 4s: --deck-dwell in globals.css, set per lap below. */
const FIRST_DWELL = '3s';
const DWELL = '4s';
/** Slide out, slide in, and the stack closing up behind: quick, so an
 *  automatic move never feels like a wait. */
const SLIDE = 0.35;

export default function DeckInteractive({ cards }: { cards: Card[] }) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const container = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const auto = useRef<{ restart: () => void } | null>(null);
  const placed = useRef(false);
  const flying = useRef<HTMLElement | null>(null);
  const highlighted = useRef<Element | null>(null);
  const busy = useRef(false);

  const nodes = () =>
    Array.from(
      container.current?.querySelectorAll<HTMLElement>('[data-card]') ?? [],
    );

  const frontNode = () =>
    nodes().find((node) => Number(node.dataset.card) === order[0]) ?? null;

  /**
   * Advancing is travel, not a shuffle: the card you have read leaves to
   * the left and the next one arrives from behind on the right. A card that
   * simply swapped z-index would read as a glitch, because nothing in the
   * physical world reorders itself without moving.
   *
   * The outgoing card is excluded from the normal placement pass while it is
   * in flight — otherwise two tweens would own its transform at once — and
   * it is re-seated at the back of the stack once it is off screen.
   */
  const advance = () => {
    if (busy.current) return;

    const front = frontNode();
    if (!front) return;

    if (prefersReducedMotion()) {
      setOrder((current) => [...current.slice(1), current[0]]);
      return;
    }

    busy.current = true;
    flying.current = front;
    const back = slot(cards.length - 1);

    gsap
      .timeline({
        onComplete: () => {
          flying.current = null;
          busy.current = false;
        },
      })
      .set(front, { zIndex: 70 })
      /* inOut rather than in: the card eases off its spot instead of
         lurching, which matters now that the deck also moves on its own and
         the reader did not cause the departure. */
      .to(front, {
        xPercent: -120,
        rotate: -6,
        opacity: 0,
        duration: SLIDE,
        ease: EASE.inOut,
      })
      /* Re-enter from the right, at the back, where a returning card belongs. */
      .set(front, { xPercent: 0, x: back.x + 40, y: back.y, rotate: back.rotate, zIndex: back.zIndex })
      .to(front, { x: back.x, opacity: back.opacity, duration: SLIDE, ease: EASE.out });

    setOrder((current) => [...current.slice(1), current[0]]);
  };

  /* Every card tweens to the slot it now occupies. The slots are a pure
     function of position, so no layout measurement is needed — which is why
     this is not Flip. See docs/decisions.md. */
  useGSAP(
    () => {
      const first = !placed.current;
      placed.current = true;

      nodes().forEach((node) => {
        if (node === flying.current) return;

        const position = order.indexOf(Number(node.dataset.card));
        const target = slot(position);
        const body = node.querySelector('[data-body]');
        const visible = position === 0 ? 1 : 0;

        if (first || prefersReducedMotion()) {
          gsap.set(node, { ...target, xPercent: 0 });
          if (body) gsap.set(body, { opacity: visible });
          return;
        }

        gsap.to(node, {
          ...target,
          xPercent: 0,
          duration: SLIDE,
          ease: EASE.inOut,
          overwrite: 'auto',
        });

        if (body) {
          gsap.to(body, {
            opacity: visible,
            duration: visible ? 0.3 : 0.15,
            delay: visible ? 0.18 : 0,
            ease: EASE.out,
            overwrite: 'auto',
          });
        }
      });
    },
    { dependencies: [order] },
  );

  /* The observer is created once and reads the current handlers through a
     ref: rebuilding it on every reorder would tear down and re-attach the
     touch listeners mid-gesture. */
  const latest = useRef({ advance, frontNode });
  useEffect(() => {
    latest.current = { advance, frontNode };
  });

  /**
   * Auto-advance, with the progress fill as the timer.
   *
   * The fill under the current card runs a 5s CSS animation on its
   * transform, and its animationend advances the deck. Pausing the timer and
   * freezing the indicator are then the same thing — animation-play-state —
   * so the two can never disagree about how long is left. CSS rather than a
   * GSAP tween because a tween ticks on the main thread every frame for as
   * long as the page is open; a transform animation runs on the compositor.
   * Measured: the tween version cost ~60ms of Total Blocking Time on a 4x
   * throttled load, and doubled main-thread work while idle.
   *
   * It runs only when every condition holds: the hero entrance has
   * finished (the page's one orchestrated moment plays alone), the deck is
   * on screen, it owns
   * the motion lease, the tab is visible, and nobody is touching it. Hover
   * and focus are held states, released when the pointer or focus leaves.
   * A touch holds until the finger lifts. A key press anywhere restarts the
   * count, so someone reading with the keyboard is never moved on mid-read.
   * Every release restarts from zero rather than resuming, so the card
   * never leaves the instant a reader looks away.
   *
   * Everything lives inside gsap.matchMedia: under reduced motion none of it
   * exists, data-auto never appears, and the current mark is simply solid.
   */
  useEffect(() => {
    const element = root.current;
    const stack = container.current;
    if (!element || !stack) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const state = { settled: false, visible: false, owned: false, hover: false, focus: false, touch: false };
      /* Two identical keyframes, alternated: changing animation-name restarts
         an animation without the forced reflow a remove-and-re-add needs. */
      let lap: 'a' | 'b' = 'a';

      const running = () =>
        state.settled &&
        state.visible && state.owned && !state.hover && !state.focus && !state.touch && !document.hidden;

      const sync = () => element.toggleAttribute('data-paused', !running());

      /* 3s for the first lap after the hero settles, 4s for every lap
         after it, including any restart a reader causes. */
      let firstLap = true;
      const restart = () => {
        element.style.setProperty('--deck-dwell', firstLap ? FIRST_DWELL : DWELL);
        lap = lap === 'a' ? 'b' : 'a';
        element.dataset.lap = lap;
        sync();
      };

      const finished = (event: AnimationEvent) => {
        if (!event.animationName.startsWith('deck-dwell')) return;
        firstLap = false;
        /* Mid-gesture or mid-flight: count again rather than skip. */
        if (busy.current) restart();
        else latest.current.advance();
      };

      const hold = (key: 'hover' | 'focus' | 'touch', on: boolean) => {
        state[key] = on;
        if (!on) firstLap = false;
        if (on) sync();
        else restart();
      };

      const enter = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') hold('hover', true);
      };
      const leave = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') hold('hover', false);
      };
      const down = (event: PointerEvent) => {
        if (event.pointerType === 'touch') hold('touch', true);
      };
      const up = (event: PointerEvent) => {
        if (event.pointerType === 'touch' && state.touch) hold('touch', false);
      };
      const focusIn = () => hold('focus', true);
      const focusOut = (event: FocusEvent) => {
        if (!element.contains(event.relatedTarget as Node | null)) hold('focus', false);
      };
      const key = () => {
        firstLap = false;
        restart();
      };

      element.addEventListener('animationend', finished);
      element.addEventListener('pointerenter', enter);
      element.addEventListener('pointerleave', leave);
      element.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      element.addEventListener('focusin', focusIn);
      element.addEventListener('focusout', focusOut);
      window.addEventListener('keydown', key);
      document.addEventListener('visibilitychange', sync);

      const observer = new IntersectionObserver(
        ([entry]) => {
          state.visible = entry.isIntersecting;
          want('deck', state.visible);
          sync();
        },
        { threshold: 0.6 },
      );
      observer.observe(stack);

      const unsubscribe = subscribe((owner) => {
        state.owned = owner === 'deck';
        sync();
      });

      element.setAttribute('data-auto', '');
      auto.current = { restart };
      restart();

      /* The count starts once the hero entrance has finished, or after 4s
         if it never reports (fonts that never resolve, for instance). */
      const begin = () => {
        if (state.settled) return;
        state.settled = true;
        restart();
      };
      const cancelSettled = whenSettled(begin);
      const fallback = window.setTimeout(begin, 4000);

      return () => {
        cancelSettled();
        window.clearTimeout(fallback);
        auto.current = null;
        element.removeAttribute('data-auto');
        element.removeAttribute('data-paused');
        delete element.dataset.lap;
        observer.disconnect();
        unsubscribe();
        want('deck', false);
        element.removeEventListener('animationend', finished);
        element.removeEventListener('pointerenter', enter);
        element.removeEventListener('pointerleave', leave);
        element.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        element.removeEventListener('focusin', focusIn);
        element.removeEventListener('focusout', focusOut);
        window.removeEventListener('keydown', key);
        document.removeEventListener('visibilitychange', sync);
      };
    });

    return () => mm.revert();
  }, []);

  /* A new front card, however it got there, starts a fresh count. */
  useEffect(() => {
    auto.current?.restart();
  }, [order]);

  /* Touch: the card follows the finger, then either leaves or springs back.
     A threshold on distance alone punishes a fast flick, and velocity alone
     punishes a slow deliberate push, so both count. */
  useEffect(() => {
    if (!container.current || prefersReducedMotion()) return;

    const observer = Observer.create({
      target: container.current,
      type: 'touch,pointer',
      dragMinimum: 6,
      onDrag: (self) => {
        const front = latest.current.frontNode();
        if (!front || busy.current) return;
        gsap.set(front, { x: self.deltaX + Number(gsap.getProperty(front, 'x')), rotate: self.deltaX * 0.04 });
      },
      onDragEnd: (self) => {
        const front = latest.current.frontNode();
        if (!front || busy.current) return;

        const width = front.getBoundingClientRect().width || 1;
        const dragged = Number(gsap.getProperty(front, 'x'));
        const far = Math.abs(dragged) > width * DRAG_RATIO;
        const fast = Math.abs(self.velocityX) > FLICK_VELOCITY;

        if (far || fast) {
          latest.current.advance();
        } else {
          gsap.to(front, { ...slot(0), duration: SLIDE, ease: EASE.out });
        }
      },
    });

    return () => observer.kill();
  }, []);

  /* Tilt toward the cursor and raise the line underneath it. */
  useGSAP(
    () => {
      const front = frontNode();
      if (!front || prefersReducedMotion()) return;

      const rotateX = gsap.quickTo(front, 'rotationX', { duration: DURATION.track, ease: EASE.out });
      const rotateY = gsap.quickTo(front, 'rotationY', { duration: DURATION.track, ease: EASE.out });

      const move = (event: PointerEvent) => {
        if (busy.current) return;
        const bounds = front.getBoundingClientRect();
        rotateX(-((event.clientY - bounds.top) / bounds.height - 0.5) * 5);
        rotateY(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);

        const line = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest('.line');

        if (line !== highlighted.current) {
          highlighted.current?.classList.remove('line-hover');
          line?.classList.add('line-hover');
          highlighted.current = line ?? null;
        }
      };

      const leave = () => {
        rotateX(0);
        rotateY(0);
        highlighted.current?.classList.remove('line-hover');
        highlighted.current = null;
      };

      front.addEventListener('pointermove', move);
      front.addEventListener('pointerleave', leave);

      return () => {
        front.removeEventListener('pointermove', move);
        front.removeEventListener('pointerleave', leave);
        leave();
      };
    },
    { dependencies: [order] },
  );

  return (
    <div ref={root}>
      {/* The progress bar, above the deck and as wide as it. With
          auto-advance it is the clock: its fill runs across over the dwell
          and its animationend moves the deck. Without auto-advance (reduced
          motion, no JavaScript) it shows position instead: filled to the
          current card's share of the deck. */}
      <div aria-hidden="true" className="relative mb-4 h-1 w-full overflow-hidden bg-line">
        <span
          data-fill
          className="absolute inset-0 origin-left bg-accent"
          style={{ '--deck-pos': (order[0] + 1) / cards.length } as React.CSSProperties}
        />
      </div>
      <div
        ref={container}
        className="relative h-[27rem] w-full overflow-x-clip [perspective:1200px] sm:h-[23rem]"
      >
        {cards.map((card, cardIndex) => {
          const position = order.indexOf(cardIndex);
          const isFront = position === 0;

          return (
            /* The card is content, not a control. It used to be a
               role="button" with an aria-label, and the label replaced
               everything inside it: a screen reader heard the card's title
               and never the code or the verdict. The pointer still taps the
               card; keyboard and assistive tech use the button below.
               Cards behind the front one are inert — out of the focus order
               and the accessibility tree together. */
            <article
              key={card.context}
              data-card={cardIndex}
              onClick={isFront ? advance : undefined}
              aria-hidden={isFront ? undefined : true}
              inert={!isFront}
              className="absolute inset-x-0 top-0 h-full origin-top-left cursor-pointer touch-pan-y overflow-hidden border border-line bg-raised p-5 [transform-style:preserve-3d]"
            >
              <div data-body>
                <p className="font-display text-2xs text-muted">{card.context}</p>

                <div
                  className="mt-4 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: card.html }}
                />

                <p className="mt-4 max-w-[54ch] text-xs text-muted">
                  <span className="font-display text-ink">What breaks: </span>
                  {card.verdict}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Clear of the stack. The cards behind sit lower and rotate about
          their top-left corner, so their far corner hangs below the deck's
          box: measured 59-61px on a phone and up to 84px at tablet width.
          The old 20px gap left the counter and "Next bug" underneath them. */}
      <div className="mt-[4.75rem] flex items-center gap-3 md:mt-[6.5rem]">
        <p aria-live="polite" className="text-2xs text-muted tabular-nums">
          {order[0] + 1} of {cards.length}
          <span className="sr-only">: {cards[order[0]].context}</span>
        </p>
        <button
          type="button"
          onClick={advance}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              advance();
            }
          }}
          className="ml-auto border border-line px-3 py-1.5 text-2xs text-ink transition-colors hover:border-ink"
        >
          Next bug
        </button>
      </div>
    </div>
  );
}
