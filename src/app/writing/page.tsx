import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { published } from "@/config/writing";
import { portfolioConfig } from "@/config/site";
import TopicFilter from "@/features/writing/topic-filter";
import Reveals from "@/components/layout/reveals";

export const metadata: Metadata = pageMetadata({
  title: "Writing: web engineering and AI evaluation",
  description:
    "Write-ups by a full-stack developer and AI evaluator: decisions from real projects, what each one cost, and how to check what AI gets wrong.",
  path: "/writing",
});

export default function WritingPage() {
  return (
    <section className="px-4 sm:px-6 py-20 md:py-24">
      <Reveals />
      <div className="mx-auto max-w-(--container-view)">
        <h1 data-reveal className="max-w-[20ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.writingHeading}
        </h1>
        <TopicFilter entries={published} />
      </div>
    </section>
  );
}
