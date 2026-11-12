import type { CSSProperties } from "react";
import { REVEAL } from "@/lib/motion";

/* The step between items of one list, written into the markup so a list
   on the first screen enters one item after another from first paint, with
   no JavaScript. On a client-side navigation the reveals (reveals.tsx)
   set their own steps for whatever arrives together. Capped, so a long
   list never waits on a long queue. */
const MAX_STEPS = 5;

export function stagger(index: number): CSSProperties {
  const step = Math.min(index, MAX_STEPS);
  return step === 0 ? {} : ({ "--reveal-delay": `${Math.round(step * REVEAL.stagger * 1000)}ms` } as CSSProperties);
}
