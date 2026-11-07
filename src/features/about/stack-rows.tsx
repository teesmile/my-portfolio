import { TechList } from "@/components/ui/tech";

type Layer = { layer: string; items: string[] };

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

    if (layer.items.length < MIN_FOR_OWN_ROW && previous) {
      previous.layer = `${previous.layer} and ${layer.layer.toLowerCase()}`;
      previous.items = [...previous.items, ...layer.items];
      continue;
    }

    rows.push({ layer: layer.layer, items: [...layer.items] });
  }

  return rows;
}

const speeds = ["52s", "64s", "58s", "70s"];

export default function StackRows({ layers }: { layers: Layer[] }) {
  const rows = merge(layers);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {rows.map((row, index) => (
        <div key={row.layer} className="flex min-w-0 items-center gap-4">
          <span className="w-28 shrink-0 text-2xs text-muted">{row.layer}</span>

          <div className="marquee min-w-0 flex-1 overflow-x-clip">
            <div
              className="marquee-track"
              style={
                {
                  "--marquee-duration": speeds[index % speeds.length],
                  "--marquee-from": index % 2 === 0 ? "0%" : "-50%",
                  "--marquee-to": index % 2 === 0 ? "-50%" : "0%",
                } as React.CSSProperties
              }
            >
              <TechList items={row.items} />
              {/* The second copy exists only so the loop has something to run
                  into; a screen reader should hear the list once. */}
              <div aria-hidden="true">
                <TechList items={row.items} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
