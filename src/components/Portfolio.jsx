import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    FileDown,
    Mail,
    Linkedin,
    MapPin,
    Github,
    Phone,
    Calendar,
    GraduationCap,
    BadgeCheck,
    BookOpen,
    Heart,
    Sun,
    Moon,
    Menu,
    ArrowUpRight,
    Play,
    Video,
    Newspaper,
    Bot,
    UserRound,
    UsersRound,
} from "lucide-react";
import contentData from "../data/content.json";
import ContactForm from "./ContactForm";
import InteractiveBackground from "./InteractiveBackground";
import { optimizeImage } from "../utils/cloudinaryHelper";

/* ----------------------------------------------------------------------------
   Theme (dark/light)
---------------------------------------------------------------------------- */
function useTheme() {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem("theme");
            if (saved) return saved;
        } catch {
            // Use the system preference when storage is unavailable.
        }
        if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
        return "light";
    });

    useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        document.body.classList.toggle("dark", theme === "dark");
        root.dataset.theme = theme;
        const chromeColor = theme === "dark" ? "#1b1a17" : "#fdfbf4";
        document.querySelectorAll('meta[name="theme-color"]').forEach((element) => {
            element.content = chromeColor;
        });
        try {
            localStorage.setItem("theme", theme);
        } catch {
            // The theme still applies for this visit.
        }
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

/* ------------------------------- Medium feed --------------------------------- */
function useMediumPosts(feedUrl, limit = 3) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        let cancelled = false;
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled || data.status !== "ok" || !Array.isArray(data.items)) return;
                const mapped = data.items.slice(0, limit).map((item) => {
                    const images = (item.content ?? "").matchAll(/<img\b[^>]*\ssrc=["']([^"']+)["']/gi);
                    const thumbnail = [item.thumbnail, ...Array.from(images, ([, src]) => src)]
                        .find((src) => src && !src.includes("/_/stat"));
                    return {
                        kind: "Article",
                        title: item.title,
                        href: item.link,
                        meta: "Medium | Article",
                        featured: true,
                        thumbnail: thumbnail ?? "",
                    };
                });
                setPosts(mapped);
            })
            .catch(() => { /* feed unavailable, fall back to curated list */ });
        return () => { cancelled = true; };
    }, [feedUrl, limit]);

    return posts;
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

/* --------------------------------- Doc Tag ---------------------------------- */
function Tag({ children }) {
    return (
        <span className="inline-flex items-center rounded-sm border border-ink-900/20 dark:border-paper-50/20 px-2.5 py-1 font-mono text-[11px] text-ink-800 dark:text-paper-100 bg-paper-50/70 dark:bg-ink-900/40">
            {children}
        </span>
    );
}

/* ------------------------------ Section header ------------------------------ */
function Section({ id, title, eyebrow, children }) {
    return (
        <section id={id} className="relative scroll-mt-28 w-full px-4 sm:px-6 py-20 sm:py-24 mx-auto">
            <div className="mx-auto max-w-5xl">
                <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed border-ink-900/25 dark:border-paper-50/20 pb-4 mb-10">
                    <h2 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-ink-900 dark:text-paper-50">{title}</h2>
                    <motion.span
                        aria-hidden="true"
                        className="portfolio-section-mark absolute -bottom-px left-0 h-0.5 w-12 origin-left bg-mark dark:bg-mark-light"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.34, ease: "easeOut" }}
                    />
                    {eyebrow && (
                        <div className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-mark dark:text-mark-light">{eyebrow}</div>
                    )}
                </div>
                <div className="space-y-6">{children}</div>
            </div>
        </section>
    );
}

/* ---------------------------------- Card ------------------------------------ */
function Card({ children, className = "", tabLabel }) {
    return (
        <div
            className={`portfolio-card relative rounded-sm border border-ink-900/15 dark:border-paper-50/15 bg-paper-50/80 dark:bg-ink-800/70 backdrop-blur-sm shadow-[3px_3px_0_0_rgba(27,26,23,0.10)] dark:shadow-[3px_3px_0_0_rgba(0,0,0,0.5)] motion-safe:transition duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(27,26,23,0.16)] dark:hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.6)] ${className}`}
        >
            {tabLabel && (
                <span className="absolute -top-3 left-5 bg-paper-50 dark:bg-ink-900 border border-ink-900/20 dark:border-paper-50/20 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-700 dark:text-paper-200">
                    {tabLabel}
                </span>
            )}
            {children}
        </div>
    );
}

