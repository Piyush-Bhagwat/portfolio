import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

export default function Reveal({
    children,
    display = "block",
    width = "fit-content",
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const fadeControl = useAnimation();

    useEffect(() => {
        if (isInView) {
            fadeControl.start("visible");
        } else {
            fadeControl.start("hidden");
        }
    }, [isInView]);

    return (
        <div
            ref={ref}
            style={{ position: "relative", display, width, overflow: "hidden" }}
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 70 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={fadeControl}
                transition={{
                    duration: 0.5,
                    delay: 0.25,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
