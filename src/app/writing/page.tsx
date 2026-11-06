import type { Metadata } from "next";
import Link from "next/link";
import { writing, readingTime } from "@/config/writing";
import { portfolioConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Writing",
  description: "Short write-ups on decisions I made building things.",
};

export default function WritingPage() {
  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-view)">
        <h1 className="max-w-[20ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.writingHeading}
        </h1>

        <div className="mt-14 flex flex-col">
          {writing.map((entry) => (
            <article key={entry.slug} className="border-t border-line py-8">
              <p className="text-2xs text-muted tabular-nums">
                {entry.date} &middot; {readingTime(entry)} min read
              </p>
              <h2 className="mt-2 text-lg text-ink">
                <Link
                  href={`/writing/${entry.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {entry.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-(--container-reading) text-sm text-muted">
                {entry.standfirst}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
