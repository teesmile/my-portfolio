import { resumeContent } from "@/content/resume";


export type StackLayer = {
  layer: string;
  items: string[];
  /** "tool" rows carry logos; "practice" rows are text chips. */
  kind?: "tool" | "practice";
};

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

/* Ordered by the Projects rule in CLAUDE.md: strongest and newest first,
   simpler ones further down. Nothing is ever deleted from this list; a
   weaker project moves down here and comes off the resume instead. */
const projects: Project[] = [
  {
    id: 1,
    slug: "todo-app",
    preview: "/work/todo-app.webp",
    title: "React Todo / Productivity App",
    /* What the live app does today. Sync shipped in November 2026; the
       repo README still describes the offline-only version. */
    description:
      "A local-first task list that works offline, with optional Google sign-in that syncs tasks and labels across devices. Tasks are grouped by when they're due, with Vital tasks, labels, search, and delete with Undo.",
    role: "Full-stack implementation",
    year: "2026",
    tech: ["Next.js", "React", "TypeScript", "Dexie", "IndexedDB", "Supabase", "Tailwind CSS"],
    link: "https://todo.anthonyugwuja.dev",
    repo: "https://github.com/teesmile/todo-app-tsc",
    highlights: [
      "Works offline: tasks live in IndexedDB on the device, and edits made in two tabs at once don't silently replace each other",
      "Optional Google sign-in syncs tasks and labels across devices; without it, nothing leaves the device",
      "Grouped by when it's due: Overdue, Today, Tomorrow, Upcoming, No date and Done, re-grouped at midnight",
      "Vital tasks and colour labels, with search and filters that survive a reload",
      "Add, edit in place, complete, and delete with Undo; Ctrl+Z works too",
      "Keyboard and screen-reader friendly: n adds, / searches, a skip link, and no axe violations, contrast included",
    ],
    /* The first project with a server. Every line checked against the repo:
       supabase/migrations, supabase/config.toml and src/features/tasks/sync. */
    architecture: {
      dataModel:
        "Dexie over IndexedDB on the device is what the interface reads and writes. Signed in, tasks and labels mirror to two Supabase Postgres tables under row-level security, so each account only ever reads and writes its own rows.",
      api: "No API routes. A client-side sync engine pushes and pulls in batches against Supabase. A database trigger settles conflicts: last write wins, a device clock running fast can win by at most five minutes, and a deletion is final.",
      auth: "Optional Google sign-in through Supabase Auth. Without an account the app works fully offline on one device.",
      hosting: "Vercel for the app; Supabase for Postgres and sign-in.",
    },
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
    /* From the repo's package.json: a Next.js app, not Vite. */
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Zustand"],
    link: "https://shop.anthonyugwuja.dev",
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
    link: "https://space.anthonyugwuja.dev",
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
  /* The resume's own title line, not a copy of it: the share cards and the
     document a recruiter downloads should never describe two people. */
  title: resumeContent.titles.default,
  /* Search and social copy. One title and one description for the home page,
     used by the root layout for <title>, Open Graph and Twitter alike, so the
     three cannot drift apart the way they did when each was typed out. */
  seo: {
    title: "Anthony Ugwuja — full-stack developer and AI evaluator",
    description:
      "Full-stack developer (React, Next.js, TypeScript, Node.js) and registered pharmacist. I build product interfaces and evaluate AI models, catching what they get wrong in code and in clinical and scientific answers.",
  },
  phone: "+234 903 257 0130",
  email: "anthonyugwujac@gmail.com",
  location: "Abuja, Nigeria",
  availability: "Remote, anywhere",
  /* The first entry on /work, ahead of every project (the Projects rule).
     Not a Project: the real tasks are under NDA, so there is no live link
     and no screenshot. The sample is an original task built the same way,
     and its showcase at /work/renal-dosing-task is what the entry links to. */
  evaluation: {
    title: "AI evaluation",
    period: "Nov 2025 – Present",
    role: "Self-employed, remote",
    body: "I evaluate and stress-test AI models. I author expert-level tasks built to stump frontier models in chemistry, biology and clinical pharmacy, including terminal-based benchmarks where an agent must reconcile messy synthetic patient records and carry out pharmacokinetic calculations. I also annotate image, video and audio data, verify facts, and rate and compare model responses against detailed guidelines. Every task I author ships with evidence that its grading is sound. Client and task details stay under NDA; the sample below is an original task built the same way.",
    sample: {
      title: "Renal dose check",
      summary:
        "An original terminal task. An agent checks fifteen synthetic patients' medication orders against renal dosing rules in a chart with mixed units, and 32 tests grade the result. Eight traps each change one answer; two valid look-alikes break blanket rules.",
      /* One line, for the home page's Selected work card. */
      teaser: "Building tasks that stump frontier models in clinical pharmacy.",
      href: "/work/renal-dosing-task",
      repo: "https://github.com/teesmile/renal-dosing-task",
    },
  },
  takingWork: true,
  resumePdf: "/Anthony-Ugwuja-Resume.pdf",
  currently:
    "Reading model-written code most of the week, and building the next thing with a real server behind it.",
  statement:
    "Pharmacist by training, engineer by choice. I ship across the stack and catch what AI gets wrong.",
  /* The hero says it in two voices: the headline in Syne, the line under it
     in monospace, as if the second sentence were typed into an editor. */
  headline: "Pharmacist by training, engineer by choice.",
  monoLine: "I ship across the stack and catch what AI gets wrong.",
  /* The span the lint squiggle is drawn under. Must appear in monoLine. */
  monoFlag: "what AI gets wrong",
  // The dated spine on /about. Two tracks running in parallel, not one career
  // replacing another — which is the actual story.
  timeline: [
    { period: "2017 – 2023", label: "B.Pharm, University of Nigeria, Nsukka", track: "pharmacy" },
    { period: "2020", label: "First code, written during pharmacy school", track: "code" },
    { period: "May 2022 – Sep 2022", label: "Full stack developer trainee, Zuri Team", track: "code" },
    { period: "Feb 2024", label: "Provisional pharmacist licence", track: "pharmacy" },
    { period: "Oct 2024 – Oct 2025", label: "Diploma in Frontend Engineering, AltSchool Africa", track: "code" },
    { period: "May 2025 – May 2026", label: "Pharmacy intern, Federal Medical Centre, Keffi", track: "pharmacy" },
    { period: "Nov 2025 – Present", label: "AI training and evaluation, self-employed", track: "code" },
    { period: "Jul 2026 – Present", label: "Cloud Computing, AltSchool Africa", track: "code" },
    { period: "Aug 2026 – Present", label: "Pharmacist, NYSC, Nasarawa State University clinic", track: "pharmacy" },
    { period: "Oct 2026", label: "Full pharmacist licence", track: "pharmacy" },
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
      language: "tsx" as const,
      context: "Auth — reading a session token",
      lines: [
        "import { jwtDecode } from 'jwt-decode';",
        "",
        "export function getUser(token: string) {",
        "  const claims = jwtDecode<Claims>(token);",
        "  return claims.role === 'admin' ? adminView(claims) : userView(claims);",
        "}",
      ],
      markedLine: 4,
      verdict:
        "jwtDecode only base64-decodes the payload — it never checks the signature. Anyone can hand-write a token claiming role admin and this will believe it.",
      fix: ["  const { payload } = await jwtVerify(token, publicKey);"],
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
      context: "Python — collecting results",
      lines: [
        "def add_result(value, results=[]):",
        "    results.append(value)",
        "    return results",
        "",
        "add_result('a')  # ['a']",
        "add_result('b')  # ['a', 'b'] — the list survived",
      ],
      markedLine: 1,
      verdict:
        "The default list is built once, when the function is defined, and every call that omits the argument shares that same list. The second caller sees the first caller's data.",
      fix: ["def add_result(value, results=None):", "    results = [] if results is None else results"],
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
      context: "MongoDB — a login lookup",
      lines: [
        "const user = await users.findOne({",
        "  email: req.body.email,",
        "  password: req.body.password,",
        "});",
      ],
      markedLine: 3,
      verdict:
        "A JSON body can send { \"$ne\": null } where a string was expected, and the query matches the first user with any password at all. The operator is the injection — no quotes needed.",
      fix: [
        "const user = await users.findOne({ email: String(req.body.email) });",
        "const ok = user && (await verifyHash(user.hash, String(req.body.password)));",
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
    {
      language: "tsx" as const,
      context: "Money — totalling a cart",
      lines: [
        "const total = items.reduce((sum, item) => sum + item.price, 0);",
        "",
        "// 0.1 + 0.2 === 0.30000000000000004",
        "return `$${total.toFixed(2)}`;",
      ],
      markedLine: 1,
      verdict:
        "Prices in binary floating point drift as they add up. On a long cart the error surfaces as a penny that appears between the subtotal shown and the amount charged, and the two systems disagree forever after.",
      fix: [
        "const totalCents = items.reduce((sum, item) => sum + item.priceInCents, 0);",
        "return formatMoney(totalCents);",
      ],
    },
    {
      language: "tsx" as const,
      context: "React — a live price subscription",
      lines: [
        "useEffect(() => {",
        "  socket.on('price', setPrice);",
        "}, [symbol]);",
      ],
      markedLine: 2,
      verdict:
        "Every change of symbol adds another listener and removes none. After a few switches one message updates state several times, and the component keeps listening long after it unmounts.",
      fix: ["  return () => socket.off('price', setPrice);"],
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
  // The data row stayed empty until something shipped with a database: the
  // todo app's sync (Supabase Postgres) is the first.
  stack: [
    {
      layer: "Frontend",
      items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML", "CSS"],
    },
    { layer: "Backend", items: ["Node.js", "Python", "Django"] },
    { layer: "Data", items: ["Supabase", "PostgreSQL", "IndexedDB"] },
    { layer: "Infrastructure", items: ["Git", "GitHub", "Vercel", "pnpm", "Linux"] },
    /* Practices rather than tools: no logos exist for them, so the row draws
       them as text chips instead of borrowing an icon that means something
       else. */
    {
      layer: "AI evaluation",
      kind: "practice",
      items: [
        "LLM evaluation",
        "Adversarial task authoring",
        "Image, video and audio annotation",
        "Fact verification",
        "Response rating",
      ],
    },
  ] as StackLayer[],
  // Page prose lives here so it can be edited in one file.
  copy: {
    heroSupport:
      "Bugs from code a model wrote. I read its clinical and scientific answers the same way, looking for the mistake that survives a quick read.",
    aboutHeading: "I read other people's code for a living. Mine included.",
    aboutParagraphs: [
      "I trained as a pharmacist at the University of Nigeria, Nsukka. I wrote my first code in 2020, partway through the degree, and kept going after it: HTML and CSS first, then JavaScript, then React.",
      "Now I build interfaces in React and TypeScript, and I use AI tools while I do it. In the same week I get paid to read code a model wrote and say exactly what is wrong with it — the bug, why it bites, and the version that works.",
      "The second job changed how I do the first. Read enough confident, broken answers and you stop trusting code that merely looks right. Including your own.",
      "I am working across the whole stack now. The todo app on the Work page has a database and Google sign-in behind it, and syncs across devices.",
    ],
    aboutStackHeading: "What I work with",
    workHeading: "Things I\u2019ve built, and what each one taught me.",
    workArchiveLink: "Everything else, including the training work",
    writingHeading: "Decisions, and what they cost.",
    contactHeading: "Open to remote AI evaluation and full-stack work.",
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