/* -------------------------------- Stamp button ------------------------------- */
function StampButton({ children, href, onClick, variant = "solid", className = "" }) {
    const base = "inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-medium border-2 border-ink-900 dark:border-paper-50 motion-safe:transition motion-safe:hover:translate-x-[2px] motion-safe:hover:translate-y-[2px]";
    const solid = "bg-mark text-paper-50 shadow-[3px_3px_0_0_rgba(27,26,23,0.9)] dark:shadow-[3px_3px_0_0_rgba(247,242,230,0.9)] hover:shadow-[1px_1px_0_0_rgba(27,26,23,0.9)] dark:hover:shadow-[1px_1px_0_0_rgba(247,242,230,0.9)]";
    const outline = "bg-transparent text-ink-900 dark:text-paper-50 shadow-[3px_3px_0_0_rgba(27,26,23,0.25)] dark:shadow-[3px_3px_0_0_rgba(247,242,230,0.25)] hover:bg-ink-900 hover:text-paper-50 dark:hover:bg-paper-50 dark:hover:text-ink-900 hover:shadow-[1px_1px_0_0_rgba(27,26,23,0.25)]";
    const Component = href ? motion.a : motion.button;
    const props = href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: href.startsWith("http") ? "noreferrer" : undefined } : { onClick };
    return (
        <Component {...props} className={`${base} ${variant === "solid" ? solid : outline} ${className}`} whileTap={{ scale: 0.97 }}>
            {children}
        </Component>
    );
}

/* ------------------------------ Scroll progress ------------------------------ */
function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    return <motion.div aria-hidden="true" className="pointer-events-none fixed top-0 left-0 right-0 h-[3px] bg-mark origin-left z-[100]" style={{ scaleX }} />;
}

/* ------------------------------- Doc mark / logo ------------------------------ */
const DOC_MARK_ANIMATIONS = ["stamp", "swivel", "sweep"];

function DocMarkLink({ children, className, onClick }) {
    const [animation, setAnimation] = useState(-1);
    const play = () => setAnimation((index) => (index + 1) % DOC_MARK_ANIMATIONS.length);

    return (
        <a
            href="#top"
            aria-label={children ? undefined : "NE, back to top"}
            className={className}
            data-mark-motion={DOC_MARK_ANIMATIONS[animation]}
            onClick={onClick}
            onPointerEnter={(event) => { if (event.pointerType === "mouse" || event.pointerType === "pen") play(); }}
            onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) play(); }}
        >
            <span aria-hidden="true" className="doc-mark pointer-events-none relative isolate inline-flex shrink-0 rotate-[-2deg] select-none">
                <span className="doc-mark-face relative overflow-hidden rounded-sm border-2 border-ink-900 bg-transparent px-1.5 py-0.5 font-mono text-sm font-bold tracking-tight text-paper-50 dark:border-paper-50">
                    <span className="relative z-10">NE</span>
                </span>
            </span>
            {children}
        </a>
    );
}

function ClientMark({ name, href, logo }) {
    const [broken, setBroken] = useState(false);
    let domain = "";
    try { domain = new URL(href).hostname; } catch { /* no usable domain, fall back to initial */ }
    const src = logo || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "");

    if (!src || broken) {
        return (
            <div className="h-9 w-9 flex items-center justify-center font-mono text-sm font-bold text-ink-700 dark:text-paper-200">
                {name[0]}
            </div>
        );
    }

    return <img src={src} alt="" loading="lazy" className="h-9 w-9 rounded-sm object-contain dark:bg-paper-50/90 dark:p-1" onError={() => setBroken(true)} />;
}

function SpinningBadge({ text }) {
    const pathId = useId();
    if (!text) return null;

    // Pick the largest font where two loops of the phrase still wrap the ring
    // without being stretched thin, instead of shrinking the font to fit more loops.
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    const unit = `${text.toUpperCase()}  •  `;
    const fontSize = 13;
    const pathD = `M${42 - radius} 42a${radius} ${radius} 0 1 1 ${radius * 2} 0a${radius} ${radius} 0 1 1 ${-radius * 2} 0`;

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 84 84"
            className="pointer-events-none absolute -top-[26px] -right-[10px] z-10 size-16 text-ink-900 dark:text-paper-50 lg:-top-[34px] lg:-right-[12px] lg:size-[84px]"
        >
            <defs>
                <path id={pathId} d={pathD} />
            </defs>
            <circle cx="42" cy="42" r="40" className="fill-paper-50 stroke-current dark:fill-ink-800" strokeWidth="2" />
            <g className="role-badge-lettering">
                <text className="fill-current font-mono font-medium" fontSize={fontSize} textLength={circumference.toFixed(1)} lengthAdjust="spacing">
                    <textPath href={`#${pathId}`}>{unit.repeat(2)}</textPath>
                </text>
            </g>
            <circle cx="42" cy="42" r="4" className="fill-mark dark:fill-mark-light" />
        </svg>
    );
}

/* --------------------------- Hero headline reveal ---------------------------- */
const HEADLINE_HOLD_MS = 4000;
const HEADLINE_ENTER = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
const HEADLINE_EXIT = { duration: 0.36, ease: [0.55, 0, 0.75, 0.5] };
const FIRST_HEADLINE_FRAME = { index: 0, phase: "hold" };

function headlineSentence(line, connector, prefix) {
    return `${line.object} ${connector} ${line.reader} ${prefix} ${line.verb}.`;
}

