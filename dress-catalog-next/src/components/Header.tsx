'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const shopName =
    process.env.NEXT_PUBLIC_SHOP_NAME || 'Jain Fancy Dresses';

  const tagline =
    process.env.NEXT_PUBLIC_SHOP_TAGLINE ||
    'Fancy dress collection for kids, school events and parties';

  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto px-3 py-3 md:px-6">
        {/* Single, polished primary ribbon/header */}
        <div className="relative overflow-visible rounded-[22px] border border-pink-100 bg-white px-4 py-3 shadow-[0_8px_28px_rgba(236,72,153,0.10)] md:px-6">
          {/* Small decorative accents */}
          <span className="pointer-events-none absolute -left-1 top-5 text-pink-300">
            ✦
          </span>
          <span className="pointer-events-none absolute right-20 -top-2 text-fuchsia-300">
            ✦
          </span>

          <div className="flex min-h-[62px] items-center gap-3">
            {/* Brand */}
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-pink-100 md:h-14 md:w-14">
                <Image
                  src="/images/logo_r.png"
                  alt="Shop Logo"
                  fill
                  sizes="56px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-black tracking-tight text-slate-950 transition-colors group-hover:text-pink-600 md:text-2xl">
                  {shopName}
                </h1>
                <p className="hidden text-sm font-medium text-slate-500 md:block">
                  {tagline}
                </p>
              </div>
            </Link>

            {/* Main navigation */}
            <nav className="ml-auto hidden items-center gap-1 text-sm font-semibold md:flex">
              <Link
                href="/"
                className="rounded-full bg-pink-50 px-4 py-2.5 font-black text-pink-600"
              >
                Home
              </Link>

              <a
                href="#catalog"
                className="rounded-full px-4 py-2.5 text-slate-700 transition hover:bg-pink-50 hover:text-pink-600"
              >
                Catalog
              </a>

              <a
                href="#contact"
                className="rounded-full px-4 py-2.5 text-slate-700 transition hover:bg-pink-50 hover:text-pink-600"
              >
                Contact
              </a>
            </nav>

            {/* Admin functionality bubble remains in this same header */}
            <div className="relative ml-1 shrink-0">
              <button
                type="button"
                aria-label="Open more options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
              >
                <span className="flex flex-col items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span className="h-1 w-1 rounded-full bg-current" />
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-48 overflow-hidden rounded-2xl border border-pink-100 bg-white p-1 shadow-xl">
                  <Link
                    href="/admin"
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Login
                  </Link>

                  <a
                    href="#contact"
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact Seller
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMPORTANT:
          The marquee is intentionally NOT removed here.
          Keep your existing marquee/hero immediately below this Header.
          This patch only removes the duplicate navigation ribbon and
          decorates the primary header. */}
    </header>
  );
}
