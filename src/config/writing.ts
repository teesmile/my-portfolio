export type Section = {
  id: string;
  heading: string;
  paragraphs: string[];
  /** Drawn inline, at the point the section explains the thing. */
  figure?: string;
  /** Links set after the section's paragraphs. Paragraphs stay plain strings. */
  links?: { text: string; href: string }[];
  /**
   * Evidence images, after the paragraphs: recreated screens or captures,
   * served through next/image as WebP under 300 KB. `caption` is the
   * figure's own caption, copied word for word.
   */
  images?: { src: string; width: number; height: number; alt: string; caption: string }[];
};

/* A fixed vocabulary rather than free tags: five topics the site will
   plausibly cover, so the filter row stays short and a new piece has to pick
   a lane instead of inventing one. */
export type Topic = "Engineering" | "AI" | "Pharmacy" | "Health" | "Notes";

export type WritingEntry = {
  slug: string;
  topic: Topic;
  title: string;
  /**
   * When the piece went out, as a full timestamp in West Africa Time, e.g.
   * "2026-11-06T22:22:32+01:00". A bare date was read as UTC midnight, so
   * anyone west of Greenwich (and LinkedIn's Post Inspector) saw the evening
   * before. The date shown on the page is taken from this, never typed
   * separately, so the two cannot disagree.
   */
  published: string;
  /**
   * When the piece last changed in a way a reader would notice, in the same
   * West Africa Time format. Absent until then. Becomes dateModified and the
   * sitemap's lastmod.
   */
  updated?: string;
  standfirst: string;
  /**
   * Search and share copy. The page keeps its own headline and standfirst;
   * these spend a search result's ~60 and ~155 characters on what the piece
   * is about. `title` is the whole <title>, without the name template.
   */
  seo: { title: string; description: string };
  /**
   * The project the piece is about. A case study at that address lists the
   * piece under "Related writing"; the piece links back at its foot.
   */
  project?: { name: string; href: string };
  sections: Section[];
  /**
   * A draft is built and reachable at its URL, so it can be read in place
   * before it goes out, but it is left out of /writing and the sitemap and
   * carries noindex. Delete the line to publish.
   */
  draft?: true;
};

