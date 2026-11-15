"""Trace the footer wordmark from the display font into src/components/layout/wordmark.ts.

The footer's oversized "teesmile" is drawn as outlines, not set as text, so
it fills the content column edge to edge whatever font the browser has at
that moment: nothing to swap in, nothing that can render narrower. This
script does the tracing once, from the same Syne file the site serves, and
is rerun only if the word, the face, the weight or the tracking changes.

    python3 scripts/wordmark.py <syne.woff2|syne.ttf>

The font: after `pnpm build`, the latin Syne file is the one of the
.next/static/media/*.woff2 files whose name table says Syne and whose cmap
covers the word (the preloaded one, "-s.p."); or Syne from Google Fonts.
Needs fontTools (and brotli for woff2).
"""
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

WORD = "teesmile"
WEIGHT = 700
TRACKING_EM = -0.04  # letter-spacing the text version used
CLIP_EM = 0.07  # the bottom tenth of the letters runs off the page: stop this far above the baseline
OUT = Path(__file__).resolve().parent.parent / "src" / "components" / "layout" / "wordmark.ts"


def kerning(font, left, right):
    """The 'kern' feature's x-advance adjustment for a pair (PairPos formats 1 and 2)."""
    gpos = font["GPOS"].table
    total = 0
    for feature in gpos.FeatureList.FeatureRecord:
        if feature.FeatureTag != "kern":
            continue
        for index in feature.Feature.LookupListIndex:
            lookup = gpos.LookupList.Lookup[index]
            subtables = [s.ExtSubTable if lookup.LookupType == 9 else s for s in lookup.SubTable]
            for sub in subtables:
                if getattr(sub, "Format", None) is None or sub.__class__.__name__ != "PairPos":
                    continue
                coverage = sub.Coverage.glyphs
                if left not in coverage:
                    continue
                if sub.Format == 1:
                    pair_set = sub.PairSet[coverage.index(left)]
                    for record in pair_set.PairValueRecord:
                        if record.SecondGlyph == right:
                            return total + (record.Value1.XAdvance if record.Value1 and hasattr(record.Value1, "XAdvance") else 0)
                elif sub.Format == 2:
                    class1 = sub.ClassDef1.classDefs.get(left, 0)
                    class2 = sub.ClassDef2.classDefs.get(right, 0)
                    value = sub.Class1Record[class1].Class2Record[class2].Value1
                    if value is not None and hasattr(value, "XAdvance"):
                        return total + value.XAdvance
    return total


def main(path):
    font = TTFont(path)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": WEIGHT})
    upm = font["head"].unitsPerEm
    tracking = round(TRACKING_EM * upm)
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    names = [cmap[ord(c)] for c in WORD]

    x = 0
    svg = SVGPathPen(glyph_set, ntos=lambda v: str(round(v)))
    bounds = BoundsPen(glyph_set)
    positions = []
    for i, name in enumerate(names):
        positions.append((WORD[i], x))
        # y flipped: SVG's y runs down the page, a font's runs up.
        for pen in (svg, bounds):
            glyph_set[name].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
        x += glyph_set[name].width + tracking
        if i + 1 < len(names):
            x += kerning(font, name, names[i + 1])

    left, top, right, bottom = bounds.bounds  # y flipped: top is the most negative
    clip = -round(CLIP_EM * upm)
    view_box = f"{round(left)} {round(top)} {round(right - left)} {round(clip - top)}"
    d = svg.getCommands()
    OUT.write_text(
        "/* The footer wordmark as outlines, traced from Syne %d by\n"
        "   scripts/wordmark.py. Not hand-edited: rerun the script instead. */\n"
        "export const wordmark = {\n"
        '  viewBox: "%s",\n'
        '  d: "%s",\n'
        "} as const;\n" % (WEIGHT, view_box, d)
    )
    print("positions (font units):", positions)
    print("ink", (round(left), round(top), round(right), round(bottom)), "viewBox", view_box, "ink width/em", round((right - left) / upm, 4))
    print("wrote", OUT.relative_to(Path.cwd()), len(d), "bytes of path")


if __name__ == "__main__":
    main(sys.argv[1])
