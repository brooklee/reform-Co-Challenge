"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Illo } from "../icons/Illo";
import styles from "./marquee.module.css";

export function Marquee() {
    const marqueeRef = useRef<HTMLDivElement | null>(null);
    const track1Ref = useRef<HTMLDivElement | null>(null);
    const track2Ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!marqueeRef.current || !track1Ref.current || !track2Ref.current) return;

        let ctx = gsap.context(() => {
            const speedPxPerSecond = 120; // adjust speed
            let tween: gsap.core.Tween | null = null;

            function setupAndAnimate() {
                const distance = track1Ref.current!.offsetWidth;
                // ensure both tracks are in normal flow, no manual offsets
                gsap.set([track1Ref.current, track2Ref.current], { x: 0 });
                gsap.set(marqueeRef.current, { x: 0 });

                const duration = distance / speedPxPerSecond;

                tween = gsap.to(marqueeRef.current, {
                    x: -distance,
                    duration,
                    ease: "none",
                    repeat: -1,
                    modifiers: {
                        x: gsap.utils.unitize((value: string) => {
                            const n = parseFloat(value);
                            // wrap into [-distance, 0)
                            const mod = n % -distance;
                            return mod;
                        })
                    }
                });
            }

            setupAndAnimate();

            const handleResize = () => {
                tween?.kill();
                setupAndAnimate();
            };

            // also react to width changes of content (fonts/images)
            const ro = new ResizeObserver(handleResize);
            ro.observe(track1Ref.current!);

            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
                ro.disconnect();
                tween?.kill();
            };
        }, marqueeRef);

        return () => ctx.revert();
    }, []);

    const Items = () => (
        <>
            <span>Unpredictable Rate Increases</span>
            <Illo />
            <span>Lack of transparency</span>
            <Illo />
            <span>Implementation Headaches</span>
            <Illo />
            <span>claim denials</span>
            <Illo />
            <span>Frustrated User</span>
            <Illo />
        </>
    );

    return (
        <div className={styles.marqueeWrapper + " title"}>
            <div className={styles.marquee} ref={marqueeRef}>
                <div className={styles.track} ref={track1Ref}>
                    <Items />
                </div>
                <div className={styles.track} ref={track2Ref} aria-hidden="true">
                    <Items />
                </div>
            </div>
        </div>
    );
}