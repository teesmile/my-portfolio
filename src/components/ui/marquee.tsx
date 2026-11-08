/**
 * A drifting row: the content twice, translated by half the track, so the
 * second copy runs into the place the first started and the loop has no seam.
 *
 * CSS rather than a tween (see .marquee-track in globals.css): a row that
 * runs for as long as the page is open should cost the compositor a
 * transform per frame and the main thread nothing. Hover and keyboard focus
 * pause it; under reduced motion it stops, wraps, and drops the copy.
 *
 * Shared by the stack rows on /about and the tools row on /.
 */
export default function Marquee({
  duration,
  reverse = false,
  gap,
  children,
}: {
  duration: string;
  reverse?: boolean;
  /** Must match the gap between items, or the seam shows where the copies meet. */
  gap?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="marquee min-w-0 flex-1 overflow-x-clip">
      <div
        className="marquee-track"
        style={
          {
            "--marquee-duration": duration,
            "--marquee-from": reverse ? "-50%" : "0%",
            "--marquee-to": reverse ? "0%" : "-50%",
            ...(gap ? { "--marquee-gap": gap } : {}),
          } as React.CSSProperties
        }
      >
        {children}
        {/* The second copy exists only so the loop has something to run
            into; a screen reader should hear the list once. */}
        <div aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
