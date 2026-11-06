'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Observer, useGSAP);

type Card = { context: string; verdict: string; html: string };

/* Where a card sits once it is in slot n. Slot 0 is the one you read.
   GSAP owns these transforms, not React: if both wrote to style.transform the
   two would overwrite each other mid-tween. React owns order and z-index. */
const slot = (index: number) => ({
  x: index * 8,
  y: index * 12,
  rotate: index * 1.4,
});

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function DeckInteractive({ cards }: { cards: Card[] }) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const container = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  const highlighted = useRef<Element | null>(null);

  const advance = () => {
    setOrder((current) => [...current.slice(1), current[0]]);
  };

  /**
   * Each card tweens to the slot it now occupies.
   *
   * Flip was the obvious tool and measurably the wrong one here: it reads
   * layout for every card before animating, which cost a 33.4ms frame at 4x
   * CPU throttle against a 16.8ms control. Flip earns that cost when the
   * start and end geometry are unknown — the case-study hero, where the
   * element lives on another route. In this deck the slots are a pure
   * function of position, so the start and end transforms are already known
   * and the measurement pass buys nothing.
   */
  useGSAP(
    () => {
      const nodes = container.current?.querySelectorAll<HTMLElement>('[data-card]');
      if (!nodes) return;

      const first = !placed.current;
      placed.current = true;

      nodes.forEach((node) => {
        const cardIndex = Number(node.dataset.card);
        const position = order.indexOf(cardIndex);
        const target = slot(position);

        if (first || reduced()) {
          gsap.set(node, target);
          return;
        }

        gsap.to(node, { ...target, duration: 0.5, ease: 'power2.inOut', overwrite: 'auto' });
      });
    },
    { dependencies: [order] },
  );

  /* Swipe on touch, which is the gesture a stack of cards already implies.
     Observer handles the pointer maths and the thresholds. */
  useEffect(() => {
    if (!container.current || reduced()) return;

    const observer = Observer.create({
      target: container.current,
      type: 'touch',
      onLeft: advance,
      onRight: advance,
      tolerance: 24,
    });

    return () => observer.kill();
  }, []);

  /* Tilt toward the cursor, and raise the code line underneath it. The card
     reacts to where you are reading, not merely that you are there. */
  useGSAP(
    () => {
      if (!container.current || reduced()) return;

      const front = container.current.querySelector<HTMLElement>('[data-front]');
      if (!front) return;

      const rotateX = gsap.quickTo(front, 'rotationX', { duration: 0.4, ease: 'power2.out' });
      const rotateY = gsap.quickTo(front, 'rotationY', { duration: 0.4, ease: 'power2.out' });

      const move = (event: PointerEvent) => {
        const bounds = front.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        rotateX(-y * 5);
        rotateY(x * 5);

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
    <div
      ref={container}
      className="relative h-[27rem] w-full [perspective:1200px] sm:h-[23rem]"
    >
      {order.map((cardIndex, position) => {
        const card = cards[cardIndex];
        const isFront = position === 0;

        return (
          <article
            key={card.context}
            data-card={cardIndex}
            data-front={isFront ? '' : undefined}
            style={{ zIndex: 40 - position * 10 }}
            onClick={isFront ? advance : undefined}
            onKeyDown={
              isFront
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      advance();
                    }
                  }
                : undefined
            }
            tabIndex={isFront ? 0 : -1}
            role={isFront ? 'button' : undefined}
            aria-label={isFront ? `${card.context}. Show the next bug.` : undefined}
            className="absolute inset-x-0 top-0 h-full origin-top-left cursor-pointer overflow-hidden border border-line bg-raised p-5 [transform-style:preserve-3d]"
          >
            <p className="font-display text-2xs text-muted">{card.context}</p>

            <div
              className="mt-4 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: card.html }}
            />

            <p className="mt-4 max-w-[54ch] text-xs text-muted">
              <span className="font-display text-ink">What breaks: </span>
              {card.verdict}
            </p>
          </article>
        );
      })}
    </div>
  );
}
