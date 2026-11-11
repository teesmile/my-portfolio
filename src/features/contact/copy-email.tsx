'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, MailIcon } from '@/components/ui/icons';

type State = 'idle' | 'copied' | 'failed';

/**
 * The address is a real mailto link first and a copy target second. That
 * ordering matters: the link works before JavaScript loads and when the
 * Clipboard API is unavailable or denied, which is the common case in an
 * embedded browser or over plain http. The button is an enhancement on top,
 * and it says so out loud when it cannot do its job.
 */
export default function CopyEmail({ email, children }: { email: string; children?: React.ReactNode }) {
  const [state, setState] = useState<State>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const announce = (next: State) => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      announce('copied');
    } catch {
      announce('failed');
    }
  };

  return (
    /* The actions sit on the address's line where there is room and wrap
       under it on a narrow phone, rather than squeezing the address. */
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line py-3 md:py-4">
      <span className="text-muted">
        {state === 'copied' ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <MailIcon className="h-4 w-4" />
        )}
      </span>

      <span className="min-w-0 flex-1 basis-48">
        <span className="block text-2xs text-muted">Email</span>
        <a
          href={`mailto:${email}`}
          className="block text-sm text-ink underline decoration-line underline-offset-[5px] transition-colors [overflow-wrap:anywhere] hover:text-accent"
        >
          {email}
        </a>
      </span>

      <span className="ml-7 flex shrink-0 items-center gap-2 sm:ml-0">
        <button
          type="button"
          onClick={copy}
          className="border border-line px-2.5 py-1 text-2xs text-muted transition-colors hover:border-ink hover:text-ink"
        >
          {state === 'copied' ? 'Copied' : 'Copy'}
        </button>
        {children}
      </span>

      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Email address copied' : ''}
        {state === 'failed' ? 'Could not copy. Use the email link instead.' : ''}
      </span>
    </div>
  );
}
