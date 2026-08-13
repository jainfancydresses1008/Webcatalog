"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { DressDto } from "@/lib/dress-types";

import DressCard from "./DressCard";
import DressDetailsModal from "./DressDetailsModal";
import SearchFilters from "./SearchFilters";

type Props = {
  dresses: DressDto[];
  sellerPhone: string;
  sellerEmail: string;
  categories: string[];
  subcategories: string[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  initialSearch: string;
  initialCategory: string;
  initialSubcategory: string;
  visitorCount: number;
};

export default function DressCatalogClient({
  dresses,
  sellerPhone,
  sellerEmail,
  categories,
  subcategories,
  total,
  page,
  totalPages,
  pageSize,
  initialSearch,
  initialCategory,
  initialSubcategory,
  visitorCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchText, setSearchText] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || "All",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialSubcategory || "All",
  );
  const [selectedDress, setSelectedDress] = useState<DressDto | null>(null);

  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>(
    Object.fromEntries(
      dresses.map((dress) => [dress.id, dress.sizes[0]?.size ?? ""]),
    ),
  );

  const shopName =
    process.env.NEXT_PUBLIC_SHOP_NAME || "Jain Fancy Dresses";

  const tagline =
    process.env.NEXT_PUBLIC_SHOP_TAGLINE ||
    "Beautiful costumes for every special occasion";

  function navigate(
    nextSearch = searchText,
    nextCategory = selectedCategory,
    nextSubcategory = selectedSubcategory,
    nextPage = 1,
  ) {
    const params = new URLSearchParams();

    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextCategory && nextCategory !== "All") {
      params.set("category", nextCategory);
    }
    if (nextSubcategory && nextSubcategory !== "All") {
      params.set("subcategory", nextSubcategory);
    }

    if (nextPage > 1) params.set("page", String(nextPage));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearch(value: string) {
    setSearchText(value);
    navigate(value, selectedCategory, selectedSubcategory, 1);
  }

  function handleCategory(value: string) {
    setSelectedCategory(value);
    setSelectedSubcategory("All");
    navigate(searchText, value, "All", 1);
  }

  function handleSubcategory(value: string) {
    setSelectedSubcategory(value);
    navigate(searchText, selectedCategory, value, 1);
  }

  function selectedSizeFor(dress: DressDto) {
    return (
      dress.sizes.find((size) => size.size === selectedSizes[dress.id]) ??
      dress.sizes[0]
    );
  }

  function updateSize(id: number, size: string) {
    setSelectedSizes((current) => ({
      ...current,
      [id]: size,
    }));
  }

  function links(dress: DressDto) {
    const selected = selectedSizeFor(dress);

    const message = `Hello, I am interested in this dress.

Category: ${dress.category}
Subcategory: ${dress.subcategory ?? ""}
Character Name: ${dress.characterName}
Selected Size: ${selected?.size ?? ""}
Price: ₹${selected?.price ?? ""}`;

    const msg = encodeURIComponent(message);

    return {
      whatsapp: `https://wa.me/${sellerPhone}?text=${msg}`,
      email: `mailto:${sellerEmail}?subject=${encodeURIComponent(
        `Dress Inquiry - ${dress.characterName}`,
      )}&body=${msg}`,
      sms: `sms:+${sellerPhone}?body=${msg}`,
    };
  }

  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 ||
      number === totalPages ||
      Math.abs(number - page) <= 2,
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff9fc] text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-purple-100" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-pink-300/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-purple-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-3 md:px-8 md:pb-16">
          <div className="mb-6 overflow-hidden rounded-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 px-4 py-2 text-white shadow-lg">
            <div className="animate-marquee whitespace-nowrap text-center text-sm font-black uppercase tracking-[0.18em]">
              We also deal in wholesale and bulk orders ✨
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/85 px-4 py-2 text-sm font-bold text-pink-700 shadow-sm backdrop-blur">
                <span>✨</span>
                <span>Fancy Dress Collection</span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl">
                Make every event
                <span className="mt-2 block bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                  extra special ✨
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {tagline}. Explore our collection of costumes for school
                events, cultural programs, parties, celebrations and special
                occasions.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-black text-pink-600">{total}+</p>
                  <p className="text-xs font-semibold text-slate-500">
                    Costumes
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-black text-purple-600">
                    {categories.length - 1}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Categories
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-black text-fuchsia-600">
                    {visitorCount}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Visitors
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-pink-400/30 via-fuchsia-400/20 to-purple-400/30 blur-2xl" />

                <div className="relative overflow-hidden rounded-[3rem] border border-white/80 bg-white/80 p-5 shadow-2xl backdrop-blur">
                  <div className="rounded-[2.5rem] bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
                    <div className="w-full overflow-hidden rounded-[2rem] bg-white shadow-inner">
                      <Image
                        src="/images/logo.png"
                        alt="Jain Fancy Dresses"
                        width={1024}
                        height={1536}
                        className="block h-auto w-full"
                        priority
                      />
                    </div>

                    <div className="mt-5 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">
                        Welcome to
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                        {shopName}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Costumes that make celebrations memorable
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="catalog"
        className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"
      >
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              Explore Collection
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Find the perfect costume
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Browse by category, subcategory, character and description.
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
            {firstItem}-{lastItem} of {total} dresses
          </div>
        </div>

        <div className="mb-8">
          <SearchFilters
            categories={categories}
            subcategories={subcategories}
            searchText={searchText}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSearchTextChange={handleSearch}
            onSelectedCategoryChange={handleCategory}
            onSelectedSubcategoryChange={handleSubcategory}
          />
        </div>

        {dresses.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-pink-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-3xl">
              🔍
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900">
              No dresses found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try another search term or select a different category.
            </p>
            <button
              type="button"
              onClick={() => navigate("", "All", "All", 1)}
              className="mt-5 rounded-full bg-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-pink-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {dresses.map((dress) => {
              const selected = selectedSizeFor(dress);

              return (
                <div
                  key={dress.id}
                  className="group transition duration-300 hover:-translate-y-1"
                >
                  <DressCard
                    dress={dress}
                    selectedSize={selected?.size ?? ""}
                    selectedPrice={selected?.price ?? 0}
                    onSizeChange={(size) => updateSize(dress.id, size)}
                    onView={() => setSelectedDress(dress)}
                    contactLinks={links(dress)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Dress catalog pagination"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                navigate(
                  searchText,
                  selectedCategory,
                  selectedSubcategory,
                  page - 1,
                )
              }
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            {pageNumbers.map((number, index) => {
              const previous = pageNumbers[index - 1];
              const showGap = previous && number - previous > 1;

              return (
                <span key={number} className="flex items-center gap-2">
                  {showGap && (
                    <span className="px-1 text-slate-400">…</span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        searchText,
                        selectedCategory,
                        selectedSubcategory,
                        number,
                      )
                    }
                    className={`h-10 min-w-10 rounded-full px-3 text-sm font-black transition ${
                      page === number
                        ? "bg-pink-600 text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50"
                    }`}
                  >
                    {number}
                  </button>
                </span>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                navigate(
                  searchText,
                  selectedCategory,
                  selectedSubcategory,
                  page + 1,
                )
              }
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </nav>
        )}
      </section>

      <section className="px-4 pb-12 md:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 px-6 py-10 text-white shadow-xl md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-100">
                Need help choosing?
              </p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Find the right dress for your event 💕
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-pink-50 md:text-base">
                Select a dress and contact us directly through WhatsApp, email
                or SMS.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex w-fit items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-pink-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Contact Us →
            </a>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-pink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-pink-100">
                  <Image
                    src="/images/logo.png"
                    alt={`${shopName} logo`}
                    fill
                    sizes="44px"
                    className="object-contain p-1"
                  />
                </div>

                <div>
                  <p className="font-black text-slate-950">{shopName}</p>
                  <p className="text-xs text-slate-500">
                    Fancy Dress Collection
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Beautiful costumes for school events, parties, celebrations and
                special occasions.
              </p>
            </div>

            <div>
              <h3 className="font-black text-slate-900">Browse</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <a href="#catalog" className="block hover:text-pink-600">
                  Dress Catalog
                </a>
                <a href="#catalog" className="block hover:text-pink-600">
                  Categories
                </a>
                <a href="#contact" className="block hover:text-pink-600">
                  Contact Us
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-black text-slate-900">Contact</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p>Contact us directly using the buttons available on each dress.</p>
                <p>✅ WhatsApp</p>
                <p>✅ Email</p>
                <p>✅ SMS</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </div>
        </div>
      </footer>

      {selectedDress && (
        <DressDetailsModal
          dress={selectedDress}
          selectedSize={selectedSizeFor(selectedDress)?.size ?? ""}
          onSizeChange={(size) => updateSize(selectedDress.id, size)}
          onClose={() => setSelectedDress(null)}
          contactLinks={links(selectedDress)}
        />
      )}
    </main>
  );
}
