/* The banner at the top of each piece: the same scene as its share image
   (src/features/writing/scenes.tsx). SVG: sharp at any size, follows the
   theme, costs no request.

   Desktop shows the whole 1200×630 scene, cropped from the top by the 21:9
   frame. A phone gets a square hero (mobileAspect="square") and a crop of
   the scene's subject, because the full scene at a third of its size reads
   as a thumbnail. Two small SVGs, one per breakpoint, rather than a
   transform: a real crop keeps the type readable and the composition
   intentional. */
import { scenes } from "./scenes";

/* Phones: the banner fills only the area above the solid title band
   (--band-height, measured by StickyHero), and each crop is centred on the
   scene's subject, so `xMidYMid slice` keeps that subject centred whatever
   height the band takes. Each crop is about 1.6:1, the shape of that area
   on a phone, so the slice trims air rather than the subject. x y w h
   within the 1200×630 scene. */
const phoneCrops: Record<string, string> = {
  /* The red creatinine cell and its two callouts. */
  "building-a-renal-dose-check-benchmark": "530 50 630 390",
  /* The front window: URL bar, nav with Work active, the heading. */
  "every-section-is-a-route": "130 100 760 470",
  /* The file's stats, the portrait, the arrow to the phone. */
  "what-unoptimized-turns-off": "60 40 760 470",
  /* The two results: the struck vercel.app row and the domain that replaced it. */
  "moving-to-a-custom-domain": "170 70 760 470",
};

export default function HeroArt({ slug }: { slug: string }) {
  const Scene = scenes[slug];
  if (!Scene) return <div className="h-full w-full bg-raised" />;

  return (
    <>
      <div className="absolute inset-x-0 top-0 bottom-(--band-height) md:hidden">
        <Scene id={`banner-phone-${slug}`} viewBox={phoneCrops[slug]} className="h-full w-full" preserveAspectRatio="xMidYMid slice" />
      </div>
      <Scene id={`banner-${slug}`} className="hidden h-full w-full md:block" preserveAspectRatio="xMidYMin slice" />
    </>
  );
}
