"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TiltCard from "./TiltCard";

gsap.registerPlugin(ScrollTrigger);

const newArrivals = {
  key: "new-arrivals",
  label: "New Arrivals",
  sub: "Shop the Latest Styles",
  image: "/others/look(1).jpg",
  focus: "center 2%",
};

const outerwear = {
  key: "outerwear",
  label: "Premium",
  sub: "Silk & Mixed fabric",
  image: "/offer/look(5).jpg",
  focus: "center 2%",
};

const activewear = {
  key: "activewear",
  label: "Luxury",
  sub: "For Your Workout & Lifestyle",
  image: "/others/look(3).jpg",
  focus: "center 15%",
};

const clearance = {
  key: "clearance",
  label: "Clearance Sale",
  sub: "Up to 50% Off",
  image: "/others/look(4).jpg",
  focus: "center 15%",
};

function CategoryCard({ item, className }) {
  return (
    <div className={`cat-reveal ${className}`}>
      <TiltCard tiltAmount={4} className="group relative overflow-hidden rounded-2xl bg-[#EDECE8] h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          style={{ objectPosition: item.focus }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-6">
          <p className="text-lg font-semibold text-white md:text-xl">{item.label}</p>
          <p className="mt-1 text-sm text-white/75">{item.sub}</p>
          <button
            type="button"
            className="mt-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition-transform hover:scale-105"
          >
            View Collections
          </button>
        </div>
      </TiltCard>
    </div>
  );
}

export default function CategoryGrid() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".cat-reveal").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, rotateX: -40, transformPerspective: 1000 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            delay: i * 0.06,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-white px-6 pt-12 pb-24 md:px-14 md:pt-16 md:pb-32">
      <h2 className="cat-reveal mb-10 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
        Our Categories
      </h2>

      <div className="grid grid-cols-1 gap-4 md:h-[640px] md:grid-cols-2">
        <CategoryCard item={newArrivals} className="h-[360px] md:h-full" />

        <div className="grid grid-rows-2 gap-4">
          <CategoryCard item={outerwear} className="h-[240px] md:h-full" />
          <div className="grid grid-cols-2 gap-4">
            <CategoryCard item={activewear} className="h-[240px] md:h-full" />
            <CategoryCard item={clearance} className="h-[240px] md:h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
