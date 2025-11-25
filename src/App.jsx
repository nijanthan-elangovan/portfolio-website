import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FileDown,
  Mail,
  Linkedin,
  MapPin,
  ExternalLink,
  Github,
  Phone,
  Calendar,
  GraduationCap,
  BadgeCheck,
  BookOpen,
  Youtube,
  Globe,
  Heart,
  Sun,
  Moon,
  MousePointerClick,
} from "lucide-react";

/* ----------------------------------------------------------------------------
   Inline CSS needed for hue CTA, glass, typing, and small helpers
---------------------------------------------------------------------------- */
function useInlineStyles() {
  useLayoutEffect(() => {
    if (document.getElementById("ne-inline-css")) return;
    const el = document.createElement("style");
    el.id = "ne-inline-css";
    // FIX: Added Google Font @import here for more reliable loading.
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300..800&display=swap');
@keyframes hue-cycle { from { filter: hue-rotate(0deg) } to { filter: hue-rotate(360deg) } }
.hue-cta:hover { animation: hue-cycle 6s linear infinite; will-change: filter; }
@keyframes typing { from { width: 0 } to { width: 100% } }
@keyframes caret-blink { 0%,49% { border-color: transparent } 50%,100% { border-color: currentColor } }
.typing-item { display:inline-block; white-space:nowrap; overflow:hidden; border-right:2px solid currentColor; animation-fill-mode:forwards; }
.glass { backdrop-filter: saturate(140%) blur(16px); background: color-mix(in oklab, white 80%, transparent); }
:root.dark .glass { background: color-mix(in oklab, black 70%, transparent); }
@keyframes gradientShift {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes paintFlow {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
`;
    document.head.appendChild(el);
  }, []);
}

/* ----------------------------------------------------------------------------
   STRAPI Cloud integration (URL normalization + optional token)
---------------------------------------------------------------------------- */
const RAW_STRAPI_URL = (typeof window !== "undefined" && window.__STRAPI_URL__) || "";
const STRAPI_URL = RAW_STRAPI_URL ? (/^https?:\/\//.test(RAW_STRAPI_URL) ? RAW_STRAPI_URL : `https://${RAW_STRAPI_URL}`) : "";
const STRAPI_TOKEN = "";

/* Fetch helper */
async function strapiGet(path) {
  if (!STRAPI_URL) throw new Error("STRAPI_URL not set");
  const url = `${STRAPI_URL}${path}${path.includes("?") ? "&" : "?"}populate=*`;
  const headers = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Strapi request failed: ${res.status}`);
  return res.json();
}

/* ----------------------------------------------------------------------------
   Theme (dark/light)
---------------------------------------------------------------------------- */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
    } catch { }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { }
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = (e) => {
      if (!localStorage.getItem("theme")) {
        const next = e.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", next === "dark");
        document.body.classList.toggle("dark", next === "dark");
        document.documentElement.dataset.theme = next;
        setTheme(next);
      }
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return { theme, setTheme };
}

/* ----------------------------------------------------------------------------
   Content (local fallbacks) — CMS can override
---------------------------------------------------------------------------- */
const PROFILE = {
  name: "Nijanthan Elangovan",
  roles: ["Technical Writer", "Creative Designer"],
  summary:
    "Multidisciplinary Technical & Conversational Writer with 5+ years crafting clear, user-focused content and elegant interfaces for global tech products (Google Ads, YouTube, DV360). Blends precise documentation with thoughtful design to create friction-free experiences.",
  location: "Chennai, India",
  email: "nijanthan.work@gmail.com",
  phone: "+91 8681828144",
  availability: "Open to select freelance & consulting",
};

const SOCIALS = {
  linkedin: "https://www.linkedin.com/in/nijanthane/",
  website: "http://rebrand.ly/nijanthan",
  github: "",
};

const LINKS = { resume: "#" };

/* Experience (full) */
const EXPERIENCE = [
  {
    company: "Google Operations Center",
    title: "Senior Tech Writer Associate",
    range: "Jul 2024 — Present",
    bullets: [
      "Create user-facing Help Center articles for Google Ads with global clarity and accessibility.",
      "Develop internal documentation enabling fast, accurate troubleshooting for support teams.",
      "Write/optimize conversational content for AI-powered chatbots within the Google Help Center.",
      "Collaborate on launch comms for YouTube, DV360, Google Ads, and Policy & Billing.",
    ],
  },
  {
    company: "Euclid Innovations",
    title: "UI Designer & Content",
    range: "Dec 2022 — Jul 2024",
    bullets: [
      "Produced employee handbooks, project docs, and marketing copy to elevate org clarity.",
      "Designed & migrated web content (blogs, case studies) with accessibility best practices.",
      "Conceptualised social creatives + marketing materials; implemented analytics for performance.",
      "Managed multiple websites, optimizing UX and engagement.",
    ],
  },
  {
    company: "AdsHi5",
    title: "WordPress Developer",
    range: "Nov 2021 — Dec 2022",
    bullets: [
      "Directed compliant, performant web experiences across a 40+ site portfolio.",
      "Shipped e-commerce & landing pages—several properties reached 500k+ monthly visits.",
      "Ensured uptime, accessibility, analytics, and SEO discipline.",
    ],
  },
  {
    company: "Yorafitness (PG Internship)",
    title: "Graphic Designer / DM Associate",
    range: "Apr 2021 — Oct 2021",
    bullets: [
      "Designed branding assets and video content; managed targeted ad promotions.",
      "Refined strategy via analytics and audience insights.",
    ],
  },
  {
    company: "Website Learners",
    title: "Technical Content Writer",
    range: "Jun 2018 — Dec 2018",
    bullets: [
      "Built technical content strategy and end-to-end e-learning materials.",
      "Coordinated content pipeline and analyzed performance for continuous improvement.",
    ],
  },
];

// NOTE: "Help Center Systems for Google Ads / YouTube / DV360" intentionally omitted
const PROJECTS = [
  {
    title: "Multi-site WordPress Suite (40+ sites)",
    blurb:
      "Delivered e-commerce & content sites with robust SEO and analytics; several properties crossed 500k+ monthly visits.",
    meta: ["WordPress", "SEO", "Analytics"],
  },
  {
    title: "Design Systems & UI Prototypes",
    blurb:
      "Built consistent, minimalist component libraries and interactive flows in Figma for faster iteration and handoffs.",
    meta: ["Figma", "Prototyping", "Design System"],
  },
  {
    title: "OTT App Concept (University)",
    blurb:
      "Structured a clean, content-first OTT interface with typographic hierarchy and focus states for TV remote UX.",
    meta: ["Product Thinking", "Interaction", "TV UX"],
  },
];

const SKILLS = [
  "Technical & Conversational Writing",
  "Help Center IA & Governance",
  "Chatbot / CX Writing",
  "UX Writing",
  "HTML • CSS • JS • Bootstrap",
  "WordPress",
  "SEO & Web Performance",
  "Figma • Adobe XD • PS • AI",
  "Docs: Word • Excel • PowerPoint",
];

const EDUCATION = [
  { school: "Pondicherry University", degree: "Masters in Electronic Media (Writing, Design & Production)", year: "2019 – 2021" },
  { school: "St. Thomas College of Arts & Science — University of Madras", degree: "Bachelors in Electronic Media", year: "2015 – 2018" },
];

const CERTS = [{ issuer: "NFDC (National Film Development Corporation of India)", name: "Graphic Design Certification" }];

const LATEST = [
  { kind: "Article", title: "About ads and AI Overviews", href: "https://support.google.com/google-ads/answer/16297775", meta: "Google Ads Help" },
  { kind: "Video", title: "How to Add Google Maps in WordPress", href: "https://www.youtube.com/watch?v=bT0cZOQbztI", meta: "YouTube" },
  { kind: "Video", title: "How To Make A Logo in 5 Minutes — for Free", href: "https://youtu.be/wVrEeImyg_E?si=Iz8r8AHQI-8QWwxO", meta: "YouTube" },
];

const CLIENTS = [
  { name: "Euclid Innovations", href: "https://euclidinnovations.com/", blurb: "Staffing • Cloud Enablement • Digital Transformation" },
  { name: "GetKitch", href: "https://getkitch.in/", blurb: "Kitchen solutions & e-commerce" },
  { name: "Yaamohaideen Briyani", href: "https://yaamohaideenbriyani.com/", blurb: "F&B • Restaurant brand" },
  { name: "Yorafitness", href: "https://yorafitness.com/", blurb: "Fitness & lifestyle" },
  { name: "VivaFit", href: "https://vivafit.life/", blurb: "Wellness & nutrition" },
  { name: "SLAM Fitness Studio", href: "https://slamfitnessstudio.in/", blurb: "Gyms & training" },
];

const COMMUNITY = { name: "U&I – Non-profit", href: "https://uandi.org.in/", note: "Proud volunteer — Chapter Lead. Grateful for the impact they create in education and mentorship." };

/* ----------------------------------- Utils ---------------------------------- */
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    return null;
  } catch {
    return null;
  }
}

/* --------------------------- Animation Utilities ---------------------------- */

// Hook for 3D tilt effect on cards
function useTilt(ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / (rect.width / 2));
    y.set((e.clientY - centerY) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

// Magnetic button component
function MagneticButton({ children, href, onClick, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < 100) {
      x.set(distanceX * 0.3);
      y.set(distanceY * 0.3);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;
  const props = href ? { href } : { onClick };

  return (
    <Component
      ref={ref}
      {...props}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </Component>
  );
}

// Scroll progress indicator
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

// Animation variants for stagger effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

function Chip({ children }) {
  return (
    <motion.span
      className="inline-flex items-center rounded-full border border-zinc-300/60 dark:border-zinc-700/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 backdrop-blur-sm bg-white/50 dark:bg-white/5"
      whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.4)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.span>
  );
}

function Section({ id, title, eyebrow, children }) {
  return (
    <section id={id} className="relative scroll-mt-28 w-full px-4 sm:px-6 py-24 sm:py-28 mx-auto">
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <div className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{eyebrow}</div>
        )}
        <h2 className="mb-8 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  );
}

function Card({ children, className = "", tilt = false }) {
  const ref = useRef(null);
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt(ref);
  const shouldReduceMotion = useReducedMotion();

  if (tilt && !shouldReduceMotion) {
    return (
      <motion.div
        ref={ref}
        className={`relative h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] transition-shadow ${className}`}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`relative h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] transition-shadow ${className}`}>
      <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
      {children}
    </div>
  );
}

/* ------------------------------ Animated Logo ------------------------------- */
function LogoNE() {
  const { scrollYProgress } = useScroll();
  const pos = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  return (
    <motion.span
      className="text-lg font-semibold tracking-tight bg-clip-text text-transparent select-none"
      style={{ backgroundImage: "linear-gradient(90deg, #10b981, #22d3ee, #a78bfa, #10b981)", backgroundSize: "200% 100%", backgroundPosition: pos }}
    >
      NE.
    </motion.span>
  );
}

/* --------------------------- Hero Rotating Word ----------------------------- */
function TypingWord({ word }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0; const letters = word.split(""); setShown("");
    const id = setInterval(() => { i += 1; setShown(letters.slice(0, i).join("")); if (i >= letters.length) clearInterval(id); }, 150);
    return () => clearInterval(id);
  }, [word]);
  return (
    <span className="relative">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-cyan-300">{shown}</span>
      <span className="ml-[1px] inline-block w-[2px] h-[1em] align-text-bottom bg-current animate-pulse" />
    </span>
  );
}

function ClickWord({ word }) {
  return (
    <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1.08, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="relative inline-flex items-center">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-cyan-300">{word}</span>
      <MousePointerClick className="ml-2 h-4 w-4 text-emerald-500" />
      <span className="pointer-events-none absolute -inset-2 rounded-full border border-emerald-400/30" />
    </motion.span>
  );
}

function PaintedWord({ word }) {
  useLayoutEffect(() => {
    const id = "painted-gradient-anim";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id; style.textContent = `@keyframes paintFlow {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`;
      document.head.appendChild(style);
    }
  }, []);
  return (
    <span className="relative inline-block">
      <span className="bg-clip-text text-transparent [background-size:300%_300%] animate-[paintFlow_5s_ease_infinite]" style={{ backgroundImage: "linear-gradient(115deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #06b6d4, #10b981, #f59e0b)" }}>{word}</span>
      <span aria-hidden className="block h-[6px] mt-[-6px] rounded-full opacity-70" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #06b6d4, #10b981)", filter: "blur(1px)" }} />
    </span>
  );
}

function RotatingWord({ items = ["Design", "Word", "Click"] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 3000); return () => clearInterval(id); }, [items.length]);
  const active = items[idx];
  return (
    <span className="inline-block align-baseline">
      <motion.span key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {active === "Word" ? <TypingWord word="Word" /> : active === "Click" ? <ClickWord word="Click" /> : <PaintedWord word="Design" />}
      </motion.span>
    </span>
  );
}

/* ------------------------------ Background Glow ----------------------------- */
function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60vmax 60vmax at 120% -10%, rgba(99,102,241,0.22), transparent 60%),radial-gradient(50vmax 50vmax at -20% 10%, rgba(236,72,153,0.18), transparent 60%)", backgroundRepeat: "no-repeat" }} />
  );
}

/* ------------------------------ Floating Navbar ----------------------------- */
function Header({ theme, setTheme }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <header className="fixed top-2 z-50 w-full px-2 sm:px-4">
      <div className="mx-auto w-[95vw] md:w-[85vw] rounded-full border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          <a href="#top" className="min-w-0"><LogoNE /></a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-700 dark:text-zinc-300">
            {["latest", "work", "projects", "clients", "skills", "about", "community", "contact"].map((id) => (
              <a key={id} href={`#${id}`} className="relative hover:text-zinc-900 dark:hover:text-white after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:rounded-full after:transition-all after:duration-300 after:bg-[linear-gradient(90deg,#10b981,#22d3ee,#a78bfa)]">
                {id[0].toUpperCase() + id.slice(1)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <MagneticButton
              href="#contact"
              className="hue-cta inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow transition bg-[linear-gradient(90deg,#10b981,#22d3ee,#a78bfa,#10b981)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="h-4 w-4" />
              Let's talk
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <div className="relative">
              <motion.button
                aria-label="Toggle dark mode"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="ml-1 rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={shouldReduceMotion ? {} : { rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={shouldReduceMotion ? {} : { rotate: 90, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={shouldReduceMotion ? {} : { rotate: 90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={shouldReduceMotion ? {} : { rotate: -90, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
/* --------------------------------- Layout ---------------------------------- */
export default function Portfolio() {
  useInlineStyles();
  const { theme, setTheme } = useTheme();

  useLayoutEffect(() => {
    // FIX: Removed the dynamic font <link> creation from here as it's now handled in useInlineStyles.
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflowX = "clip";

    const setMeta = (name, value) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", value);
    };
    setMeta("x-build-version", "v1");
    setMeta("x-build-time", new Date().toISOString());

  }, []);

  const cms = {};
  const PROFILE_V = cms.PROFILE || PROFILE;
  const EXPERIENCE_V = cms.EXPERIENCE || EXPERIENCE;
  const PROJECTS_V = (cms.PROJECTS || PROJECTS).filter(p => p.title.trim() !== "Help Center Systems for Google Ads / YouTube / DV360");
  const LATEST_V = cms.LATEST || LATEST;
  const CLIENTS_V = cms.CLIENTS || CLIENTS;
  const EDUCATION_V = cms.EDUCATION || EDUCATION;
  const CERTS_V = cms.CERTS || CERTS;
  const SKILLS_V = cms.SKILLS || SKILLS;
  const COMMUNITY_V = cms.COMMUNITY || COMMUNITY;

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black text-zinc-900 dark:text-zinc-50 antialiased" style={{ fontFamily: '"Host Grotesk", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <ScrollProgress />
      <BackgroundGlow />
      <Header theme={theme} setTheme={setTheme} />
      <main id="top" className="pt-20">
        <section className="w-full px-4 sm:px-6 pt-16 pb-12 sm:pb-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 min-w-0">
              {/* FIX: Restructured h1 with <span>s and "block" class to force three lines */}
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-zinc-900 dark:text-zinc-50">
                <span className="block">Creating Strategic</span>
                <span className="block">Impact, One <RotatingWord items={["Design", "Word", "Click"]} /></span>
                <span className="block">at a time.</span>
              </motion.h1>
              <p className="mt-6 max-w-2xl text-zinc-700 dark:text-zinc-300">{PROFILE_V.summary}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <MagneticButton
                  href="#contact"
                  className="hue-cta inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow transition [background-size:300%_300%] animate-[gradientShift_6s_ease_infinite] bg-[linear-gradient(90deg,#10b981,#22d3ee,#a78bfa,#10b981)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="h-4 w-4" /> Contact me <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                {LINKS.resume !== "#" && (
                  <motion.a
                    href={LINKS.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900/5 dark:hover:bg-white/10"
                    whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileDown className="h-4 w-4" /> Resume
                  </motion.a>
                )}
                <motion.a
                  href={SOCIALS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900/5 dark:hover:bg-white/10"
                  whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </motion.a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {PROFILE_V.location}</span>
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> 5+ years</span>
                <Chip>{PROFILE_V.availability}</Chip>
              </div>
            </div>
            {/* Spotlight card with pulsing dot BEFORE "Now" */}
            <div className="lg:col-span-5 min-w-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Card>
                  <div className="relative p-6 sm:p-8">
                    <div className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Now
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold">Senior Tech Writer Associate</h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">Google Operations Center</p>
                    <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      <li>Help Center articles & internal docs for Google Ads</li>
                      <li>AI-assisted chatbot scripts & flows</li>
                      <li>Cross-functional launch communications</li>
                    </ul>
                    <a href="#work" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline">See experience <ArrowRight className="h-4 w-4" /></a>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Latest Published Work */}
        <Section id="latest" eyebrow="Fresh" title="Latest Published Work">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
            {LATEST_V.map((item, i) => {
              const yt = item.kind === "Video" ? getYouTubeId(item.href) : null;
              const thumb = yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null;
              return (
                <motion.div key={item.href} className="h-full" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <Card className="h-full" tilt={true}>
                      <div className="relative aspect-video w-full overflow-hidden">
                        {thumb ? (
                          <motion.img
                            src={thumb}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                        ) : (
                          <div className="h-full w-full bg-[conic-gradient(at_20%_20%,_#34d399_0deg,_#22d3ee_90deg,_#a78bfa_180deg,_#10b981_270deg,_#34d399_360deg)]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur-sm">
                          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                            {yt ? <Youtube className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                          </motion.div>
                          <span>{item.kind}</span>
                        </div>
                      </div>
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                          <motion.div whileHover={{ x: 3, y: -3 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                            <ExternalLink className="h-4 w-4 text-zinc-500" />
                          </motion.div>
                        </div>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.meta}</p>
                      </div>
                    </Card>
                  </a>
                </motion.div>
              );
            })}
          </div>
        </Section>
        {/* Work Experience */}
        <Section id="work" eyebrow="Experience" title="Selected Work">
          <div className="grid grid-cols-1 gap-6">
            {EXPERIENCE_V.map((job, i) => (
              <motion.div key={job.company + job.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 0.5, delay: i * 0.04 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="h-full">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{job.range}</div>
                    </div>
                    <div className="mt-1 text-zinc-700 dark:text-zinc-300">{job.company}</div>
                    <ul className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {job.bullets.map((b) => (
                        <li key={b} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">{b}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
        {/* Projects */}
        <Section id="projects" eyebrow="Case Studies" title="Projects & Impact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[minmax(0,1fr)]">
            {PROJECTS_V.map((p, i) => (
              <motion.div key={p.title} className="h-full" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="h-full">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-tight">{p.title}</h3>
                      <ExternalLink className="h-4 w-4 text-zinc-500" />
                    </div>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{p.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{p.meta.map((m) => (<Chip key={m}>{m}</Chip>))}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
        {/* Clients */}
        <Section id="clients" eyebrow="Trusted by" title="Clients & Collaborations">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
            {CLIENTS_V.map((c) => (
              <motion.div key={c.name} className="h-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="h-full">
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{c.name}</h3><ExternalLink className="h-4 w-4 text-zinc-500" /></div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{c.blurb}</p>
                    </div>
                  </a>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
        {/* Skills */}
        <Section id="skills" eyebrow="Toolbox" title="Skills & Superpowers">
          <Card>
            <motion.div
              className="p-6 sm:p-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={containerVariants}
            >
              <div className="flex flex-wrap gap-2">
                {SKILLS_V.map((s, i) => (
                  <motion.div key={s} variants={itemVariants}>
                    <Chip>{s}</Chip>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Card>
        </Section>
        {/* About */}
        <Section id="about" eyebrow="Story" title="About Nijanthan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
            <Card><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><GraduationCap className="h-4 w-4" /> Education</div><ul className="mt-4 space-y-3 text-sm">{EDUCATION_V.map((e) => (<li key={e.school} className="text-zinc-800 dark:text-zinc-200"><div className="font-medium">{e.school}</div><div className="text-zinc-600 dark:text-zinc-400">{e.degree}</div><div className="text-zinc-500 dark:text-zinc-500">{e.year}</div></li>))}</ul></div></Card>
            <Card><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><BadgeCheck className="h-4 w-4" /> Certification</div><ul className="mt-4 space-y-3 text-sm">{CERTS_V.map((c) => (<li key={c.name} className="text-zinc-800 dark:text-zinc-200"><div className="font-medium">{c.name}</div><div className="text-zinc-600 dark:text-zinc-400">{c.issuer}</div></li>))}</ul></div></Card>
            <Card><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><BookOpen className="h-4 w-4" /> Focus</div><p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">I turn complex systems into simple, elegant narratives—whether that’s product docs, chatbots, or interfaces. I care about inclusive language, fast load times, and the tiny details people feel more than see.</p></div></Card>
          </div>
        </Section>
        {/* Community */}
        <Section id="community" eyebrow="Shoutout" title="Community & Causes">
          <Card>
            <a href={COMMUNITY_V.href} target="_blank" rel="noopener noreferrer" className="block">
              <div className="p-6 sm:p-8 flex items-start gap-4">
                <div className="mt-1"><Heart className="h-5 w-5 text-rose-500" /></div>
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">U&I Foundation</div>
                  <h3 className="mt-1 text-lg font-semibold">{COMMUNITY_V.name}</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{COMMUNITY_V.note}</p>
                </div>
              </div>
            </a>
          </Card>
        </Section>
        {/* Contact */}
        <Section id="contact" eyebrow="Say hello" title="Let’s build something clear & beautiful">
          <Card>
            <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Preferred</div>
                <a href={`mailto:${PROFILE_V.email}`} className="mt-1 inline-flex items-center gap-2 text-lg font-medium hover:underline"><Mail className="h-5 w-5" /> {PROFILE_V.email}</a>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-2"><Linkedin className="h-4 w-4" /> <a className="hover:underline" target="_blank" rel="noreferrer" href={SOCIALS.linkedin}>LinkedIn</a></span>
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {PROFILE_V.location}</span>
                  <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {PROFILE_V.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MagneticButton
                  href={`mailto:${PROFILE_V.email}?subject=Project%20inquiry%20from%20portfolio`}
                  className="hue-cta inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow transition [background-size:300%_300%] animate-[gradientShift_6s_ease_infinite] bg-[linear-gradient(90deg,#10b981,#22d3ee,#a78bfa,#10b981)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="h-4 w-4" /> Start a conversation
                </MagneticButton>
                {LINKS.resume !== "#" && (
                  <motion.a
                    href={LINKS.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 px-5 py-3 text-sm font-medium hover:bg-zinc-900/5 dark:hover:bg-white/10"
                    whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileDown className="h-4 w-4" /> Resume
                  </motion.a>
                )}
              </div>
            </div>
          </Card>
        </Section>
        <footer className="w-full relative py-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Nijanthan Elangovan · Built with care.
          </div>
        </footer>
      </main>
    </div>
  );
}