export type Section = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type WritingEntry = {
  slug: string;
  title: string;
  date: string;
  standfirst: string;
  sections: Section[];
};

export const writing: WritingEntry[] = [
  {
    slug: "every-section-is-a-route",
    title: "Every section is its own route",
    date: "2026-11-06",
    standfirst:
      "I replaced a single page of anchor links with six routes, and three bugs disappeared without being fixed.",
    sections: [
      {
        id: "the-shape-i-started-with",
        heading: "The shape I started with",
        paragraphs: [
          "The site used to be one long page. Hero, services, projects, about, skills, contact, stacked in a column, with a nav that scrolled you to an anchor. It is the default shape for a portfolio and I had never questioned it.",
        ],
      },
      {
        id: "three-things-that-pushed-me-off-it",
        heading: "Three things that pushed me off it",
        paragraphs: [
          "The nav active state was a lie. It only updated when you clicked a link, so scrolling past a section never changed it, and landing on a deep link or reloading the page showed the wrong one.",
          "Every section needed an entrance animation to justify existing, which is how motion turns into decoration. Fade-and-slide-up on six blocks is not choreography, it is a tic.",
          "And one page can only carry one title and one description, so every view shared metadata that described none of them.",
        ],
      },
      {
        id: "what-routes-fixed-for-free",
        heading: "What routes fixed for free",
        paragraphs: [
          "Active state is now derived from the current path, so a deep link, a reload and a back button are all correct by construction. There is no scroll position to track and no observer to keep in sync.",
          "Each view carries its own title and description. And motion has exactly one job left: the transition between views.",
        ],
      },
      {
        id: "the-cost",
        heading: "The cost",
        paragraphs: [
          "The transition is now load-bearing. On one page, a bad scroll animation is a small annoyance; between routes, a hard cut is the most visible flaw the site can have. I have moved work into the motion phase rather than removed it.",
          "One guard made the change safe. Typed routes turn a link to a route that does not exist into a compile error, so the structure cannot rot quietly as I move things around. The first time I enabled it, it rejected my own nav links — they had been plain strings that nothing had ever checked.",
        ],
      },
    ],
  },
  {
    slug: "what-unoptimized-turns-off",
    title: "A 2.4 MB portrait, and what unoptimized actually turns off",
    date: "2026-11-06",
    standfirst:
      "One image was larger than the rest of the site combined. The fix was four lines, but the interesting part is why it was that large.",
    sections: [
      {
        id: "the-numbers",
        heading: "The numbers",
        paragraphs: [
          "The portrait on my about page was 2,507,195 bytes: a 1254 by 1254 PNG at 16 bits per channel, displayed in a circle 320 pixels wide. Every visitor downloaded all of it to look at a thumbnail.",
        ],
      },
      {
        id: "what-the-prop-actually-does",
        heading: "What the prop actually does",
        paragraphs: [
          "The image was rendered with unoptimized set, and quality={100} sitting on the line above it. That pairing taught me something. unoptimized does not mean lower effort — it means the optimizer is skipped entirely, so no resizing, no format conversion, no generated srcset. Which also means quality is never read.",
          "The two props look like they are arguing about compression. In fact one of them had already ended the conversation.",
        ],
      },
      {
        id: "three-reasons-it-was-big",
        heading: "Three reasons it was big",
        paragraphs: [
          "Only one of them was compression. It was four times wider than it needed to be. It was 16 bits per channel where 8 is indistinguishable at that size. And it carried an alpha channel that was uniformly opaque from corner to corner — roughly a quarter of the file storing the same number over and over.",
          "Converted to WebP at 640 pixels, which is twice the display size for high-density screens, it came out at 16,712 bytes. Served through the image optimizer it arrives as 11.6 KB. That is a 99.5% reduction for an image nobody will notice has changed.",
        ],
      },
      {
        id: "the-part-i-nearly-got-wrong",
        heading: "The part I nearly got wrong",
        paragraphs: [
          "The sizes attribute is a description of your layout, not a request. The browser uses it to pick a candidate from the srcset before it knows anything about your CSS. My container is a fixed 320 pixels at every breakpoint, so sizes=\"320px\" is the truth. A responsive value copied from a tutorial would have described a layout I do not have, and the browser would have believed it.",
        ],
      },
    ],
  },
];

/** 200 words per minute, rounded up, floor of one minute. */
export function readingTime(entry: WritingEntry) {
  const words = entry.sections
    .flatMap((section) => [section.heading, ...section.paragraphs])
    .join(" ")
    .split(/\s+/).length;

  return Math.max(1, Math.ceil(words / 200));
}
