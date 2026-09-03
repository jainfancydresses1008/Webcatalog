"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
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
    <header className="sticky top-0 z-50 border-b border-pink-100/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <button
          type="button"
          className="group flex min-w-0 items-center gap-3 rounded-2xl px-1.5 py-1 text-left transition hover:bg-pink-50/60"
          onClick={() => {
            if (window.location.pathname === "/") {
              window.dispatchEvent(new CustomEvent("jfd-home"));
            } else {
              router.push("/");
            }
          }}
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-pink-100 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-xl">
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
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-100 bg-slate-50/80 p-1 text-sm font-bold text-slate-600 shadow-sm md:flex">
          <button
            type="button"
            className="rounded-full bg-white px-4 py-2 text-pink-600 shadow-sm"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.dispatchEvent(new CustomEvent("jfd-home"));
              } else {
                router.push("/");
              }
            }}
          >
            Home
          </button>

          <button
            type="button"
            className="rounded-full px-4 py-2 transition hover:bg-white hover:text-pink-600 hover:shadow-sm"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.dispatchEvent(new CustomEvent("jfd-dresses"));
              } else {
                router.push("/#catalog");
              }
            }}
          >
            Dresses
          </button>

          <button
            type="button"
            className="rounded-full px-4 py-2 transition hover:bg-white hover:text-pink-600 hover:shadow-sm"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.dispatchEvent(new CustomEvent("jfd-contact"));
              } else {
                router.push("/#contact");
              }
            }}
          >
            Contact Us
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* SEARCH LENS */}
          <button
            type="button"
            aria-label="Search by image"
            title="Search by image"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-200 bg-pink-50 text-pink-600 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:bg-pink-100 hover:text-pink-700 hover:shadow-md"
            onClick={() => {
              // Image search will be added later.
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 3H5a2 2 0 0 0-2 2v4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 3h4a2 2 0 0 1 2 2v4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 15v4a2 2 0 0 1-2 2h-4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 21H5a2 2 0 0 1-2-2v-4"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <a
            href={`https://wa.me/${sellerPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with us on WhatsApp"
            title="Chat with us on WhatsApp"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-md sm:inline-flex"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 11.5a8.5 8.5 0 0 1-12.75 7.36L4 20l1.14-3.03A8.5 8.5 0 1 1 20 11.5Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.6 8.7c.2-.45.42-.46.78-.47h.48c.2 0 .39.07.49.3l.66 1.55c.1.22.08.4-.08.58l-.5.58c-.13.14-.16.3-.07.47.3.58 1.12 1.55 2.2 2.12.18.1.33.08.46-.07l.55-.65c.15-.18.34-.22.56-.12l1.49.7c.23.1.3.3.27.53-.1.72-.67 1.28-1.36 1.47-.47.13-1.1.08-1.92-.23-1.07-.4-2.35-1.25-3.6-2.5-1.25-1.25-2.1-2.53-2.5-3.6-.3-.82-.36-1.45-.23-1.92.11-.41.33-.66.51-.69Z"
              />
            </svg>
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

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.location.pathname === "/") {
                      window.dispatchEvent(new CustomEvent("jfd-dresses"));
                    } else {
                      router.push("/#catalog");
                    }
                  }}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-slate-800 transition hover:bg-pink-50 hover:text-pink-700 md:hidden"
                >
                  View Dresses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
