import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function InteractiveBackground() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll();
    const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]), {
        stiffness: 100,
        damping: 30,
    });

    return (
        <div
            ref={ref}
            className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
            aria-hidden="true"
        >
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black transition-colors duration-700" />

            {/* Floating Orbs */}
            <motion.div
                style={{ y }}
                className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-400/30 dark:bg-purple-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"
            />
            <motion.div
                style={{ y }}
                className="absolute top-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-400/30 dark:bg-cyan-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"
            />
            <motion.div
                style={{ y }}
                className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] bg-emerald-400/30 dark:bg-emerald-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"
            />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
    );
}
