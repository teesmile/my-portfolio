import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Archive",
  description:
    "Every other project by a full-stack developer and AI evaluator, including the training work.",
  path: "/work/archive",
});

export default function ArchivePage() {
  return (
    <section className="px-4 sm:px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-view)">
        <Link
          href="/work"
          className="text-2xs text-muted transition-colors hover:text-ink"
        >
          &larr; Work
        </Link>

        <h1 className="mt-8 max-w-[20ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.archiveHeading}
        </h1>

        <table className="mt-12 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-2xs text-muted">
              <th scope="col" className="py-3 pr-6 font-normal">Year</th>
              <th scope="col" className="py-3 pr-6 font-normal">Project</th>
              <th scope="col" className="py-3 pr-6 font-normal">Stack</th>
              <th scope="col" className="py-3 font-normal">Link</th>
            </tr>
          </thead>
          <tbody>
            {portfolioConfig.archive.map((item) => (
              <tr key={item.title} className="border-b border-line align-top text-sm">
                <td className="py-4 pr-6 text-2xs text-muted tabular-nums">
                  {item.year}
                </td>
                <td className="py-4 pr-6 text-ink">
                  {item.title}
                  {item.training ? (
                    <span className="ml-3 text-2xs text-muted">training</span>
                  ) : null}
                </td>
                <td className="py-4 pr-6 text-2xs text-muted">
                  {item.stack.join(", ")}
                </td>
                <td className="py-4 text-2xs">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline decoration-accent/40 underline-offset-[6px]"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-muted">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
