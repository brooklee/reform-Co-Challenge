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
  const GAP_PX = 16; // keep in sync with CSS `.track { gap: 16px }`

  const imagesExtended = image.length > 1 ? [image[image.length - 1], ...image, image[0]] : image;

  useLayoutEffect(() => {
    if (!containerRef.current || !trackRef.current || imagesExtended.length === 0) return;

    const ctx = gsap.context(() => {
      const measureStep = () => {
        const firstSlide = trackRef.current?.querySelector(`.${styles.slideWrapper}`) as HTMLDivElement | null;
        if (firstSlide) {
          stepRef.current = firstSlide.offsetWidth + GAP_PX;
        }
      };

      measureStep();

      let resizeObserver: ResizeObserver | undefined;
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          measureStep();
          gsap.set(trackRef.current, { x: -stepRef.current * currentIndexRef.current });
        });
        resizeObserver.observe(containerRef.current);
      }

      currentIndexRef.current = imagesExtended.length > 1 ? 1 : 0;
      gsap.set(trackRef.current, { x: -stepRef.current * currentIndexRef.current });

      let tween: gsap.core.Tween | null = null;
      let delayed: gsap.core.Tween | null = null;

      const goNext = () => {
        if (!trackRef.current) return;
        const nextIndex = currentIndexRef.current + 1;
        tween = gsap.to(trackRef.current, {
          x: -stepRef.current * nextIndex,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            currentIndexRef.current = nextIndex;
            // if at last clone, jump back to the first real slide
            if (currentIndexRef.current === imagesExtended.length - 1) {
              currentIndexRef.current = 1;
              gsap.set(trackRef.current, { x: -stepRef.current * currentIndexRef.current });
            }
            delayed = gsap.delayedCall(1.8, goNext);
          },
        });
      };

      if (imagesExtended.length > 1) {
        delayed = gsap.delayedCall(1.8, goNext);
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