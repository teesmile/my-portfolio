import { findTrap, renalTraps } from "@/content/renal-dosing";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "A trap from the renal dose check, a clinical AI-agent benchmark - Anthony Ugwuja";
export const size = shareImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return renalTraps.map((trap) => ({ trap: trap.slug }));
}

/* One card per trap: its name, and which benchmark it belongs to. */
export default async function Image({ params }: { params: Promise<{ trap: string }> }) {
  const trap = findTrap((await params).trap);

  return renderShareImage({
    title: trap?.name ?? "Renal dose check",
    kicker: trap ? `${trap.kind === "trap" ? "Trap" : "Valid look-alike"} · renal dose check` : "Clinical AI-agent benchmark",
  });
}
