import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { portfolioConfig } from "@/config/site";
import WorkEntry from "@/features/work/work-entry";
import EvaluationEntry from "@/features/work/evaluation-entry";
import TechGlitch from "@/components/ui/tech-glitch";
import Reveals from "@/components/layout/reveals";

export const metadata: Metadata = pageMetadata({
  title: "Full-stack projects and AI evaluation",
  description:
    "Case studies from a full-stack developer: a voter information site for Nigeria's 2027 elections, an offline-first app with sync, and an AI-agent benchmark.",
  path: "/work",
});

export default function WorkPage() {
  const [lead, ...rest] = portfolioConfig.projects;
  return (
    <section className="px-4 sm:px-6 py-20 md:py-24">
      <Reveals />
      <TechGlitch />
      <div className="mx-auto max-w-(--container-view)">
        <h1 data-reveal="load" className="max-w-[18ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.workHeading}
        </h1>
        {/* The lead project first, then the evaluation work, then the rest
            strongest and newest first. The lead keeps index 0, so its frame
            is the one fetched eagerly as the page's largest paint. */}
        <div className="mt-16 flex flex-col gap-20">
          {lead ? <WorkEntry project={lead} index={0} /> : null}
          <EvaluationEntry />
          {rest.map((project, index) => (
            <WorkEntry key={project.slug} project={project} index={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
