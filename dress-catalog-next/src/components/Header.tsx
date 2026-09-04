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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Jain Fancy Dresses";
  const tagline =
    process.env.NEXT_PUBLIC_SHOP_TAGLINE ||
    "Fancy dress collection for kids, school events and parties";
  const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE || "919999999999";
  const whatsappMessage = encodeURIComponent(
    "Hello, I want to know more about Jain Fancy Dresses.",
  );

  useEffect(() => {
    const currentSearch =
      new URLSearchParams(window.location.search).get("search") || "";
    setSearchText(currentSearch);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = searchText.trim();

    if (!query) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setSuggestionsLoading(true);

        const response = await fetch(
          `/api/search-suggestions?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = (await response.json()) as {
          suggestions?: SearchSuggestion[];
        };

        setSuggestions(dedupeSuggestions(data.suggestions ?? []));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setSuggestionsLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchText]);

  function navigateSearch(
    nextSearch: string,
    nextCategory = "All",
    nextSubcategory = "All",
  ) {
    const params = new URLSearchParams();

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    if (nextCategory && nextCategory !== "All") {
      params.set("category", nextCategory);
    }

    if (nextSubcategory && nextSubcategory !== "All") {
      params.set("subcategory", nextSubcategory);
    }

    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;

    setSuggestions([]);
    setIsSearchFocused(false);
    setMobileSearchOpen(false);
    router.push(target, { scroll: false });

    window.setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  function handleSearchSubmit() {
    const trimmed = searchText.trim();
    if (!trimmed) return;

    const exactSuggestion = suggestions.find(
      (suggestion) =>
        suggestion.value.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (exactSuggestion) {
      handleSuggestionSelect(exactSuggestion);
      return;
    }

    navigateSearch(trimmed);
  }

  function handleSuggestionSelect(suggestion: SearchSuggestion) {
    const nextSearch = suggestion.value;

    if (suggestion.type === "category") {
      navigateSearch(nextSearch, suggestion.value, "All");
      return;
    }

    if (suggestion.type === "subcategory") {
      navigateSearch(
        nextSearch,
        cleanFilterValue(suggestion.category),
        suggestion.value,
      );
      return;
    }

    navigateSearch(
      nextSearch,
      cleanFilterValue(suggestion.category),
      cleanFilterValue(suggestion.subcategory),
    );
  }

  function handleSearchChange(value: string) {
    setSearchText(value);
    setIsSearchFocused(true);
  }

  function openMobileSearch() {
    setMobileSearchOpen(true);
    setIsSearchFocused(true);
    window.setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
  }

  const showSuggestions =
    isSearchFocused &&
    searchText.trim().length > 0 &&
    (suggestionsLoading || suggestions.length > 0);

  function SearchBox({ mobile = false }: { mobile?: boolean }) {
    return (
      <div
        className={
          mobile
            ? "relative w-full"
            : "relative hidden shrink-0 sm:block"
        }
        ref={searchRef}
      >
        <div
          className={
            mobile
              ? "relative flex h-11 w-full items-center rounded-full border border-pink-100 bg-white shadow-sm transition focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-100"
              : "relative flex h-11 w-[210px] items-center rounded-full border border-pink-100 bg-white shadow-sm transition focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-100 md:w-[270px]"
          }
        >
          <svg
            viewBox="0 0 24 24"
            className="ml-3 h-5 w-5 shrink-0 text-pink-500"
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

          <input
            ref={mobile ? mobileSearchInputRef : undefined}
            id={mobile ? "header-dress-search-mobile" : "header-dress-search"}
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
                setMobileSearchOpen(false);
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
                setIsSearchFocused(true);
              }}
              className="mr-2 rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {showSuggestions && (
          <div className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:left-auto sm:right-0 sm:w-[min(90vw,360px)]">
            {suggestionsLoading ? (
              <div className="px-4 py-4 text-sm text-slate-500">
                Looking for matches...
              </div>
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
                      {suggestion.type === "character"
                        ? "👗"
                        : suggestion.type === "category"
                          ? "▦"
                          : "✦"}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-800">
                        {suggestion.value}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {suggestion.type === "character"
                          ? [suggestion.category, suggestion.subcategory]
                              .filter(Boolean)
                              .join(" • ") || "Character"
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
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 sm:py-3.5 md:px-8">
        {/* MAIN HEADER ROW */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <button
            type="button"
            className="group flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-1 py-1 text-left transition hover:bg-pink-50/60 sm:gap-3 sm:px-1.5"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.dispatchEvent(new CustomEvent("jfd-home"));
              } else {
                router.push("/");
              }
            }}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-pink-100 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-xl sm:h-14 sm:w-14">
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

          {/* DESKTOP SEARCH */}
          <div className="hidden items-center gap-2 sm:flex">
            <SearchBox />
          </div>

          {/* MOBILE SEARCH ICON */}
          <button
            type="button"
            onClick={openMobileSearch}
            aria-label="Open dress search"
            title="Search Dresses"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pink-200 bg-white text-pink-600 shadow-sm transition hover:bg-pink-50 sm:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16 16 4.5 4.5"
              />
            </svg>
          </button>

          {/* WHATSAPP */}
          <a
            href={`https://wa.me/${sellerPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with us on WhatsApp"
            title="Chat with us on WhatsApp"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700 sm:h-11 sm:w-11"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 sm:h-6 sm:w-6"
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

          {/* SECURE MENU */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Open secure menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 sm:h-11 sm:w-11"
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

                <Link
                  href="/privacy-policy"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-pink-50 hover:text-pink-700"
                >
                  Privacy Policy
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

        {/* MOBILE SEARCH BOX: DIRECTLY UNDER THE HEADER ROW */}
        {mobileSearchOpen && (
          <div className="mt-2 sm:hidden">
            <SearchBox mobile />
          </div>
        )}

        {/* MOBILE NAVIGATION */}
        <nav className="mt-2 flex items-center justify-center gap-1 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/80 p-1 text-xs font-bold text-slate-600 shadow-sm md:hidden">
          <button
            type="button"
            className="shrink-0 rounded-xl bg-white px-4 py-2 text-pink-600 shadow-sm"
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
            className="shrink-0 rounded-xl px-4 py-2 transition hover:bg-white hover:text-pink-600 hover:shadow-sm"
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
            className="shrink-0 rounded-xl px-4 py-2 transition hover:bg-white hover:text-pink-600 hover:shadow-sm"
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
      </div>
    </header>
  );
}
