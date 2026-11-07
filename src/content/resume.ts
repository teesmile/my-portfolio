/**
 * The resume, in one place.
 *
 * Both `/resume` and the printed PDF read from this file, so the page a
 * recruiter opens and the document they download cannot disagree. Dates are
 * written in one format — "Mon YYYY" — because a resume that mixes formats
 * reads as carelessness, and because parsers key on the pattern.
 *
 * Three versions come out of this one file:
 *
 *   default   the master. The only one linked on the site.
 *   ai        health-AI evaluation, led by the pharmacy.
 *   general   fintech and operations, led by evaluation and data quality,
 *             with the retail and admin history that the master leaves out.
 *
 * Each runs to two pages at most, at a readable size (the working rules, Resume
 * rule), and never with a second page holding only a few lines.
 *
 * Nothing is invented for a version. Every fact here is true of all three;
 * what changes is which facts are worth the space, and in what order.
 */
export type Variant = 'default' | 'ai' | 'general';

/**
 * Where a piece of content appears, and in what order.
 *
 * A missing key means "not in that version at all", a present key is its sort
 * rank. One field decides both because the two questions are the same
 * question: a line is either worth its space to that reader or it is not.
 * This sits on bullets as well as on roles, because a role can be worth
 * keeping while one of its lines is not.
 */
export type Placement = Partial<Record<Variant, number>>;

export type Line = { text: string; place: Placement };

export type ContactItem = { text: string; href: string; private?: boolean };

export type Role = {
  title: string;
  company: string;
  period: string;
  /** Rendered on /about, not on the resume. */
  tech: string[];
  /** A short line under the company, for something the bullets should not carry. */
  note?: Line;
  bullets: Line[];
  place: Placement;
};

export type SkillGroup = { label: string; items: string[]; place: Placement };

