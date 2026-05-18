import AboutSection from "@/features/about/about-section";
import ContactSection from "@/features/contact/contact-section";
import Hero from "@/features/landing/hero";
import ProjectsSection from "@/features/projects/projects-section";
import ServicesSection from "@/features/services/services-section";
import SkillsSection from "@/features/skills/skills-section";

export default function Home() {
   return (
    <main className="flex flex-col">
      <Hero />
      <ServicesSection />
      <ProjectsSection />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}
