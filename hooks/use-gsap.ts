"use client";

import { useRef, useEffect, type RefObject } from "react";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  GSAP fade-in-up on mount                                           */
/* ------------------------------------------------------------------ */
export function useGsapFadeIn<T extends HTMLElement>(
  delay = 0,
  duration = 0.8
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration, delay, ease: "power3.out" }
    );
  }, [delay, duration]);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  GSAP stagger children on mount                                     */
/* ------------------------------------------------------------------ */
export function useGsapStagger<T extends HTMLElement>(
  childSelector = ":scope > *",
  stagger = 0.1,
  duration = 0.6
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const children = ref.current.querySelectorAll(childSelector);
    if (children.length === 0) return;

    gsap.fromTo(
      children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: "power2.out",
      }
    );
  }, [childSelector, stagger, duration]);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  GSAP scale pulse (for anomaly indicators)                          */
/* ------------------------------------------------------------------ */
export function useGsapPulse<T extends HTMLElement>(
  active: boolean
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (active) {
      gsap.to(ref.current, {
        scale: 1.05,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "sine.inOut",
      });
    } else {
      gsap.killTweensOf(ref.current);
      gsap.set(ref.current, { scale: 1 });
    }

    return () => {
      if (ref.current) gsap.killTweensOf(ref.current);
    };
  }, [active]);

  return ref;
}