function ReaderWord({ reader, type, animateIcon = false }) {
    const Icon = type === "ai" ? Bot : type === "team" ? UsersRound : UserRound;
    const burstRef = useRef(null);

    useEffect(() => {
        const burst = burstRef.current;
        if (!animateIcon || !burst?.animate) return;

        // Give each burst its own window so the randomized timings cannot overlap.
        const animations = [220, 1310, 2400].map((start) => {
            const delay = start + Math.random() * 350;
            const duration = 520 + Math.random() * 170;
            const angle = Math.random() * 24 - 12;
            const scale = 1.04 + Math.random() * 0.12;

            return burst.animate([
                { opacity: 0, transform: `rotate(${angle - 6}deg) scale(0.65)` },
                { opacity: 1, transform: `rotate(${angle}deg) scale(${scale})`, offset: 0.35 },
                { opacity: 0, transform: `rotate(${angle + 6}deg) scale(${scale + 0.07})` },
            ], { delay, duration, easing: "ease-out" });
        });

        return () => animations.forEach((animation) => animation.cancel());
    }, [animateIcon]);

    return (
        <span className="text-mark dark:text-mark-light">
            <Icon
                className={`mr-[0.22em] inline-block size-[0.65em] overflow-visible align-[0.03em]${animateIcon ? " headline-reader-icon" : ""}`}
                aria-hidden="true"
            >
                {animateIcon && (
                    <g ref={burstRef} className="origin-center" opacity="0" strokeWidth="2">
                        <path d="M-1 11h-4M1 5l-4-3M7 1l-2-4M17 1l2-4M23 5l4-3M25 11h4" />
                    </g>
                )}
            </Icon>
            {reader}
        </span>
    );
}

