'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion';

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

export default function DeckInteractive({ cards }: { cards: Card[] }) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const container = useRef<HTMLDivElement>(null);
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
      .to(front, {
        xPercent: -130,
        rotate: -8,
        opacity: 0,
        duration: DURATION.base,
        ease: EASE.in,
      })
      /* Re-enter from the right, at the back, where a returning card belongs. */
      .set(front, { xPercent: 0, x: back.x + 40, y: back.y, rotate: back.rotate, zIndex: back.zIndex })
      .to(front, { x: back.x, opacity: back.opacity, duration: DURATION.base, ease: EASE.out });

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
          duration: DURATION.base,
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
          gsap.to(front, { ...slot(0), duration: DURATION.base, ease: EASE.out });
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
    <div>
      <div
        ref={container}
        className="relative h-[27rem] w-full overflow-x-clip [perspective:1200px] sm:h-[23rem]"
      >
        {cards.map((card, cardIndex) => {
          const position = order.indexOf(cardIndex);
          const isFront = position === 0;

          return (
            <article
              key={card.context}
              data-card={cardIndex}
              onClick={isFront ? advance : undefined}
              onKeyDown={
                isFront
                  ? (event) => {
                      if (['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                        event.preventDefault();
                        advance();
                      }
                    }
                  : undefined
              }
              tabIndex={isFront ? 0 : -1}
              role={isFront ? 'button' : undefined}
              aria-hidden={isFront ? undefined : true}
              aria-label={isFront ? `${card.context}. Show the next bug.` : undefined}
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

      <div className="mt-5 flex items-center gap-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {cards.map((card, index) => (
            <span
              key={card.context}
              className={`h-1 w-4 transition-colors ${
                index === order[0] ? 'bg-accent' : 'bg-line'
              }`}
            />
          ))}
        </div>
        <p className="text-2xs text-muted tabular-nums">
          {order[0] + 1} of {cards.length}
          <span className="ml-3 text-muted">&middot; tap, swipe or use the arrow keys</span>
        </p>
      </div>
    </div>
  );
}
