import type { Flip } from 'gsap/Flip';

type FlipState = ReturnType<typeof Flip.getState>;

/**
 * A one-slot handoff between two routes.
 *
 * The card that starts the transition unmounts the moment navigation
 * happens, so its measured position has to outlive it. Flip matches elements
 * by `data-flip-id`, which means the arriving hero can finish an animation
 * the departing card began. Module scope rather than context: this is not
 * state anything renders from, and putting it in context would re-render two
 * trees to pass a value that only one effect ever reads.
 *
 * The slot is cleared on read, and on any read that does not match, so a
 * stale capture cannot animate an unrelated page later.
 */
let pending: { id: string; state: FlipState } | null = null;

export function captureFlip(id: string, state: FlipState) {
  pending = { id, state };
}

export function takeFlip(id: string): FlipState | null {
  const match = pending?.id === id ? pending.state : null;
  pending = null;
  return match;
}
