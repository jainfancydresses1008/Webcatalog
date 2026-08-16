"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Jain Fancy Dresses";
  const tagline =
    process.env.NEXT_PUBLIC_SHOP_TAGLINE ||
    "Fancy dress collection for kids, school events and parties";
  const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE || "919999999999";

  const whatsappMessage = encodeURIComponent(
    "Hello, I want to know more about Jain Fancy Dresses.",
  );
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-pink-100/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-pink-100">
            <Image
              src="/images/logo_r.png"
              alt={`${shopName} logo`}
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-lg font-black tracking-tight text-slate-950 md:text-2xl">
              {shopName}
            </p>
            <p className="hidden truncate text-xs font-semibold text-slate-500 sm:block">
              {tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
          <button
            type="button"
            className="text-pink-600"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("jfd-home"));
            }}
          >
            Home
          </button>{" "}
          <a href="#catalog" className="transition hover:text-pink-600">
            Dresses
          </a>
          <a href="#contact" className="transition hover:text-pink-600">
            Contact Us
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`https://wa.me/${sellerPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex"
          >
            WhatsApp Us
          </a>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Open secure menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
            >
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-pink-100 bg-white p-2 shadow-2xl">
                <div className="px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
                    Secure Options
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Admin console uses email, password and security PIN.
                  </p>
                </div>

                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-pink-50 hover:text-pink-700"
                >
                  Admin Login
                </Link>
                <a
                  href="#catalog"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-pink-50 hover:text-pink-700 md:hidden"
                >
                  View Dresses
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
