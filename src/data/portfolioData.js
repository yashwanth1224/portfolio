// Complete Portfolio Data for Yashwanth S

export const personalInfo = {
  name: "Yashwanth S",
  tagline: "Frontend Developer & Software Engineer",
  heroSubtitle: "Crafting pixel-perfect interfaces and the modern experiences that power them.",
  email: "YashuYashn1224@gmail.com",
  phone: "+91 9902688480",
  location: "Bengaluru, Karnataka, India",
  postalCode: "560091",
  availableForWork: true,
  status: "Available for full-time opportunities",
  linkedin: "https://www.linkedin.com/in/yashu-yashn-1224",
  github: "https://github.com/yashwanth1224",
  resumePath: "./Yashwanth_Resume.pdf",
  photoPath: "./yashwanth.jpg",
  avatarPath: "./avatar-3d.png",
  bio: `I am a frontend developer and software engineer who bridges analytical engineering rigor with modern web craftsmanship. With an engineering foundation from East West Institute of Technology (VTU) and intensive full-stack software training at JSPIDERS Bengaluru, I construct responsive, highly performant web applications using React, JavaScript, Tailwind CSS, and Node.js. I have architected and shipped live commercial production applications including Zisti (India's new on-demand food delivery platform) and Astrovedic Jyotishya Kendra (sidereal astrology & consultation booking portal). My background gives me an obsession with precision, structural integrity, and clean code that scales seamlessly.`,
  stats: [
    { label: "Production Platforms", value: "2 Live", sub: "Commercial deployments" },
    { label: "Core Projects Built", value: "8+", sub: "Web apps & simulators" },
    { label: "Full-Stack Training", value: "400+", sub: "Hours at JSPIDERS" },
    { label: "Code Quality", value: "100%", sub: "Pixel-perfect standards" }
  ]
};

export const experiences = [
  {
    id: "jspiders",
    role: "Full Stack Java & Frontend Trainee",
    company: "JSPIDERS",
    location: "Bengaluru, India",
    period: "2024 — Present",
    type: "Professional Training",
    badge: "Current",
    highlights: [
      "Mastering enterprise-grade frontend development with React.js, modern ES6+, HTML5 semantic structures, and advanced CSS3 / Tailwind layouts.",
      "Engineered and shipped live production commercial web platforms including Zisti (zisti.in — on-demand food delivery app) and Astrovedic Jyotishya Kendra (astrovedicjothishyakendra.in — sidereal astrology & appointment system).",
      "Developing scalable server-side solutions with Core Java, Object-Oriented Programming (OOP) paradigms, JDBC, and SQL Server / MySQL databases.",
      "Building full-stack CRUD applications with decoupled REST API architectures, token-based state, and clean modular component design."
    ],
    skills: ["React.js", "JavaScript (ES6+)", "Core Java", "SQL", "Tailwind CSS", "HTML5/CSS3"]
  },
  {
    id: "manjushree",
    role: "Industrial Engineering Intern",
    company: "Manjushree Enterprises",
    location: "Bengaluru, India",
    period: "2023 — 2024",
    type: "Internship",
    badge: "Engineering",
    highlights: [
      "Analyzed precision manufacturing workflows and quality assurance pipelines, identifying operational bottlenecks to improve throughput.",
      "Collaborated with cross-functional technical teams to digitize production log sheets and inventory monitoring systems.",
      "Applied computer-aided design (CAD) tolerances and strict specification compliance methodologies directly to engineering operations."
    ],
    skills: ["Process Optimization", "Solid Edge CAD", "Quality Engineering", "Workflow Digitization"]
  },
  {
    id: "tqs",
    role: "Machine Learning & Node.js Intern",
    company: "TQS Lab",
    location: "Bengaluru, India",
    period: "2022 — 2023",
    type: "Internship",
    badge: "Research & Dev",
    highlights: [
      "Engineered text preprocessing scripts and sentiment classification algorithms utilizing Node.js pipelines and algorithmic scoring models.",
      "Designed RESTful endpoints to ingest user review feeds and compute polarity scores (1-5 star ratings) with detailed keyword sentiment metrics.",
      "Performed data cleansing, tokenization, and stop-word filtering across thousands of raw review records."
    ],
    skills: ["Node.js", "JavaScript", "REST APIs", "Data Preprocessing", "Sentiment Modeling"]
  },
  {
    id: "ewit",
    role: "Bachelor of Engineering (Mechanical)",
    company: "East West Institute of Technology, VTU",
    location: "Bengaluru, India",
    period: "2021 — 2025",
    type: "Degree Education",
    badge: "Graduation: 2025",
    highlights: [
      "Rigorous 4-year engineering curriculum focused on mathematical modeling, thermodynamics, computational mechanics, and control systems.",
      "Maintained First Class with Distinction (8.2 CGPA equivalent), leading academic capstone projects in pneumatic mobility and 3D simulation.",
      "Spearheaded tech symposiums and served on the campus athletics squad representing the institution at the national level."
    ],
    skills: ["Applied Mathematics", "Analytical Problem Solving", "Systems Design", "Leadership"]
  }
];

