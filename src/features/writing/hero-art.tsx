/* The banner at the top of each piece: the same scene as its share image
   (src/features/writing/scenes.tsx). SVG: sharp at any size, follows the
   theme, costs no request.

   Desktop shows the whole 1200×630 scene, cropped from the top by the 21:9
   frame. A phone gets a square hero (mobileAspect="square") and a square
   crop of the scene's key region, because the full scene at a third of its
   size reads as a thumbnail and the title band covers its lower half. Two
   small SVGs, one per breakpoint, rather than a transform: a real crop keeps
   the type at a readable size and the composition intentional. */
import { scenes } from "./scenes";

/* x y w h within the 1200×630 scene; content kept in the upper ~60%, above
   the title band. */
const phoneCrops: Record<string, string> = {
  /* The lit creatinine cell and both callouts. */
  "building-a-renal-dose-check-benchmark": "540 40 620 620",
  /* The front window: URL bar, nav with Work active, the heading. */
  "every-section-is-a-route": "140 90 620 620",
  /* The file window, with its stats and the portrait. */
  "what-unoptimized-turns-off": "64 40 600 600",
};

export default function HeroArt({ slug }: { slug: string }) {
  const Scene = scenes[slug];
  if (!Scene) return <div className="h-full w-full bg-raised" />;

  return (
    <>
      <Scene
        id={`banner-phone-${slug}`}
        viewBox={phoneCrops[slug]}
        className="h-full w-full md:hidden"
        preserveAspectRatio="xMidYMin slice"
      />
      <Scene id={`banner-${slug}`} className="hidden h-full w-full md:block" preserveAspectRatio="xMidYMin slice" />
    </>
  );
}
