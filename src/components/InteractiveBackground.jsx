import { useEffect, useRef } from "react";
import { motion as Motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";

const INK_LIFETIME = 3000;
const INK_MAX_GAP = 80;
const INK_FALLBACK = "#146363";

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, summary, [role='button']";

/* A thick teal brush stroke you can leave on the page background by clicking and
   dragging; it fades away after a few seconds, like doodling in the margin. Decorative
   only: fixed behind every section (-z-10), pointer-events disabled, skipped for
   touch/reduced motion, and only active while the pointer is held down. It's an easter
   egg: `enabled` only goes true after the header logo is clicked three times. */
function CursorInk({ enabled }) {
    const canvasRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!enabled || shouldReduceMotion || typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        let points = [];
        let raf;
        let isDrawing = false;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        const onDown = (event) => {
            isDrawing = true;
            // Dragging to draw would otherwise start a native text selection; suppress
            // it, but leave real controls (links, buttons, form fields) working normally.
            if (!event.target.closest(INTERACTIVE_SELECTOR)) {
                event.preventDefault();
                document.body.style.userSelect = "none";
            }
        };
        const stopDrawing = () => {
            isDrawing = false;
            document.body.style.userSelect = "";
        };
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", stopDrawing);
        window.addEventListener("pointercancel", stopDrawing);
        window.addEventListener("blur", stopDrawing);

        const onMove = (event) => {
            if (!isDrawing) return;
            points.push({ x: event.clientX, y: event.clientY, t: performance.now() });
        };
        window.addEventListener("pointermove", onMove);

        const draw = () => {
            const now = performance.now();
            points = points.filter((p) => now - p.t < INK_LIFETIME);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const portfolioEl = document.querySelector(".portfolio");
            const accent = (portfolioEl && getComputedStyle(portfolioEl).getPropertyValue("--portfolio-accent").trim()) || INK_FALLBACK;

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 7;
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                if (curr.t - prev.t > INK_MAX_GAP) continue;
                const age = now - curr.t;
                const alpha = Math.max(0, 1 - age / INK_LIFETIME) * 0.4;
                if (alpha <= 0) continue;
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = accent;
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            document.body.style.userSelect = "";
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", stopDrawing);
            window.removeEventListener("pointercancel", stopDrawing);
            window.removeEventListener("blur", stopDrawing);
            window.removeEventListener("pointermove", onMove);
        };
    }, [enabled, shouldReduceMotion]);

    return <canvas ref={canvasRef} className="fixed inset-0" />;
}

export default function InteractiveBackground({ inkEnabled = false }) {
    const { scrollY, scrollYProgress } = useScroll();
    const gridY = useTransform(scrollY, (position) => -(position * 0.18) % 40);
    const washY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -180]));

    return (
        <div className="portfolio-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <Motion.div className="portfolio-scene-wash portfolio-parallax" style={{ y: washY }} />
            <div className="portfolio-scene-grid">
                <Motion.div className="portfolio-scene-lines portfolio-parallax" style={{ y: gridY }}>
                    <div className="portfolio-scene-wave" />
                </Motion.div>
            </div>
            <CursorInk enabled={inkEnabled} />
        </div>
    );
}
