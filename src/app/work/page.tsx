import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { portfolioConfig } from "@/config/site";
import WorkEntry from "@/features/work/work-entry";
import EvaluationEntry from "@/features/work/evaluation-entry";
import TechGlitch from "@/components/ui/tech-glitch";
import Reveals from "@/components/layout/reveals";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Full-stack builds in React, Next.js and TypeScript with the decisions behind them, and AI evaluation work in chemistry, biology and clinical pharmacy.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <section className="px-4 sm:px-6 py-20 md:py-24">
      <Reveals />
      <TechGlitch />
      <div className="mx-auto max-w-(--container-view)">
        <h1 data-reveal className="max-w-[18ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.workHeading}
        </h1>
        {/* The evaluation work leads, then projects strongest and newest
            first. See the Projects rule in the working rules. */}
        <div className="mt-16 flex flex-col gap-20">
          <EvaluationEntry />
          {portfolioConfig.projects.map((project, index) => (
            <WorkEntry key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
