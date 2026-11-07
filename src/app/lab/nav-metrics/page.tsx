import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import NavMetrics from "./measure";

export const metadata: Metadata = pageMetadata({
  title: "Nav metrics",
  description:
    "Proving the active state cannot move anything.",
  path: "/lab/nav-metrics",
  noindex: true,
});

export default function NavMetricsPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-(--container-view)">
        <h1 className="text-xl text-ink">Nav active state, measured</h1>
        <p className="mt-3 max-w-(--container-reading) text-sm text-muted">
          The active state may change colour and underline colour only. Anything
          that touches weight, width or tracking moves the tabs when you click
          them. This renders the real class strings in both states and compares
          every item&rsquo;s position and width.
        </p>
        <NavMetrics />
      </div>
    </section>
  );
}
