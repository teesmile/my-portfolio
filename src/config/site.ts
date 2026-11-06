
export type Project = {
  id: number;
  slug: string;
  title: string;
  description: string;
  role: string;
  year: string;
  tech: string[];
  link: string;
  /** The repository itself, never the profile. Omit it when a project has no
   *  public repo — the card hides the "Source" link rather than linking to
   *  something that is not the source. */
  repo?: string;
  /** A real capture of the running project. Absent until one exists — the
   *  index renders a typographic frame rather than a mock interface. */
  preview?: string;
  highlights: string[];
  /** Filled once a project has a server. Phase 3's flagship is the first. */
  architecture?: {
    dataModel: string;
    api: string;
    auth: string;
    hosting: string;
  };
};

const projects: Project[] = [
  {
    id: 1,
    slug: "todo-app",
    preview: "/work/todo-app.webp",
    title: "React Todo / Productivity App",
    description:
      "A todo app I built to learn TanStack Router and Form properly. Typed routes, inputs validated with Zod, and pagination that keeps its place when you come back to it.",
    role: "Frontend implementation",
    year: "2025",
    tech: ["React", "TypeScript", "TanStack Router", "TanStack Form", "Zod", "Tailwind CSS"],
    link: "https://todo-app-tsc-mauve.vercel.app/",
    repo: "https://github.com/teesmile/todo-app-tsc", 
    highlights: [
      "Home, TodoItem and Pagination split so each one does a single job",
      "Form validation with Zod, so bad input fails before it reaches state",
      "Layout built mobile first, with Tailwind doing the spacing",
    ]
  },
  {
    id: 2,
    slug: "ecommerce-product-page",
    preview: "/work/ecommerce-product-page.webp",
    title: "E-Commerce Product Page",
    description:
      "A product page built from a design file. Gallery thumbnails, a cart that counts correctly, and one layout that works on a phone without a separate mobile build.",
    role: "Frontend implementation",
    year: "2025",
    tech: ["Vite", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    link: "https://e-commerce-product-page-one-ashy.vercel.app/",
    repo: "https://github.com/teesmile/e-commerce-product-page",
    highlights: [
      "Gallery and thumbnail states wired to one source of truth",
      "Cart that refuses empty and invalid quantities",
      "Desktop and mobile from the same markup, not two templates",
    ]
  },
  {
    id: 3,
    slug: "space-tourism",
    preview: "/work/space-tourism.webp",
    title: "Space Tourism Website",
    description:
      "A four-section site I used to practise layout systems and page transitions. Same shell, four content types, no page that looks bolted on.",
    role: "Frontend implementation",
    year: "2025",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    link: "https://space-tourism-toni.vercel.app/",
    repo: "https://github.com/teesmile/space-tourism",
    highlights: [
      "Four content types sharing one navigation shell",
      "A spacing and type system reused across every page",
      "Transitions between pages instead of hard cuts",
    ]
  }
];

export const portfolioConfig = {
  name: "Anthony Ugwuja",
  brandName: "Teesmile",
  title: "Frontend developer and AI code evaluator",
  phone: "+234 903 257 0130",
  email: "anthonyugwuja.dev@gmail.com",
  location: "Abuja, Nigeria",
  availability: "Remote",
  statement:
    "I trained as a pharmacist. Now I build React interfaces — and get paid to find what's wrong with AI-written code.",
  // The dated spine on /about. Two tracks running in parallel, not one career
  // replacing another — which is the actual story.
  timeline: [
    { period: "2017 — 2025", label: "Pharmacy degree", track: "pharmacy" },
    { period: "2020", label: "First code, written during pharmacy school", track: "code" },
    { period: "2022", label: "Zuri and I4G training programmes", track: "code" },
    { period: "2024 — 2025", label: "Software engineering diploma, AltSchool Africa", track: "code" },
    { period: "2025", label: "Provisional pharmacist licence", track: "pharmacy" },
    { period: "2025 — 2026", label: "Pharmacy internship", track: "pharmacy" },
    { period: "2025 — now", label: "Frontend development and code evaluation", track: "code" },
    { period: "2026", label: "Full pharmacist licence", track: "pharmacy" },
  ] as { period: string | null; label: string; track: "pharmacy" | "code" }[],
  // The deck on /. Every example is written for this purpose, never taken from
  // paid evaluation work, and every bug is real enough to verify by reading.
  defects: [
    {
      language: "tsx" as const,
      context: "React — a price-sorted product list",
      lines: [
        "function ProductList({ items }: { items: Product[] }) {",
        "  const sorted = useMemo(",
        "    () => items.sort((a, b) => a.price - b.price),",
        "    [items],",
        "  );",
        "",
        "  return <ul>{sorted.map(renderRow)}</ul>;",
        "}",
      ],
      markedLine: 3,
      verdict:
        "sort() orders in place, so this reorders the caller's array as a side effect of rendering. Every other component holding that prop silently changes order too.",
      fix: ["() => [...items].sort((a, b) => a.price - b.price),"],
    },
    {
      language: "python" as const,
      context: "Django — an order list page",
      lines: [
        "def order_list(request):",
        "    orders = Order.objects.all()",
        "    rows = []",
        "    for order in orders:",
        "        rows.append((order.id, order.customer.name))",
        "    return render(request, 'orders.html', {'rows': rows})",
      ],
      markedLine: 5,
      verdict:
        "order.customer is a separate query per row. One hundred orders means one hundred and one queries, and the page gets slower in production exactly as the data grows.",
      fix: ["    orders = Order.objects.select_related('customer')"],
    },
    {
      language: "python" as const,
      context: "SQL — a product search",
      lines: [
        "def search(request):",
        "    term = request.GET['q']",
        "    with connection.cursor() as cursor:",
        "        cursor.execute(",
        "            \"SELECT id, name FROM product WHERE name LIKE '%\" + term + \"%'\"",
        "        )",
        "        return cursor.fetchall()",
      ],
      markedLine: 5,
      verdict:
        "The search box is concatenated straight into SQL. A quote in the query string ends the literal and the rest executes, which is how a product search becomes a database dump.",
      fix: [
        "        cursor.execute(",
        "            'SELECT id, name FROM product WHERE name LIKE %s',",
        "            [f'%{term}%'],",
        "        )",
      ],
    },
    {
      language: "tsx" as const,
      context: "Async — a search-as-you-type field",
      lines: [
        "useEffect(() => {",
        "  fetch(`/api/search?q=${query}`)",
        "    .then((res) => res.json())",
        "    .then(setResults);",
        "}, [query]);",
      ],
      markedLine: 4,
      verdict:
        "Responses resolve in whatever order the network returns them. Type quickly and a slow answer for an old query lands after the fast one, so the list shows results for something you already stopped typing.",
      fix: [
        "  let current = true;",
        "  fetch(`/api/search?q=${query}`)",
        "    .then((res) => res.json())",
        "    .then((data) => { if (current) setResults(data); });",
        "  return () => { current = false; };",
      ],
    },
  ],
  // /lab exists as a route but stays out of the nav until it holds one
  // experiment. An empty page linked from the nav is worse than no link.
  // /work/archive. TODO(human): the other projects — year, stack, and links if
  // they are still up. The two training rows below are what the spine already
  // establishes; everything else needs your list.
  archive: [
    {
      year: "2022",
      title: "Zuri and I4G training projects",
      stack: ["HTML", "CSS", "JavaScript"],
      training: true,
      link: null,
    },
    {
      year: "2020",
      title: "First projects, written during pharmacy school",
      stack: ["HTML", "CSS"],
      training: true,
      link: null,
    },
  ] as { year: string; title: string; stack: string[]; training: boolean; link: string | null }[],
  // Grouped by layer, and only tools that appear in a listed project or role.
  // The data row is empty on purpose: nothing I have shipped has a database
  // yet, and pretending otherwise is the easiest lie on a portfolio.
  stack: [
    {
      layer: "Frontend",
      items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Vite", "HTML", "CSS"],
    },
    { layer: "Backend", items: ["Node.js"] },
    { layer: "Data", items: [] },
    { layer: "Infrastructure", items: ["Git", "GitHub", "Vercel", "pnpm", "Linux"] },
  ] as { layer: string; items: string[] }[],
  // Page prose lives here so it can be edited in one file.
  copy: {
    heroSupport:
      "Four bugs from code a model wrote. Every one is real, and every one would survive a quick read.",
    aboutHeading: "I read other people's code for a living. Mine included.",
    aboutParagraphs: [
      "I trained as a pharmacist at the University of Nigeria, Nsukka. I wrote my first code in 2020, partway through the degree, and kept going after it: HTML and CSS first, then JavaScript, then React.",
      "Now I build interfaces in React and TypeScript. In the same week I get paid to read code a model wrote and say exactly what is wrong with it — the bug, why it bites, and the version that works.",
      "The second job changed how I do the first. Read enough confident, broken answers and you stop trusting code that merely looks right. Including your own.",
      "I am moving across the stack. The frontend is where I am strongest today. The next thing I build has a server, a database and real sign-in, because that is the part I cannot prove yet.",
    ],
    aboutStackHeading: "What I work with",
    aboutDataEmpty: "Nothing I have shipped has a database yet.",
    workHeading: "Three things I built, and what each one taught me.",
    workArchiveLink: "Everything else, including the training work",
    writingHeading: "Decisions, and what they cost.",
    contactHeading: "I am open to remote frontend work and code evaluation.",
    contactNote: "Email reaches me fastest.",
    labHeading: "Interaction experiments, one at a time.",
    labIntro:
      "Where I try the things a client project would not pay for, and where I settle arguments with a measurement instead of an opinion.",
    archiveHeading: "Everything else.",
  },
  navLinks: [
    { name: "Work", href: "/work" },
    { name: "Writing", href: "/writing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ] as const,
  skills: [
    {
      label: "Core Skills",
      items: ["React", "Node.js", "JavaScript", "Angular", "HTML", "CSS"]
    },
    {
      label: "Frontend",
      items: ["TypeScript", "Vite", "Tailwind CSS", "Responsive design", "Component architecture", "Form validation"]
    },
    {
      label: "AI training",
      items: ["Code evaluation", "Prompt-response review", "Rubric-based grading", "Instruction-following assessment", "Hallucination detection", "Edge-case testing", "Concise feedback"]
    },
    {
      label: "Tools",
      items: ["Git", "GitHub", "Chrome DevTools", "Vercel", "pnpm", "Linux/Ubuntu", "REST API fundamentals"]
    }
  ],
  resume: {
    summary:
      "I build frontend interfaces in React and TypeScript, and I get paid to read code a model wrote and say what's wrong with it. I trained as a pharmacist first, which is where I picked up the habit of checking things twice before they reach someone else.",
    highlights: [
      "I build React and TypeScript interfaces: components that get reused, forms validated with Zod, layouts that hold on a phone.",
      "I review model-written code and answers for correctness, missing requirements, edge cases and clarity, then write the feedback that explains the fix.",
      "I work in Git, GitHub, Vercel, pnpm and Linux every day, and I debug in the browser rather than guessing.",
    ],
    experience: [
      {
        role: "Frontend developer and AI code evaluator",
        company: "Independent, remote",
        period: "2025 - Present",
        present: true,
        tech: ["React", "Vite", "TypeScript", "JavaScript", "Tailwind CSS", "Git", "GitHub", "Vercel", "pnpm", "Linux"],
        bullets: [
          "Build React and Vite interfaces with reusable components, hooks and Tailwind CSS.",
          "Debug form validation, conditional rendering, routing, async data and responsive layout problems in JavaScript and TypeScript.",
          "Read model-written code and answers, and judge them for correctness, instruction-following, edge cases and what the user actually asked for.",
          "Write feedback that names the bug, explains why it bites and shows the version that works.",
        ],
      },
      {
        role: "Software engineering intern",
        company: "AltSchool Africa",
        period: "2024 - 2025",
        present: false,
        tech: ["JavaScript", "React", "Node.js", "HTML", "CSS", "Git", "GitHub"],
        bullets: [
          "Worked through engineering tasks in JavaScript, React, Node.js, HTML and CSS.",
          "Built and reviewed interfaces with attention to responsive layout, reusable components and accessibility.",
          "Practised debugging, code review and technical writing, which is the same work the evaluation job pays for now.",
        ],
      },
    ],
    education: [
      {
        title: "B.Pharm, Pharmacy",
        institution: "University of Nigeria, Nsukka",
        period: "2017 - 2025",
        details: [
          "Pharmacology, pharmaceutics and clinical practice. I wrote my first code in 2020, partway through the degree.",
        ],
      },
      {
        title: "Diploma in software engineering",
        institution: "AltSchool Africa",
        period: "2024 - 2025",
        details: [
          "JavaScript, React, Node.js, Angular, HTML, CSS, TypeScript, Git and GitHub, with debugging and technical writing throughout.",
        ],
      },
    ],
    credentials: [
      { label: "Provisional pharmacist licence", year: "2025" },
      { label: "Full pharmacist licence", year: "2026" },
    ],
  },
  socials: [
    { 
      name: "GitHub",
      url: "https://github.com/teesmile",
      iconKey: "github"
    },
    { 
      name: "LinkedIn",
      url: "https://linkedin.com/in/tonysmile",
      iconKey: "linkedin"
    },
    { 
      name: "X",
      url: "https://x.com/Tonysmile_1",
      iconKey: "twitter"

    }
  ],
  projects,
};
