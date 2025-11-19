
export const portfolioConfig = {
  name: "Teesmile",
  title: "Frontend Engineer and Creative web3 artist",
  bio: "I fall in love with beautiful UIs long before I even start building them. Now I craft the kind of interfaces I can’t scroll past. clean, intentional, and addictive. Always learning, always exploring new tech, always chasing that ‘damn this feels good’ moment.",
  navLinks: [
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    { name: "Socials", href: "#footer" },
  ],
  socials: [
    { 
      name: "GitHub",
      url: "https://github.com/teesmile",
      iconKey: "github"
    },
    { 
      name: "LinkedIn",
      url: "https://linkedin.com/in/tonysmile",
      iconKey: "linkedin"
    },
    { 
      name: "Twitter / X",
      url: "https://x.com/teesmilex",
      iconKey: "twitter"

    }
  ],
  projects: [
    {
      id: 1,
      title: "Space Tourism Website",
      description: "A multi-page immersive space tourism experience. Users can explore destinations, crew members, and technology with smooth transitions.",
      tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
      link: "https://space-tourism-toni.vercel.app/",
      preview: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", 
      color: "from-indigo-900 to-slate-900"
    },
    {
      id: 2,
      title: "E-Commerce Product Page",
      description: "A pixel-perfect product page featuring a lightbox gallery, cart functionality, and responsive layout logic.",
      tech: ["Next.js", "TypeScript", "Tailwind", "Lightbox"],
      link: "https://e-commerce-product-page-one-ashy.vercel.app/",
      preview: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
      color: "from-orange-500 to-amber-500"
    },
   {
      id: 3,
      title: "Insta Spots",
      description: "A modern photo location sharing app. Discover photogenic spots, share your own discoveries, and view them on an interactive map.",
      tech: ["React", "Node.js", "MongoDB", "Google Maps API"],
      link: "https://insta-spots.vercel.app/",
      preview: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
      color: "from-pink-600 to-rose-600"
    },
    {
      id: 4,
      title: "Advanced Todo App",
      description: "A robust task management app with theme switching, drag-and-drop reordering, and local storage persistence.",
      tech: ["Next.js", "TypeScript", "Tailwind", "Local Storage"],
      link: "https://todo-app-tsc-mauve.vercel.app/",
      preview: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop",
      color: "from-blue-500 to-cyan-500"
    }
  ]
};
