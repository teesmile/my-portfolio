# anthonyugwuja.dev

The portfolio of Anthony Ugwuja: pharmacist, full-stack developer and AI evaluator.

**Live: [anthonyugwuja.dev](https://anthonyugwuja.dev)**

What's on it:

- **Work.** The AI evaluation work first, with a full showcase of an original agent benchmark at [`/work/renal-dosing-task`](https://anthonyugwuja.dev/work/renal-dosing-task): ten trap pages built from the task's own data and graded by its own tests. Then projects, strongest and newest first, each with a case study.
- **Writing.** Short pieces on decisions and what they cost, each explained with inline diagrams.
- **Resume.** `/resume` and three PDF versions, all generated from one source file.
- **About** and **Contact.**

## Stack

- **Next.js 16** (App Router, static generation, typed routes), **React 19**, **TypeScript**
- **Tailwind CSS 4**, with every colour, type step and spacing value defined as a token in `src/app/globals.css`
- **GSAP** with `@gsap/react` for motion, **Lenis** for smooth scrolling (driven from GSAP's ticker)
- **Shiki** for code highlighting at build time, **simple-icons** for technology logos
- Fonts: Syne (display), Source Serif 4 (text), Martian Mono (the hero's monospace line)
- Hosted on **Vercel**

## Run it

Needs Node 20+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm build && pnpm start
```

`pnpm install` also points git at `.githooks/` (see *Resume PDFs* below).

## Where things live

| What | Where |
|---|---|
| Projects, page copy, stack, timeline, socials | `src/config/site.ts` |
| Writing pieces (text, figures, publish timestamps) | `src/config/writing.ts` |
| The resume, all three versions | `src/content/resume.ts` |
| Renal benchmark data (a frozen snapshot) | `src/content/renal-dosing/` |
| Page sections | `src/features/<name>/` |
| Shared layout (nav, footer, sticky hero, reveals) | `src/components/layout/` |
| Design tokens, including the illustration palette | `src/app/globals.css` |

## Resume PDFs

The resume exists once, in `src/content/resume.ts`. Every line carries a `place` that says which versions show it and in what order: `default` (the master, linked on the site), `ai` and `general`. Both `/resume` and the PDFs render from that file, so the page and the documents can't disagree.

```bash
pnpm resume                       # public/Anthony-Ugwuja-Resume.pdf
pnpm resume --variant ai          # public/Anthony-Ugwuja-Resume-AI.pdf
pnpm resume --variant general     # public/Anthony-Ugwuja-Resume-General.pdf
pnpm resume --variant ai --private   # private/…-private.pdf, with the phone number
```

How a PDF is made (`scripts/resume-pdf.mjs`):

1. Rebuilds the app if anything in `src/` is newer than the last build.
2. Starts the built app on a free local port and opens `/resume` in headless Chromium under print media, waiting for fonts and for the layout to settle.
3. Prints A4 with `Page.printToPDF`. The print stylesheet in `globals.css` sets the sizes: 11pt body, larger headings, 0.75in margins. No job, project or qualification splits across the page break.
4. Checks the result the way an applicant tracking system would read it, with two extractors (`pdftotext` and pdfjs). Every rendered line must survive, no words may fuse, no web-only text may appear, no date range may split across lines, and a public document must not contain the phone number.
5. Enforces the page rules: at most two pages, and never a second page holding a few stray lines. If page two would be that short, it reprints once in a tighter layout (body at the 10.5pt floor). If that still needs two pages, the check fails.

The phone number only renders when the local server was started by `pnpm resume --private`. A deployed instance ignores `?private=1`. Private PDFs go to `private/`, which is gitignored.

A pre-commit hook (`.githooks/pre-commit`) regenerates and stages the three public PDFs whenever `resume.ts` is committed, so a committed PDF never describes an older resume.

Needs `chromium`, `pdftotext` (poppler-utils) and ImageMagick's `convert`.

## Other scripts

| Command | What it does |
|---|---|
| `pnpm capture` | Screenshots each live project at 1440×900 into `public/work/<slug>.webp` (under 200 KB). Waits in real time until the page has loaded and any loading text is gone; fails after 20 s. |
| `pnpm snapshot:renal` | Rebuilds `src/content/renal-dosing/snapshot.json` from the [renal-dosing-task](https://github.com/teesmile/renal-dosing-task) repo by running its simulator and pytest suite, and refuses to write if the result disagrees with that repo's committed evidence. Needs `uv` and the repo checked out (`RENAL_TASK_DIR`, default `~/projects/personal/renal-dosing-task`). |
| `pnpm frames` | Records five motion scenarios at 4× CPU throttle and reports the longest frame in each against the 16.7 ms budget. |
