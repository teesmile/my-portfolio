import Link from "next/link";
import type { Route } from "next";
import { ChevronLeftIcon } from "./icons";

/**
 * The site's one back control: "All work", "All writing", "Renal dose check".
 *
 * The same radius as every other button. Amber outline and amber text at
 * rest; filled with the bright amber and
 * dark text on hover, keyboard focus and press, with the site's focus ring
 * outside it. Measured: amber text on the surface is 10.4:1 dark, 6.6:1
 * light; dark text on the amber fill is 10.4:1 in both themes. In light mode
 * the border stays the deep amber when filled, so the pill's edge keeps
 * 6.6:1 against white instead of the fill's 1.8:1.
 */
export default function BackPill({ href, label, className = "" }: { href: Route; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-button border border-accent bg-surface/70 py-1.5 pl-2 pr-3.5 text-2xs text-accent transition-colors hover:bg-accent-strong hover:text-accent-ink focus-visible:bg-accent-strong focus-visible:text-accent-ink active:bg-accent-strong active:text-accent-ink ${className}`}
    >
      <ChevronLeftIcon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
