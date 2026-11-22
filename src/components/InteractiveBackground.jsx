import { motion as Motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function InteractiveBackground() {
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
        </div>
    );
}
