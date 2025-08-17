import "/src/index.css";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
} from "lucide-react";

/**
 * Nijanthan • Portfolio Site (JavaScript + SWC-ready)
 * Fixes in this revision:
 *  - ✅ Define CMS-driven view models (PROFILE_V, etc.) **before** usage inside <Portfolio />
 *  - ✅ Remove stray CMS access from <Chip /> (no hooks there anymore)
 *  - ✅ Keep equal-height cards + Strapi integration + thumbnails intact
 */

// ------------------------------
// Content (local fallbacks)
// ------------------------------
const PROFILE = {
  name: "Nijanthan Elangovan",
  roles: ["Technical Writer", "Creative Designer"],
  summary:
    "Multidisciplinary Technical & Conversational Writer with 5+ years crafting clear, user‑focused content and elegant interfaces for global tech products (Google Ads, YouTube, DV360). Blends precise documentation with thoughtful design to create friction‑free experiences.",
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

const LINKS = {
  resume: "#",
};

const EXPERIENCE = [
  {
    company: "Google Operations Center",
    title: "Senior Tech Writer Associate",
    range: "Jul 2024 — Present",
    bullets: [
      "Create user‑facing Help Center articles for Google Ads with global clarity and accessibility.",
      "Develop internal documentation enabling fast, accurate troubleshooting for support teams.",
      "Write/optimize conversational content for AI‑powered chatbots within the Google Help Center.",
      "Collaborate with PMs and UX Writers to publish launch comms for YouTube, DV360, Google Ads, and Policy & Billing.",
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
];

const PROJECTS = [
  {
    title: "Help Center Systems for Google Ads / YouTube / DV360",
    blurb:
      "Crafted high‑signal articles and conversational flows that reduce time‑to‑answer and boost self‑serve success.",
    meta: ["Docs", "Chatbot UX", "Accessibility"],
  },
  {
    title: "Design Systems & UI Prototypes",
    blurb:
      "Built consistent, minimalist component libraries and interactive flows in Figma for faster iteration and handoffs.",
    meta: ["Figma", "Prototyping", "Design System"],
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
  {
    school: "Pondicherry University",
    degree: "Masters in Electronic Media (Writing, Design & Production)",
    year: "2019 – 2021",
  },
  {
    school: "St. Thomas College of Arts & Science — University of Madras",
    degree: "Bachelors in Electronic Media",
    year: "2015 – 2018",
  },
];

const CERTS = [
  {
    issuer: "NFDC (National Film Development Corporation of India)",
    name: "Graphic Design Certification",
  },
];

// Latest published work
const LATEST = [
  {
    kind: "Article",
    title: "About ads and AI Overviews",
    href: "https://support.google.com/google-ads/answer/16297775",
    meta: "Google Ads Help",
  },
  {
    kind: "Video",
    title: "How to Add Google Maps in WordPress",
    href: "https://www.youtube.com/watch?v=bT0cZOQbztI",
    meta: "YouTube",
  },
  {
    kind: "Video",
    title: "How To Make A Logo in 5 Minutes — for Free",
    href: "https://youtu.be/wVrEeImyg_E?si=Iz8r8AHQI-8QWwxO",
    meta: "YouTube",
  },
];

// Clients (expanded)
const CLIENTS = [
  {
    name: "Euclid Innovations",
    href: "https://euclidinnovations.com/",
    blurb: "Staffing • Cloud Enablement • Digital Transformation",
  },
  {
    name: "GetKitch",
    href: "https://getkitch.in/",
    blurb: "Kitchen solutions & e‑commerce",
  },
  {
    name: "Yaamohaideen Briyani",
    href: "https://yaamohaideenbriyani.com/",
    blurb: "F&B • Restaurant brand",
  },
  {
    name: "Yorafitness",
    href: "https://yorafitness.com/",
    blurb: "Fitness & lifestyle",
  },
  {
    name: "VivaFit",
    href: "https://vivafit.life/",
    blurb: "Wellness & nutrition",
  },
  {
    name: "SLAM Fitness Studio",
    href: "https://slamfitnessstudio.in/",
    blurb: "Gyms & training",
  },
];

// Community (shoutout)
const COMMUNITY = {
  name: "U&I – Non‑profit",
  href: "https://uandi.org.in/",
  note: "Proud volunteer — Chapter Lead. Grateful for the impact they create in education and mentorship.",
};

// ------------------------------
// Utilities & primitives
// ------------------------------
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

function Chip({ children }) {
  // No CMS access here — purely presentational so it never blocks or errors
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-300/60 dark:border-zinc-700/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 backdrop-blur-sm bg-white/50 dark:bg-white/5">
      {children}
    </span>
  );
}

function Section({ id, title, eyebrow, children }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
      {eyebrow && (
        <div className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {eyebrow}
        </div>
      )}
      <h2 className="mb-8 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

// Static Card (no hover animation) — equal height helper via h-full
function Card({ children, className = "" }) {
  return (
    <div
      className={`relative h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] transition-shadow ${className}`}
    >
      <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
      {children}
    </div>
  );
}

// Aurora background
function Aurora() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  return (
    <motion.div
      ref={ref}
      style={{ y }}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className="absolute -top-40 right-10 h-[38rem] w-[38rem] rounded-full blur-[100px] bg-gradient-to-br from-fuchsia-400/30 via-sky-300/30 to-purple-300/30 dark:from-fuchsia-500/25 dark:via-sky-400/25 dark:to-purple-500/25" />
      <div className="absolute top-1/3 -left-24 h-[34rem] w-[34rem] rounded-full blur-[110px] bg-gradient-to-tr from-emerald-300/30 via-cyan-300/30 to-indigo-300/30 dark:from-emerald-400/25 dark:via-cyan-400/25 dark:to-indigo-500/25" />
    </motion.div>
  );
}

// Magnetic CTA
function MagneticButton({ children, href }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    };
    const reset = () => (el.style.transform = "translate(0,0)");
    el.addEventListener("mousemove", handle);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);
  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 bg-white/80 dark:bg-white/10 px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 shadow-sm hover:shadow-lg transition-all backdrop-blur-md"
    >
      {children}
    </a>
  );
}