function HeroHeadline({ connector, prefix, strike, lines }) {
    const [shouldReduceMotion, setShouldReduceMotion] = useState(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    const [frame, setFrame] = useState(FIRST_HEADLINE_FRAME);
    const headlineRef = useRef(null);

    useEffect(() => {
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = ({ matches }) => {
            setShouldReduceMotion(matches);
            setFrame(FIRST_HEADLINE_FRAME);
        };
        preference.addEventListener("change", onChange);
        return () => preference.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        if (shouldReduceMotion || frame.phase !== "hold" || lines.length < 2) return;

        const headline = headlineRef.current;
        let hovered = headline.matches(":hover");
        let timer;
        let startedAt;
        let remaining = HEADLINE_HOLD_MS;

        const updateTimer = () => {
            if (document.hidden || hovered) {
                if (timer === undefined) return;
                clearTimeout(timer);
                timer = undefined;
                remaining = Math.max(0, remaining - (performance.now() - startedAt));
            } else if (timer === undefined) {
                startedAt = performance.now();
                timer = setTimeout(() => setFrame({ ...frame, phase: "exit" }), remaining);
            }
        };
        const onEnter = () => {
            hovered = true;
            updateTimer();
        };
        const onLeave = () => {
            hovered = false;
            updateTimer();
        };
        document.addEventListener("visibilitychange", updateTimer);
        headline.addEventListener("mouseenter", onEnter);
        headline.addEventListener("mouseleave", onLeave);
        updateTimer();

        return () => {
            clearTimeout(timer);
            document.removeEventListener("visibilitychange", updateTimer);
            headline.removeEventListener("mouseenter", onEnter);
            headline.removeEventListener("mouseleave", onLeave);
        };
    }, [frame, lines.length, shouldReduceMotion]);

    const firstLine = lines[0];
    if (!firstLine) return null;

    const line = lines[frame.index] ?? firstLine;
    const isExiting = frame.phase === "exit";
    const motionProps = {
        initial: frame.phase === "enter"
            ? { opacity: 0, y: 12, clipPath: "inset(80% -10% -18% -10%)" }
            : false,
        animate: isExiting
            ? { opacity: 0, y: -8, clipPath: "inset(-18% -10% 80% -10%)" }
            : { opacity: 1, y: 0, clipPath: "inset(-18% -10% -18% -10%)" },
        transition: shouldReduceMotion ? { duration: 0 } : isExiting ? HEADLINE_EXIT : HEADLINE_ENTER,
    };
    const onAnimationComplete = () => {
        if (frame.phase === "hold") return;
        const nextFrame = frame.phase === "exit"
            ? { index: (frame.index + 1) % lines.length, phase: "enter" }
            : { ...frame, phase: "hold" };
        setFrame((current) => current === frame ? nextFrame : current);
    };
    const rotatingWordClass = "col-start-1 row-start-1 min-w-0 break-words";
    const verbClass = `${rotatingWordClass} font-semibold italic text-mark dark:text-mark-light`;

    // Reserve space with invisible copies and align the visible phrase just above the fixed second row.
    return (
        <h1
            ref={headlineRef}
            className="text-left font-display text-[clamp(1.25rem,6.5vw,4.6rem)] font-medium leading-[1.15] tracking-tight text-ink-900 dark:text-paper-50 sm:text-[clamp(1.65rem,7vw,4.6rem)] lg:text-[2.625rem]"
            aria-label={headlineSentence(firstLine, connector, prefix)}
        >
            <span className="flex flex-wrap items-end gap-x-[0.25em]" aria-hidden="true">
                <span className="grid max-w-full items-end">
                    {lines.map((entry, index) => (
                        <span key={index} className={`invisible ${rotatingWordClass}`}>{entry.object}</span>
                    ))}
                    <motion.span
                        key={`object-${frame.index}`}
                        className={rotatingWordClass}
                        {...motionProps}
                        onAnimationComplete={onAnimationComplete}
                    >
                        {line.object}
                    </motion.span>
                </span>
                <span className="grid max-w-full grid-cols-[auto_minmax(0,1fr)] items-end gap-x-[0.25em]">
                    <span>{connector}</span>
                    <span className="grid items-end">
                        {lines.map((entry, index) => (
                            <span key={index} className={`invisible ${rotatingWordClass}`}>
                                <ReaderWord reader={entry.reader} type={entry.type} />
                            </span>
                        ))}
                        <motion.span key={`reader-${frame.index}`} className={rotatingWordClass} {...motionProps}>
                            <ReaderWord reader={line.reader} type={line.type} animateIcon={!shouldReduceMotion && frame.phase === "hold"} />
                        </motion.span>
                    </span>
                </span>
            </span>
            <span className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[0.25em]" aria-hidden="true">
                <span className="whitespace-nowrap">
                    {prefix} <span className="relative inline-block text-ink-900/75 dark:text-paper-50/75">
                        {strike}
                        <span className="absolute inset-x-0 bg-mark/75 dark:bg-mark-light/75" style={{ bottom: "0.4em", height: "0.14em" }} />
                    </span>
                </span>
                <span className="grid">
                    {lines.map((entry, index) => (
                        <span key={index} className={`invisible ${verbClass}`}>{entry.verb}.</span>
                    ))}
                    <motion.span key={`verb-${frame.index}`} className={verbClass} {...motionProps}>
                        {line.verb}.
                    </motion.span>
                </span>
            </span>
        </h1>
    );
}

/* ------------------------------- Floating header ------------------------------ */
const PORTFOLIO_NAV_ITEMS = [
    { id: "latest", label: "Published" },
    { id: "work", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "clients", label: "Clients" },
    { id: "skills", label: "Skills" },
    { id: "about", label: "About" },
    { id: "community", label: "Community" },
    { id: "writing", label: "Writing" },
    { id: "contact", label: "Contact" },
];

function Header({ theme, setTheme, hasWriting }) {
    const shouldReduceMotion = useReducedMotion();
    const mobileMenu = useRef(null);
    const [activeSection, setActiveSection] = useState(null);
    const closeMobileMenu = () => { mobileMenu.current.open = false; };
    const navItems = PORTFOLIO_NAV_ITEMS.filter(({ id }) => id !== "writing" || hasWriting);

    useEffect(() => {
        const sections = PORTFOLIO_NAV_ITEMS
            .map(({ id }) => document.getElementById(id))
            .filter(Boolean)
            .reverse();
        const lastSection = sections[0];
        if (!lastSection) return;

        let frameId = null;
        const update = () => {
            frameId = null;
            // Allow for small layout shifts while a smooth anchor scroll is in progress.
            const readingLine = parseFloat(getComputedStyle(lastSection).scrollMarginTop) + 24;
            const atBottom = window.scrollY > 0 &&
                window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
            const current = atBottom
                ? lastSection
                : sections.find((section) => section.getBoundingClientRect().top <= readingLine);
            setActiveSection(current?.id ?? null);
        };
        const schedule = () => {
            if (frameId === null) frameId = window.requestAnimationFrame(update);
        };
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(lastSection.closest("main"));
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        schedule();

        return () => {
            if (frameId !== null) window.cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [hasWriting]);

    return (
        <header className="fixed top-0 z-50 w-full px-3 sm:px-5 pt-3">
            <div className="mx-auto max-w-6xl rounded-sm border border-ink-900/15 dark:border-paper-50/15 bg-paper-50/90 dark:bg-ink-900/85 backdrop-blur-xl shadow-[0_2px_0_0_rgba(27,26,23,0.08)]">
                <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-2.5">
                    <DocMarkLink className="inline-flex shrink-0" />
                    <nav aria-label="Portfolio sections" className="hidden lg:flex items-center gap-4 xl:gap-5 font-mono text-[11px] uppercase tracking-widest text-ink-700 dark:text-paper-200">
                        {navItems.map(({ id, label }) => (
                            <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} className="portfolio-nav-link relative py-1 hover:text-mark dark:hover:text-mark-light transition-colors">
                                {label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <StampButton href="#contact" className="!px-4 !py-2 !text-xs hidden sm:inline-flex">
                            <Mail className="h-3.5 w-3.5" /> Let's talk
                        </StampButton>
                        <details
                            ref={mobileMenu}
                            className="relative lg:hidden"
                            onKeyDown={(event) => {
                                if (event.key !== "Escape") return;
                                closeMobileMenu();
                                mobileMenu.current.querySelector("summary").focus();
                            }}
                        >
                            <summary aria-label="Sections" className="list-none cursor-pointer rounded-sm border border-ink-900/15 p-2 dark:border-paper-50/15 [&::-webkit-details-marker]:hidden">
                                <Menu className="h-4 w-4" aria-hidden="true" />
                            </summary>
                            <nav aria-label="Portfolio sections" className="absolute right-0 mt-2 grid max-h-[calc(100dvh-5rem)] w-44 gap-1 overflow-y-auto rounded-sm border border-ink-900/15 bg-paper-50 p-2 shadow-lg dark:border-paper-50/15 dark:bg-ink-900">
                                <DocMarkLink onClick={closeMobileMenu} className="flex items-center gap-2 border-b border-dashed border-ink-900/20 px-2 py-2 text-sm hover:text-mark dark:border-paper-50/20 dark:hover:text-mark-light">
                                    Back to top
                                </DocMarkLink>
                                {navItems.map(({ id, label }) => (
                                    <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} onClick={closeMobileMenu} className="portfolio-nav-link relative px-2 py-2 text-sm hover:text-mark dark:hover:text-mark-light">
                                        {label}
                                    </a>
                                ))}
                            </nav>
                        </details>
                        <motion.button
                            aria-label="Toggle dark mode"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-sm p-2 border border-ink-900/15 dark:border-paper-50/15 hover:border-mark"
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                        >
                            <AnimatePresence mode="wait">
                                {theme === "dark" ? (
                                    <motion.div key="sun" initial={shouldReduceMotion ? {} : { rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={shouldReduceMotion ? {} : { rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
                                        <Sun className="h-4 w-4 text-paper-50" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={shouldReduceMotion ? {} : { rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={shouldReduceMotion ? {} : { rotate: -90, scale: 0 }} transition={{ duration: 0.2 }}>
                                        <Moon className="h-4 w-4 text-ink-900" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
}

/* --------------------------------- Layout ---------------------------------- */
export default function Portfolio() {
    const [verified, setVerified] = useState({ phone: "", email: "" });
    const { theme, setTheme } = useTheme();
    const mediumProfile = contentData.SOCIALS.medium || "https://nijanthanelangovan.medium.com";
    const mediumPosts = useMediumPosts(`${mediumProfile.replace(/\/$/, "")}/feed`, 6);
    const latestPost = mediumPosts[0];

    useLayoutEffect(() => {
        document.documentElement.style.overflowX = "clip";
        document.body.style.overflowX = "clip";
        const setMeta = (name, value) => {
            let el = document.querySelector(`meta[name="${name}"]`);
            if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
            el.setAttribute("content", value);
        };
        setMeta("x-build-version", "v2");
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
    const NOW_V = contentData.NOW;
    const HERO_V = contentData.HERO;
    const UI_V = contentData.UI;

    return (
        <div className="portfolio isolate min-h-screen w-full overflow-x-clip bg-transparent text-ink-900 dark:text-paper-100 antialiased font-sans">
            <ScrollProgress />
            <InteractiveBackground />
            <Header theme={theme} setTheme={setTheme} hasWriting={mediumPosts.length > 0} />

            <main id="top" className="pt-24">
                {/* Hero */}
                <section className="w-full px-4 sm:px-6 pt-20 sm:pt-28 pb-12 sm:pb-16">
                    <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 min-w-0">
                            <HeroHeadline connector={UI_V.hero.connector} prefix={UI_V.hero.prefix} strike={HERO_V.strike} lines={HERO_V.lines} />
                            <p className="mt-4 max-w-xl text-ink-700 dark:text-paper-200 leading-relaxed">{PROFILE_V.summary}</p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <StampButton href="#contact"><Mail className="h-4 w-4" /> Contact me <ArrowRight className="h-4 w-4" /></StampButton>
                                {LINKS_V.resume !== "#" && (
                                    <StampButton href={LINKS_V.resume} variant="outline"><FileDown className="h-4 w-4" /> Resume</StampButton>
                                )}
                                <StampButton href={SOCIALS_V.linkedin} variant="outline"><Linkedin className="h-4 w-4" /> LinkedIn</StampButton>
                                {SOCIALS_V.github && (
                                    <StampButton href={SOCIALS_V.github} variant="outline"><Github className="h-4 w-4" /> GitHub</StampButton>
                                )}
                            </div>
                            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-ink-700 dark:text-paper-300">
                                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {PROFILE_V.location}</span>
                                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> 5+ years</span>
                                <Tag>{PROFILE_V.availability}</Tag>
                                {PROFILE_V.roles.slice(1).map((r) => <Tag key={r}>{r}</Tag>)}
                            </div>
                        </div>

                        <div className="lg:col-span-5 min-w-0">
                            <Card tabLabel="Current Role">
                                <SpinningBadge text={PROFILE_V.badge} />
                                <div className="relative p-6 sm:p-8">
                                    <h3 className="text-xl sm:text-2xl font-display font-semibold text-ink-900 dark:text-paper-50">{NOW_V.title}</h3>
                                    <p className="mt-1 text-ink-700 dark:text-paper-300 italic">{NOW_V.company}</p>
                                    <ul className="mt-4 space-y-2 text-sm text-ink-800 dark:text-paper-200">
                                        {NOW_V.bullets.map((bullet, i) => (
                                            <li key={i} className="flex gap-2"><span className="font-mono text-mark">›</span>{bullet}</li>
                                        ))}
                                    </ul>
                                    <a href={NOW_V.link} className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-mark dark:text-mark-light hover:underline">
                                        See full experience <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </Card>
                            {latestPost && (
                                <Card className="mt-6" tabLabel="Latest Writing">
                                    <a href={latestPost.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-5 sm:p-6">
                                        {latestPost.thumbnail && (
                                            <div className="aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-sm border border-ink-900/15 bg-paper-100 dark:border-paper-50/15 dark:bg-ink-700 sm:w-28">
                                                <img
                                                    src={optimizeImage(latestPost.thumbnail, 224)}
                                                    alt=""
                                                    width="112"
                                                    height="84"
                                                    decoding="async"
                                                    className="h-full w-full object-cover motion-safe:transition motion-safe:group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="font-display font-semibold leading-snug text-ink-900 transition-colors group-hover:text-mark dark:text-paper-50 dark:group-hover:text-mark-light">{latestPost.title}</h3>
                                            <span className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mark dark:text-mark-light">
                                                Read on Medium <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                            </span>
                                        </div>
                                    </a>
                                </Card>
                            )}
                        </div>
                    </div>
                </section>

                {/* Latest */}
                <Section id="latest" eyebrow={UI_V.latest.eyebrow} title={UI_V.latest.title}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                        {LATEST_V.filter((item) => item.featured !== false).map((item) => {
                            const yt = item.kind === "Video" ? getYouTubeId(item.href) : null;
                            return (
                                <Card key={item.href}>
                                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full group">
                                        <div className="relative aspect-video w-full overflow-hidden bg-paper-100 dark:bg-ink-700 border-b border-dashed border-ink-900/20 dark:border-paper-50/15">
                                            {yt ? (
                                                <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt={item.title} loading="lazy" decoding="async" width="480" height="360" className="h-full w-full object-cover motion-safe:transition duration-500 motion-safe:group-hover:scale-105" />
                                            ) : item.thumbnail ? (
                                                <img
                                                    src={optimizeImage(item.thumbnail)}
                                                    srcSet={`${optimizeImage(item.thumbnail, 400)} 400w, ${optimizeImage(item.thumbnail, 800)} 800w, ${optimizeImage(item.thumbnail, 1200)} 1200w`}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    alt={item.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-full w-full object-cover motion-safe:transition duration-500 motion-safe:group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-ink-700/40 dark:text-paper-200/30"><ArrowUpRight className="h-8 w-8" /></div>
                                            )}
                                            {item.kind === "Video" && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-ink-900/20 group-hover:bg-ink-900/10 transition">
                                                    <div className="rounded-sm bg-paper-50/95 p-3 border-2 border-ink-900"><Play className="h-5 w-5 fill-ink-900 text-ink-900 ml-0.5" /></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 font-mono text-[11px] text-ink-700 dark:text-paper-300 uppercase tracking-wider">
                                                    {item.kind === "Video" ? <Video className="h-3 w-3" /> : <Newspaper className="h-3 w-3" />}
                                                    {item.meta}
                                                </div>
                                                <ArrowUpRight className="h-4 w-4 text-ink-700/40 dark:text-paper-200/40 transition group-hover:text-mark" />
                                            </div>
                                            <h3 className="mt-3 text-lg font-display font-semibold leading-tight text-ink-900 dark:text-paper-50 group-hover:text-mark dark:group-hover:text-mark-light transition">{item.title}</h3>
                                        </div>
                                    </a>
                                </Card>
                            );
                        })}
                    </div>
                </Section>

                {/* Work / revision history */}
                <Section id="work" eyebrow={UI_V.work.eyebrow} title={UI_V.work.title}>
                    <div className="relative pl-6 sm:pl-8 border-l border-dashed border-ink-900/25 dark:border-paper-50/20 space-y-6">
                        {EXPERIENCE_V.map((job, i) => (
                            <motion.div
                                key={job.company + job.title}
                                className="relative"
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-15%" }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <span className="absolute -left-[29px] sm:-left-[37px] top-7 h-2.5 w-2.5 rounded-sm bg-mark border border-ink-900 dark:border-paper-50" />
                                <Card>
                                    <div className="p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                                            <h3 className="text-xl font-display font-semibold text-ink-900 dark:text-paper-50">{job.title}</h3>
                                            <div className="font-mono text-xs text-ink-700 dark:text-paper-300">{job.range}</div>
                                        </div>
                                        <div className="mt-1 text-ink-700 dark:text-paper-300 italic">{job.company}</div>
                                        <ul className="mt-4 grid gap-2 text-sm text-ink-800 dark:text-paper-200">
                                            {job.bullets.map((b) => (
                                                <li key={b} className="flex gap-2"><span className="font-mono text-mark shrink-0">›</span><span>{b}</span></li>
                                            ))}
                                        </ul>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                {/* Projects / case files */}
                <Section id="projects" eyebrow={UI_V.projects.eyebrow} title={UI_V.projects.title}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 auto-rows-[minmax(0,1fr)]">
                        {PROJECTS_V.filter((p) => p.featured !== false).map((p, i) => {
                            const isLinked = p.href && p.href !== "#";
                            const ProjectContent = isLinked ? "a" : "div";
                            const link = isLinked ? { href: p.href, target: "_blank", rel: "noopener noreferrer" } : undefined;
                            return (
                                <motion.div
                                    key={p.title}
                                    className="h-full"
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-15%" }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                >
                                    <Card tabLabel={p.category} className="h-full">
                                        <ProjectContent {...link} className="block h-full p-6 sm:p-8 pt-7">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-xl font-display font-semibold text-ink-900 dark:text-paper-50">{p.title}</h3>
                                                {isLinked && <ArrowUpRight className="h-5 w-5 text-ink-700/40 dark:text-paper-200/40 shrink-0" />}
                                            </div>
                                            <p className="mt-3 text-ink-700 dark:text-paper-300 leading-relaxed text-sm">{p.blurb}</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {p.meta.map((m) => <Tag key={m}>{m}</Tag>)}
                                            </div>
                                            {p.thumbnail && (
                                                <img
                                                    src={optimizeImage(p.thumbnail)}
                                                    srcSet={`${optimizeImage(p.thumbnail, 400)} 400w, ${optimizeImage(p.thumbnail, 800)} 800w`}
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    alt={p.title}
                                                    className="mt-4 w-full h-48 object-cover rounded-sm border border-dashed border-ink-900/20 dark:border-paper-50/15"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            )}
                                        </ProjectContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </Section>

                {/* Clients / credits */}
                <Section id="clients" eyebrow={UI_V.clients.eyebrow} title={UI_V.clients.title}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                        {CLIENTS_V.filter((c) => c.featured !== false).map((c) => (
                            <Card key={c.name} className="h-full">
                                <a href={c.href} target="_blank" rel="noopener noreferrer" className="block p-6 h-full group">
                                    <div className="flex items-center justify-between mb-4">
                                        <ClientMark name={c.name} href={c.href} logo={c.logo} />
                                        <ArrowUpRight className="h-4 w-4 text-ink-700/40 dark:text-paper-200/40 group-hover:text-mark" />
                                    </div>
                                    <h3 className="font-display font-semibold text-ink-900 dark:text-paper-50">{c.name}</h3>
                                    <p className="mt-1 text-sm text-ink-700 dark:text-paper-300">{c.blurb}</p>
                                </a>
                            </Card>
                        ))}
                    </div>
                </Section>

                {/* Skills / spec sheet */}
                <Section id="skills" eyebrow={UI_V.skills.eyebrow} title={UI_V.skills.title}>
                    <Card>
                        <motion.div className="divide-y divide-dashed divide-ink-900/15 dark:divide-paper-50/15" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={containerVariants}>
                            {SKILLS_V.map((group) => (
                                <motion.div key={group.category} variants={itemVariants} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                                    <div className="sm:w-48 shrink-0 font-mono text-[11px] uppercase tracking-widest text-mark dark:text-mark-light">{group.category}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map((s) => <Tag key={s}>{s}</Tag>)}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </Card>
                </Section>

                {/* About / appendix */}
                <Section id="about" eyebrow={UI_V.about.eyebrow} title={UI_V.about.title}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                        <Card>
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-700 dark:text-paper-300"><GraduationCap className="h-4 w-4" /> Education</div>
                                <ul className="mt-4 space-y-3 text-sm">
                                    {EDUCATION_V.map((e) => (
                                        <li key={e.school} className="text-ink-800 dark:text-paper-200">
                                            <div className="font-medium font-display">{e.school}</div>
                                            <div className="text-ink-700 dark:text-paper-300">{e.degree}</div>
                                            <div className="font-mono text-xs text-ink-700/60 dark:text-paper-300/60">{e.year}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-700 dark:text-paper-300"><BadgeCheck className="h-4 w-4" /> Certification</div>
                                <ul className="mt-4 space-y-3 text-sm">
                                    {CERTS_V.map((c) => (
                                        <li key={c.name} className="text-ink-800 dark:text-paper-200">
                                            <div className="font-medium font-display">{c.name}</div>
                                            <div className="text-ink-700 dark:text-paper-300">{c.issuer}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-700 dark:text-paper-300"><BookOpen className="h-4 w-4" /> Focus</div>
                                <p className="mt-4 text-sm text-ink-700 dark:text-paper-300 leading-relaxed">
                                    My background in web development and UI design helps me trace where users get stuck and decide whether they need a clearer article, a better screenshot, or a fix in the interface.
                                </p>
                            </div>
                        </Card>
                    </div>
                </Section>

                {/* Community / footnote */}
                <Section id="community" eyebrow={UI_V.community.eyebrow} title={UI_V.community.title}>
                    <Card>
                        <a href={COMMUNITY_V.href} target="_blank" rel="noopener noreferrer" className="block border-l-4 border-mark">
                            <div className="p-6 sm:p-8 flex items-start gap-4">
                                <Heart className="h-5 w-5 text-mark shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-display font-semibold text-ink-900 dark:text-paper-50">{COMMUNITY_V.name}</h3>
                                    <p className="mt-2 text-sm text-ink-700 dark:text-paper-300">{COMMUNITY_V.note}</p>
                                </div>
                            </div>
                        </a>
                    </Card>
                </Section>

                {/* Writing (Medium, fetched live) */}
                {mediumPosts.length > 0 && (
                    <Section id="writing" eyebrow={UI_V.writing.eyebrow} title={UI_V.writing.title}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]">
                            {mediumPosts.map((post) => (
                                <Card key={post.href}>
                                    <a href={post.href} target="_blank" rel="noopener noreferrer" className="block h-full group">
                                        {post.thumbnail && (
                                            <div className="relative aspect-video w-full overflow-hidden bg-paper-100 dark:bg-ink-700 border-b border-dashed border-ink-900/20 dark:border-paper-50/15">
                                                <img src={post.thumbnail} alt={post.title} loading="lazy" decoding="async" className="h-full w-full object-cover motion-safe:transition duration-500 motion-safe:group-hover:scale-105" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 font-mono text-[11px] text-ink-700 dark:text-paper-300 uppercase tracking-wider">
                                                    <Newspaper className="h-3 w-3" /> Medium
                                                </div>
                                                <ArrowUpRight className="h-4 w-4 text-ink-700/40 dark:text-paper-200/40 transition group-hover:text-mark" />
                                            </div>
                                            <h3 className="mt-3 text-lg font-display font-semibold leading-tight text-ink-900 dark:text-paper-50 group-hover:text-mark dark:group-hover:text-mark-light transition">{post.title}</h3>
                                        </div>
                                    </a>
                                </Card>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Contact / open a ticket */}
                <Section id="contact" eyebrow={UI_V.contact.eyebrow} title={UI_V.contact.title}>
                    <Card className="contact-postcard overflow-hidden">
                        <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8">
                            <div className="flex min-w-0 flex-col gap-5">
                                <div aria-hidden="true" className="contact-postcard-stamp self-end text-mark dark:text-mark-light">
                                    <Mail className="size-7" />
                                </div>
                                <div className="border-b border-ink-900/20 pb-3 dark:border-paper-50/20">
                                    <p className="text-sm font-medium text-ink-700 dark:text-paper-300">To</p>
                                    <span aria-live="polite" className="mt-1 inline-block break-all font-display text-lg font-medium text-ink-900 dark:text-paper-50">
                                        {verified.email ? (
                                            <a href={`mailto:${verified.email}`} className="hover:text-mark dark:hover:text-mark-light">{verified.email}</a>
                                        ) : (
                                            "Email available after verification"
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-700 dark:text-paper-300">
                                    <span className="inline-flex items-center gap-2"><Linkedin className="h-4 w-4" /> <a className="hover:underline" target="_blank" rel="noreferrer" href={SOCIALS_V.linkedin}>LinkedIn</a></span>
                                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {PROFILE_V.location}</span>
                                    <span aria-live="polite" className="inline-flex items-center gap-2">
                                        <Phone className="h-4 w-4" aria-hidden="true" />
                                        {verified.phone ? (
                                            <a href={`tel:${verified.phone.replace(/[^+\d]/g, "")}`} className="hover:underline">{verified.phone}</a>
                                        ) : (
                                            "Phone available after verification"
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0 border-t border-dashed border-ink-900/25 pt-6 dark:border-paper-50/20 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                                <ContactForm onVerified={setVerified} />
                            </div>
                        </div>
                    </Card>
                </Section>

                <footer className="w-full relative py-8 border-t border-dashed border-ink-900/20 dark:border-paper-50/15">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ink-700 dark:text-paper-300">
                        <span>&copy; {new Date().getFullYear()} Nijanthan Elangovan{UI_V.footer ? ` · ${UI_V.footer}` : ""}</span>
                        <div className="flex items-center gap-4">
                            <a href={`mailto:${PROFILE_V.email}`} aria-label="Email" className="hover:text-mark dark:hover:text-mark-light transition-colors"><Mail className="h-4 w-4" /></a>
                            {SOCIALS_V.linkedin && <a href={SOCIALS_V.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer" className="hover:text-mark dark:hover:text-mark-light transition-colors"><Linkedin className="h-4 w-4" /></a>}
                            {SOCIALS_V.github && <a href={SOCIALS_V.github} aria-label="GitHub" target="_blank" rel="noreferrer" className="hover:text-mark dark:hover:text-mark-light transition-colors"><Github className="h-4 w-4" /></a>}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
