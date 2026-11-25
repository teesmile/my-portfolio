"""Static instances of the site's two faces, for the printed resume.

Chrome embeds a variable font in a PDF as a Type 3 font, and text extracted
from a Type 3 font loses its spaces ("Linux.Works"), which is what an
applicant tracking system reads. A static TrueType face is embedded as
TrueType and extracts cleanly. These instances are cut from the same
variable files the site serves, at the axis values the printed page uses,
so the outlines are the ones the browser would have drawn: no visual change.

    python3 scripts/print-fonts.py            after `pnpm build`

Reads the latin Syne and Source Serif 4 files out of .next/static/media
(found by their name tables) and writes src/app/fonts/print/*.ttf, which
the root layout loads for print only. Rerun if the print sizes change: a
Source Serif 4 instance is needed per optical size the page uses, and
Chrome sets opsz to the font size in CSS px.
Needs fontTools and brotli.
"""
import glob
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "app" / "fonts" / "print"
PROBE = "Works carefully, Linux: 2026"  # must be in the subset: the latin one

# (family name in the font, instance axes, output file)
INSTANCES = [
    ("Syne", {"wght": 400}, "syne-400.ttf"),
    ("Source Serif 4", {"wght": 400, "opsz": 14}, "source-serif-4-400-opsz-14.ttf"),  # 10.5pt
    ("Source Serif 4", {"wght": 400, "opsz": 14.6667}, "source-serif-4-400-opsz-14-67.ttf"),  # 11pt
]


def find(family):
    best = None
    for path in glob.glob(str(ROOT / ".next" / "static" / "media" / "*.woff2")):
        font = TTFont(path)
        if font["name"].getDebugName(1) != family or "fvar" not in font:
            continue
        cmap = font.getBestCmap()
        if all(ord(c) in cmap for c in PROBE) and (best is None or len(cmap) > len(best[1].getBestCmap())):
            best = (path, font)
    if best is None:
        raise SystemExit(f"no variable {family} with latin coverage in .next/static/media: run pnpm build first")
    return best


OUT.mkdir(parents=True, exist_ok=True)
for family, axes, name in INSTANCES:
    path, font = find(family)
    static = instantiateVariableFont(font, axes, inplace=False)
    static.flavor = None
    static.save(OUT / name)
    print(f"{name}: {family} {axes} from {Path(path).name}, {len(static.getGlyphOrder())} glyphs, {(OUT / name).stat().st_size} bytes")
