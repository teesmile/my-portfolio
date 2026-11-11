import { TechList } from "@/components/ui/tech";
import type { StackLayer as Layer } from "@/config/site";
import Marquee from "@/components/ui/marquee";

/**
 * The stack as drifting rows, one per layer.
 *
 * Two rules keep it honest. An empty layer is left out entirely — a row
 * labelled "Data" with nothing in it would be a line about work I have not
 * done. And a layer with too few tools cannot fill a row without the same
 * icons coming round every few seconds, so it merges into its neighbour and
 * the labels merge with it.
 *
 * The motion is a CSS animation, not a tween: a marquee runs for as long as
 * the page is open, and a looping CSS transform costs the compositor nothing
 * per frame where a JavaScript ticker would cost main-thread work forever.
 * Hover and keyboard focus pause it through animation-play-state.
 */
const MIN_FOR_OWN_ROW = 5;

function merge(layers: Layer[]) {
  const filled = layers.filter((layer) => layer.items.length > 0);
  const rows: Layer[] = [];

  for (const layer of filled) {
    const previous = rows[rows.length - 1];

    /* Tools merge with tools only: folding a practice into a row of logos
       would put "fact verification" beside Git as if it were software. */
    if (
      layer.items.length < MIN_FOR_OWN_ROW &&
      previous &&
      (previous.kind ?? "tool") === (layer.kind ?? "tool")
    ) {
      /* A list, not a chain: "Data and delivery" + "Services" reads
         "Data, delivery and services". */
      previous.layer = `${previous.layer.replace(/ and (?!.* and )/, ", ")} and ${layer.layer.toLowerCase()}`;
      previous.items = [...previous.items, ...layer.items];
      continue;
    }

    rows.push({ ...layer, items: [...layer.items] });
  }

  return rows;
}

const speeds = ["52s", "64s", "58s", "70s"];

/* Practice rows are text chips: a hairline frame stands in for the logo, so
   the row keeps the rhythm of the tool rows without inventing an icon. */
function List({ row }: { row: Layer }) {
  if (row.kind !== "practice") return <TechList items={row.items} />;

  return (
    <ul className="flex flex-wrap gap-2 text-2xs text-muted">
      {row.items.map((item) => (
        <li key={item} className="border border-line px-2 py-0.5">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function StackRows({ layers }: { layers: Layer[] }) {
  const rows = merge(layers);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {rows.map((row, index) => (
        <div key={row.layer} className="flex min-w-0 items-center gap-4">
          <span className="w-28 shrink-0 text-2xs text-muted">{row.layer}</span>

          <Marquee duration={speeds[index % speeds.length]} reverse={index % 2 === 1}>
            <List row={row} />
          </Marquee>
        </div>
      ))}
    </div>
  );
}
