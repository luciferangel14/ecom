"use client";

import { useEffect } from "react";
import Lenis from "lenis";
<<<<<<< HEAD
import { gsap } from "gsap";
=======
import gsap from "gsap";
>>>>>>> 7de87f5 (Ecom project with Supabase admin login)
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

<<<<<<< HEAD
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1,
      easing: easeOutExpo,
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.4,
=======
export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
>>>>>>> 7de87f5 (Ecom project with Supabase admin login)
    });

    lenis.on("scroll", ScrollTrigger.update);

<<<<<<< HEAD
    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return children;
=======
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
>>>>>>> 7de87f5 (Ecom project with Supabase admin login)
}
