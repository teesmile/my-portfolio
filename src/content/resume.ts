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

/* A role prints as three lines, in the order a parser looks for them: the
   title alone, then "employer, location", then the dates as
   "Mon YYYY - Mon YYYY" or "Mon YYYY - Present". Commas and plain hyphens
   only: a middle dot or a long dash is where extractors split fields
   wrongly or drop characters. */
export type Role = {
  title: string;
  company: string;
  location: string;
  period: string;
  /** Rendered on /about, not on the resume. */
  tech: string[];
  /** A short line under the company, for something the bullets should not carry. */
  note?: Line;
  bullets: Line[];
  place: Placement;
  /** Order on /about's timeline, apart from any CV: what fits on a CV page
   *  should never decide what the site shows. Absent means not on /about. */
  about?: number;
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
  /* Named the way a parser and a recruiter both expect, in this order:
     summary, skills, experience, projects, then education and credentials
     together under one heading. */
  sections: {
    summary: 'Professional summary',
    skills: 'Technical skills',
    experience: 'Professional experience',
    projects: 'Projects',
    education: 'Education and credentials',
    languages: 'Languages',
  },
  /* One role per title line, the role that version is applying for. The
     summary under it opens on the same role and gives the rest as
     background. */
  titles: {
    default: 'Full-stack developer (React, Next.js, TypeScript, Node.js)',
    ai: 'AI evaluation and data annotation specialist (pharmacy and science)',
    general: 'AI data annotation and quality specialist',
  },
  /* Projects before experience on the developer version, where the work
     itself is what the reader hires for; the other two put the roles first. */
  projectsFirst: { default: true, ai: false, general: false } as Record<Variant, boolean>,

  /* Written out as text so a parser reads them, and linked so a human can
     click them. Both, not either. */
  /* `private: true` is kept out of the public document and off the site.
     `pnpm resume --private` puts it back for applications. */
  contact: [
    { text: 'anthonyugwujac@gmail.com', href: 'mailto:anthonyugwujac@gmail.com' },
    /* WhatsApp is the channel that number answers. Shown as text so it
       still reads on paper, linked so a click opens a chat. */
    { text: 'WhatsApp: +234 903 257 0130', href: 'https://wa.me/2349032570130', private: true },
    { text: 'Abuja, Nigeria', href: '' },
    { text: 'anthonyugwuja.dev', href: 'https://anthonyugwuja.dev' },
    { text: 'linkedin.com/in/tonysmile', href: 'https://linkedin.com/in/tonysmile' },
    { text: 'github.com/teesmile', href: 'https://github.com/teesmile' },
  ] as ContactItem[],

  /* No first person, keyword-led, written for a reader scanning twenty of
     these. The site says the same thing in my voice; a resume is not the
     place for it. Each version opens on what its reader is hiring for. */
  /* Under a "Summary" heading, so a parser files it as the summary rather
     than guessing from position. One paragraph per version. */
  summary: {
    default: [
      'Full-stack developer with a pharmacy background, building web applications end to end with React, Next.js, TypeScript, Node.js and Python. Experienced in taking products from idea to launch, including offline-first apps, data pipelines and a site with more than 26,000 pages that stays fast on slow connections. Also works as an AI evaluation and data annotation specialist, with more than 1,000 tasks completed across annotation, grading and expert task writing. Brings the care of clinical work to software: clear documentation, thorough testing and attention to what can go wrong.',
    ],
    ai: [
      'AI evaluation and data annotation specialist with a pharmacy degree and a software development background. Since 2025, has completed more than 1,000 image and video annotation, comparison and rating tasks with quality ratings mostly between 4.5 and 4.8 out of 5, and has written expert-level science tasks with about 90% approved. Also builds terminal-based benchmark tasks for AI coding agents, working in Python, TypeScript and Linux. Works carefully and consistently, and writes clear feedback.',
    ],
    general: [
      'AI data annotation and quality specialist with a pharmacy degree. Since 2025, has completed more than 1,000 image and video annotation, comparison and rating tasks with quality ratings mostly between 4.5 and 4.8 out of 5, and has written expert-level science tasks with about 90% approved. Completed a one-year pharmacy internship at Federal Medical Centre Keffi and now serves as a corps pharmacist at the Nasarawa State University clinic under the National Youth Service Corps, dispensing medicines and counselling patients face to face. Also has working knowledge of Python, TypeScript and Linux.',
    ],
  } as Record<Variant, string[]>,

  experience: [
    {
      title: 'AI Evaluation and Data Annotation Specialist',
      /* Printed as "Freelance, remote". No platform or client is named
         anywhere on the site or the CVs; the note below says why. */
      company: 'Freelance',
      location: 'remote',
      period: 'Nov 2025 - Present',
      /* Empty on purpose: /about renders this role's bullets in full, and
         the practices live in the stack's "AI evaluation" row. Four tags
         under the bullets would say the same thing twice. */
      tech: [],
      /* First in the AI version only: both this and the NYSC post are
         current, so dates can't order them and relevance does. */
      place: { default: 1, ai: 0, general: 1 },
      about: 1,
      /* Why no client names anywhere in this entry. One line, in every
         version, because its absence is more conspicuous than its presence. */
      note: { text: 'Client and project details under NDA.', place: { default: 0, ai: 0, general: 0 } },
      /* The three counted results lead, word for word as given. The older
         lines they made redundant are folded in, not repeated: "annotate
         image, video and audio data" and "quality bars, rated at the top of
         the reviewer scale" are the first result; "author expert-level
         tasks in chemistry, biology and clinical pharmacy ... and
         terminal-based formats" is the second
         and third; side-by-side rating joins the grading line. */
      bullets: [
        {
          text: 'Completed more than 1,000 image and video annotation, comparison and rating tasks on a single project, with quality ratings mostly between 4.5 and 4.8 out of 5.',
          place: { default: 0, ai: 0, general: 0 },
        },
        {
          text: 'Wrote more than 25 expert-level science tasks built to expose model errors, with about 90% approved.',
          place: { default: 1, ai: 1, general: 1 },
        },
        {
          text: 'Built and submitted more than 10 terminal-based benchmark tasks that test AI coding agents.',
          place: { default: 2, ai: 2, general: 3 },
        },
        {
          /* Off the developer version: its Skills line already says
             "rubric-based grading", "side-by-side model comparison" and
             "fact verification", and the three lines are what keep this
             role whole on page one there. */
          text: 'Grade and compare model responses for accuracy, instruction following, reasoning quality and safety against detailed guidelines, and verify factual claims against sources.',
          place: { ai: 3, general: 2 },
        },
        {
          /* The differentiator for health and science evaluation, and dead
             weight on a fintech desk. */
          text: 'Write tasks in biology and clinical pharmacy too, and apply pharmacy knowledge to catch confident but incorrect answers in clinical and scientific content.',
          place: { default: 4, ai: 4 },
        },
      ],
    },
    {
      title: 'Full Stack Developer Trainee',
      company: 'Zuri Team',
      location: 'Remote',
      period: 'May 2022 - Sep 2022',
      tech: ['HTML', 'CSS', 'JavaScript', 'Python', 'Django'],
      /* Off every version since the lead project went on (11 Nov 2026): the
         oldest and weakest development entry, and the Diploma in Frontend
         Engineering covers the same training. /about keeps it (`about`). */
      place: {},
      about: 3,
      bullets: [
        { text: 'Built frontend interfaces in HTML, CSS and JavaScript.', place: { default: 0 } },
        { text: 'Learned backend development in Python and Django through project work.', place: { default: 1 } },
      ],
    },
    {
      /* Current clinical post. One line in every version: the title, the
         employer and the dates are the whole point of it. */
      title: 'Corps Pharmacist (National Youth Service Corps)',
      company: 'Nasarawa State University clinic',
      location: 'Keffi, Nigeria',
      period: 'Aug 2026 - Present',
      tech: [],
      /* The master and general versions run strict reverse chronological
         order, so the current clinical post opens the section there. In the
         AI version it sits second: it and the evaluation role are both
         "- Present", so putting the evaluation role first never shows a
         jump back in time, and two concurrent roles are ordered by
         relevance to the reader instead. */
      place: { default: 0, ai: 1, general: 0 },
      about: 0,
      bullets: [
        {
          text: 'Dispense medications and counsel students and staff on safe use.',
          place: { default: 0, ai: 0, general: 0 },
        },
      ],
    },
    {
      title: 'Pharmacy Intern',
      company: 'Federal Medical Centre',
      location: 'Keffi, Nigeria',
      period: 'May 2025 - May 2026',
      tech: [],
      place: { default: 2, ai: 2, general: 2 },
      about: 2,
      bullets: [
        {
          text: 'Rotated through A&E, GOPD, inpatient, theatre, O&G and the ART (HIV) clinic, and joined the TB unit on my own initiative.',
          place: { default: 0, ai: 0, general: 0 },
        },
      ],
    },
    {
      /* Customer service and covering a regulated role. Worth the space to a
         fintech or operations reader; not to the other two. */
      title: 'Locum Pharmacy Assistant',
      company: 'Sky Pharmacy',
      location: 'Wuse, Abuja, Nigeria',
      period: 'Jul 2024 - Mar 2025',
      tech: [],
      place: { general: 3 },
      bullets: [
        { text: 'Assisted the resident pharmacist and covered the role in their absence.', place: { general: 0 } },
        { text: 'Provided front-line customer service across 45-hour weeks.', place: { general: 1 } },
      ],
    },
    {
      title: 'Administrative Assistant',
      company: 'New System Pharmacy',
      location: 'Nsukka, Nigeria',
      period: 'Jul 2022 - Sep 2022',
      tech: [],
      place: { general: 4 },
      bullets: [
        { text: 'Grew sales revenue 15% in two months against a 5% target.', place: { general: 0 } },
        /* Off since the lead project went on: the weakest of the three, and
           the line that keeps the operations version at two pages. */
        { text: 'Handled wholesale distribution.', place: {} },
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
     of the four, and it is still on /work. Roasted then replaced the
     E-Commerce page on the master: it has a server side, three external
     services and real users, where the product page is a frontend build. */
  /* Who's on my ballot? leads the developer and operations versions; the
     AI version leads with the evaluation sample, which is what that reader
     hires for (the owner's calls, 11 Nov 2026). Its figures are checked
     against the repo (teesmile/whos-on-my-ballot at e92c9c0): 26,142 pages
     in the built sitemap, 177,299 polling units from INEC's locator, and
     LCP 2.0-2.4 s in Lighthouse's simulated slow-3G profile. Roasted stays
     on the developer version, fourth, as a one-line entry.

     Each project links to its case study on the site and to the live
     site, as buttons; a project shows only the links it has. */
  projects: [
    {
      name: "Who's on my ballot? (launching November 2026), whosonmyballot.ng",
      line: "Built a free voter information site for Nigeria's 2027 elections, with a data pipeline that turns INEC's official candidate lists into more than 26,000 static pages and a polling-unit lookup covering 177,299 units that runs in the browser, tested to show its main content in about 2 seconds on a simulated slow 3G connection.",
      /* Two lines on the operations version: the same facts, less of them. */
      lineFor: {
        general: "Built a free voter information site for Nigeria's 2027 elections, with more than 26,000 pages from INEC's candidate lists and a lookup covering 177,299 polling units.",
      },
      caseStudy: 'https://anthonyugwuja.dev/work/whos-on-my-ballot',
      url: 'https://whosonmyballot.ng',
      /* Second on the AI version, behind the benchmark: that reader is
         hiring for evaluation work. */
      place: { default: 0, ai: 1, general: 0 } as Placement,
    },
    {
      name: 'Renal dose check (AI agent benchmark)',
      line: 'Built a benchmark task that tests whether AI agents can check drug doses from a messy patient chart, with simulated agents proving each mistake is caught.',
      caseStudy: 'https://anthonyugwuja.dev/work/renal-dosing-task',
      place: { default: 1, ai: 0 } as Placement,
    },
    {
      name: 'Todo App',
      line: 'Built a local-first task list that works offline and syncs across devices via Google sign-in.',
      caseStudy: 'https://anthonyugwuja.dev/work/todo-app',
      url: 'https://todo.anthonyugwuja.dev',
      place: { default: 2 } as Placement,
    },
    {
      name: 'Roasted',
      /* Back on the developer version as a short entry (owner's call, 11
         Nov 2026), held to one line so the CV stays at two pages. /work
         carries the full description. */
      line: 'Built a Farcaster mini app that writes a roast from a user\'s profile and recent casts.',
      caseStudy: 'https://anthonyugwuja.dev/work/roasted',
      url: 'https://castroast.vercel.app',
      place: { default: 3 } as Placement,
    },
    {
      name: 'E-Commerce Product Page',
      line: 'Built a product page with a gallery, cart state and one responsive layout from a design file.',
      caseStudy: 'https://anthonyugwuja.dev/work/ecommerce-product-page',
      url: 'https://shop.anthonyugwuja.dev',
      place: {} as Placement,
    },
    {
      name: 'Space Tourism Website',
      line: 'Built four content types that share one navigation shell, spacing system and page transitions.',
      caseStudy: 'https://anthonyugwuja.dev/work/space-tourism',
      url: 'https://space.anthonyugwuja.dev',
      place: {} as Placement,
    },
  ] as { name: string; line: string; lineFor?: Partial<Record<Variant, string>>; caseStudy?: string; url?: string; place: Placement }[],

  /* Reverse chronological, like the experience section. Mixing the two
     orders in one document is the kind of small inconsistency a careful
     reader notices and cannot unsee. */
  education: [
    {
      title: 'Cloud Computing (in progress)',
      institution: 'AltSchool Africa',
      period: 'Jul 2026 - Present',
      /* Off the operations version: a course with no credential yet says
         little to that reader, and its three lines keep it at two pages. */
      place: { default: 0, ai: 0 } as Placement,
    },
    {
      title: 'Diploma in Frontend Engineering',
      institution: 'AltSchool Africa',
      period: 'Oct 2024 - Oct 2025',
      note: {
        text: 'Project work in JavaScript, React, Node.js, HTML and CSS, with code review and technical writing throughout.',
        /* Off since the lead project went on: it restates the Skills
           section, and its two lines keep the developer version at two
           pages. */
        place: {},
      } as Line,
      place: { default: 1, ai: 1, general: 1 } as Placement,
    },
    {
      title: 'B.Pharm, Pharmacy',
      institution: 'University of Nigeria, Nsukka',
      period: '2017 - 2023',
      place: { default: 2, ai: 2, general: 2 } as Placement,
    },
  ],

  credentials: [
    { label: 'Pharmacist', issuer: 'Pharmacists Council of Nigeria', date: '', place: { default: 0, ai: 0, general: 0 } as Placement },
    { label: 'AI Fluency Framework', issuer: 'Anthropic', date: 'Jul 2026', place: { default: 1, ai: 1, general: 1 } as Placement },
  ],

  /* Research, as one line at the foot of Education and credentials on the
     AI version. The citations themselves are on the pharmacy CV, which is
     kept off the site. */
  research: {
    text: 'Co-author of one journal article and two international conference posters in pharmacy and HIV research (2024).',
    place: { ai: 0 },
  } as Line,

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
      items: ['LLM evaluation', 'data annotation', 'multimodal (image, video and audio) annotation', 'fact verification', 'rubric-based grading', 'side-by-side model comparison'],
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

  const projects = select(resumeContent.projects, variant).map((project) => ({
    ...project,
    line: project.lineFor?.[variant] ?? project.line,
  }));

  return {
    ...resumeContent,
    contact,
    title: resumeContent.titles[variant],
    projectsFirst: resumeContent.projectsFirst[variant],
    pdfHref: resumeContent.pdf[variant],
    summary: resumeContent.summary[variant],
    experience,
    projects,
    education,
    credentials: select(resumeContent.credentials, variant),
    research: inVariant(resumeContent.research.place, variant) ? resumeContent.research.text : '',
    languages: inVariant(resumeContent.languages.place, variant)
      ? resumeContent.languages.text
      : '',
    skills: select(resumeContent.skills, variant),
  };
}

/* A bullet's order on /about: its developer-version rank where it has one,
   else its rank in the AI or operations version. */
const rank = (place: Placement) => place.default ?? place.ai ?? place.general ?? 99;

/** The experience /about shows, in its own order (`about`), with every
 *  bullet the role carries in any version. */
export const siteExperience = resumeContent.experience
  .filter((role) => role.about !== undefined)
  .sort((a, b) => (a.about ?? 0) - (b.about ?? 0))
  .map((role) => ({
    ...role,
    note: role.note?.text ?? '',
    bullets: [...role.bullets]
      .sort((a, b) => rank(a.place) - rank(b.place))
      .map((bullet) => bullet.text),
  }));