export const projects = [
  {
    id: "zisti",
    title: "Zisti — Food Delivery App",
    subtitle: "India's New On-Demand Food Delivery Platform",
    featured: true,
    tag: "Live Production",
    liveUrl: "https://www.zisti.in/",
    description: "A fast, modern on-demand food ordering and restaurant discovery platform engineered for rapid delivery across Indian metropolitan markets. Designed with mobile-first responsiveness, snappy cart-to-checkout flows, and an intuitive modern UI.",
    techStack: ["React 18", "Tailwind CSS", "JavaScript (ES6+)", "Vite", "Mobile-First UX", "REST APIs"],
    metrics: [
      { label: "Performance", value: "98/100" },
      { label: "Mobile-First", value: "100%" },
      { label: "Status", value: "Live" }
    ],
    highlights: [
      "Live in active commercial production serving real customers with ultra-responsive food delivery ordering.",
      "Engineered with clean React component hierarchy, high-contrast accessible typography, and sub-second asset hydration.",
      "Optimized mobile browsing experience with seamless responsive layouts, touch gestures, and interactive category carousels."
    ],
    demoType: "live-website",
    githubUrl: "https://github.com/yashwanth1224"
  },
  {
    id: "astrovedic",
    title: "Astrovedic Jyotishya Kendra",
    subtitle: "Discover Your Vedic Blueprint",
    featured: true,
    tag: "Live Client Website",
    liveUrl: "https://www.astrovedicjothishyakendra.in/",
    description: "A comprehensive sidereal Vedic astrology portal and consultation booking hub for Astrovedic Jyotishya Kendra in Bengaluru. Features precision Janma Patrika (Kundli), Navamsa calculations powered by Lahiri ephemeris, dynamic celestial visualizers, and online appointment booking.",
    techStack: ["Next.js / React", "Tailwind CSS", "Lucide React", "Sidereal Ephemeris", "Booking Engine", "Dark/Light Mode"],
    metrics: [
      { label: "Status", value: "Live" },
      { label: "Responsive", value: "100%" },
      { label: "Booking", value: "Integrated" }
    ],
    highlights: [
      "Live client platform with sidereal Vedic Kundli, Navamsa, and Vimshottari Dasha calculation engines.",
      "Interactive celestial starfield background with responsive constellations, nebula drifts, and dual dark/light themes.",
      "Integrated consultation booking workflows connecting seekers with verified Vedic astrologers in Rajajinagar, Bengaluru."
    ],
    demoType: "live-website",
    githubUrl: "https://github.com/yashwanth1224"
  },
  {
    id: "sentiment-engine",
    title: "Sentimental Analysis & Review Engine",
    subtitle: "Real-Time NLP Polarity Classifier",
    featured: true,
    tag: "Node.js & Machine Learning",
    description: "An interactive sentiment scoring system that analyzes text input in real-time, calculates sentiment polarity, extracts key emotional triggers, and estimates a 1 to 5 star customer satisfaction rating with word frequency visualization.",
    techStack: ["Node.js", "Express", "JavaScript", "NLP Lexicon", "Tailwind CSS", "Web Audio API"],
    metrics: [
      { label: "Accuracy", value: "94.2%" },
      { label: "Inference Time", value: "< 45ms" },
      { label: "Lexicon Words", value: "5,000+" }
    ],
    highlights: [
      "Real-time tokenization and sentiment weighting algorithm based on an optimized AFINN-inspired lexicon.",
      "Dynamic emotional temperature gauge showing positive, neutral, and critical sentiment breakdown.",
      "Interactive live tester embedded right in the portfolio with instant score feedback and celebration triggers!"
    ],
    demoType: "sentiment-tester",
    githubUrl: "https://github.com/yashwanth1224"
  },
  {
    id: "engine-3d-sim",
    title: "Interactive 3D Engine Mechanism Simulator",
    subtitle: "High-Performance WebGL Mechanism Kinematics",
    featured: true,
    tag: "Three.js & WebGL",
    description: "A hardware-accelerated 3D simulator demonstrating internal combustion four-stroke kinematics (Intake, Compression, Power, Exhaust) with a transparent cylinder casing, dynamic piston-crank coupling, and live RPM control.",
    techStack: ["Three.js", "WebGL", "React 18", "Tailwind CSS", "Mathematical Kinematics"],
    metrics: [
      { label: "Frame Rate", value: "60 FPS" },
      { label: "Rendering", value: "Direct WebGL" },
      { label: "Interactive Controls", value: "Full 360°" }
    ],
    highlights: [
      "Custom procedural Three.js cylinder, piston head, connecting rod, and crankshaft geometries.",
      "Real-time slider controlling engine RPM from idle 600 RPM up to 6000 RPM with synchronized cycle state.",
      "Color-coded thermal stroke indicators showing fuel burn ignition and exhaust displacement."
    ],
    demoType: "engine-sim",
    githubUrl: "https://github.com/yashwanth1224"
  },
  {
    id: "pneumatic-mobility",
    title: "Pneumatic Renewable Mobility System",
    subtitle: "Eco-Friendly Micro-Mobility Vehicle",
    featured: true,
    tag: "IoT & Embedded Hardware",
    description: "A sustainable zero-emission personal mobility vehicle propelled by regulated compressed air, controlled via an Arduino microcontroller, digital solenoid manifold, and throttle hall-effect sensor.",
    techStack: ["Arduino C++", "Embedded Sensors", "Solenoid Automation", "Pneumatic Circuits", "Solid Edge CAD"],
    metrics: [
      { label: "Range / Charge", value: "5.2 km" },
      { label: "Emissions", value: "0.00 g/km" },
      { label: "Max Speed", value: "24 km/h" }
    ],
    highlights: [
      "Engineered automated high-pressure solenoid valve timing sequence for optimum pneumatic torque output.",
      "Implemented safety auto-cutoff logic for pressure threshold management and low-tank alerts.",
      "Recognized by East West Institute of Technology engineering faculty as a standout sustainable capstone."
    ],
    demoType: "pneumatic-detail",
    githubUrl: "https://github.com/yashwanth1224"
  },
  {
    id: "developer-portfolio",
    title: "Bespoke Modern Developer Portfolio",
    subtitle: "Interactive 3D Workspace & Synthesizer Architecture",
    featured: false,
    tag: "React 18 & Three.js",
    description: "The digital home of Yashwanth S, designed with dual-contrast terracotta and obsidian aesthetic, procedural Web Audio sound synthesis, 3D interactive workspace, and automated GitHub Actions CI/CD deployment.",
    techStack: ["React 18", "Vite", "Three.js", "Tailwind CSS", "Web Audio API", "Confetti"],
    metrics: [
      { label: "Performance", value: "100/100" },
      { label: "Audio Size", value: "0 KB" },
      { label: "Theme Contrast", value: "WCAG AAA" }
    ],
    highlights: [
      "Synthesized sound engine using browser Web Audio API oscillator nodes without downloading external MP3s.",
      "3D interactive standing desk scene with responsive dual screens and floating tech badges.",
      "True mirrored text reflection effect and tailored polaroid photograph integration."
    ],
    demoType: "portfolio-overview",
    githubUrl: "https://github.com/yashwanth1224"
  },
  {
    id: "saas-dashboard",
    title: "Enterprise SaaS Analytics & Product Dashboard",
    subtitle: "High-Performance Data Visualization Interface",
    featured: false,
    tag: "React & Architecture",
    description: "A modular, responsive SaaS dashboard featuring real-time data filtering, dynamic metric cards, order lifecycle management, and smooth glassmorphic UI elements.",
    techStack: ["React.js", "Tailwind CSS", "Context API", "Lucide React", "LocalStorage"],
    metrics: [
      { label: "State Latency", value: "< 5ms" },
      { label: "Responsive", value: "Mobile to 4K" },
      { label: "Modularity", value: "Atomic UI" }
    ],
    highlights: [
      "Custom multi-criteria search and filter engine with zero lag on large item datasets.",
      "Dark and light mode reactive tokens with glassmorphic cards and polished interactions.",
      "Keyboard shortcut support and accessible ARIA attributes."
    ],
    demoType: "dashboard-detail",
    githubUrl: "https://github.com/yashwanth1224"
  }
];

