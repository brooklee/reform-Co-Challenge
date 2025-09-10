"use client";

import { useRef, useEffect, useCallback } from "react";
import styles from "./button.module.css";
import { gsap } from "gsap";


type ButtonProps = {
  label: string;
};

export function Button({ label }: ButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const arrowPathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    gsap.set([buttonRef.current, svgRef.current, arrowPathRef.current], { clearProps: "all" });
  }, []);

  const computeSwap = useCallback(() => {
    const buttonEl = buttonRef.current;
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!buttonEl || !svgEl || !containerEl) return { btnX: 0, svgX: 0 };
    const gap = parseFloat(getComputedStyle(containerEl).gap || "0");
    const btnWidth = buttonEl.getBoundingClientRect().width;
    const svgWidth = svgEl.getBoundingClientRect().width;
    return { btnX: svgWidth + gap, svgX: -(btnWidth + gap) };
  }, []);

  const handleEnter = useCallback(() => {
    const { btnX, svgX } = computeSwap();
    gsap.to(buttonRef.current, { x: btnX, duration: 0.2, ease: "power3.in" });
    gsap.to(svgRef.current, { x: svgX, duration: 0.2, ease: "power3.in" });
  }, [computeSwap]);

  const handleLeave = useCallback(() => {
    gsap.to([buttonRef.current, svgRef.current], { x: 0, duration: 0.2, ease: "power3.in" });
  }, []);

  const handleSVGClick = useCallback(() => {
    const arrow = arrowPathRef.current;
    if (!arrow) return;

    const distance = 300;
    const tl = gsap.timeline();
    tl.to(arrow, { x: distance, duration: 0.25, ease: "power3.in" })
      .to(arrow, { opacity: 0}, "<")
      .set(arrow, { x: -distance })
      .to(arrow, { opacity: 1, duration: 0.05 })
      .to(arrow, { x: 0, duration: 0.25, ease: "power3.out" });
  }, []);

  return (
      <div className={styles.buttonContainer} ref={containerRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={handleSVGClick}>
        <button ref={buttonRef} className={styles.button + " body-s"}>{label}</button>
        <svg ref={svgRef} className={styles.arrow} width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" >
          {/* arrow */}
          <path ref={arrowPathRef} d="M25.2486 32.5L31.4986 26.25M31.4986 26.25L25.2486 20M31.4986 26.25H19"/> 
          {/*  circle */}
          <path d="M11.4227 5.6875C15.5263 2.73737 20.5603 1 26 1C39.8071 1 51 12.1929 51 26C51 39.8071 39.8071 51 26 51C12.1929 51 1 39.8071 1 26C1 23.8419 1.27346 21.7476 1.78761 19.75" />
        </svg>
      </div>
    );
}