// Major Interactive Card (tilt + glare) — used sparingly
function InteractiveCard({ href, children, className = "" }) {
  const ref = useRef(null);
  const [vars, setVars] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -10;
      const ry = (px - 0.5) * 10;
      setVars({ rx, ry, gx: px * 100, gy: py * 100 });
    };
    const onLeave = () => setVars({ rx: 0, ry: 0, gx: 50, gy: 50 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const content = (
    <motion.div
      ref={ref}
      style={{
        transform: `perspective(900px) rotateX(${vars.rx}deg) rotateY(${vars.ry}deg)`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      className={`group relative h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition-all ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-px rounded-2xl"
        style={{
          background: `radial-gradient(600px at ${vars.gx}% ${vars.gy}%, rgba(255,255,255,0.20), transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );

  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  return content;
}

// ------------------------------
// Strapi Cloud integration (optional)
// ------------------------------
const STRAPI_URL =
  (typeof window !== "undefined" && window.__STRAPI_URL__) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_STRAPI_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_STRAPI_URL) ||
  "";

async function strapiGet(path) {
  const url = `${STRAPI_URL}${path}${path.includes("?") ? "&" : "?"}populate=*`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Strapi request failed: ${res.status}`);
  return res.json();
}

function useStrapiCMS() {
  const [cms, setCMS] = useState({
    PROFILE,
    EXPERIENCE,
    PROJECTS,
    LATEST,
    CLIENTS,
    EDUCATION,
    CERTS,
    SKILLS,
    COMMUNITY,
  });
  useEffect(() => {
    if (!STRAPI_URL) return; // Skip if not configured
    (async () => {
      try {
        const [
          profile,
          experiences,
          projects,
          works,
          clients,
          education,
          certs,
          skills,
          community,
        ] = await Promise.allSettled([
          strapiGet("/api/profile"), // single type
          strapiGet("/api/experiences?sort=order:asc"),
          strapiGet("/api/projects?sort=order:asc"),
          strapiGet("/api/works?sort=publishedAt:desc"),
          strapiGet("/api/clients?sort=name:asc"),
          strapiGet("/api/education?sort=year:desc"),
          strapiGet("/api/certs?sort=createdAt:desc"),
          strapiGet("/api/skills?sort=order:asc"),
          strapiGet("/api/community"), // single type
        ]);
        const next = { ...cms };
        if (profile.status === "fulfilled" && profile.value?.data?.attributes) {
          const a = profile.value.data.attributes;
          next.PROFILE = {
            ...next.PROFILE,
            name: a.name ?? next.PROFILE.name,
            roles: a.roles ?? next.PROFILE.roles,
            summary: a.summary ?? next.PROFILE.summary,
            location: a.location ?? next.PROFILE.location,
            email: a.email ?? next.PROFILE.email,
            phone: a.phone ?? next.PROFILE.phone,
            availability: a.availability ?? next.PROFILE.availability,
          };
        }
        if (experiences.status === "fulfilled" && experiences.value?.data) {
          next.EXPERIENCE = experiences.value.data.map((d) => ({
            company: d.attributes.company,
            title: d.attributes.title,
            range: d.attributes.range,
            bullets: (d.attributes.bullets || []).map((b) =>
              typeof b === "string" ? b : b.text
            ),
          }));
        }
        if (projects.status === "fulfilled" && projects.value?.data) {
          next.PROJECTS = projects.value.data.map((d) => ({
            title: d.attributes.title,
            blurb: d.attributes.blurb,
            meta: d.attributes.meta || [],
          }));
        }
        if (works.status === "fulfilled" && works.value?.data) {
          next.LATEST = works.value.data.map((d) => ({
            kind: d.attributes.kind || "Article",
            title: d.attributes.title,
            href: d.attributes.url,
            meta: d.attributes.source || "",
            thumbnail: d.attributes.thumbnail?.data?.attributes?.url || null,
          }));
        }
        if (clients.status === "fulfilled" && clients.value?.data) {
          next.CLIENTS = clients.value.data.map((d) => ({
            name: d.attributes.name,
            href: d.attributes.url,
            blurb: d.attributes.blurb || "",
          }));
        }
        if (education.status === "fulfilled" && education.value?.data) {
          next.EDUCATION = education.value.data.map((d) => ({
            school: d.attributes.school,
            degree: d.attributes.degree,
            year: d.attributes.year,
          }));
        }
        if (certs.status === "fulfilled" && certs.value?.data) {
          next.CERTS = certs.value.data.map((d) => ({
            issuer: d.attributes.issuer,
            name: d.attributes.name,
          }));
        }
        if (skills.status === "fulfilled" && skills.value?.data) {
          next.SKILLS = skills.value.data.map((d) => d.attributes.label);
        }
        if (
          community.status === "fulfilled" &&
          community.value?.data?.attributes
        ) {
          const a = community.value.data.attributes;
          next.COMMUNITY = {
            name: a.name,
            href: a.url,
            note: a.note,
          };
        }
        setCMS(next);
      } catch (e) {
        console.warn("Strapi fetch failed", e);
      }
    })();
  }, []);
  return cms;
}

// ------------------------------
// Main
// ------------------------------
export default function Portfolio() {
  const [prefDark, setPrefDark] = useState(true);
  useEffect(() => {
    // Load Host Grotesk font dynamically
    const id = "host-grotesk-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300..800&display=swap";
      document.head.appendChild(link);
    }
    // Respect user's OS preference by default
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setPrefDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const isDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", isDark);
    setPrefDark(isDark);
  };

  // 👉 CMS view models (fallback to local constants). These exist immediately,
  // then update when Strapi responds — so no undefined errors.
  const cms = useStrapiCMS();
  const PROFILE_V = cms.PROFILE || PROFILE;
  const EXPERIENCE_V = cms.EXPERIENCE || EXPERIENCE;
  const PROJECTS_V = cms.PROJECTS || PROJECTS;
  const LATEST_V = cms.LATEST || LATEST;
  const CLIENTS_V = cms.CLIENTS || CLIENTS;
  const EDUCATION_V = cms.EDUCATION || EDUCATION;
  const CERTS_V = cms.CERTS || CERTS;
  const SKILLS_V = cms.SKILLS || SKILLS;
  const COMMUNITY_V = cms.COMMUNITY || COMMUNITY;

  return (
    <div
      className="relative min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black text-zinc-900 dark:text-zinc-50 antialiased"
      style={{
        fontFamily:
          '"Host Grotesk", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      }}
    >
      <Aurora />

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-black/30 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-semibold tracking-tight">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
              Nijanthan
            </span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-700 dark:text-zinc-300">
            <a
              href="#work"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Work
            </a>
            <a
              href="#latest"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Latest
            </a>
            <a
              href="#projects"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Projects
            </a>
            <a
              href="#clients"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Clients
            </a>
            <a
              href="#skills"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Skills
            </a>
            <a
              href="#about"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              About
            </a>
            <a
              href="#community"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Community
            </a>
            <a
              href="#contact"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={SOCIALS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full hover:bg-zinc-900/5 dark:hover:bg-white/10"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            {SOCIALS.github && (
              <a
                href={SOCIALS.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:bg-zinc-900/5 dark:hover:bg-white/10"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-900/5 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {prefDark ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-10-10 1 1 0 0 0-1.19-1.27A10 10 0 1 0 22 14.19a1 1 0 0 0-.36-1.19Z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M6.76 4.84l-1.8-1.79L4 4l1.79 1.79 0 0 0 0L6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4 20a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1h0a1 1 0 0 0-1-1h0a1 1 0 0 0-1 1zM20 4a1 1 0 0 0-1-1h0a1 1 0 0 0-1 1h0a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1zM12 1h0a1 1 0 0 0-1 1h0a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1h0a1 1 0 0 0-1-1zM19.07 4.93l1.79-1.79L20 2l-1.79 1.79h0l0 0L19.07 4.93zM4.93 19.07l-1.8 1.8L4 22l1.79-1.79h0l0 0L4.93 19.07zM20 13h3v-2h-3v2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="top">
        <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]"
              >
                Designing{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300">
                  clarity
                </span>
                . Writing{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-cyan-300">
                  confidence
                </span>
                .
              </motion.h1>

              <p className="mt-6 max-w-2xl text-zinc-700 dark:text-zinc-300">
                {PROFILE_V.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <MagneticButton href="#contact">
                  <Mail className="h-4 w-4" /> Contact me{" "}
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                {LINKS.resume !== "#" && (
                  <a
                    href={LINKS.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900/5 dark:hover:bg-white/10"
                  >
                    <FileDown className="h-4 w-4" /> Resume
                  </a>
                )}
                <a
                  href={SOCIALS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900/5 dark:hover:bg-white/10"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {PROFILE_V.location}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> 5+ years
                </span>
                <Chip>{PROFILE_V.availability}</Chip>
              </div>
            </div>

            {/* Major interactive spotlight card */}
            <div className="lg:col-span-5">
              <InteractiveCard>
                <div className="relative p-6 sm:p-8">
                  <div className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    Now
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    Senior Tech Writer Associate
                  </h3>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Google Operations Center
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                    <li>Help Center articles & internal docs for Google Ads</li>
                    <li>AI‑assisted chatbot scripts & flows</li>
                    <li>Cross‑functional launch communications</li>
                  </ul>
                  <a
                    href="#work"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    See experience <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </InteractiveCard>
            </div>
          </div>
        </section>

        {/* Latest Published Work — interactive & with thumbnails */}
        <Section id="latest" eyebrow="Fresh" title="Latest Published Work">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
            {LATEST_V.map((item, i) => {
              const yt = item.kind === "Video" ? getYouTubeId(item.href) : null;
              const thumb = item.thumbnail
                ? item.thumbnail.startsWith("http")
                  ? item.thumbnail
                  : `${STRAPI_URL}${item.thumbnail}`
                : yt
                ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
                : null;
              return (
                <motion.div
                  key={item.href}
                  className="h-full"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <InteractiveCard href={item.href} className="h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-[conic-gradient(at_20%_20%,_#34d399_0deg,_#22d3ee_90deg,_#a78bfa_180deg,_#10b981_270deg,_#34d399_360deg)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur-sm">
                        {yt ? (
                          <Youtube className="h-3.5 w-3.5" />
                        ) : (
                          <Globe className="h-3.5 w-3.5" />
                        )}
                        <span>{item.kind}</span>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold leading-tight">
                          {item.title}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-zinc-500" />
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.meta}
                      </p>
                    </div>
                  </InteractiveCard>
                </motion.div>
              );
            })}
          </div>
        </Section>

        {/* Highlights ribbon */}
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_40%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.5))] dark:bg-[linear-gradient(110deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_40%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.06))]" />
            <div className="relative flex items-center gap-6 px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
              <BadgeCheck className="h-4 w-4" /> Help Center & Chatbot UX
              <BadgeCheck className="h-4 w-4" /> WordPress (40+ sites)
              <BadgeCheck className="h-4 w-4" /> SEO & Performance
              <BadgeCheck className="h-4 w-4" /> Design Systems
            </div>
          </div>
        </div>

        {/* Work Experience — static cards */}
        <Section id="work" eyebrow="Experience" title="Selected Work">
          <div className="grid grid-cols-1 gap-6">
            {EXPERIENCE_V.map((job, i) => (
              <motion.div
                key={job.company}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
              >
                <Card className="h-full">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {job.range}
                      </div>
                    </div>
                    <div className="mt-1 text-zinc-700 dark:text-zinc-300">
                      {job.company}
                    </div>
                    <ul className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {job.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Projects — static cards */}
        <Section id="projects" eyebrow="Case Studies" title="Projects & Impact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[minmax(0,1fr)]">
            {PROJECTS_V.map((p, i) => (
              <motion.div
                key={p.title}
                className="h-full"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Card className="h-full">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-tight">
                        {p.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-zinc-500" />
                    </div>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {p.blurb}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.meta.map((m) => (
                        <Chip key={m}>{m}</Chip>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Clients — static cards */}
        <Section
          id="clients"
          eyebrow="Trusted by"
          title="Clients & Collaborations"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
            {CLIENTS_V.map((c) => (
              <Card key={c.name} className="h-full">
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <ExternalLink className="h-4 w-4 text-zinc-500" />
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {c.blurb}
                    </p>
                  </div>
                </a>
              </Card>
            ))}
          </div>
        </Section>

        {/* Skills — static */}
        <Section id="skills" eyebrow="Toolbox" title="Skills & Superpowers">
          <Card className="h-full">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {SKILLS_V.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            </div>
          </Card>
        </Section>

        {/* About — static */}
        <Section id="about" eyebrow="Story" title="About Nijanthan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
            <Card className="h-full">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <GraduationCap className="h-4 w-4" /> Education
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {EDUCATION_V.map((e) => (
                    <li
                      key={e.school}
                      className="text-zinc-800 dark:text-zinc-200"
                    >
                      <div className="font-medium">{e.school}</div>
                      <div className="text-zinc-600 dark:text-zinc-400">
                        {e.degree}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-500">
                        {e.year}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <BadgeCheck className="h-4 w-4" /> Certification
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {CERTS_V.map((c) => (
                    <li
                      key={c.name}
                      className="text-zinc-800 dark:text-zinc-200"
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-zinc-600 dark:text-zinc-400">
                        {c.issuer}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
            <Card className="h-full">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <BookOpen className="h-4 w-4" /> Focus
                </div>
                <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
                  I turn complex systems into simple, elegant narratives—whether
                  that’s product docs, chatbots, or interfaces. I care about
                  inclusive language, fast load times, and the tiny details
                  people feel more than see.
                </p>
              </div>
            </Card>
          </div>
        </Section>

        {/* Community Shoutout — static, respectful */}
        <Section id="community" eyebrow="Shoutout" title="Community & Causes">
          <Card className="h-full">
            <a
              href={COMMUNITY_V.href}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <div className="p-6 sm:p-8 flex items-start gap-4">
                <div className="mt-1">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    U&I Foundation
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">
                    {COMMUNITY_V.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {COMMUNITY_V.note}
                  </p>
                </div>
              </div>
            </a>
          </Card>
        </Section>

        {/* Contact — static */}
        <Section
          id="contact"
          eyebrow="Say hello"
          title="Let’s build something clear & beautiful"
        >
          <Card className="h-full">
            <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Preferred
                </div>
                <a
                  href={`mailto:${PROFILE_V.email}`}
                  className="mt-1 inline-flex items-center gap-2 text-lg font-medium hover:underline"
                >
                  <Mail className="h-5 w-5" /> {PROFILE_V.email}
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />{" "}
                    <a
                      className="hover:underline"
                      target="_blank"
                      rel="noreferrer"
                      href={SOCIALS.linkedin}
                    >
                      LinkedIn
                    </a>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {PROFILE_V.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {PROFILE_V.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MagneticButton
                  href={`mailto:${PROFILE_V.email}?subject=Project%20inquiry%20from%20portfolio`}
                >
                  <Mail className="h-4 w-4" /> Start a conversation
                </MagneticButton>
                {LINKS.resume !== "#" && (
                  <a
                    href={LINKS.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 px-5 py-3 text-sm font-medium hover:bg-zinc-900/5 dark:hover:bg-white/10"
                  >
                    <FileDown className="h-4 w-4" /> Resume
                  </a>
                )}
              </div>
            </div>
          </Card>
        </Section>

        <footer className="mx-auto max-w-6xl px-6 pb-16 pt-4 text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Nijanthan Elangovan · Built with care.
        </footer>
      </main>
    </div>
  );
}
