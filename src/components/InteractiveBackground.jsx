import { useEffect, useRef } from "react";
import { motion as Motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";

export default function InteractiveBackground() {
    const spotlight = useRef(null);
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const { scrollY, scrollYProgress } = useScroll();
    const gridY = useTransform(scrollY, (position) => -(position * 0.18) % 40);
    const washY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -180]));

    useEffect(() => {
        const element = spotlight.current;
        const query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
        const hide = () => { delete element.dataset.visible; };
        const move = (event) => {
            if (!query.matches || event.pointerType !== "mouse") return;
            pointerX.set(event.clientX);
            pointerY.set(event.clientY);
            if (!element.dataset.visible) element.dataset.visible = "true";
        };
        const leave = (event) => { if (!event.relatedTarget) hide(); };

        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerout", leave);
        window.addEventListener("blur", hide);
        query.addEventListener("change", hide);
        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerout", leave);
            window.removeEventListener("blur", hide);
            query.removeEventListener("change", hide);
        };
    }, [pointerX, pointerY]);

    return (
        <div className="portfolio-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <Motion.div className="portfolio-scene-wash portfolio-parallax" style={{ y: washY }} />
            <div className="portfolio-scene-grid">
                <Motion.div className="portfolio-scene-lines portfolio-parallax" style={{ y: gridY }}>
                    <div className="portfolio-scene-wave" />
                </Motion.div>
            </div>
            <Motion.div className="portfolio-scene-spotlight" ref={spotlight} style={{ x: pointerX, y: pointerY }} />
        </div>
    );
}
