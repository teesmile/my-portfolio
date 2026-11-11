import Link from "next/link";
import type { Route } from "next";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The site's one button, in three forms.
 *
 *   primary    solid: the bright gold fill with dark text, for a page's main
 *              action. The edge is --accent, which in light mode is the deep
 *              amber, so the button keeps a visible outline against white.
 *   secondary  outlined in the accent, text in the accent, a faint accent
 *              tint on hover: every other action.
 *   icon       no edge, a square tap area (44px by default) that tints on
 *              hover: the theme switch, the menu, the footer's social marks.
 *
 * One radius (--radius-button), one type voice (the display face), and one
 * set of states everywhere: hover darkens or tints, press goes a step
 * further, and keyboard focus gets the site's ring (globals.css). Colours
 * come from the tokens, never typed here.
 */
export type ButtonVariant = "primary" | "secondary" | "icon";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-button border font-display font-medium leading-none no-underline transition-colors duration-(--duration-fast)";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "border-accent bg-accent-strong text-accent-ink hover:bg-accent-hover active:bg-accent-press",
  secondary: "border-accent bg-transparent text-accent hover:bg-accent-soft active:bg-accent-soft-press",
  icon: "border-transparent text-muted hover:bg-tint hover:text-ink active:bg-tint-press",
};

const SIZE: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-3.5 text-2xs",
};

const ICON_SIZE: Record<ButtonSize, string> = {
  md: "h-11 w-11",
  sm: "h-9 w-9",
};

/** The classes for a <button> or anything else that should look like one. */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return cn(BASE, VARIANT[variant], variant === "icon" ? ICON_SIZE[size] : SIZE[size], className);
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Opens in a new tab and says so to a screen reader. */
  external?: boolean;
  download?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children" | "download">;

/**
 * A link that looks like a button. Routes on this site go through next/link;
 * a download or another site is a plain anchor.
 */
export function ButtonLink({ href, variant, size, external, download, className, children, ...rest }: ButtonLinkProps) {
  const classes = buttonClass(variant, size, className);

  if (external || download || !href.startsWith("/")) {
    return (
      <a
        href={href}
        className={classes}
        {...(download ? { download: true } : {})}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={classes} {...rest}>
      {children}
    </Link>
  );
}
