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
    ArrowUpRight,
    Play,
    Video,
    Newspaper,
} from "lucide-react";
import contentData from "../data/content.json";
import InteractiveBackground from "./InteractiveBackground";

import { optimizeImage } from "../utils/cloudinaryHelper";

// ... (existing imports)

import SEO from "./SEO";

// ... (existing code)

// ... (existing code)

// ... (imports remain) ...

// ... (existing code) ...


function useInlineStyles() {
    useLayoutEffect(() => {
        if (document.getElementById("ne-inline-css")) return;
        const el = document.createElement("style");
        el.id = "ne-inline-css";
        // FIX: Added Google Font @import here for more reliable loading.
        el.textContent = `
@keyframes hue-cycle { from { filter: hue-rotate(0deg) } to { filter: hue-rotate(360deg) } }
.hue-cta:hover { animation: hue-cycle 6s linear infinite; will-change: filter; }
@keyframes typing { from { width: 0 } to { width: 100% } }
@keyframes caret-blink { 0%,49% { border-color: transparent } 50%,100% { border-color: currentColor } }
.typing-item { display:inline-block; white-space:nowrap; overflow:hidden; border-right:2px solid currentColor; animation-fill-mode:forwards; }
.glass { backdrop-filter: saturate(140%) blur(16px); background: color-mix(in oklab, white 80%, transparent); }
:root.dark .glass { background: color-mix(in oklab, black 70%, transparent); }
@keyframes gradientShift {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes paintFlow {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
`;
        document.head.appendChild(el);
    }, []);
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
    const rectRef = useRef(null);

    const handleMouseEnter = () => {
        if (ref.current) {
            rectRef.current = ref.current.getBoundingClientRect();
        }
    };

    const handleMouseMove = (e) => {
        if (!rectRef.current) return;
        const rect = rectRef.current;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) / (rect.width / 2));
        y.set((e.clientY - centerY) / (rect.height / 2));
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        rectRef.current = null;
    };

    return { rotateX, rotateY, handleMouseEnter, handleMouseMove, handleMouseLeave };
}

