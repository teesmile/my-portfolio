
export const portfolioConfig = {
  name: "Anthony Ugwuja",
  brandName: "Teesmile",
  title: "AI Training Evaluator | TypeScript / Frontend Developer",
  headline: "I build, debug, and evaluate frontend experiences with clarity and precision.",
  bio: "TypeScript-focused developer with practical experience building React interfaces, reusable components, form validation, responsive layouts, and frontend logic. I also evaluate model-generated code and written responses for accuracy, instruction following, edge cases, clarity, and technical correctness.",
  phone: "+234 903 257 0130",
  email: "anthonyugwuja.dev@gmail.com",
  location: "Abuja, Nigeria",
  availability: "Remote",
  resumePdf: "/Anthony-Ugwuja-Resume.pdf",
  navLinks: [
    { name: "Home", href: "/#home" },
    { name: "Featured projects", href: "/#projects" },
    { name: "About me", href: "/#about" },
    { name: "Contact me", href: "/#contact" },
  ],
  services: [
    {
      title: "Frontend Development",
      description:
        "Building responsive React, Vite, and Next.js interfaces with reusable components, clean state handling, and practical UI behavior.",
    },
    {
      title: "Code Evaluation",
      description:
        "Reviewing model-generated code and written responses for correctness, missing requirements, edge cases, and technical clarity.",
    },
    {
      title: "UI Implementation",
      description:
        "Translating interface ideas into polished layouts with Tailwind CSS, accessible states, visual hierarchy, and motion that supports usability.",
    },
  ],
  skills: [
    {
      label: "Core Skills",
      items: ["React", "Node.js", "JavaScript", "Angular", "HTML", "CSS"]
    },
    {
      label: "Frontend",
      items: ["TypeScript", "Vite", "Tailwind CSS", "Responsive design", "Component architecture", "Form validation", "DOM manipulation"]
    },
    {
      label: "AI training",
      items: ["Code evaluation", "Prompt-response review", "Rubric-based grading", "Instruction-following assessment", "Hallucination detection", "Edge-case testing", "Concise feedback"]
    },
    {
      label: "Tools",
      items: ["Git", "GitHub", "VS Code", "Chrome DevTools", "Vercel", "npm", "pnpm", "Linux/Ubuntu", "JSON", "REST API fundamentals"]
    }
  ],
  resume: {
    summary:
      "AI training and TypeScript-focused developer with practical experience building, debugging, and reviewing React/Vite interfaces, reusable components, form validation, responsive layouts, and frontend logic.",
    highlights: [
      "Skilled at evaluating model-generated code and written responses for accuracy, instruction following, edge cases, clarity, and technical correctness.",
      "Strong working knowledge of React, Node.js, JavaScript, Angular, HTML, CSS, TypeScript, Tailwind CSS, Git, GitHub, and browser debugging tools.",
      "Comfortable writing direct technical feedback that explains bugs, stronger implementations, safer UI behavior, and clearer response structure."
    ],
    experience: [
      {
        role: "Independent Frontend Developer / AI Code Evaluation Contributor",
        company: "Remote",
        period: "2025 - Present",
        bullets: [
          "Built and refined React/Vite interfaces using component-based architecture, hooks, state management, Tailwind CSS, and reusable UI patterns.",
          "Debugged JavaScript and TypeScript issues involving form validation, conditional rendering, routing, event handlers, async data flow, and responsive layout behavior.",
          "Reviewed model-generated code and written outputs for correctness, readability, missing requirements, user intent alignment, and edge-case handling.",
          "Wrote direct technical feedback explaining bugs, stronger implementations, safer UI behavior, and clearer response structure.",
          "Used Git, GitHub, Vercel, npm/pnpm workflows, Linux tooling, and browser developer tools to build, test, and troubleshoot web projects."
        ]
      },
      {
        role: "Software Engineering Intern",
        company: "AltSchool Africa",
        period: "2024 - 2025",
        bullets: [
          "Completed practical software engineering tasks using JavaScript, React, Node.js, HTML, CSS, Git, GitHub, and modern frontend workflows.",
          "Built and reviewed web interfaces with attention to responsive layouts, reusable components, accessibility, clean code structure, and technical accuracy.",
          "Practiced debugging, code review, task interpretation, documentation, and feedback writing, skills directly aligned with AI training and model evaluation work."
        ]
      }
    ],
    education: [
      {
        title: "Diploma in Software Engineering",
        institution: "AltSchool Africa",
        period: "2024 - 2025",
        details: [
          "Focus areas: JavaScript, React, Node.js, Angular, HTML, CSS, TypeScript, Git, GitHub, debugging, frontend engineering, and technical documentation.",
          "AI training readiness: code review, response evaluation, prompt interpretation, bug identification, technical writing, and quality assurance."
        ]
      }
    ]
  },
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
      title: "React Todo / Productivity App",
      description: "A productivity interface with reusable components, stateful interactions, validation, and clean component logic.",
      role: "Frontend implementation",
      year: "2025",
      tech: ["React", "TypeScript", "TanStack Router", "TanStack Form", "Zod", "Tailwind CSS"],
      link: "https://todo-app-tsc-mauve.vercel.app/",
      repo: "https://github.com/teesmile",
      preview: "/projects/todo-productivity.svg", 
      color: "from-indigo-900 to-slate-900",
      highlights: ["Reusable Home, TodoItem, and Pagination components", "Validation and stateful interactions", "Responsive layout with Tailwind CSS and icons"]
    },
    {
      id: 2,
      title: "E-Commerce Product Page",
      description: "A responsive product interface with product data, image paths, pricing states, cart behavior, and mobile/desktop layout handling.",
      role: "Frontend implementation",
      year: "2025",
      tech: ["Vite", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
      link: "https://e-commerce-product-page-one-ashy.vercel.app/",
      repo: "https://github.com/teesmile",
      preview: "/projects/ecommerce-product.svg",
      color: "from-orange-500 to-amber-500",
      highlights: ["Product gallery and thumbnail states", "Cart behavior and UI controls", "Validation against empty or invalid actions"]
    },
   {
      id: 3,
      title: "Portfolio Deployment Workflow",
      description: "A personal developer portfolio workflow covering deployment, domain setup, DNS records, HTTPS checks, and search verification.",
      role: "Deployment and frontend workflow",
      year: "2025",
      tech: ["Vercel", "DNS", "GitHub", "Google Search Console"],
      link: "https://teesmile.vercel.app/",
      repo: "https://github.com/teesmile",
      preview: "/projects/deployment-workflow.svg",
      color: "from-pink-600 to-rose-600",
      highlights: ["Vercel deployment workflow", "Domain and DNS configuration", "HTTPS and search verification checks"]
    },
    {
      id: 4,
      title: "Space Tourism Website",
      description: "A multi-page immersive space tourism experience for exploring destinations, crew members, and technology content.",
      role: "Frontend implementation",
      year: "2025",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      link: "https://space-tourism-toni.vercel.app/",
      repo: "https://github.com/teesmile",
      preview: "/projects/space-tourism.svg",
      color: "from-blue-500 to-cyan-500",
      highlights: ["Multi-page navigation", "Responsive layout system", "Animated content transitions"]
    }
  ]
};