export const writing: WritingEntry[] = [
  {
    /* Every date and value is from the repository's history and the
       recreated Search Console screens in public/writing/moving-to-a-custom-domain. */
    slug: "moving-to-a-custom-domain",
    topic: "Engineering",
    title: "Moving my site to a custom domain: how Google switched in a day",
    published: "2026-11-10T16:26:41+01:00",
    draft: true,
    standfirst:
      "I gave my portfolio its own domain and Google kept showing the old vercel.app address instead. The fixes were small. What made Google switch was asking it to look again.",
    seo: {
      title: "Moving to a custom domain: how Google switched in a day",
      description:
        "My new domain lost to the old vercel.app address in Google. What \"Google chose different canonical\" meant, the fixes, and how it switched in a day.",
    },
    project: { name: "This site's source", href: "https://github.com/teesmile/my-portfolio" },
    sections: [
      {
        id: "the-email",
        heading: "The email",
        paragraphs: [
          "My portfolio started where Vercel puts every project, at teesmile.vercel.app. When I gave it its own domain, anthonyugwuja.dev, I assumed the new address would simply take over in search. It didn't.",
          "Search Console sent me an email with a reason I had never seen before: Duplicate, Google chose different canonical than user. Searching my own name showed why it mattered. The old vercel.app address was there, under a title from a version of the site I had already replaced, and my own domain wasn't anywhere.",
        ],
        images: [
          { src: "/writing/moving-to-a-custom-domain/01-before-google-email.webp", width: 1400, height: 627, alt: "The Search Console email, headed New reason preventing your pages from being indexed, with the reason Duplicate, Google chose different canonical than user highlighted.", caption: "Recreated from the Search Console email, November 2026." },
          { src: "/writing/moving-to-a-custom-domain/03-before-search.webp", width: 1400, height: 1156, alt: "Search results for anthony ugwuja before the move: three other pages, then the old teesmile.vercel.app listing titled Anthony Ugwuja | Frontend Engineer, highlighted. The custom domain is not in the results.", caption: "Recreated from my searches before the domain move, early November 2026. Phone numbers and photos left out." },
        ],
      },
      {
        id: "what-google-was-telling-me",
        heading: "What Google was telling me",
        paragraphs: [
          "A canonical is the address a page says is the real one when the same content lives at more than one. Every page on my site already declared anthonyugwuja.dev as its canonical. URL Inspection showed that Google had read that and chosen differently: user-declared canonical, anthonyugwuja.dev; Google-selected canonical, teesmile.vercel.app.",
          "The canonical tag is a hint, not an instruction. When Google disagrees with it, Google's choice is the one that gets shown, and the page you declared is filed as a duplicate of it.",
        ],
        images: [
          { src: "/writing/moving-to-a-custom-domain/02-before-url-inspection.webp", width: 1400, height: 958, alt: "URL Inspection for https://anthonyugwuja.dev/: URL is not on Google. Last crawl Nov 6, 2026. The user-declared canonical is anthonyugwuja.dev and the Google-selected canonical is teesmile.vercel.app, highlighted.", caption: "Recreated from Google Search Console, as shown on 9 November 2026." },
        ],
      },
      {
        id: "why-the-old-address-won",
        heading: "Why the old address won",
        paragraphs: [
          "Three hosts were serving identical HTML: teesmile.vercel.app, teesmilex.vercel.app (the site deploys to two Vercel projects) and anthonyugwuja.dev. Every preview deployment served a full copy of the site too, on its own vercel.app address. Nothing told a crawler which copy was the original.",
          "Google had already indexed teesmile.vercel.app. Given three identical pages and a hint pointing elsewhere, it kept the one it had.",
        ],
      },
      {
        id: "one-address-said-four-ways",
        figure: "one-address",
        heading: "One address, said four ways",
        paragraphs: [
          "The fix was to stop asking and start stating, in every way a crawler listens. All four went live on 7 November.",
          "Permanent redirects. Every path on teesmile.vercel.app and teesmilex.vercel.app now answers with a 308 to the same path on anthonyugwuja.dev. They match the exact host names, so preview deployments keep serving their own branch for review.",
          "One address in the code. The canonical on every page, the sitemap, robots.txt and the structured data all read the domain from a single constant, so no page can name another host by accident.",
          "Previews closed to crawlers. A preview build's robots.txt says Disallow: /, so a draft can never compete with the page it is a draft of.",
          "One identity. Structured data on the home page links the domain to my GitHub, LinkedIn and X profiles, so they read as one person.",
          "The redirect is the part a crawler can't argue with. The canonical is the part that tells it which address to keep.",
        ],
      },
      {
        id: "asking-google-to-look-again",
        heading: "Then I asked Google to look again",
        paragraphs: [
          "On 9 November, two days after the fixes went live, URL Inspection still showed the old verdict. The reason was in the same screen: the last crawl was 6 November. Google hadn't been back since the fix, so it hadn't seen any of it.",
          "So I submitted the sitemap in Search Console on 9 November. Google read it the same day and found all 24 pages, each on the new address. It crawled the home page again at 4:49 that afternoon, and by the next day URL Inspection said URL is on Google, with the Google-selected canonical now the inspected URL itself.",
        ],
        images: [
          { src: "/writing/moving-to-a-custom-domain/06-after-sitemap.webp", width: 1400, height: 487, alt: "Search Console's sitemap report: https://anthonyugwuja.dev/sitemap.xml, submitted and last read Nov 9, 2026, status Success, 24 discovered pages.", caption: "Recreated from Google Search Console, as shown on 10 November 2026." },
          { src: "/writing/moving-to-a-custom-domain/05-after-url-inspection.webp", width: 1400, height: 958, alt: "URL Inspection for https://anthonyugwuja.dev/ after the fix: URL is on Google, page is indexed, last crawl Nov 9, 2026 at 4:49 PM, and the Google-selected canonical is the inspected URL.", caption: "Recreated from Google Search Console, as shown on 10 November 2026." },
        ],
      },
      {
        id: "the-search-a-day-later",
        heading: "The search, a day later",
        paragraphs: [
          "Searching my name on 10 November, my own domain was second and the old vercel.app listing was gone. The snippet under it still uses wording from before I rewrote the site's descriptions that week; Google refreshes those when it next crawls the page.",
        ],
        images: [
          { src: "/writing/moving-to-a-custom-domain/04-after-search.webp", width: 1400, height: 1156, alt: "Search results for anthony ugwuja after the move: anthonyugwuja.dev is second, titled Anthony Ugwuja - full-stack developer and AI evaluator, highlighted, and the vercel.app listing is gone.", caption: "Recreated from Google search results, 10 November 2026. Phone numbers and photos left out." },
          { src: "/writing/moving-to-a-custom-domain/00-before-after-search.webp", width: 1400, height: 755, alt: "The two searches side by side. Before, the fourth result is the old vercel.app address. After, the second result is anthonyugwuja.dev.", caption: "Recreated from my searches before the domain move (early November) and on 10 November 2026. Phone numbers and photos left out." },
        ],
      },
      {
        id: "what-id-do-on-day-one",
        heading: "What I'd do on day one next time",
        paragraphs: [
          "Put the domain on before sharing a single link, and redirect the default vercel.app host to it from the start, so there is never a second copy for Google to prefer.",
          "Read the address from one constant everywhere it appears, and close preview builds to crawlers before the first preview exists.",
          "The day the domain goes live, submit the sitemap and inspect the home page in Search Console. The fixes were in place for two days before Google noticed them. Asking it to look took a minute.",
          "Search Console also has a Change of Address tool for moves between sites you can verify. The old address is set up so it can still be verified for that.",
        ],
      },
    ],
  },
  {
    /* Every fact about the task is from the renal-dosing-task repository
       (README, patient design table, evidence results). */
    slug: "building-a-renal-dose-check-benchmark",
    topic: "AI",
    title: "Ten ways to misread a ward chart, and proving the tests catch them",
    published: "2026-11-08T01:15:15+01:00",
    standfirst:
      "I built a small benchmark where an AI agent checks drug doses against kidney function. The maths is handed over in the instruction. The hard part is reading the chart, and then proving the grading is fair.",
    seo: {
      title: "Ten ways to misread a ward chart: a clinical AI benchmark",
      description:
        "How I built a benchmark where an AI agent checks drug doses against kidney function, the chart traps that catch it out, and how I proved the grading fair.",
    },
    project: { name: "Renal dose check", href: "/work/renal-dosing-task" },
    sections: [
      {
        id: "the-maths-is-the-easy-part",
        heading: "The maths is the easy part",
        paragraphs: [
          "The task gives an agent a terminal and a small ward chart: fifteen synthetic adults, their creatinine results, their medication orders, and a rules file with a dose limit for each level of kidney function. For each patient it has to work out creatinine clearance, an estimate of how well the kidneys clear drugs from the blood, using the Cockcroft-Gault formula, then flag every active order whose daily dose is over the limit. It writes one line per patient, and 32 tests grade the file.",
          "I'm a pharmacist, and I spent a year as an intern on hospital wards, where the slips this task tests are the ones that matter.",
          "I gave the formula away. The instruction states it, along with both unit conversions and the exact rules. So the task doesn't ask whether a model knows pharmacy. It asks whether it reads the chart properly, which is a different skill, and it's the one this task is about.",
          "The drugs are invented, and so are the limits. Aldrovexin, Bremazotan, Cylvarone, Dorvatinex and Exalmizide don't exist, and none of this is dosing guidance.",
        ],
      },
      {
        id: "where-agents-go-wrong",
        figure: "renal-one-row",
        heading: "Where agents go wrong with clinical data",
        paragraphs: [
          "The mistakes I built this around aren't exotic. They're the ones a fast reader makes on a messy chart. A creatinine of 150 is in µmol/L, but it sits in the same column as values in mg/dL, and the unit is one column over. A weight of 176 is in pounds. An order that breaks the limit was stopped last week. BD and TDS are Latin abbreviations for twice and three times a day, and q8h means every eight hours, which is three doses, not eight. And labs.csv isn't sorted by time, so the last row for a patient isn't always their latest result.",
          "Each of those looks like a small slip. None of them is small. Skip the µmol/L conversion and a patient whose clearance is 32.5 mL/min comes out at 0.4, which reads as kidneys that have stopped working. On a ward that means a drug gets withheld from someone who needs it.",
        ],
      },
      {
        id: "one-trap-one-answer",
        figure: "renal-trap-isolation",
        heading: "One trap, one answer",
        paragraphs: [
          "The design rule I cared about most: each trap changes exactly one patient's answer, or a small group built for the same trap, and no patient carries two. If a model fails on PT008, it counted the discontinued order. It can't be anything else, because nothing else about PT008 is hard.",
          "That turns a score into a diagnosis. A benchmark that piles every difficulty onto every patient can tell you a model failed. It can't tell you why, and the why is what someone improving the model needs.",
          "I didn't take the rule on trust. A script runs each mistake on its own and records which patients' answers move. Every mistake moves at least one patient, and each one moves only the patients designed for it. A trap that never changes an answer measures nothing, and that's an easy trap to build without noticing.",
        ],
      },
      {
        id: "look-alikes-that-punish-shortcuts",
        figure: "renal-magnitude-rule",
        heading: "Look-alikes that punish shortcuts",
        paragraphs: [
          "Traps alone reward a cheap trick. If every pound weight in the chart is a big number, a model can pass with a rule like \"anything over 140 must be pounds\" without ever reading the unit column. So two patients are there to break blanket rules.",
          "PT007 really does weigh 150 kg, recorded in kg. The \"big number means pounds\" rule turns him into 68 kg, his clearance falls from 152 to 69, and a Cylvarone order that's fine gets flagged. PT004 is a frail 90-year-old weighing 38 kg with a creatinine of 16 µmol/L. Guess the unit from the size of the number and 16 becomes mg/dL, and she looks like she's in end-stage kidney failure.",
          "Neither patient is a trick. People that size are common, and low muscle mass really does mean low creatinine. They're exactly the patients a shortcut fails, which is why the only rule that passes every patient is to read the unit column.",
        ],
      },
      {
        id: "is-the-answer-key-right",
        heading: "Is the answer key right?",
        paragraphs: [
          "A benchmark grades against an answer key, and an answer key can be wrong. Mine comes from a reference solution in Python. To check it, I wrote a second implementation in SQL, against the instruction alone, sharing no code with the first: unit conversion in CASE expressions, the latest lab by MAX(collected_at), frequencies through a lookup table.",
          "The two agree on all fifteen patients, to 0.1 mL/min and to the exact set of flagged orders. The key also records a SHA-256 hash of every input file, so the check fails if anyone changes the chart without rebuilding the answers.",
        ],
      },
      {
        id: "do-the-tests-tell-right-from-wrong",
        figure: "renal-grading-evidence",
        heading: "Do the tests tell right from wrong?",
        paragraphs: [
          "Then the tests themselves. A simulated agent runs under 25 configurations, and the real test file grades every one. The reference and a mistake-free run have to pass. So do six variants a careful agent might reasonably choose: 88.42 instead of 88.4, 2.2 or 2.2046 pounds to the kilo, rounding the inputs first, choosing the band from the rounded clearance, listing the flags in a different order.",
          "Those variants matter as much as the mistakes. A grader that fails a sensible choice is measuring pedantry, and a model trained against it learns the wrong lesson. Everything else has to fail: each of the ten mistakes on its own, and seven broken outputs such as a missing patient, a duplicate line, or a clearance written as a string. All 25 land where they should.",
        ],
      },
      {
        id: "why-one-percent-cant-flip-a-flag",
        figure: "renal-tolerance-margin",
        heading: "Why 1% can't flip a flag",
        paragraphs: [
          "The tests accept a clearance within 1% of the reference, so honest rounding passes. That tolerance has a hidden risk: if a patient sat right on a band edge, a 1%-accurate answer could fall into the next band and get a different dose limit, and the flag test would fail an agent that did nothing wrong.",
          "So every reference clearance is at least 2% from every band edge for that patient's drugs, twice the tolerance. The closest is PT005, 5.8% away. The script checks that too.",
        ],
      },
      {
        id: "what-it-taught-me",
        heading: "What building it taught me about evaluating models",
        paragraphs: [
          "A test is a claim, and it needs evidence like any other claim. Writing the answer key is the half you can't skip. Proving it right, and proving the tests pass right answers and fail wrong ones, is the half that's easy to skip.",
          "A good trap is a precise description of what wrong looks like. If I can't say which patient changes and by how much, I haven't designed a trap, I've added noise. And every trap invites a shortcut, so the next thing to build is the case that breaks the shortcut.",
          "And grade the output, not the explanation. The tests read the answer file and nothing else. A model can write a confident paragraph about units and still divide by the wrong number, and only the number reaches the patient.",
        ],
        links: [
          { text: "See every trap and the evidence", href: "/work/renal-dosing-task" },
          { text: "Read the task on GitHub", href: "https://github.com/teesmile/renal-dosing-task" },
        ],
      },
    ],
  },
  {
    slug: "every-section-is-a-route",
    topic: "Engineering",
    title: "Every section is its own route",
    published: "2026-11-06T22:22:32+01:00",
    standfirst:
      "I replaced a single page of anchor links with six routes, and three bugs disappeared without being fixed.",
    seo: {
      title: "Every section its own route in the Next.js App Router",
      description:
        "Why I replaced a one-page portfolio of anchor links with six Next.js routes, the three bugs that disappeared without being fixed, and what it cost.",
    },
    project: { name: "This site's source", href: "https://github.com/teesmile/my-portfolio" },
    sections: [
      {
        id: "the-shape-i-started-with",
        figure: "anchors-vs-routes",
        heading: "The shape I started with",
        paragraphs: [
          "The site used to be one long page. Hero, services, projects, about, skills, contact, stacked in a column, with a nav that scrolled you to an anchor. It is the default shape for a portfolio and I had never questioned it.",
        ],
      },
      {
        id: "three-things-that-pushed-me-off-it",
        heading: "Three things that pushed me off it",
        paragraphs: [
          "The nav active state was a lie. It only updated when you clicked a link, so scrolling past a section never changed it, and landing on a deep link or reloading the page showed the wrong one.",
          "Every section needed an entrance animation to justify existing, which is how motion turns into decoration. Fade-and-slide-up on six blocks is not choreography, it is a tic.",
          "And one page can only carry one title and one description, so every view shared metadata that described none of them.",
        ],
      },
      {
        id: "what-routes-fixed-for-free",
        figure: "state-source",
        heading: "What routes fixed for free",
        paragraphs: [
          "Active state is now derived from the current path, so a deep link, a reload and a back button are all correct by construction. There is no scroll position to track and no observer to keep in sync.",
          "Each view carries its own title and description. And motion has exactly one job left: the transition between views.",
        ],
      },
      {
        id: "the-cost",
        figure: "cut-vs-continuous",
        heading: "The cost",
        paragraphs: [
          "The transition is now load-bearing. On one page, a bad scroll animation is a small annoyance; between routes, a hard cut is the most visible flaw the site can have. I have moved work into the motion phase rather than removed it.",
          "One guard made the change safe. Typed routes turn a link to a route that does not exist into a compile error, so the structure cannot rot quietly as I move things around. The first time I enabled it, it rejected my own nav links - they had been plain strings that nothing had ever checked.",
        ],
      },
    ],
  },
  {
    slug: "what-unoptimized-turns-off",
    topic: "Engineering",
    title: "A 2.4 MB portrait, and what unoptimized actually turns off",
    published: "2026-11-06T22:22:32+01:00",
    standfirst:
      "One image was larger than the rest of the site combined. The fix was four lines, but the interesting part is why it was that large.",
    seo: {
      title: "What next/image unoptimized turns off: a 2.4 MB portrait",
      description:
        "One image outweighed the rest of the site. What Next.js image optimisation does, what unoptimized switches off, and the four-line fix.",
    },
    project: { name: "This site's source", href: "https://github.com/teesmile/my-portfolio" },
    sections: [
      {
        id: "the-numbers",
        figure: "oversized-box",
        heading: "The numbers",
        paragraphs: [
          "The portrait on my about page was 2,507,195 bytes: a 1254 by 1254 PNG at 16 bits per channel, displayed in a circle 320 pixels wide. Every visitor downloaded all of it to look at a thumbnail.",
        ],
      },
      {
        id: "what-the-prop-actually-does",
        figure: "optimizer-bypass",
        heading: "What the prop actually does",
        paragraphs: [
          "The image was rendered with unoptimized set, and quality={100} sitting on the line above it. That pairing taught me something. unoptimized does not mean lower effort - it means the optimizer is skipped entirely, so no resizing, no format conversion, no generated srcset. Which also means quality is never read.",
          "The two props look like they are arguing about compression. In fact one of them had already ended the conversation.",
        ],
      },
      {
        id: "three-reasons-it-was-big",
        heading: "Three reasons it was big",
        paragraphs: [
          "Only one of them was compression. It was four times wider than it needed to be. It was 16 bits per channel where 8 is indistinguishable at that size. And it carried an alpha channel that was uniformly opaque from corner to corner - roughly a quarter of the file storing the same number over and over.",
          "Converted to WebP at 640 pixels, which is twice the display size for high-density screens, it came out at 16,712 bytes. Served through the image optimizer it arrives as 11.6 KB. That is a 99.5% reduction for an image nobody will notice has changed.",
        ],
      },
      {
        id: "the-part-i-nearly-got-wrong",
        figure: "srcset-pick",
        heading: "The part I nearly got wrong",
        paragraphs: [
          "The sizes attribute is a description of your layout, not a request. The browser uses it to pick a candidate from the srcset before it knows anything about your CSS. My container is a fixed 320 pixels at every breakpoint, so sizes=\"320px\" is the truth. A responsive value copied from a tutorial would have described a layout I do not have, and the browser would have believed it.",
        ],
      },
    ],
  },
];

const WAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+01:00$/;
for (const entry of writing) {
  if (!WAT.test(entry.published)) {
    throw new Error(`${entry.slug}: published must be a full +01:00 timestamp, got "${entry.published}"`);
  }
}

/** The calendar date in West Africa Time, as the page shows it. */
export const dateOf = (entry: WritingEntry) => entry.published.slice(0, 10);

/** The author, for metadata, article tags and structured data alike. */
export const AUTHOR = { name: "Anthony Ugwuja", url: "https://anthonyugwuja.dev/about" } as const;

/** What /writing, the sitemap and the home page list. Drafts are left out. */
export const published = writing.filter((entry) => !entry.draft);

/** 200 words per minute, rounded up, floor of one minute. */
export function readingTime(entry: WritingEntry) {
  const words = entry.sections
    .flatMap((section) => [section.heading, ...section.paragraphs])
    .join(" ")
    .split(/\s+/).length;

  return Math.max(1, Math.ceil(words / 200));
}
