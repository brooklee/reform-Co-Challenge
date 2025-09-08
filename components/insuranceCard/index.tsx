"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./insuranceCard.module.css";

type InsuranceCardProps = {
  image: Array<string>;
};

export function InsuranceCard({ image }: InsuranceCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef<number>(1);
  const stepRef = useRef<number>(0);
  const centerOffsetRef = useRef<number>(0);
  const GAP_PX = 55; // keep in sync with CSS `.track { gap: 16px }`
  // Timing controls
  const SLIDE_DURATION = 1.5; // seconds for slide movement
  const PULSE_HALF_DURATION = 1; // seconds for scale up and down
  const PULSE_HOLD_AT_TOP = 0.8; // hold at max scale before shrinking
  const HOLD_AFTER_PULSE = 0.8; // extra hold before moving again
  const PAUSE_BETWEEN = PULSE_HALF_DURATION * 2 + PULSE_HOLD_AT_TOP + HOLD_AFTER_PULSE; // total pause while centered

  const imagesExtended = image.length > 1 ? [image[image.length - 1], ...image, image[0]] : image;

  useLayoutEffect(() => {
    if (!containerRef.current || !trackRef.current || imagesExtended.length === 0) return;

    const ctx = gsap.context(() => {
      const getWrappers = () => {
        return Array.from(
          trackRef.current?.querySelectorAll(`.${styles.slideWrapper}`) || []
        ) as HTMLDivElement[];
      };

      const pulseActive = () => {
        const wrappers = getWrappers();
        wrappers.forEach((w) => gsap.set(w, { scale: 1 }));
        const active = wrappers[currentIndexRef.current];
        if (active) {
          const tl = gsap.timeline();
          tl.to(active, { scale: 1.14, duration: PULSE_HALF_DURATION, ease: "power1.inOut", zIndex: 100 }) // scale up 
            .to(active, { scale: 1.14, duration: PULSE_HOLD_AT_TOP, ease: "none", zIndex: 100 }) // hold at max scale
            .to(active, { scale: 1, duration: PULSE_HALF_DURATION, ease: "power1.inOut", zIndex: 'auto' }); // scale down
        }
      };
      // calculate the center offset and step
      const measure = () => {
        const firstSlide = trackRef.current?.querySelector(`.${styles.slideWrapper}`) as HTMLDivElement | null;
        if (firstSlide && containerRef.current) {
          const slideWidth = firstSlide.offsetWidth;
          const style = getComputedStyle(containerRef.current);
          const paddingLeft = parseFloat(style.paddingLeft || "0");
          const paddingRight = parseFloat(style.paddingRight || "0");
          const contentWidth = containerRef.current.clientWidth - paddingLeft - paddingRight;
          centerOffsetRef.current = (contentWidth - slideWidth) / 2;
          stepRef.current = slideWidth + GAP_PX;
        }
      };

      measure();

      let resizeObserver: ResizeObserver | undefined;
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          measure();
          gsap.set(trackRef.current, { x: centerOffsetRef.current - stepRef.current * currentIndexRef.current });
          pulseActive();
        });
        resizeObserver.observe(containerRef.current);
      }

      currentIndexRef.current = imagesExtended.length > 1 ? 1 : 0;
      gsap.set(trackRef.current, { x: centerOffsetRef.current - stepRef.current * currentIndexRef.current });
      pulseActive();

      let tween: gsap.core.Tween | null = null;
      let delayed: gsap.core.Tween | null = null;

      const goNext = () => {
        if (!trackRef.current) return;
        const nextIndex = currentIndexRef.current + 1;
        tween = gsap.to(trackRef.current, {
          x: centerOffsetRef.current - stepRef.current * nextIndex,
          duration: SLIDE_DURATION,
          ease: "power2.inOut",
          onComplete: () => {
            currentIndexRef.current = nextIndex;
            // if at last clone, jump back to the first real slide
            if (currentIndexRef.current === imagesExtended.length - 1) {
              currentIndexRef.current = 1;
              gsap.set(trackRef.current, { x: centerOffsetRef.current - stepRef.current * currentIndexRef.current });
            }
            pulseActive();
            delayed = gsap.delayedCall(PAUSE_BETWEEN, goNext);
          },
        });
      };

      if (imagesExtended.length > 1) {
        delayed = gsap.delayedCall(PAUSE_BETWEEN, goNext);
      }

      return () => {
        tween?.kill();
        delayed?.kill();
        resizeObserver?.disconnect();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [imagesExtended.length]);

  return (
    <div className={styles.carousel} ref={containerRef}>
      <div className={styles.track} ref={trackRef}>
        {imagesExtended.map((img, idx) => (
          <div className={styles.slideWrapper} key={`${img}-${idx}`}>
            <img className={styles.slide} src={img} alt="Insurance Card" />
          </div>
        ))}
      </div>
    </div>
  );
}