// Magnetic button component
function MagneticButton({ children, href, onClick, className = "" }) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });
    const rectRef = useRef(null);

    const handleMouseEnter = () => {
        if (ref.current) {
            rectRef.current = ref.current.getBoundingClientRect();
        }
    };

    const handleMouseMove = (e) => {
        if (!rectRef.current) return;
        const rect = rectRef.current;
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
        rectRef.current = null;
    };

    const Component = href ? motion.a : motion.button;
    const props = href ? { href } : { onClick };

    return (
        <Component
            ref={ref}
            {...props}
            className={className}
            style={{ x: springX, y: springY }}
            onMouseEnter={handleMouseEnter}
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
    const { rotateX, rotateY, handleMouseEnter, handleMouseMove, handleMouseLeave } = useTilt(ref);
    const shouldReduceMotion = useReducedMotion();

    if (tilt && !shouldReduceMotion) {
        return (
            <motion.div
                ref={ref}
                className={`relative h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] transition-shadow ${className}`}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                onMouseEnter={handleMouseEnter}
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
    useTypeform();
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

    const PROFILE_V = contentData.PROFILE;
    const SOCIALS_V = contentData.SOCIALS;
    const LINKS_V = contentData.LINKS;
    const EXPERIENCE_V = contentData.EXPERIENCE;
    const PROJECTS_V = contentData.PROJECTS;
    const LATEST_V = contentData.LATEST;
    const CLIENTS_V = contentData.CLIENTS;
    const EDUCATION_V = contentData.EDUCATION;
    const CERTS_V = contentData.CERTS;
    const SKILLS_V = contentData.SKILLS;
    const COMMUNITY_V = contentData.COMMUNITY;
    const NOW_V = contentData.NOW || {
        title: "Senior Tech Writer Associate",
        company: "Google Operations Center",
        link: "#work",
        bullets: [
            "Help Center articles & internal docs for Google Ads",
            "AI-assisted chatbot scripts & flows",
            "Cross-functional launch communications"
        ]
    };

    const HERO_V = contentData.HERO || { words: ["Design", "Word", "Click"] };
    const UI_V = contentData.UI || {
        hero: { line1: "Creating Strategic", line2_prefix: "Impact, One", line3: "at a time." },
        latest: { eyebrow: "Fresh", title: "Latest Published Work" },
        work: { eyebrow: "Experience", title: "Selected Work" },
        projects: { eyebrow: "Case Studies", title: "Projects & Impact" },
        clients: { eyebrow: "Trusted by", "title": "Clients & Collaborations" },
        skills: { eyebrow: "Toolbox", title: "Skills & Superpowers" },
        about: { eyebrow: "Story", title: "About Nijanthan" },
        community: { eyebrow: "Shoutout", title: "Community & Causes" },
        contact: { eyebrow: "Say hello", title: "Let’s build something clear & beautiful" },
        footer: "Built with care."
    };

    // Construct Schema.org Person Data
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": PROFILE_V.name,
        "jobTitle": PROFILE_V.roles,
        "description": PROFILE_V.summary,
        "url": SOCIALS_V.website,
        "sameAs": [
            SOCIALS_V.linkedin,
            SOCIALS_V.github
        ].filter(Boolean),
        "knowsAbout": SKILLS_V,
        "worksFor": {
            "@type": "Organization",
            "name": NOW_V.company || "Google Operations Center"
        }
    };

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-transparent text-zinc-900 dark:text-zinc-50 antialiased" style={{ fontFamily: '"Host Grotesk", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
            <SEO
                title={`${PROFILE_V.name} | ${PROFILE_V.roles[0]}`}
                description={PROFILE_V.summary}
                canonical={SOCIALS_V.website}
                openGraph={{
                    type: 'website',
                    image: 'https://res.cloudinary.com/nijanthan/image/upload/f_auto,q_auto/v1765621694/all-devices-white_fi2jmy.png',
                    title: `${PROFILE_V.name} - Portfolio`,
                    description: PROFILE_V.summary
                }}
                schema={personSchema}
            />
            <ScrollProgress />
            <InteractiveBackground />
            <Header theme={theme} setTheme={setTheme} />
            <main id="top" className="pt-20">
                <section className="w-full px-4 sm:px-6 pt-16 pb-12 sm:pb-16">
                    <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 min-w-0">
                            {/* FIX: Restructured h1 with <span>s and "block" class to force three lines */}
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-zinc-900 dark:text-zinc-50">
                                <span className="block">{UI_V.hero.line1}</span>
                                <span className="block">{UI_V.hero.line2_prefix} <RotatingWord items={HERO_V.words} /></span>
                                <span className="block">{UI_V.hero.line3}</span>
                            </motion.h1>
                            <p className="mt-6 max-w-2xl text-zinc-700 dark:text-zinc-300">{PROFILE_V.summary}</p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <MagneticButton
                                    href="#contact"
                                    className="hue-cta inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow transition [background-size:300%_300%] animate-[gradientShift_6s_ease_infinite] bg-[linear-gradient(90deg,#10b981,#22d3ee,#a78bfa,#10b981)] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Mail className="h-4 w-4" /> Contact me <ArrowRight className="h-4 w-4" />
                                </MagneticButton>
                                {LINKS_V.resume !== "#" && (
                                    <motion.a
                                        href={LINKS_V.resume}
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
                                    href={SOCIALS_V.linkedin}
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
                                        <h3 className="text-xl sm:text-2xl font-semibold">{NOW_V.title}</h3>
                                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{NOW_V.company}</p>
                                        <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                                            {NOW_V.bullets.map((bullet, i) => (
                                                <li key={i}>{bullet}</li>
                                            ))}
                                        </ul>
                                        <a href={NOW_V.link} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline">See experience <ArrowRight className="h-4 w-4" /></a>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Latest Published Work */}
                <Section id="latest" eyebrow={UI_V.latest.eyebrow} title={UI_V.latest.title}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                        {LATEST_V.filter(item => item.featured !== false).map((item, i) => {
                            const yt = item.kind === "Video" ? getYouTubeId(item.href) : null;
                            return (
                                <Card key={item.title}>
                                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full group">
                                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                            {yt ? (
                                                <img
                                                    src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    width="480"
                                                    height="360"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : item.thumbnail ? (
                                                <img
                                                    src={optimizeImage(item.thumbnail)}
                                                    srcSet={`
                                                        ${optimizeImage(item.thumbnail, 400)} 400w,
                                                        ${optimizeImage(item.thumbnail, 800)} 800w,
                                                        ${optimizeImage(item.thumbnail, 1200)} 1200w
                                                    `}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-zinc-400"><ArrowUpRight className="h-8 w-8 opacity-50" /></div>
                                            )}
                                            {item.kind === "Video" && <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition"><div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm"><Play className="h-5 w-5 fill-black text-black ml-0.5" /></div></div>}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    {item.kind === "Video" ? <Video className="h-3 w-3" /> : <Newspaper className="h-3 w-3" />}
                                                    {item.meta}
                                                </div>
                                                <ArrowUpRight className="h-4 w-4 text-zinc-400 transition group-hover:text-emerald-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </div>
                                            <h3 className="mt-3 text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{item.title}</h3>
                                        </div>
                                    </a>
                                </Card>
                            );
                        })}
                    </div>
                    {/* Scrollable Non-Featured Items */}
                    {LATEST_V.filter(item => item.featured === false).length > 0 && (
                        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x">
                            {LATEST_V.filter(item => item.featured === false).map((item, i) => (
                                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-emerald-500/50 transition group">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{item.title}</h4>
                                        <ArrowUpRight className="h-3 w-3 text-zinc-400 shrink-0" />
                                    </div>
                                    <div className="mt-2 text-xs text-zinc-500">{item.meta}</div>
                                </a>
                            ))}
                        </div>
                    )}
                </Section>
                {/* Work Experience */}
                <Section id="work" eyebrow={UI_V.work.eyebrow} title={UI_V.work.title}>
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
                <Section id="projects" eyebrow={UI_V.projects.eyebrow} title={UI_V.projects.title}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[minmax(0,1fr)]">
                        {PROJECTS_V.filter(p => p.featured !== false).map((p, i) => (
                            <motion.div key={p.title} className="h-full" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Card>
                                    <a href={p.href || '#'} className="block h-full p-6 sm:p-8">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                {p.meta.map((m) => (
                                                    <span key={m} className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">{m}</span>
                                                ))}
                                            </div>
                                            {p.href && p.href !== '#' && <ArrowUpRight className="h-5 w-5 text-zinc-400" />}
                                        </div>
                                        <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">{p.title}</h3>
                                        <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">{p.blurb}</p>
                                        {p.thumbnail && (
                                            <img
                                                src={optimizeImage(p.thumbnail)}
                                                srcSet={`
                                                    ${optimizeImage(p.thumbnail, 400)} 400w,
                                                    ${optimizeImage(p.thumbnail, 800)} 800w
                                                `}
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                alt=""
                                                className="mt-4 w-full h-48 object-cover rounded-lg"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        )}
                                    </a>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                    {/* Scrollable Non-Featured Projects */}
                    {PROJECTS_V.filter(p => p.featured === false).length > 0 && (
                        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x">
                            {PROJECTS_V.filter(p => p.featured === false).map((p, i) => (
                                <a key={i} href={p.href || '#'} className="snap-start shrink-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-emerald-500/50 transition group">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{p.title}</h4>
                                        {p.href && p.href !== '#' && <ArrowUpRight className="h-4 w-4 text-zinc-400 shrink-0" />}
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{p.blurb}</p>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {p.meta.slice(0, 2).map(m => <span key={m} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{m}</span>)}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </Section>
                {/* Clients */}
                <Section id="clients" eyebrow={UI_V.clients.eyebrow} title={UI_V.clients.title}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                        {CLIENTS_V.filter(c => c.featured !== false).map((c) => (
                            <motion.div key={c.name} className="h-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Card>
                                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="block p-6 sm:p-8 h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400">{c.name[0]}</div>
                                            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{c.name}</h3>
                                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{c.blurb}</p>
                                    </a>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                    {/* Scrollable Non-Featured Clients */}
                    {CLIENTS_V.filter(c => c.featured === false).length > 0 && (
                        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x">
                            {CLIENTS_V.filter(c => c.featured === false).map((c, i) => (
                                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-emerald-500/50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 shrink-0">{c.name[0]}</div>
                                        <div>
                                            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{c.name}</h4>
                                            <p className="text-xs text-zinc-500 truncate w-32">{c.blurb}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </Section>
                {/* Skills */}
                <Section id="skills" eyebrow={UI_V.skills.eyebrow} title={UI_V.skills.title}>
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
                <Section id="about" eyebrow={UI_V.about.eyebrow} title={UI_V.about.title}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                        <Card><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><GraduationCap className="h-4 w-4" /> Education</div><ul className="mt-4 space-y-3 text-sm">{EDUCATION_V.map((e) => (<li key={e.school} className="text-zinc-800 dark:text-zinc-200"><div className="font-medium">{e.school}</div><div className="text-zinc-600 dark:text-zinc-400">{e.degree}</div><div className="text-zinc-500 dark:text-zinc-500">{e.year}</div></li>))}</ul></div></Card>
                        <Card><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><BadgeCheck className="h-4 w-4" /> Certification</div><ul className="mt-4 space-y-3 text-sm">{CERTS_V.map((c) => (<li key={c.name} className="text-zinc-800 dark:text-zinc-200"><div className="font-medium">{c.name}</div><div className="text-zinc-600 dark:text-zinc-400">{c.issuer}</div></li>))}</ul></div></Card>
                        <Card><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><BookOpen className="h-4 w-4" /> Focus</div><p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">I turn complex systems into simple, elegant narratives—whether that’s product docs, chatbots, or interfaces. I care about inclusive language, fast load times, and the tiny details people feel more than see.</p></div></Card>
                    </div>
                </Section>
                {/* Community */}
                <Section id="community" eyebrow={UI_V.community.eyebrow} title={UI_V.community.title}>
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
                <Section id="contact" eyebrow={UI_V.contact.eyebrow} title={UI_V.contact.title}>
                    <Card>
                        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Preferred</div>
                                <a href={`mailto:${PROFILE_V.email}`} className="mt-1 inline-flex items-center gap-2 text-lg font-medium hover:underline"><Mail className="h-5 w-5" /> {PROFILE_V.email}</a>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <span className="inline-flex items-center gap-2"><Linkedin className="h-4 w-4" /> <a className="hover:underline" target="_blank" rel="noreferrer" href={SOCIALS_V.linkedin}>LinkedIn</a></span>
                                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {PROFILE_V.location}</span>
                                    <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {PROFILE_V.phone}</span>
                                </div>
                            </div>
                            <div className="w-full mt-6 md:mt-0 md:pl-10">
                                <div data-tf-live="01KCBQD38PG1AR5GWYSF1R69BQ"></div>
                            </div>
                        </div>
                    </Card>
                </Section>
                <footer className="w-full relative py-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        © {new Date().getFullYear()} Nijanthan Elangovan · {UI_V.footer}
                    </div>
                </footer>
            </main>
        </div>
    );
}

// Load Typeform script
function useTypeform() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "//embed.typeform.com/next/embed.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
}
