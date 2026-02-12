"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function FlyingMascot() {
    const { scrollY } = useScroll();
    const [isClient, setIsClient] = useState(false);
    const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);

    // Smooth spring animation for scroll-based movement (Parallax) when NOT pointing
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
    const yScroll = useSpring(useTransform(scrollY, [0, 1000], [0, -50]), springConfig);

    useEffect(() => {
        setIsClient(true);

        const handleScroll = () => {
            const button = document.getElementById("cta-button");

            if (button) {
                const rect = button.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const mascotSize = window.innerWidth >= 768 ? 160 : 112; // md:w-40 vs w-28

                    let targetX, targetY;

                    if (window.innerWidth >= 768) {
                        // Desktop: Right side of button + padding
                        targetX = rect.right + 20;
                        // Center vertically relative to button
                        targetY = rect.top + (rect.height / 2) - (mascotSize / 2);
                    } else {
                        // Mobile: Position slightly overlapping the bottom-right of the button
                        // ensuring it doesn't go off-screen
                        targetX = Math.min(rect.right - 20, window.innerWidth - mascotSize - 10);

                        // Position slightly below the center to "peek"
                        targetY = rect.top + (rect.height / 2) - (mascotSize / 3);
                    }

                    setTargetPos({ x: targetX, y: targetY });
                } else {
                    setTargetPos(null);
                }
            } else {
                setTargetPos(null);
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);
        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    if (!isClient) return null;

    return (
        <motion.div
            className="fixed z-[9999] pointer-events-none w-28 h-28 md:w-40 md:h-40"
            // Use `animate` to control position. 
            // When targetPos is null, we want it at bottom-10 right-10.
            // When targetPos is set, we use those exact coordinates.
            initial={{ bottom: 40, right: 40, x: 0, y: 0, opacity: 0 }}
            animate={
                targetPos
                    ? {
                        left: targetPos.x,
                        top: targetPos.y,
                        right: "auto",
                        bottom: "auto",
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotate: -10, // Tilt towards button
                        filter: "drop-shadow(0px 0px 20px rgba(255, 255, 255, 0.9))" // Strong white glow on blue bg
                    }
                    : {
                        left: "auto",
                        top: "auto",
                        right: 40,
                        bottom: 40,
                        x: 0,
                        y: yScroll.get(), // Use scroll parallax when floating
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                        filter: "drop-shadow(0px 0px 10px rgba(59, 130, 246, 0.5))" // Subtle blue glow on white bg
                    }
            }
            transition={{
                type: "spring",
                stiffness: 100, // Softer spring for movement
                damping: 20,
            }}
        >
            <AnimatePresence>
                {targetPos && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 10, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.1 } }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute -top-16 -left-10 md:-left-24 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-blue-100 whitespace-nowrap z-10"
                    >
                        <p className="text-sm md:text-base font-bold text-[#005AE1]">Let's try it now!</p>
                        {/* Tail */}
                        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-r border-b border-blue-100/50"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="w-full h-full"
            >
                <Image
                    src={targetPos ? "/flying mascot2.png" : "/flying mascott.png"}
                    alt="Flying Mascot"
                    width={200}
                    height={200}
                    className="w-full h-full object-contain drop-shadow-2xl"
                />
            </motion.div>
        </motion.div>
    );
}