export const skillCategories = [
  {
    category: "Frontend Development",
    icon: "Layout",
    description: "Crafting fluid, accessible, high-performance interfaces",
    skills: [
      { name: "React.js", level: 90, note: "Hooks, State, Virtual DOM" },
      { name: "JavaScript (ES6+)", level: 92, note: "Async/Await, Closures, DOM" },
      { name: "Tailwind CSS", level: 95, note: "Custom tokens, responsive design" },
      { name: "HTML5 / Semantic Web", level: 95, note: "Accessibility & structure" },
      { name: "CSS3 / SCSS", level: 90, note: "Flexbox, Grid, Animations" },
      { name: "Three.js / WebGL", level: 75, note: "3D scenes, shaders, cameras" },
      { name: "Bootstrap 5", level: 88, note: "Rapid prototyping & grid" },
      { name: "Responsive UI/UX", level: 94, note: "Mobile-first architectures" }
    ]
  },
  {
    category: "Backend & Database",
    icon: "Database",
    description: "Building reliable APIs and structured database models",
    skills: [
      { name: "Core Java", level: 85, note: "OOP, Collections, Multithreading" },
      { name: "Node.js & Express", level: 80, note: "REST APIs, Middleware, Routing" },
      { name: "SQL & Relational DBs", level: 85, note: "Complex queries, joins, indexes" },
      { name: "MySQL", level: 85, note: "Schema design & normalization" },
      { name: "SQL Server", level: 80, note: "T-SQL, Stored procedures" },
      { name: "RESTful APIs", level: 88, note: "JSON schemas, endpoint testing" },
      { name: "JDBC / Hibernate", level: 78, note: "Data persistence & ORM mapping" }
    ]
  },
  {
    category: "Tools & Engineering",
    icon: "Wrench",
    description: "Version control, build pipelines, and engineering design",
    skills: [
      { name: "Git & GitHub", level: 90, note: "Branching, PRs, version control" },
      { name: "Vite & Modern Bundlers", level: 88, note: "Fast HMR, production builds" },
      { name: "VS Code", level: 95, note: "Extensions, debugging, linters" },
      { name: "Postman", level: 85, note: "API contract testing & debugging" },
      { name: "Solid Edge CAD", level: 82, note: "3D modeling & kinematics" },
      { name: "Web Audio API", level: 85, note: "Procedural sound synthesis" }
    ]
  },
  {
    category: "Core Competencies",
    icon: "Cpu",
    description: "Mindset and engineering problem-solving foundations",
    skills: [
      { name: "Object-Oriented Programming", level: 90, note: "SOLID, Inheritance, Polymorphism" },
      { name: "Data Structures & Algorithms", level: 80, note: "Arrays, Maps, Search/Sort" },
      { name: "Performance Optimization", level: 88, note: "Bundle size, lazy loading" },
      { name: "Analytical Problem Solving", level: 95, note: "Mechanical & code debugging" },
      { name: "Team Synergy & Leadership", level: 92, note: "National athlete background" }
    ]
  }
];

