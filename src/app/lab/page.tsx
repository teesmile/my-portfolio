import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Lab",
  description:
    "Small interaction experiments, one at a time.",
  path: "/lab",
  noindex: true,
});

/* Deliberately not in the nav until it holds its first experiment: a link to an
   empty page costs more than the page is worth. */
export default function LabPage() {
  return (
    <section className="flex flex-1 items-center px-6 py-20">
      <div className="mx-auto w-full max-w-(--container-view)">
        <h1 className="max-w-[18ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.labHeading}
        </h1>
        <p className="mt-8 max-w-(--container-reading) text-base text-muted">
          {portfolioConfig.copy.labIntro}
        </p>

        <ul className="mt-12 flex flex-col">
          <li className="border-t border-line py-6">
            <h2 className="text-lg text-ink">
              <Link
                href="/lab/type"
                className="transition-colors hover:text-accent"
              >
                Hero type specimen
              </Link>
            </h2>
            <p className="mt-2 max-w-(--container-reading) text-sm text-muted">
              Four typefaces, two line-heights, five sizes, both themes. The
              page counts its own rendered lines and reports which combination
              passes, so the choice is a measurement rather than a preference.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
