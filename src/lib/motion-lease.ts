/**
 * One moving thing on screen at a time.
 *
 * Ambient motion on the home page (the deck's auto-advance and the tools
 * row) asks for a lease before it runs. Each claimant has a fixed priority,
 * so the decision is the same however the two arrive: whichever higher-
 * priority claimant is visible owns the lease, and everything else holds
 * still until it lets go.
 *
 * This is a module-level store rather than React context because the two
 * claimants sit in different parts of the tree, one inside the hero's client
 * island and one in a server-rendered section near the footer, and neither
 * should re-render to learn about the other. Subscribers are called with the
 * current owner; they toggle a class or pause a tween, nothing more.
 */
type Listener = (owner: string | null) => void;

const PRIORITY: Record<string, number> = { deck: 3, renal: 2, tools: 1 };

const wanting = new Set<string>();
const listeners = new Set<Listener>();
let owner: string | null = null;

function decide() {
  let next: string | null = null;
  for (const id of wanting) {
    if (next === null || (PRIORITY[id] ?? 0) > (PRIORITY[next] ?? 0)) next = id;
  }
  if (next === owner) return;
  owner = next;
  listeners.forEach((listener) => listener(owner));
}

/** Say whether `id` currently wants to move (it is visible and allowed to). */
export function want(id: string, wants: boolean) {
  if (wants) wanting.add(id);
  else wanting.delete(id);
  decide();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(owner);
  return () => {
    listeners.delete(listener);
  };
}

/* The home page's one orchestrated moment is the hero entrance. Ambient
   motion waits for it: a deck counting down while the headline is still
   rising is two things moving at once, and the entrance is also where the
   page's heaviest main-thread work happens. The hero calls settle() when
   its entrance ends (or at once, if it has already played or is skipped). */
let settled = false;
const waiting = new Set<() => void>();

export function settle() {
  if (settled) return;
  settled = true;
  waiting.forEach((callback) => callback());
  waiting.clear();
}

/** Runs `callback` once the hero has settled. Returns a cancel function. */
export function whenSettled(callback: () => void) {
  if (settled) {
    callback();
    return () => {};
  }
  waiting.add(callback);
  return () => {
    waiting.delete(callback);
  };
}
