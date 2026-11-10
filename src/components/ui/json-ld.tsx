import { graph } from "@/lib/structured-data";

/**
 * Structured data as a single @graph. JSON-LD is data, not markup: it is read
 * from the response HTML, so it is server-rendered rather than injected later.
 * `<` is escaped so no string in the data can close the script element.
 */
export default function JsonLd({ nodes }: { nodes: object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: graph(...nodes).replace(/</g, "\\u003c") }}
    />
  );
}