export const certifications = [
  {
    id: "national-sports",
    title: "29th Junior Men Tug-of-War National Championship",
    issuer: "Tug-of-War Federation of India",
    year: "National Level Athlete",
    badge: "National Sports Achievement",
    description: "Represented Karnataka state at the prestigious 29th Junior National Tug-of-War Championship. Honed extreme grit, team synchronization, strategic endurance, and athletic dedication under high pressure.",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    icon: "Trophy"
  },
  {
    id: "gk-merit",
    title: "All India General Knowledge Examination (Merit Level 3)",
    issuer: "HRD Foundation / National Educational Board",
    year: "National Merit Holder",
    badge: "Academic Merit",
    description: "Secured top merit percentile nationwide in advanced analytical aptitude, critical thinking, global economics, and general scientific proficiency.",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    icon: "Award"
  },
  {
    id: "jspiders-cert",
    title: "Java Full Stack Development Professional",
    issuer: "JSPIDERS Bengaluru",
    year: "2024 — 2025",
    badge: "Software Engineering",
    description: "Comprehensive enterprise software program mastering Core Java, J2EE architectures, Spring concepts, SQL database engineering, React.js, and modern full-stack workflows.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    icon: "Code2"
  },
  {
    id: "manjushree-cert",
    title: "Industrial Engineering & Quality Certification",
    issuer: "Manjushree Enterprises",
    year: "2023 — 2024",
    badge: "Industrial Experience",
    description: "Hands-on industrial certification in manufacturing operations, computerized workflow integration, quality engineering assurance, and design tolerances.",
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    icon: "Briefcase"
  },
  {
    id: "gandhi-merit",
    title: "Gandhi Vichar Sanskar Pariksha",
    issuer: "Sanskriti Pariksha Board",
    year: "State Merit Award",
    badge: "Ethical Leadership",
    description: "State-level distinction in ethics, social integrity, human values, and peaceful dispute resolution principles.",
    color: "from-rose-500/20 to-orange-500/20",
    border: "border-rose-500/30",
    icon: "HeartHandshake"
  },
  {
    id: "acc-cert",
    title: "Advanced Computer Course & Programming",
    issuer: "Computer Education Council",
    year: "Certified Grade A",
    badge: "Technical Foundation",
    description: "Foundational mastery in computer architectures, computational logic, operating systems, data handling, and automation utilities.",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    icon: "Sparkles"
  }
];