export const resumeContent = {
  name: 'Anthony Ugwuja',
  /* One file per version: downloading from a version's page should not hand
     over the master. Only the default is linked anywhere on the site. */
  pdf: {
    default: '/Anthony-Ugwuja-Resume.pdf',
    ai: '/Anthony-Ugwuja-Resume-AI.pdf',
    general: '/Anthony-Ugwuja-Resume-General.pdf',
  },
  /* Section labels live here as well, so the document has no text that the
     ATS check cannot trace back to this file. */
  sections: {
    experience: 'Experience',
    projects: 'Selected projects',
    education: 'Education',
    credentials: 'Credentials',
    languages: 'Languages',
    skills: 'Skills',
  },
  titles: {
    default: 'Full-stack developer and AI evaluator · Registered pharmacist',
    ai: 'AI evaluation specialist · Registered pharmacist',
    general: 'AI evaluation and data quality specialist · Registered pharmacist',
  },

  /* Written out as text so a parser reads them, and linked so a human can
     click them. Both, not either. */
  /* `private: true` is kept out of the public document and off the site.
     `pnpm resume --private` puts it back for applications. */
  contact: [
    { text: 'anthonyugwujac@gmail.com', href: 'mailto:anthonyugwujac@gmail.com' },
    { text: '+234 903 257 0130', href: 'tel:+2349032570130', private: true },
    { text: 'Abuja, Nigeria', href: '' },
    { text: 'anthonyugwuja.dev', href: 'https://anthonyugwuja.dev' },
    { text: 'linkedin.com/in/tonysmile', href: 'https://linkedin.com/in/tonysmile' },
    { text: 'github.com/teesmile', href: 'https://github.com/teesmile' },
  ] as ContactItem[],

  /* No first person, keyword-led, written for a reader scanning twenty of
     these. The site says the same thing in my voice; a resume is not the
     place for it. Each version opens on what its reader is hiring for. */
  summary: {
    /* One paragraph, not two. Two opening lines at this width wrapped to
       four, and the second was a second claim about the same person — the
       merge says both things once and buys back the lines that kept
       Education off page one. */
    default: [
      'Full-stack developer (React, Next.js, TypeScript, Node.js) and registered pharmacist who builds accessible product interfaces and evaluates AI model output, catching confident but wrong clinical answers.',
    ],
    ai: [
      'Registered pharmacist who evaluates AI models and catches confident but incorrect answers in clinical and scientific content.',
      'Authors and reviews expert-level evaluation tasks across text, image, video and terminal-based formats, grading for accuracy, instruction following, reasoning quality and safety.',
    ],
    general: [
      'AI training and evaluation specialist working on data quality: grading model output against detailed guidelines and flagging subtle factual and reasoning errors.',
      'Registered pharmacist with front-line customer service, sales growth and regulated record-keeping experience.',
    ],
  } as Record<Variant, string[]>,

  experience: [
    {
      title: 'AI Training & Evaluation Specialist',
      company: 'Self-employed, remote · Outlier, Mercor, micro1 and similar platforms',
      period: 'Nov 2025 – Present',
      /* Empty on purpose: /about renders this role's bullets in full, and
         the practices live in the stack's "AI evaluation" row. Four tags
         under six bullets would say the same thing twice. */
      tech: [],
      /* First in the AI version only: both this and the NYSC post are
         current, so dates can't order them and relevance does. */
      place: { default: 1, ai: 0, general: 1 },
      /* Why no client names anywhere in this entry. One line, in every
         version, because its absence is more conspicuous than its presence. */
      note: { text: 'Client and project details under NDA.', place: { default: 0, ai: 0, general: 0 } },
      bullets: [
        {
          text: 'Author expert-level tasks designed to stump frontier models in chemistry, biology and clinical pharmacy, across text, image, video and terminal-based formats.',
          place: { default: 0, ai: 0, general: 0 },
        },
        {
          text: 'Grade outputs for accuracy, instruction following, reasoning quality and safety against detailed guidelines.',
          place: { default: 1, ai: 1, general: 1 },
        },
        {
          text: 'Rate and compare model responses side by side, and verify factual claims against sources.',
          place: { default: 2, ai: 2, general: 2 },
        },
        {
          /* The differentiator for health and science evaluation, and dead
             weight on a fintech desk. */
          text: 'Apply pharmacy and chemistry knowledge to catch confident but incorrect answers in clinical and scientific content.',
          place: { default: 4, ai: 4 },
        },
        {
          text: 'Annotate image, video and audio data.',
          place: { default: 3, ai: 3, general: 3 },
        },
        {
          text: 'Consistently meet quality bars across concurrent projects, with tasks rated at the top of the reviewer scale.',
          place: { default: 5, ai: 5, general: 4 },
        },
      ],
    },
    {
      title: 'Full Stack Developer Trainee',
      company: 'Zuri Team',
      period: 'May 2022 – Sep 2022',
      tech: ['HTML', 'CSS', 'JavaScript', 'Python', 'Django'],
      /* The master carries the development history as history. The other two
         carry it as a skills line and spend the space elsewhere. */
      place: { default: 3 },
      bullets: [
        { text: 'Built frontend interfaces in HTML, CSS and JavaScript.', place: { default: 0 } },
        { text: 'Learned backend development in Python and Django through project work.', place: { default: 1 } },
      ],
    },
    {
      /* Current clinical post. One line in every version: the title, the
         employer and the dates are the whole point of it. */
      title: 'Pharmacist (NYSC Corps Member)',
      company: 'Nasarawa State University clinic, Keffi',
      period: 'Aug 2026 – Present',
      tech: [],
      /* The master and general versions run strict reverse chronological
         order, so the current clinical post opens the section there. In the
         AI version it sits second: it and the evaluation role are both
         "– Present", so putting the evaluation role first never shows a
         jump back in time, and two concurrent roles are ordered by
         relevance to the reader instead. */
      place: { default: 0, ai: 1, general: 0 },
      bullets: [
        {
          text: 'Dispense medications and counsel students and staff on safe use.',
          place: { default: 0, ai: 0, general: 0 },
        },
      ],
    },
    {
      title: 'Pharmacy Intern',
      company: 'Federal Medical Centre, Keffi',
      period: 'May 2025 – May 2026',
      tech: [],
      place: { default: 2, ai: 2, general: 2 },
      bullets: [
        {
          text: 'Rotations across A&E, GOPD, inpatient, theatre, O&G and the ART (HIV) clinic; joined the TB unit on my own initiative.',
          place: { default: 0, ai: 0, general: 0 },
        },
      ],
    },
    {
      /* Customer service and covering a regulated role. Worth the space to a
         fintech or operations reader; not to the other two. */
      title: 'Locum Pharmacy Assistant',
      company: 'Sky Pharmacy, Wuse, Abuja',
      period: 'Jul 2024 – Mar 2025',
      tech: [],
      place: { general: 3 },
      bullets: [
        { text: 'Assisted the resident pharmacist and covered the role in their absence.', place: { general: 0 } },
        { text: 'Front-line customer service across 45-hour weeks.', place: { general: 1 } },
      ],
    },
    {
      title: 'Administrative Assistant',
      company: 'New System Pharmacy, Nsukka',
      period: 'Jul 2022 – Sep 2022',
      tech: [],
      place: { general: 4 },
      bullets: [
        { text: 'Grew sales revenue 15% in two months against a 5% target.', place: { general: 0 } },
        { text: 'Handled wholesale distribution.', place: { general: 1 } },
        { text: 'Kept dispensing records accurate.', place: { general: 2 } },
      ],
    },
  ] as Role[],

  /* The Projects rule (the working rules): every version lists only its strongest
     projects, inside the two-page limit, and when a stronger one arrives the
     weakest comes off the resume, never off the site. The evaluation sample
     leads wherever projects appear. The master carries the work itself; the
     AI version carries only the sample, because a health-AI reader is hiring
     for exactly that, and the rest is frontend work it skims. Space Tourism came
     off when the sample and the rebuilt todo app went on: it is the simplest
     of the four, and it is still on /work. */
  projects: [
    {
      name: 'Renal dose check (AI agent benchmark)',
      line: 'Dose checks on a mixed-unit synthetic chart, with simulated agents proving the grading sound.',
      repo: 'https://github.com/teesmile/renal-dosing-task',
      place: { default: 0, ai: 0 } as Placement,
    },
    {
      name: 'React Todo / Productivity App',
      line: 'Local-first task list on IndexedDB: due-date groups, edit in place, Undo, persistent filters.',
      url: 'https://todo.anthonyugwuja.dev',
      repo: 'https://github.com/teesmile/todo-app-tsc',
      place: { default: 1 } as Placement,
    },
    {
      name: 'E-Commerce Product Page',
      line: 'Product page with a gallery, cart state and one responsive layout built from a design file.',
      url: 'https://shop.anthonyugwuja.dev',
      repo: 'https://github.com/teesmile/e-commerce-product-page',
      place: { default: 2 } as Placement,
    },
    {
      name: 'Space Tourism Website',
      line: 'Four content types sharing one navigation shell, spacing system and page transitions.',
      url: 'https://space.anthonyugwuja.dev',
      repo: 'https://github.com/teesmile/space-tourism',
      place: {} as Placement,
    },
  ] as { name: string; line: string; url?: string; repo: string; place: Placement }[],

  /* Reverse chronological, like the experience section. Mixing the two
     orders in one document is the kind of small inconsistency a careful
     reader notices and cannot unsee. */
  education: [
    {
      title: 'Cloud Computing (in progress)',
      institution: 'AltSchool Africa',
      period: 'Jul 2026 – Present',
      place: { default: 0, ai: 0, general: 0 } as Placement,
    },
    {
      title: 'Diploma in Frontend Engineering',
      institution: 'AltSchool Africa',
      period: 'Oct 2024 – Oct 2025',
      note: {
        text: 'Project work in JavaScript, React, Node.js, HTML and CSS, with code review and technical writing throughout.',
        place: { default: 0 },
      } as Line,
      place: { default: 1, ai: 1, general: 1 } as Placement,
    },
    {
      title: 'B.Pharm, Pharmacy',
      institution: 'University of Nigeria, Nsukka',
      period: '2017 – 2023',
      place: { default: 2, ai: 2, general: 2 } as Placement,
    },
  ],

  credentials: [
    { label: 'Registered Pharmacist', issuer: 'Pharmacists Council of Nigeria', date: '', place: { default: 0, ai: 0, general: 0 } as Placement },
    { label: 'AI Fluency Framework', issuer: 'Anthropic', date: 'Jul 2026', place: { default: 1, ai: 1, general: 1 } as Placement },
  ],

  /* One line, and it is the point of the AI version: a second language is
     evaluation work there, not a personal detail. Every version carries it.
     The general version once dropped it to stay on one page; under the
     two-page Resume rule that reason no longer exists. */
  languages: {
    text: 'English (fluent), Igbo (native)',
    place: { default: 0, ai: 0, general: 0 },
  } as Line,

  skills: [
    {
      label: 'Frontend',
      items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS'],
      place: { default: 0, ai: 1 },
    },
    {
      label: 'Backend',
      items: ['Node.js', 'Python', 'Django', 'REST APIs'],
      place: { default: 1, ai: 2 },
    },
    {
      label: 'AI evaluation',
      items: ['LLM evaluation', 'multimodal annotation', 'data annotation', 'image, video and audio annotation', 'fact verification', 'rubric-based grading', 'side-by-side model comparison'],
      place: { default: 2, ai: 0, general: 0 },
    },
    {
      /* Frontend and Backend merged, because the general version carries
         development as one skills line and spends the saved line on the
         retail and admin history instead. Same items, no new claims. */
      label: 'Development',
      items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Django', 'REST APIs', 'Tailwind CSS', 'HTML', 'CSS'],
      place: { general: 1 },
    },
    {
      label: 'Tools',
      items: ['Git', 'GitHub', 'Linux', 'Vercel', 'pnpm'],
      place: { default: 3, ai: 3, general: 2 },
    },
  ] as SkillGroup[],
};

