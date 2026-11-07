'use client';

import { useRef, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, STAGGER } from '@/lib/motion';
import { MoonIcon, SunIcon } from '@/components/ui/icons';

const ZONE = 'Africa/Lagos';

function readClock() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '00';

  const hour = Number(value('hour'));

  return {
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
    isDay: hour >= 6 && hour < 18,
  };
}

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
};

/* Seconds since the epoch: stable within a tick, so React only re-renders
   when the displayed value can actually change. */
const getSnapshot = () => Math.floor(Date.now() / 1000);

/* The server has no "now" that will still be true when the page is opened —
   /contact is prerendered, so build-time digits would be hours stale. The
   sentinel renders a placeholder instead, and because useSyncExternalStore
   uses this same value during hydration, server and client markup match by
   construction rather than by suppressing the warning. */
const getServerSnapshot = () => 0;

const digit = 'text-[clamp(3.5rem,10vw,5.5rem)] leading-none';

export default function LocalClock() {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const clock = tick === 0 ? null : readClock();
  const scope = useRef<HTMLDivElement>(null);
  const arrived = useRef(false);

  /* The digits settle into place once, on the first real time. The guard
     matters because this component re-renders every second: without it the
     entrance would replay on every tick, which is a clock having a seizure
     rather than a clock. */
  useGSAP(
    () => {
      if (!clock || arrived.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        arrived.current = true;
        return;
      }

      arrived.current = true;

      gsap.from(scope.current!.querySelectorAll('[data-digit]'), {
        yPercent: 35,
        opacity: 0,
        duration: DURATION.base,
        ease: EASE.out,
        stagger: STAGGER.tight,
      });
    },
    { scope, dependencies: [clock !== null] },
  );

  return (
    <div ref={scope}>
      <div className="flex items-baseline gap-1 font-display tabular-nums text-ink">
        <span data-digit className={digit}>{clock ? clock.hour : '--'}</span>
        <span data-digit className={`${digit} text-muted`}>:</span>
        <span data-digit className={digit}>{clock ? clock.minute : '--'}</span>
        <span data-digit className="ml-1 text-lg leading-none text-muted">
          {clock ? clock.second : '--'}
        </span>
      </div>

      <p className="mt-4 flex items-center gap-2 text-2xs text-muted">
        {clock ? (
          <>
            {clock.isDay ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
            {clock.isDay ? 'Daytime' : 'Night'} in Lagos
          </>
        ) : (
          <span className="h-4">Local time in Lagos</span>
        )}
      </p>
    </div>
  );
}
