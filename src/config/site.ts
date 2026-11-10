

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
  /** Search and share copy for the case study. Kept apart from `description`,
   *  which is the page's own opening paragraph: a search snippet has about
   *  155 characters, the page does not. `title` runs through the layout's
   *  "%s — Anthony Ugwuja" template. */
  seo: { title: string; description: string };
  /** When the case study's content last changed, in West Africa Time. The
   *  sitemap's lastmod. Bump it with a change a reader would notice, not with
   *  a refactor or a new link. */
  updated: string;
  /** "What was hard": each entry a short paragraph, taken from the repo and
   *  its history, never from memory. */
  hard?: string[];
  /** Filled once a project has a server. Phase 3's flagship is the first. */
  architecture?: {
    dataModel: string;
    api: string;
    auth: string;
    hosting: string;
  };
};

/* Ordered by the Projects rule in the working rules: strongest and newest first,
   simpler ones further down. Nothing is ever deleted from this list; a
   weaker project moves down here and comes off the resume instead. */
const projects: Project[] = [
  {
    id: 1,
    slug: "todo-app",
    preview: "/work/todo-app.webp",
    title: "Todo App",
    seo: {
      title: "Offline-first todo app with Supabase sync",
      description:
        "A local-first Next.js task list that works offline, installs like an app and syncs across devices through Supabase. Case study with architecture.",
    },
    updated: "2026-11-09",
    /* What v1 shipped and verified (todo-app-tsc docs/plan.md, Phases 0–12):
       sync in Phase 10, install and offline in Phase 11. */
    description:
      "A local-first task list that installs like an app and works fully offline, with optional Google sign-in that syncs tasks and labels across devices. New tasks land at the top, or switch to grouping by due date, with Vital tasks, labels, search, and delete with Undo.",
    role: "Full-stack implementation",
    year: "2026",
    tech: ["Next.js", "React", "TypeScript", "Dexie", "IndexedDB", "Supabase", "Tailwind CSS"],
    link: "https://todo.anthonyugwuja.dev",
    repo: "https://github.com/teesmile/todo-app-tsc",
    highlights: [
      "Works offline: tasks live in IndexedDB on the device, and edits made in two tabs at once don't silently replace each other",
      "Optional Google sign-in syncs tasks and labels across devices; without it, nothing leaves the device",
      "Installs like an app and opens offline: a service worker precaches the whole static export and never caches Supabase data",
      "Newest first, or grouped by when it's due: Overdue, Today, Tomorrow, Upcoming, No date and Done, re-grouped at midnight",
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
      hosting: "Vercel serves the static export as plain files, and a service worker precaches it so it installs and opens offline. Supabase for Postgres and sign-in.",
    },
  },
  {
    id: 4,
    slug: "roasted",
    preview: "/work/roasted.webp",
    title: "Roasted",
    seo: {
      title: "Roasted, a Farcaster mini app",
      description:
        "A Farcaster mini app that reads a profile and recent casts, writes a roast, turns the avatar into a meme and shares it as a cast. Built on server actions.",
    },
    updated: "2026-11-09",
    /* Checked against teesmile/roasted-app at d84e741 and the live app on
       2026-11-09: a real roast and its avatar meme ran end to end; the
       upload guard is in src/lib/uploadGuard.ts. */
    description:
      "A Farcaster mini app that reads a user's profile and recent casts, writes a short roast of them, turns their avatar into a meme, and shares the result as a cast.",
    role: "Design and build",
    year: "2025",
    tech: ["Next.js", "React", "TypeScript", "Farcaster Mini App SDK", "Neynar API", "Gemini", "Replicate", "Vercel Blob", "Tailwind CSS"],
    link: "https://castroast.vercel.app",
    repo: "https://github.com/teesmile/roasted-app",
    highlights: [
      "Runs inside Farcaster clients, where the mini app SDK fills in the signed-in user's handle",
      "Three services at two speeds: the roast text shows as soon as Gemini answers, and the avatar meme from Replicate swaps in when it is ready",
      "Sharing draws a 1080×1080 card on a canvas in the browser and uploads it, because a cast can only embed a public URL; outside Farcaster it downloads instead",
      "Uploads only with a signed, single-use token issued with each roast: one 1080×1080 PNG up to 3 MB, five per minute per address, named by the server",
    ],
    architecture: {
      dataModel: "No database: each roast is computed on request from the profile and its 30 most recent casts. Share cards are stored in Vercel Blob.",
      api: "Next.js server actions: a Neynar lookup, the Gemini roast, a Replicate image edit, and a guarded Blob upload. API keys stay on the server.",
      auth: "None of its own. Inside Farcaster the client supplies the viewer's identity; the upload token ties each share to the roast it came from.",
      hosting: "Vercel, with a domain-signed manifest at /.well-known/farcaster.json that Farcaster checks before listing the app.",
    },
  },
  {
    id: 2,
    slug: "ecommerce-product-page",
    preview: "/work/ecommerce-product-page.webp",
    title: "E-Commerce Product Page",
    seo: {
      title: "E-commerce product page in Next.js",
      description:
        "A product page built from a design file: gallery thumbnails, a cart that counts correctly, and one responsive layout instead of a separate mobile build.",
    },
    updated: "2026-11-10",
    hard: [
      "My first project in Next.js and TypeScript, coming from React and plain JavaScript. Typing the cart store and the props around it is where most of the time went, and it paid off: the types caught mistakes early and made the cart logic safe to refactor.",
      "A cart that counts correctly. The store keeps a running item count for the header badge and a running total, so adding a product that is already in the cart sets its quantity instead of adding it twice, and moves the count and total by the difference. Removing a line takes back exactly what it added.",
      "One index drives the main image, the thumbnails and the lightbox, so the photo that opens full size is the one you were looking at, and stepping through it in either place keeps the other in step.",
    ],
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
    seo: {
      title: "Space tourism site: layout and transitions",
      description:
        "A four-section site I used to practise layout systems and page transitions. Same shell, four content types, no page that looks bolted on.",
    },
    updated: "2026-11-10",
    hard: [
      "Four sections, four background photographs, each in a mobile, a tablet and a desktop crop. Rather than repeat twelve background rules across the pages, one component maps each route to its three crops, and each section's layout only says which route it is.",
      "The mobile menu had to animate closed as well as open. A component that has been removed can't play an exit animation, so the menu sits inside Framer Motion's AnimatePresence, which keeps it mounted until the closing animation has finished.",
      "Destination, Crew and Technology each switch their content with tabs driven by one selected index, so the tab, the picture and the text can't fall out of step.",
    ],
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
  /* The site's own title line, used on the share cards. It used to be the
     resume's master title by reference; the CVs now say "Pharmacist" while
     the site keeps "Registered pharmacist", so the site states its own. */
  title: "Full-stack developer and AI evaluator · Registered pharmacist",
  /* Search and social copy. One title and one description for the home page,
     used by the root layout for <title>, Open Graph and Twitter alike, so the
     three cannot drift apart the way they did when each was typed out. */
  seo: {
    title: "Anthony Ugwuja — remote full-stack developer, AI evaluator",
    description:
      "Full-stack developer (React, Next.js, TypeScript, Node.js) and AI evaluator, open to remote work with UK, European and US teams. Pharmacist by training.",
  },
  phone: "+234 903 257 0130",
  email: "anthonyugwujac@gmail.com",
  /* Stated once on the site, on /contact, as a fact rather than a keyword:
     where, and what that means for a team's working day. */
  location: "Based in Nigeria",
  availability: "My working day overlaps fully with the UK and Europe, and partly with the US East Coast.",
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
    "I ship across the stack and catch what AI gets wrong. Pharmacist by training, engineer by choice.",
  /* The hero says it in two voices: the headline in Syne, the line under it
     in monospace. The headline leads with the work; the pharmacy background
     is the line under it, what sets the work apart rather than the title. */
  headline: "I ship across the stack and catch what AI gets wrong.",
  monoLine: "Pharmacist by training, engineer by choice.",
  /* The words the headline's one-time correction lands on ("right" struck,
     "wrong" typed). Must end the headline, before its full stop. */
  headlineFlag: "what AI gets wrong",
  /* When each standalone page's content last changed (West Africa Time),
     for the sitemap. Index pages take the newest date of what they list. */
  pagesUpdated: { about: "2026-11-09", resume: "2026-11-09", contact: "2026-11-10", renal: "2026-11-09" },
  // The dated spine on /about. Two tracks running in parallel, not one career
  // replacing another — which is the actual story.
  timeline: [
    { period: "2017 – 2023", label: "B.Pharm, University of Nigeria, Nsukka", track: "pharmacy" },
    { period: "2020", label: "First code, written during pharmacy school", track: "code" },
    { period: "May 2022 – Sep 2022", label: "Full stack developer trainee, Zuri Team and I4G", track: "code" },
    { period: "Feb 2024", label: "Provisional pharmacist licence", track: "pharmacy" },
    { period: "Oct 2024 – Oct 2025", label: "Diploma in Frontend Engineering, AltSchool Africa", track: "code" },
    { period: "May 2025 – May 2026", label: "Pharmacy intern, Federal Medical Centre, Keffi", track: "pharmacy" },
    { period: "Nov 2025 – Present", label: "AI training and evaluation, self-employed", track: "code" },
    { period: "Jul 2026 – Present", label: "Cloud Computing, AltSchool Africa", track: "code" },
    { period: "Aug 2026 – Present", label: "Pharmacist, NYSC, Nasarawa State University clinic", track: "pharmacy" },
    { period: "Oct 2026", label: "Full pharmacist licence", track: "pharmacy" },
  ] as { period: string | null; label: string; track: "pharmacy" | "code" }[],
  // Talks on /about, in the timeline's grid. The deck is the talk as given:
  // its own site, plus the PDF it exports.
  talks: [
    {
      period: "Aug 2025",
      title: "Basics of Antimicrobial Stewardship in Hospitals",
      venue: "Pharmacy interns' presentation, Federal Medical Centre, Keffi",
      slides: "https://talks.anthonyugwuja.dev",
      pdf: "https://talks.anthonyugwuja.dev/presentation.pdf",
      track: "pharmacy",
    },
  ] as { period: string; title: string; venue: string; slides: string; pdf: string; track: "pharmacy" | "code" }[],
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
    /* The services Roasted is built on. Four, so on /about the row merges
       into the one above as "Infrastructure and services". */
    { layer: "Services", items: ["Farcaster", "Neynar", "Gemini", "Replicate"] },
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
      "Now I build interfaces in React and TypeScript. In the same week I get paid to read code a model wrote and say exactly what is wrong with it — the bug, why it bites, and the version that works.",
      "The second job changed how I do the first. Read enough confident, broken answers and you stop trusting code that merely looks right. Including your own.",
      "I am working across the whole stack now. The todo app on the Work page has a database and Google sign-in behind it, and syncs across devices.",
    ],
    aboutStackHeading: "What I work with",
    workHeading: "Things I\u2019ve built, and what each one taught me.",
    writingHeading: "Decisions, and what they cost.",
    contactHeading: "Open to remote AI evaluation and full-stack work.",
    contactNote: "Email reaches me fastest.",
    labHeading: "Interaction experiments, one at a time.",
    labIntro:
      "Where I try the things a client project would not pay for, and where I settle arguments with a measurement instead of an opinion.",
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
      url: "https://www.linkedin.com/in/tonysmile",
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
