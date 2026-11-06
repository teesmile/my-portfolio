'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import type { Project } from '@/config/site';
import { TechList } from '@/components/ui/tech';
import { captureFlip } from '@/lib/flip-state';

gsap.registerPlugin(Flip);

/* Three layouts, cycled. Asymmetry comes from the column span, not from the
   aspect ratio: captures are 1440x900, so every frame keeps 16:10 and nothing
   gets cropped out of the shot. */
const layouts = [
  { frame: "lg:col-span-7", body: "lg:col-span-5", ratio: "aspect-[16/10]" },
  { frame: "lg:col-span-5 lg:col-start-8", body: "lg:col-span-6 lg:row-start-1", ratio: "aspect-[16/10]" },
  { frame: "lg:col-span-9", body: "lg:col-span-3", ratio: "aspect-[16/10]" },
];

export default function WorkEntry({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const layout = layouts[index % layouts.length];
  const frameRef = useRef<HTMLDivElement>(null);

  /* Measured at click, used by the case study on arrival. If the reader has
     reduced motion on, nothing is captured and the next page simply renders. */
  const handoff = () => {
    if (
      !frameRef.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    captureFlip(`work-${project.slug}`, Flip.getState(frameRef.current));
  };

  return (
    <article className="grid gap-8 border-t border-line pt-10 lg:grid-cols-12 lg:gap-12">
      <Link
        href={`/work/${project.slug}`}
        onClick={handoff}
        className={`${layout.frame} group block`}
        aria-label={`Read the ${project.title} case study`}
      >
        <div
          ref={frameRef}
          data-flip-id={`work-${project.slug}`}
          className={`${layout.ratio} relative w-full overflow-hidden border border-line bg-raised`}
        >
          {project.preview ? (
            <Image
              src={project.preview}
              alt={project.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
          ) : (
            <span className="absolute inset-0 flex items-end p-6 font-display text-lg text-muted">
              {project.title}
            </span>
          )}
        </div>
      </Link>

      <div className={layout.body}>
        <p className="text-2xs text-muted">
          {project.year} &middot; {project.role}
        </p>
        <h2 className="mt-3 text-xl text-ink">
          <Link href={`/work/${project.slug}`} onClick={handoff} className="hover:text-accent">
            {project.title}
          </Link>
        </h2>
        <p className="mt-4 max-w-[46ch] text-sm text-muted">{project.description}</p>
        <div className="mt-5">
          <TechList items={project.tech} />
        </div>
        <Link
          href={`/work/${project.slug}`}
          onClick={handoff}
          className="mt-6 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
        >
          Case study
        </Link>
      </div>
    </article>
  );
}
