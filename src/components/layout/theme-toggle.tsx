'use client';

import { buttonClass } from '@/components/ui/button';

/* No React state and no context: the class on <html> is the source of truth,
   and CSS picks the icon. That keeps server and client markup identical, which
   is what removes the whole hydration-mismatch class of bug from theming. */
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const nowLight = root.classList.toggle('light');
    try {
      localStorage.setItem('theme', nowLight ? 'light' : 'dark');
    } catch {
      /* private mode, storage blocked: the toggle still works for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark"
      className={buttonClass('icon')}
    >
      <svg
        className="block light:hidden"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
      </svg>
      <svg
        className="hidden light:block"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.8 6.8 0 0 0 10 10z" />
      </svg>
    </button>
  );
}
