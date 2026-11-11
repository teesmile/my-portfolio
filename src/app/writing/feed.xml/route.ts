import { published } from "@/config/writing";
import { SITE_URL } from "@/config/site-url";
import { portfolioConfig } from "@/config/site";

/* Built once at build time, like every other page: the pieces only change
   with a deploy. */
export const dynamic = "force-static";

const escape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * RSS 2.0 for /writing, newest first.
 *
 * Dates come from the content, never from the build: `lastBuildDate` is the
 * newest piece's own date, the same rule the sitemap's lastmod follows, so a
 * redeploy that changes no writing does not tell every reader something is
 * new. Each item carries the standfirst as its description; the full piece,
 * with its figures, is one click away.
 */
export function GET() {
  const feedUrl = `${SITE_URL}/writing/feed.xml`;
  const entries = [...published].sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  const newest = entries
    .map((entry) => Date.parse(entry.updated ?? entry.published))
    .reduce((a, b) => Math.max(a, b), 0);

  const items = entries
    .map((entry) => {
      const url = `${SITE_URL}/writing/${entry.slug}`;
      return `    <item>
      <title>${escape(entry.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(entry.published).toUTCString()}</pubDate>
      <category>${escape(entry.topic)}</category>
      <description>${escape(entry.standfirst)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${portfolioConfig.name} - Writing`)}</title>
    <link>${SITE_URL}/writing</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Write-ups by a full-stack developer and AI evaluator: decisions from real projects, what each one cost, and how to check what AI gets wrong.</description>
    <language>en</language>
    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
