import { documentFor } from "@/content/resume-document";
import type { Variant } from "@/content/resume";

/* A public version as a JSON document, the starting point for a copy
   tailored to one job (`pnpm resume --variant ai --dump file.json`). Only
   the local print server answers: a deployed instance never has
   RESUME_ALLOW_PRIVATE set, so there this is a 404. The contact lines are
   left out; they are filled in when the copy is printed. */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (process.env.RESUME_ALLOW_PRIVATE !== "1") return new Response("Not found", { status: 404 });
  const requested = new URL(request.url).searchParams.get("variant");
  const variant: Variant = requested === "ai" || requested === "general" ? requested : "default";
  const doc = documentFor(variant);
  delete doc.contact;
  delete doc.pdfHref;
  return Response.json(doc);
}