const inVariant = (place: Placement, variant: Variant) => place[variant] !== undefined;
const byPlace =
  (variant: Variant) =>
  (a: { place: Placement }, b: { place: Placement }) =>
    (a.place[variant] ?? 0) - (b.place[variant] ?? 0);

/** Picks the items a version carries and puts them in its order. */
function select<T extends { place: Placement }>(items: T[], variant: Variant) {
  return items.filter((item) => inVariant(item.place, variant)).sort(byPlace(variant));
}

/** The same facts, cut and ordered for the reader the version is aimed at. */
export function resumeFor(variant: Variant = 'default', includePrivate = false) {
  const contact = includePrivate
    ? resumeContent.contact
    : resumeContent.contact.filter((item) => !item.private);

  const experience = select(resumeContent.experience, variant).map((role) => ({
    ...role,
    note: role.note && inVariant(role.note.place, variant) ? role.note.text : '',
    bullets: select(role.bullets, variant).map((bullet) => bullet.text),
  }));

  const education = select(resumeContent.education, variant).map((item) => ({
    ...item,
    note: item.note && inVariant(item.note.place, variant) ? item.note.text : '',
  }));

  const projects = select(resumeContent.projects, variant);

  return {
    ...resumeContent,
    contact,
    title: resumeContent.titles[variant],
    pdfHref: resumeContent.pdf[variant],
    summary: resumeContent.summary[variant],
    experience,
    projects,
    education,
    credentials: select(resumeContent.credentials, variant),
    languages: inVariant(resumeContent.languages.place, variant)
      ? resumeContent.languages.text
      : '',
    skills: select(resumeContent.skills, variant),
  };
}

/** The experience the site itself shows: the master's selection. */
export const siteExperience = resumeFor('default').experience;
