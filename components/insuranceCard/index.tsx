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
  const isVerticalRef = useRef<boolean>(false);
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
        const mq = window.matchMedia("(min-width: 501px) and (max-width: 1024px)");
        isVerticalRef.current = mq.matches;

        const firstSlide = trackRef.current?.querySelector(`.${styles.slideWrapper}`) as HTMLDivElement | null;
        if (firstSlide && containerRef.current) {
          const style = getComputedStyle(containerRef.current);

          if (isVerticalRef.current) {
            const slideHeight = firstSlide.offsetHeight;
            const paddingTop = parseFloat(style.paddingTop || "0");
            const paddingBottom = parseFloat(style.paddingBottom || "0");
            const contentHeight = containerRef.current.clientHeight - paddingTop - paddingBottom;
            centerOffsetRef.current = (contentHeight - slideHeight) / 2;
            stepRef.current = slideHeight + GAP_PX;
          } else {
            const slideWidth = firstSlide.offsetWidth;
            const paddingLeft = parseFloat(style.paddingLeft || "0");
            const paddingRight = parseFloat(style.paddingRight || "0");
            const contentWidth = containerRef.current.clientWidth - paddingLeft - paddingRight;
            centerOffsetRef.current = (contentWidth - slideWidth) / 2;
            stepRef.current = slideWidth + GAP_PX;
          }
        }
      };

      const setPosition = (index: number) => {
        if (!trackRef.current) return;
        const value = centerOffsetRef.current - stepRef.current * index;
        if (isVerticalRef.current) {
          gsap.set(trackRef.current, { y: value, x: 0 });
        } else {
          gsap.set(trackRef.current, { x: value, y: 0 });
        }
      };

      measure();

      let resizeObserver: ResizeObserver | undefined;
      const mq = window.matchMedia("(min-width: 501px) and (max-width: 1024px)");
      const onMediaChange = () => {
        measure();
        setPosition(currentIndexRef.current);
        pulseActive();
      };
      mq.addEventListener?.("change", onMediaChange);
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          measure();
          setPosition(currentIndexRef.current);
          pulseActive();
        });
        resizeObserver.observe(containerRef.current);
      }

      currentIndexRef.current = imagesExtended.length > 1 ? 1 : 0;
      setPosition(currentIndexRef.current);
      pulseActive();

      let tween: gsap.core.Tween | null = null;
      let delayed: gsap.core.Tween | null = null;

      const goNext = () => {
        if (!trackRef.current) return;
        const nextIndex = currentIndexRef.current + 1;
        const toValue = centerOffsetRef.current - stepRef.current * nextIndex;
        const vars = isVerticalRef.current
          ? { y: toValue, x: 0 }
          : { x: toValue, y: 0 };
        tween = gsap.to(trackRef.current, {
          ...vars,
          duration: SLIDE_DURATION,
          ease: "power2.inOut",
          onComplete: () => {
            currentIndexRef.current = nextIndex;
            // if at last clone, jump back to the first real slide
            if (currentIndexRef.current === imagesExtended.length - 1) {
              currentIndexRef.current = 1;
              setPosition(currentIndexRef.current);
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
        mq.removeEventListener?.("change", onMediaChange);
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