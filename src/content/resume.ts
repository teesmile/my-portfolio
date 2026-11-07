/**
 * The resume, in one place.
 *
 * Both `/resume` and the printed PDF read from this file, so the page a
 * recruiter opens and the document they download cannot disagree. Dates are
 * written in one format — "Mon YYYY" — because a resume that mixes formats
 * reads as carelessness, and because parsers key on the pattern.
 *
 * `variant` reorders the same facts for different readers. Nothing is
 * invented for a variant; only the order changes.
 */
export type Variant = 'default' | 'ai';

export type ContactItem = { text: string; href: string };

export type Role = {
  title: string;
  company: string;
  period: string;
  tech: string[];
  bullets: string[];
  /** Lower sorts earlier in the AI-led variant. */
  aiRank: number;
};

export type SkillGroup = { label: string; items: string[]; aiRank: number };

export const resumeContent = {
  name: 'Anthony Ugwuja',
  /* One file per variant: downloading from the AI-ordered page should not
     hand over the default document. */
  pdf: {
    default: '/Anthony-Ugwuja-Resume.pdf',
    ai: '/Anthony-Ugwuja-Resume-AI.pdf',
  },
  /* Section labels live here as well, so the document has no text that the
     ATS check cannot trace back to this file. */
  sections: {
    experience: 'Experience',
    projects: 'Selected projects',
    education: 'Education',
    licensure: 'Licensure',
    skills: 'Skills',
  },
  titles: {
    default: 'Frontend developer and AI code evaluator',
    ai: 'AI evaluation specialist and frontend developer',
  },

  /* Written out as text so a parser reads them, and linked so a human can
     click them. Both, not either. */
  contact: [
    { text: 'anthonyugwuja.dev@gmail.com', href: 'mailto:anthonyugwuja.dev@gmail.com' },
    { text: '+234 903 257 0130', href: 'tel:+2349032570130' },
    { text: 'Abuja, Nigeria', href: '' },
    { text: 'anthonyugwuja.dev', href: 'https://anthonyugwuja.dev' },
    { text: 'linkedin.com/in/tonysmile', href: 'https://linkedin.com/in/tonysmile' },
    { text: 'github.com/teesmile', href: 'https://github.com/teesmile' },
  ] as ContactItem[],

  summary:
    "I build frontend interfaces in React and TypeScript, and I get paid to read code a model wrote and say what is wrong with it. I trained as a pharmacist first, which is where I picked up the habit of checking things twice before they reach someone else.",

  experience: [
    {
      title: 'Frontend developer and AI code evaluator',
      company: 'Independent, remote',
      period: 'Nov 2025 – Present',
      tech: ['React', 'Vite', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Git', 'GitHub', 'Vercel', 'pnpm', 'Linux'],
      aiRank: 0,
      bullets: [
        'Build React and Vite interfaces with reusable components, hooks and Tailwind CSS.',
        'Debug form validation, conditional rendering, routing, async data and responsive layout problems in JavaScript and TypeScript.',
        'Read model-written code and answers, and judge them for correctness, instruction following, edge cases and what the user actually asked for.',
        'Write feedback that names the bug, explains why it bites and shows the version that works.',
      ],
    },
    {
      title: 'Software engineering intern',
      company: 'AltSchool Africa',
      period: 'Jan 2024 – Dec 2025',
      tech: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git', 'GitHub'],
      aiRank: 2,
      bullets: [
        'Worked through engineering tasks in JavaScript, React, Node.js, HTML and CSS.',
        'Built and reviewed interfaces with attention to responsive layout, reusable components and accessibility.',
        'Practised debugging, code review and technical writing, which is the same work the evaluation job pays for now.',
      ],
    },
    {
      title: 'Pharmacy intern',
      company: 'Federal Medical Centre, Keffi',
      period: 'May 2025 – May 2026',
      tech: [],
      aiRank: 4,
      bullets: [
        'Clinical pharmacy rotations covering dispensing, ward rounds and patient counselling.',
        'The habit this job teaches is the one the evaluation work pays for: check the thing twice before it reaches someone else.',
      ],
    },
    {
      title: 'Full stack developer trainee',
      company: 'Zuri Team',
      period: 'May 2022 – Sep 2022',
      tech: ['HTML', 'CSS', 'JavaScript', 'Python', 'Django'],
      aiRank: 3,
      bullets: [
        'Built frontend interfaces in HTML, CSS and JavaScript.',
        'Built backend services in Python and Django.',
      ],
    },
  ] as Role[],

  projects: [
    {
      name: 'React Todo / Productivity App',
      line: 'Task manager with typed routes, Zod-validated forms and pagination that keeps its place.',
      url: 'https://todo-app-tsc-mauve.vercel.app/',
    },
    {
      name: 'E-Commerce Product Page',
      line: 'Product page with a gallery, cart state and one responsive layout built from a design file.',
      url: 'https://e-commerce-product-page-one-ashy.vercel.app/',
    },
    {
      name: 'Space Tourism Website',
      line: 'Four content types sharing one navigation shell, spacing system and page transitions.',
      url: 'https://space-tourism-toni.vercel.app/',
    },
  ],

  education: [
    {
      title: 'B.Pharm, Pharmacy',
      institution: 'University of Nigeria, Nsukka',
      period: '2017 – 2023',
    },
    {
      title: 'Diploma in software engineering',
      institution: 'AltSchool Africa',
      period: 'Jan 2024 – Dec 2025',
    },
  ],

  credentials: [
    { label: 'Provisional pharmacist licence', date: 'Feb 2024' },
    { label: 'Full pharmacist licence', date: 'Oct 2026' },
  ],

  skills: [
    {
      label: 'AI evaluation',
      items: ['AI evaluation', 'LLM evaluation', 'data annotation', 'multimodal annotation', 'prompt-response review', 'rubric-based grading', 'edge-case testing'],
      aiRank: 0,
    },
    {
      label: 'Frontend',
      items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vite', 'HTML', 'CSS'],
      aiRank: 1,
    },
    {
      label: 'Backend and data',
      items: ['Node.js', 'Python', 'Django', 'REST APIs'],
      aiRank: 2,
    },
    {
      label: 'Tools',
      items: ['Git', 'GitHub', 'Vercel', 'pnpm', 'Linux', 'Chrome DevTools'],
      aiRank: 3,
    },
  ] as SkillGroup[],
};

/** The same content, ordered for the reader the variant is aimed at. */
export function resumeFor(variant: Variant = 'default') {
  if (variant === 'default') {
    return {
      ...resumeContent,
      title: resumeContent.titles.default,
      pdfHref: resumeContent.pdf.default,
    };
  }

  return {
    ...resumeContent,
    title: resumeContent.titles.ai,
    pdfHref: resumeContent.pdf.ai,
    experience: [...resumeContent.experience].sort((a, b) => a.aiRank - b.aiRank),
    skills: [...resumeContent.skills].sort((a, b) => a.aiRank - b.aiRank),
  };
}
