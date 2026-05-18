import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { portfolioConfig } from "@/config/site";

const profileImage = "/pfpnew.png";

function hasProfileImage() {
  return fs.existsSync(path.join(process.cwd(), "public", profileImage));
}

export default function AboutSection() {
  const showProfileImage = hasProfileImage();

  return (
    <section id="about" className="scroll-mt-24 bg-white px-6 py-24 dark:bg-[#1b1b1b]">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-full border border-violet-500/20">
          <div className="absolute inset-8 rounded-full border border-indigo-500/20" />
          <div className="relative h-80 w-80 overflow-hidden rounded-full border border-violet-400/25 bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] text-[#111111] shadow-2xl shadow-black/25">
            {showProfileImage ? (
              <Image
                src={profileImage}
                alt={`${portfolioConfig.name} portrait`}
                fill
                sizes="320px"
                className="object-cover"
                quality={100}
                unoptimized
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold">
                AU
              </div>
            )}
          </div>
          {["JS", "TS", "React", "CSS"].map((item, index) => (
            <span
              key={item}
              className={`absolute flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/30 bg-white text-xs font-bold text-violet-700 shadow-sm dark:bg-[#111111] dark:text-violet-300 ${
                index === 0
                  ? "right-8 top-12"
                  : index === 1
                    ? "bottom-10 right-14"
                    : index === 2
                      ? "bottom-16 left-4"
                      : "left-8 top-20"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            My bio
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white md:text-4xl">
            About <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">me.</span>
          </h2>
          <div className="mt-8 space-y-5 text-base leading-8 text-zinc-600 dark:text-zinc-300">
            <p>
              I am {portfolioConfig.name}, a frontend engineer focused on
              building product interfaces that feel refined, responsive, and
              reliable. My work sits at the intersection of UI execution,
              interaction design, and modern React architecture.
            </p>
            <p>
              I also bring AI training evaluation experience: reviewing
              model-generated code and written responses for correctness,
              instruction following, edge cases, clarity, and technical quality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
