'use client';

import { useMemo, useState } from 'react';
import type { DressDto } from '@/lib/dress-types';

import DressCard from './DressCard';
import DressDetailsModal from './DressDetailsModal';
import SearchFilters from './SearchFilters';

type Props = {
  dresses: DressDto[];
  sellerPhone: string;
  sellerEmail: string;
};

export default function DressCatalogClient({
  dresses,
  sellerPhone,
  sellerEmail,
}: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [senderContact, setSenderContact] = useState('');
  const [selectedDress, setSelectedDress] = useState<DressDto | null>(null);

  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>(
    Object.fromEntries(
      dresses.map((dress) => [
        dress.id,
        dress.sizes[0]?.size ?? '',
      ])
    )
  );

  const categories = useMemo(
    () => ['All', ...new Set(dresses.map((dress) => dress.category))],
    [dresses]
  );

  const shopName =
    process.env.NEXT_PUBLIC_SHOP_NAME || 'Akshaya Dress Studio';

  const tagline =
    process.env.NEXT_PUBLIC_SHOP_TAGLINE ||
    'Beautiful costumes for every special occasion';

  const filteredDresses = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return dresses.filter(
      (dress) =>
        (selectedCategory === 'All' ||
          dress.category === selectedCategory) &&
        (dress.category.toLowerCase().includes(search) ||
          dress.characterName.toLowerCase().includes(search) ||
          dress.description.toLowerCase().includes(search))
    );
  }, [dresses, searchText, selectedCategory]);

  function selectedSizeFor(dress: DressDto) {
    return (
      dress.sizes.find(
        (size) => size.size === selectedSizes[dress.id]
      ) ?? dress.sizes[0]
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

    const msg = encodeURIComponent(
      `Hello, I am interested in this dress.

Category: ${dress.category}
Character Name: ${dress.characterName}
Selected Size: ${selected?.size ?? ''}
Price: ₹${selected?.price ?? ''}
Sender Contact Number: ${senderContact || 'Not provided'}`
    );

    return {
      whatsapp: `https://wa.me/${sellerPhone}?text=${msg}`,

      email: `mailto:${sellerEmail}?subject=${encodeURIComponent(
        `Dress Inquiry - ${dress.characterName}`
      )}&body=${msg}`,

      sms: `sms:+${sellerPhone}?body=${msg}`,
    };
  }

  return (
    <main className="min-h-screen bg-[#fff9fc] text-slate-900">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-purple-100" />

        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-8 md:pb-16 md:pt-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.7fr]">

            {/* Hero text */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-sm font-bold text-pink-700 shadow-sm backdrop-blur">
                <span>✨</span>
                <span>Fancy Dress Collection</span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
                Make every event
                <span className="block bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                  extra special ✨
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {tagline}. Explore our collection of costumes for
                school events, cultural programs, parties, celebrations
                and special occasions.
              </p>

              {/* Quick stats */}
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-black text-pink-600">
                    {dresses.length}+
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Costumes
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-black text-purple-600">
                    {categories.length - 1}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Categories
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-black text-fuchsia-600">
                    All Sizes
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Available
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative card */}
            <div className="hidden md:block">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 rotate-6 rounded-[2rem] bg-gradient-to-br from-pink-400 to-purple-500 opacity-20 blur-sm" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-2xl">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8 text-center">
                    <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-5xl shadow-lg">
                      👗
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-500">
                      Dress Studio
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      {shopName}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Find a costume your child will love wearing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CATALOG ================= */}
      <section
        id="catalog"
        className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"
      >

        {/* Section heading */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              Explore Collection
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Find the perfect costume
            </h2>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Browse by category, character, description and size.
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
            {filteredDresses.length} dresses
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-8 rounded-3xl border border-pink-100 bg-white p-4 shadow-sm md:p-5">
          <SearchFilters
            categories={categories}
            searchText={searchText}
            selectedCategory={selectedCategory}
            senderContact={senderContact}
            onSearchTextChange={setSearchText}
            onSelectedCategoryChange={setSelectedCategory}
            onSenderContactChange={setSenderContact}
          />

          {/* Category pills */}
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-950">
              Available Dresses
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose a size to see the price.
            </p>
          </div>
        </div>

        {/* Empty state */}
        {filteredDresses.length === 0 ? (
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
              onClick={() => {
                setSearchText('');
                setSelectedCategory('All');
              }}
              className="mt-5 rounded-full bg-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-pink-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filteredDresses.map((dress) => {
              const selected = selectedSizeFor(dress);

              return (
                <div
                  key={dress.id}
                  className="group transition duration-300 hover:-translate-y-1"
                >
                  <DressCard
                    dress={dress}
                    selectedSize={selected?.size ?? ''}
                    selectedPrice={selected?.price ?? 0}
                    onSizeChange={(size) =>
                      updateSize(dress.id, size)
                    }
                    onView={() => setSelectedDress(dress)}
                    contactLinks={links(dress)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= CONTACT CTA ================= */}
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
                Select a dress and contact us directly through WhatsApp,
                email or SMS.
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

      {/* ================= FOOTER ================= */}
      <footer
        id="contact"
        className="border-t border-pink-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-xl shadow-md">
                  👗
                </div>

                <div>
                  <p className="font-black text-slate-950">
                    {shopName}
                  </p>

                  <p className="text-xs text-slate-500">
                    Fancy Dress Collection
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Beautiful costumes for school events, parties,
                celebrations and special occasions.
              </p>
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                Browse
              </h3>

              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <a
                  href="#catalog"
                  className="block transition hover:text-pink-600"
                >
                  Dress Catalog
                </a>

                <a
                  href="#catalog"
                  className="block transition hover:text-pink-600"
                >
                  Categories
                </a>

                <a
                  href="#contact"
                  className="block transition hover:text-pink-600"
                >
                  Contact Us
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                Contact
              </h3>

              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p>
                  📞 +{sellerPhone}
                </p>

                <p className="break-all">
                  ✉️ {sellerEmail}
                </p>

                <p className="pt-2 text-xs text-slate-400">
                  Available for dress inquiries.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ================= MODAL ================= */}
      {selectedDress && (
        <DressDetailsModal
          dress={selectedDress}
          selectedSize={
            selectedSizeFor(selectedDress)?.size ?? ''
          }
          senderContact={senderContact}
          onSizeChange={(size) =>
            updateSize(selectedDress.id, size)
          }
          onSenderContactChange={setSenderContact}
          onClose={() => setSelectedDress(null)}
          contactLinks={links(selectedDress)}
        />
      )}
    </main>
  );
}