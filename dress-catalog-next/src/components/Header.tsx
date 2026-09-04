"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type SearchSuggestion = {
  type: "character" | "category" | "subcategory";
  value: string;
  category?: string;
  subcategory?: string | null;
};

function cleanFilterValue(value?: string | null) {
  if (!value || value.trim() === "") return "All";
  return value;
}

function dedupeSuggestions(items: SearchSuggestion[]) {
  return Array.from(
    new Map(
      items.map((item) => [
        `${item.type}-${item.value.trim().toLowerCase()}`,
        item,
      ]),
    ).values(),
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Jain Fancy Dresses";
  const tagline =
    process.env.NEXT_PUBLIC_SHOP_TAGLINE ||
    "Fancy dress collection for kids, school events and parties";
  const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE || "919999999999";
  const whatsappMessage = encodeURIComponent(
    "Hello, I want to know more about Jain Fancy Dresses.",
  );

  useEffect(() => {
    const currentSearch = new URLSearchParams(window.location.search).get("search") || "";
    setSearchText(currentSearch);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }

      const outsideDesktopSearch = !searchRef.current || !searchRef.current.contains(target);
      const outsideMobileSearch = !mobileSearchRef.current || !mobileSearchRef.current.contains(target);
      if (outsideDesktopSearch && outsideMobileSearch) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return (
    <header className="sticky top-0 z-50 border-b border-pink-100/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-3 md:px-8 md:py-3.5">
        {/* TOP ROW */}
        <div className="relative flex items-center justify-between gap-2 md:gap-4">
          <button
            type="button"
            className="group flex min-w-0 items-center gap-2 rounded-2xl px-1.5 py-1 text-left transition hover:bg-pink-50/60 md:gap-3"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.dispatchEvent(new CustomEvent("jfd-home"));
              } else {
                router.push("/");
              }
            }}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-pink-100 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-xl md:h-14 md:w-14">
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
              <p className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg md:text-2xl">
                {shopName}
              </p>
              <p className="hidden truncate text-xs font-semibold text-slate-500 sm:block">
                {tagline}
              </p>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-slate-100 bg-slate-50/80 p-1 text-sm font-bold text-slate-600 shadow-sm md:flex">
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

          {/* ACTIONS */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
            {/* MOBILE SEARCH ICON */}
            <button
              type="button"
              aria-label="Search Dresses"
              aria-expanded={mobileSearchOpen}
              onClick={() => {
                const next = !mobileSearchOpen;
                setMobileSearchOpen(next);
                setIsSearchFocused(next);
                if (next) {
                  window.setTimeout(() => {
                    document.getElementById("mobile-dress-search")?.focus();
                  }, 50);
                }
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-white text-pink-500 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 0 0-2 2v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2h-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2v-4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            {/* DESKTOP SEARCH */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <div className="relative flex h-11 w-[210px] items-center rounded-full border border-pink-100 bg-white shadow-sm transition focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-100 md:w-[270px]">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-3 h-5 w-5 shrink-0 text-pink-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 0 0-2 2v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2h-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2v-4" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <input
                  id="header-dress-search"
                  value={searchText}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearchSubmit();
                    }
                    if (event.key === "Escape") {
                      setIsSearchFocused(false);
                      setSearchText("");
                      setSuggestions([]);
                    }
                  }}
                  autoComplete="off"
                  placeholder="Search Dresses..."
                  aria-label="Search Dresses"
                  className="min-w-0 flex-1 bg-transparent px-2.5 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
                {searchText.trim() && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    title="Clear search"
                    onClick={() => {
                      setSearchText("");
                      setSuggestions([]);
                      setIsSearchFocused(false);
                    }}
                    className="mr-2 rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              {showSuggestions && (
                <div className="absolute right-0 top-full z-[70] mt-2 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  {suggestionsLoading ? (
                    <div className="px-4 py-4 text-sm text-slate-500">Looking for matches...</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto py-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.value}-${suggestion.category ?? ""}-${suggestion.subcategory ?? ""}-${index}`}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-pink-50"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm">
                            {suggestion.type === "character" ? "👗" : suggestion.type === "category" ? "▦" : "✦"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-slate-800">{suggestion.value}</span>
                            <span className="block truncate text-xs text-slate-400">
                              {suggestion.type === "character"
                                ? [suggestion.category, suggestion.subcategory].filter(Boolean).join(" • ") || "Character"
                                : suggestion.type === "category"
                                  ? "Category"
                                  : `Subcategory${suggestion.category ? ` • ${suggestion.category}` : ""}`}
                            </span>
                          </span>
                          <span className="text-slate-300">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WHATSAPP */}
            <a
              href={`https://wa.me/${sellerPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with us on WhatsApp"
              title="Chat with us on WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 11.5a8.5 8.5 0 0 1-12.75 7.36L4 20l1.14-3.03A8.5 8.5 0 1 1 20 11.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.6 8.7c.2-.45.42-.46.78-.47h.48c.2 0 .39.07.49.3l.66 1.55c.1.22.08.4-.08.58l-.5.58c-.13.14-.16.3-.07.47.3.58 1.12 1.55 2.2 2.12.18.1.33.08.46-.07l.55-.65c.15-.18.34-.22.56-.12l1.49.7c.23.1.3.3.27.53-.1.72-.67 1.28-1.36 1.47-.47.13-1.1.08-1.92-.23-1.07-.4-2.35-1.25-3.6-2.5-1.25-1.25-2.1-2.53-2.5-3.6-.3-.82-.36-1.45-.23-1.92.11-.41.33-.66.51-.69Z" />
              </svg>
            </a>

            {/* MENU */}
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
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">Secure Options</p>
                    <p className="mt-1 text-xs text-slate-500">Admin console uses email, password and security PIN.</p>
                  </div>
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-pink-50 hover:text-pink-700">Admin Login</Link>
                  <Link href="/privacy-policy" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-pink-50 hover:text-pink-700">Privacy Policy</Link>
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

        {/* MOBILE SEARCH — opens directly below the top row, never at the left edge */}
        {mobileSearchOpen && (
          <div ref={mobileSearchRef} className="relative mt-3 sm:hidden">
            <div className="relative flex h-12 w-full items-center rounded-2xl border border-pink-200 bg-white shadow-sm ring-2 ring-pink-50">
              <svg viewBox="0 0 24 24" className="ml-3 h-5 w-5 shrink-0 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 0 0-2 2v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2h-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2v-4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <input
                id="mobile-dress-search"
                autoFocus
                value={searchText}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(event) => handleSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearchSubmit();
                  }
                  if (event.key === "Escape") {
                    setMobileSearchOpen(false);
                    setIsSearchFocused(false);
                    setSearchText("");
                    setSuggestions([]);
                  }
                }}
                autoComplete="off"
                placeholder="Search Dresses..."
                aria-label="Search Dresses"
                className="min-w-0 flex-1 bg-transparent px-2.5 text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchText.trim() && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchText("");
                    setSuggestions([]);
                    document.getElementById("mobile-dress-search")?.focus();
                  }}
                  className="mr-2 rounded-full px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-100"
                >Clear</button>
              )}
            </div>

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {suggestionsLoading ? (
                  <div className="px-4 py-4 text-sm text-slate-500">Looking for matches...</div>
                ) : (
                  <div className="max-h-72 overflow-y-auto py-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.value}-${index}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-pink-50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm">
                          {suggestion.type === "character" ? "👗" : suggestion.type === "category" ? "▦" : "✦"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800">{suggestion.value}</span>
                          <span className="block truncate text-xs text-slate-400">
                            {suggestion.type === "character"
                              ? [suggestion.category, suggestion.subcategory].filter(Boolean).join(" • ") || "Character"
                              : suggestion.type === "category"
                                ? "Category"
                                : `Subcategory${suggestion.category ? ` • ${suggestion.category}` : ""}`}
                          </span>
                        </span>
                        <span className="text-slate-300">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MOBILE NAVIGATION — always visible in portrait */}
        <nav className="mt-3 flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/80 p-1 text-sm font-bold text-slate-600 shadow-sm md:hidden">
          <button
            type="button"
            className="shrink-0 rounded-xl bg-white px-4 py-2 text-pink-600 shadow-sm"
            onClick={() => {
              if (window.location.pathname === "/") window.dispatchEvent(new CustomEvent("jfd-home"));
              else router.push("/");
            }}
          >Home</button>
          <button
            type="button"
            className="shrink-0 rounded-xl px-4 py-2 transition hover:bg-white hover:text-pink-600"
            onClick={() => {
              if (window.location.pathname === "/") window.dispatchEvent(new CustomEvent("jfd-dresses"));
              else router.push("/#catalog");
            }}
          >Catalog</button>
          <button
            type="button"
            className="shrink-0 rounded-xl px-4 py-2 transition hover:bg-white hover:text-pink-600"
            onClick={() => {
              if (window.location.pathname === "/") window.dispatchEvent(new CustomEvent("jfd-contact"));
              else router.push("/#contact");
            }}
          >Contact Us</button>
        </nav>

      </div>
    </header>
  );
}
