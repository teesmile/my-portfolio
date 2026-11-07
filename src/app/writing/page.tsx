import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { writing } from "@/config/writing";
import { portfolioConfig } from "@/config/site";
import TopicFilter from "@/features/writing/topic-filter";
import Reveals from "@/components/layout/reveals";

export const metadata: Metadata = pageMetadata({
  title: "Writing",
  description:
    "Short write-ups by a full-stack developer and AI evaluator on decisions made building things, and what each one cost.",
  path: "/writing",
});

export default function WritingPage() {
  return (
    <section className="px-6 py-20 md:py-24">
      <Reveals />
      <div className="mx-auto max-w-(--container-view)">
        <h1 data-reveal className="max-w-[20ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.writingHeading}
        </h1>
        <TopicFilter entries={writing} />
      </div>
    </section>
  );
}
