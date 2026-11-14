import { portfolioConfig } from "@/config/site";
import { SITE_URL } from "@/config/site-url";

/**
 * Structured data, defined once.
 *
 * The person is described in full once and given an `@id`. Every other
 * page refers to that id rather than restating a smaller, nameless Person:
 * a crawler then reads one identity across the site, with one set of
 * credentials and one set of profiles, instead of a different author on
 * every article.
 */
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const personRef = { "@id": PERSON_ID } as const;

export const personJsonLd = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: portfolioConfig.name,
  url: SITE_URL,
  image: `${SITE_URL}/portrait-clean-v2.webp`,
  jobTitle: "Full-stack developer and AI evaluator",
  description: portfolioConfig.seo.description,
  knowsAbout: [
    "Full-stack web development",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Offline-first web apps",
    "Web performance",
    "LLM evaluation",
    "AI agent benchmarks",
    "Clinical pharmacy",
  ],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Nigeria, Nsukka" },
    { "@type": "EducationalOrganization", name: "AltSchool Africa" },
  ],
  /* The same credentials the resume lists, with the body that awards each. */
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "Bachelor of Pharmacy (B.Pharm)",
      recognizedBy: { "@type": "CollegeOrUniversity", name: "University of Nigeria, Nsukka" },
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "Pharmacist",
      recognizedBy: { "@type": "Organization", name: "Pharmacy Council of Nigeria" },
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "diploma",
      name: "Diploma in Frontend Engineering",
      recognizedBy: { "@type": "EducationalOrganization", name: "AltSchool Africa" },
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certificate",
      name: "AI Fluency Framework",
      recognizedBy: { "@type": "Organization", name: "Anthropic" },
    },
  ],
  sameAs: [...portfolioConfig.socials.map((social) => social.url), ...portfolioConfig.profiles],
};

export const websiteJsonLd = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: portfolioConfig.name,
  publisher: personRef,
};

/** Home › … › this page. `path` relative, as the routes are. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/** One script tag's worth: several nodes in a single @graph. */
export function graph(...nodes: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}
