"use client";

import { useState } from "react";

const LINK_COLUMNS = [
  {
    title: "Shop",
    links: ["New In", "Dresses", "Occasion", "Ethnic Wear"],
  },
  {
    title: "Help",
    links: ["Size Guide", "Shipping & Returns", "Track Order"],
  },
  {
    title: "Contact",
    links: ["Email Us", "WhatsApp", "Store Locator"],
  },
];

export function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-espresso pb-10 pt-32">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 select-none text-center font-display text-[22vw] leading-none text-ivory/[0.04]"
      >
        AURELLE
      </span>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="rounded-3xl bg-ivory p-8 shadow-2xl md:p-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr,1fr,1fr,1fr]">
            <div>
              <h3 className="font-display text-2xl leading-snug text-espresso">
                Get 10% off your first dress
              </h3>
              <p className="mt-2 font-body text-[13px] text-espresso/60">
                Early access to new collections, styling notes, trunk shows.
              </p>

              {submitted ? (
                <p className="mt-5 font-body text-[13px] text-gold">
                  You&apos;re on the list — check your inbox.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email) setSubmitted(true);
                  }}
                  className="mt-5 flex items-center gap-2 border-b border-espresso/20 pb-2"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full bg-transparent font-body text-[14px] text-espresso outline-none placeholder:text-espresso/40"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap font-body text-[12px] uppercase tracking-[0.15em] text-gold"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-body text-[12px] uppercase tracking-[0.2em] text-espresso/40">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-body text-[14px] text-espresso/75 transition-colors hover:text-espresso"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 text-ivory/50 md:flex-row">
          <p className="font-body text-[12px]">
            © {new Date().getFullYear()} AURELLE. All rights reserved.
          </p>
          <div className="flex items-center gap-4 font-body text-[12px] uppercase tracking-wide">
            <span>UPI</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Razorpay</span>
            <a href="/admin-login" className="text-ivory/30 transition-colors hover:text-ivory/60">
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
