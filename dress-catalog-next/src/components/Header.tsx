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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo_r.png"
            alt="Shop Logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl object-cover shadow-md"
            priority
          />

          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
              {shopName}
            </h1>

            <p className="hidden text-sm text-slate-500 md:block">
              {tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          <Link href="/" className="hover:text-pink-600">
            Home
          </Link>

          <a href="#catalog" className="hover:text-pink-600">
            Catalog
          </a>

          <a href="#contact" className="hover:text-pink-600">
            Contact
          </a>
        </nav>

        <div className="relative">
          <button
            type="button"
            aria-label="Open more options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <Link
                href="/admin"
                className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Admin Login
              </Link>

              <a
                href="#contact"
                className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Contact Seller
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}