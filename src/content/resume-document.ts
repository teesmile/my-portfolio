import { resumeContent, resumeFor, type ContactItem, type Variant } from './resume';

/**
 * A resume as a document: a header and an ordered list of typed sections.
 *
 * The public versions are built from resume.ts by `documentFor`. A private
 * version (a CV kept off the site, or a copy tailored to one job) is the same
 * shape saved as JSON outside the repo, and `pnpm resume --document <file>`
 * prints it through the same renderer. One renderer is what keeps every
 * copy looking and extracting the same way; only the content differs.
 *
 * Text may mark an italic span with asterisks (`*Escherichia coli*`), for
 * species names in citations. Nothing else is markup.
 */
export type DocRole = {
  title: string;
  /** Employer, location and dates, one per line. More than one for a
   *  combined entry (two placements under one title). */
  sites: { company: string; location: string; period: string }[];
  note?: string;
  bullets: string[];
};

export type DocProject = { name: string; line: string; caseStudy?: string; url?: string };

/** A qualification, credential or similar: a title, then one fact per line. */
export type DocEntry = { title: string; lines: string[] };

/** A closing line under a section: an optional muted label, then text. */
export type DocLine = { label?: string; text: string };

export type DocSection =
  | { kind: 'paragraphs'; heading: string; paragraphs: string[] }
  | { kind: 'skills'; heading: string; groups: { label?: string; items: string[] }[] }
  | { kind: 'roles'; heading: string; roles: DocRole[] }
  | { kind: 'projects'; heading: string; projects: DocProject[] }
  | { kind: 'entries'; heading: string; entries: DocEntry[]; after?: DocLine[] }
  /* A group's label may be empty: one unlabelled list. */
  | { kind: 'citations'; heading: string; groups: { label: string; items: string[] }[] };

export type ResumeDocument = {
  name: string;
  title: string;
  /** Filled from resume.ts when the document is printed, never stored in a
   *  private file: the contact lines live in one place. */
  contact?: ContactItem[];
  /** The site's download link. Private documents have none. */
  pdfHref?: string;
  /** A longer document can set its employer or institution and its dates
   *  on one line ("Sky Pharmacy, Wuse, Abuja, Nigeria, Jul 2024 - Mar 2025")
   *  instead of two. Off for the public versions. */
  compactMeta?: boolean;
  sections: DocSection[];
};

/** A public version as a document, in that version's section order. */
export function documentFor(variant: Variant, includePrivate = false): ResumeDocument {
  const r = resumeFor(variant, includePrivate);

  const experience: DocSection = {
    kind: 'roles',
    heading: r.sections.experience,
    roles: r.experience.map((role) => ({
      title: role.title,
      sites: [{ company: role.company, location: role.location, period: role.period }],
      note: role.note || undefined,
      bullets: role.bullets,
    })),
  };

  const projects: DocSection | null = r.projects.length
    ? {
        kind: 'projects',
        heading: r.sections.projects,
        projects: r.projects.map(({ name, line, caseStudy, url }) => ({ name, line, caseStudy, url })),
      }
    : null;

  const education: DocSection = {
    kind: 'entries',
    heading: r.sections.education,
    entries: [
      ...r.education.map((item) => ({
        title: item.title,
        lines: [item.institution, item.period, item.note].filter(Boolean),
      })),
      ...r.credentials.map((credential) => ({
        title: credential.label,
        lines: [credential.issuer, credential.date].filter(Boolean),
      })),
    ],
    after: [
      ...(r.research ? [{ text: r.research }] : []),
      ...(r.languages ? [{ label: r.sections.languages, text: r.languages }] : []),
    ],
  };

  const middle: (DocSection | null)[] = r.projectsFirst ? [projects, experience] : [experience, projects];

  return {
    name: r.name,
    title: r.title,
    contact: r.contact,
    pdfHref: r.pdfHref,
    sections: [
      { kind: 'paragraphs', heading: r.sections.summary, paragraphs: r.summary } as DocSection,
      { kind: 'skills', heading: r.sections.skills, groups: r.skills.map(({ label, items }) => ({ label, items })) },
      ...middle.filter((section): section is DocSection => section !== null),
      education,
    ],
  };
}

/** A private document's header, completed from resume.ts. */
export function withContact(doc: ResumeDocument, includePrivate: boolean): ResumeDocument {
  const contact = includePrivate
    ? resumeContent.contact
    : resumeContent.contact.filter((item) => !item.private);
  return { ...doc, name: doc.name || resumeContent.name, contact, pdfHref: undefined };
}
