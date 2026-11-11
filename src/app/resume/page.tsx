import { readFile } from "node:fs/promises";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import type { Variant } from "@/content/resume";
import { documentFor, withContact, type ResumeDocument } from "@/content/resume-document";
import ResumeView from "@/features/resume/resume-view";

export const metadata: Metadata = pageMetadata({
  title: "Resume",
  fullTitle: "Resume - Anthony Ugwuja, full-stack developer, AI evaluator",
  description:
    "Resume of Anthony Ugwuja: full-stack developer (React, Next.js, TypeScript, Node.js) and AI evaluator, pharmacist by training. PDF versions included.",
  path: "/resume",
});

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string; private?: string; document?: string }>;
}) {
  const params = await searchParams;
  const variant: Variant =
    params.variant === "ai" || params.variant === "general" ? params.variant : "default";

  /* `?private=1` and `?document=1` are requests, not authorisations.
     The phone number, and any document kept off the site, are only ever
     rendered when the *server* was started with RESUME_ALLOW_PRIVATE=1, which
     only `pnpm resume --private` (or `--document`) does, on a localhost server
     it spawns and kills itself. A deployed instance never has the variable
     set, so the parameters do nothing there: a URL anyone can type must not
     be able to reveal what is deliberately kept off the site. */
  const privateAllowed = process.env.RESUME_ALLOW_PRIVATE === "1";
  const includePrivate = privateAllowed && params.private === "1";

  /* A private document (a CV kept off the site, or a copy tailored to one
     job) is a JSON file outside the repo, named by the server's environment
     rather than by the URL, so no request can choose a file to read. */
  const documentPath = process.env.RESUME_DOCUMENT;
  const doc: ResumeDocument =
    privateAllowed && params.document === "1" && documentPath
      ? withContact(JSON.parse(await readFile(documentPath, "utf8")) as ResumeDocument, includePrivate)
      : documentFor(variant, includePrivate);

  return <ResumeView doc={doc} />;
}
