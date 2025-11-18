import Hero from "@/features/landing/hero";
import ProjectsSection from "@/features/projects/projects-section";
import Image from "next/image";

export default function Home() {
   return (
    <main className="flex flex-col">
      <Hero />
      <ProjectsSection />
    </main>
  );
}
