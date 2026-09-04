"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CategoryDto, DressDto } from "@/lib/dress-types";
import DressCard from "./DressCard";
import DressDetailsModal from "./DressDetailsModal";
import type { SearchSuggestion } from "./SearchFilters";

type Props = {
  dresses: DressDto[];
  sellerPhone: string;
  sellerEmail: string;
  categories: string[];
  categoryRecords: CategoryDto[];
  subcategories: string[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  initialSearch: string;
  initialCategory: string;
  initialSubcategory: string;
  selectedCategoryId: number | null;
};

type GoogleReview = {
  id: string;
  reviewerName: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
};

const mockGoogleReviews: GoogleReview[] = [
  {
    id: "1",
    reviewerName: "Priya Sharma",
    rating: 5,
    text: "Amazing collection of fancy dresses. The quality was excellent and the staff was very helpful.",
    date: "2 weeks ago",
  },
  {
    id: "2",
    reviewerName: "Neha Gupta",
    rating: 5,
    text: "Beautiful costumes and lots of options for school functions. Highly recommended!",
    date: "3 weeks ago",
  },
  {
    id: "3",
    reviewerName: "Rahul Jain",
    rating: 5,
    text: "Very good collection and reasonable prices. We purchased costumes for our school event.",
    date: "1 month ago",
  },
  {
    id: "4",
    reviewerName: "Anita Verma",
    rating: 4,
    text: "Good variety and very cooperative service. We found exactly what we were looking for.",
    date: "1 month ago",
  },
  {
    id: "5",
    reviewerName: "Pooja Agarwal",
    rating: 5,
    text: "Excellent fancy dress collection. The costumes looked beautiful on the children.",
    date: "2 months ago",
  },
];

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

export default function DressCatalogClient({
  dresses,
  sellerPhone,
  sellerEmail,
  categories,
  categoryRecords,
  subcategories,
  total,
  page,
  totalPages,
  pageSize,
  initialSearch,
  initialCategory,
  initialSubcategory,
  selectedCategoryId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchText, setSearchText] = useState(initialSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || "All",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialSubcategory || "All",
  );

  const [selectedDress, setSelectedDress] = useState<DressDto | null>(null);

  const categoryScrollYRef = useRef<number | null>(null);
  const scrollToCatalogRef = useRef(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [searchSubmitted, setSearchSubmitted] = useState(
    Boolean(initialSearch?.trim()),
  );

  const [isPending, startTransition] = useTransition();

  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>(
    Object.fromEntries(
      dresses.map((dress) => [dress.id, dress.sizes[0]?.size ?? ""]),
    ),
  );

  const isCategoryView =
    selectedCategoryId !== null ||
    selectedCategory !== "All" ||
    selectedSubcategory !== "All" ||
    searchSubmitted ||
    Boolean(initialSearch?.trim());

  const shopName =
    process.env.NEXT_PUBLIC_SHOP_NAME || "Jain Fancy Dresses";

  const whatsappContactLink = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(
    "Hello, I am interested in your fancy dress collection.",
  )}`;

  function clearFilterState() {
    setSearchText("");
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSuggestions([]);
  }

  function resetFilters() {
    clearFilterState();
    setSearchSubmitted(false);

    startTransition(() => {
      router.replace("/", { scroll: false });
    });
  }

  function scrollToSection(id: string) {
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  useEffect(() => {
    const goHome = () => {
      resetFilters();

      window.setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    };

    const goDresses = () => {
      resetFilters();
      scrollToSection("catalog");
    };

    const goContact = () => {
      resetFilters();
      scrollToSection("contact");
    };

    window.addEventListener("jfd-home", goHome as EventListener);
    window.addEventListener("jfd-dresses", goDresses as EventListener);
    window.addEventListener("jfd-contact", goContact as EventListener);

    return () => {
      window.removeEventListener("jfd-home", goHome as EventListener);
      window.removeEventListener("jfd-dresses", goDresses as EventListener);
      window.removeEventListener("jfd-contact", goContact as EventListener);
    };
  }, []);

  function navigate(
    nextSearch = searchText,
    nextCategory = selectedCategory,
    nextSubcategory = selectedSubcategory,
    nextPage = 1,
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

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const query = params.toString();

    startTransition(() => {
      router.push(
        query ? `${pathname}?${query}` : pathname,
        { scroll: false },
      );
    });
  }

  function handleSearch(value: string) {
    setSearchText(value);
  }

  function submitSearch(value = searchText) {
    const trimmedValue = value.trim();

    const exactSuggestion = suggestions.find(
      (suggestion) =>
        suggestion.value.trim().toLowerCase() ===
        trimmedValue.toLowerCase(),
    );

    if (exactSuggestion) {
      handleSuggestionSelect(exactSuggestion);
      return;
    }

    setSearchText(value);
    setSearchSubmitted(Boolean(trimmedValue));
    setSuggestions([]);

    navigate(value, selectedCategory, selectedSubcategory, 1);
  }

  function handleSuggestionSelect(suggestion: SearchSuggestion) {
    const nextSearch = suggestion.value;

    categoryScrollYRef.current = window.scrollY;

    setSearchText(nextSearch);
    setSearchSubmitted(true);
    setSuggestions([]);

    if (suggestion.type === "category") {
      setSelectedCategory(suggestion.value);
      setSelectedSubcategory("All");

      navigate(nextSearch, suggestion.value, "All", 1);
      return;
    }

    if (suggestion.type === "subcategory") {
      const nextCategory = cleanFilterValue(suggestion.category);

      setSelectedCategory(nextCategory);
      setSelectedSubcategory(suggestion.value);

      navigate(nextSearch, nextCategory, suggestion.value, 1);
      return;
    }

    if (suggestion.type === "character") {
      const nextCategory = cleanFilterValue(suggestion.category);

      // A character/dress selected from search is an entry point to its
      // category, not a request to filter down to only that one dress.
      // Show the complete category collection.
      setSelectedCategory(nextCategory);
      setSelectedSubcategory("All");
      setSearchText("");
      setSearchSubmitted(false);

      navigate("", nextCategory, "All", 1);
      return;
    }

    navigate(
      nextSearch,
      selectedCategory,
      selectedSubcategory,
      1,
    );
  }

  useEffect(() => {
    setSelectedCategory(initialCategory || "All");
    setSelectedSubcategory(initialSubcategory || "All");
    setSearchText(initialSearch || "");
    setSearchSubmitted(Boolean(initialSearch?.trim()));
  }, [
    initialCategory,
    initialSubcategory,
    initialSearch,
    selectedCategoryId,
  ]);

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

        setSuggestions(
          dedupeSuggestions(data.suggestions ?? []),
        );
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

  function handleCategory(value: string) {
    categoryScrollYRef.current = window.scrollY;

    setSuggestions([]);
    setSearchText("");
    setSearchSubmitted(false);
    setSelectedCategory(value);
    setSelectedSubcategory("All");

    navigate("", value, "All", 1);
  }

  function handleSubcategory(value: string) {
    categoryScrollYRef.current = window.scrollY;

    setSuggestions([]);
    setSelectedSubcategory(value);

    navigate(
      searchText,
      selectedCategory,
      value,
      1,
    );
  }

  useEffect(() => {
    if (scrollToCatalogRef.current) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById("catalog")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        scrollToCatalogRef.current = false;
      });

      return () => window.cancelAnimationFrame(frame);
    }

    const savedScrollY = categoryScrollYRef.current;

    if (savedScrollY === null) return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: savedScrollY,
        left: 0,
        behavior: "auto",
      });

      categoryScrollYRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    initialCategory,
    initialSubcategory,
    initialSearch,
    page,
  ]);

  function openCategory(categoryId: number) {
    setSuggestions([]);

    scrollToCatalogRef.current = true;

    startTransition(() => {
      router.push(
        `${pathname}?categoryId=${categoryId}&page=1`,
        { scroll: false },
      );
    });
  }

  function backToCategories() {
    setSuggestions([]);
    setSearchText("");
    setSearchSubmitted(false);
    setSelectedCategory("All");
    setSelectedSubcategory("All");

    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  function selectedSizeFor(dress: DressDto) {
    return (
      dress.sizes.find(
        (size) => size.size === selectedSizes[dress.id],
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

    const message = `Hello, I am interested in this dress.
Category: ${dress.categoryRef.name}
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

  const firstItem =
    total === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    total,
  );

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

      {/* ========================================================= */}
      {/* HERO - NO IMAGES                                         */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-100" />

        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-pink-300/25 blur-3xl" />

        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-purple-300/25 blur-3xl" />

        <div className="absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-200/25 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-4 md:px-8 md:pb-12">

          {/* Announcement */}
          <div className="mb-6 overflow-hidden rounded-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 px-4 py-2 text-white shadow-lg">
            <div className="animate-marquee whitespace-nowrap text-center text-sm font-black uppercase tracking-[0.18em]">
              New school event collection available &#10024;
              1000+ costumes for every occasion &#10024;
              Wholesale and bulk orders available &#10024;
              Best quality at affordable prices &#10024;
            </div>
          </div>

          {/* FULL WIDTH HERO CONTENT */}
        </div>
      </section>

      {/* ========================================================= */}
      {/* CATALOG                                                   */}
      {/* ========================================================= */}

      <section
        id="catalog"
        className="w-full px-4 py-10 md:px-8 md:py-14"
      >
        <div className="mx-auto max-w-7xl">

          {!isCategoryView ? (
            <>
              {/* CATEGORY HEADING */}
              <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
                  Explore Collection
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  Browse by category
                </h2>

                <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                  Select a category to view all available dresses in that
                  collection.
                </p>
              </div>

              {/* NO CATEGORIES */}
              {categoryRecords.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-pink-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-3xl">
                    &#128142;
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    No categories available
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Categories added through Category Master will appear here.
                  </p>
                </div>
              ) : (
                /* CATEGORY POSTERS ONLY */
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryRecords.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategory(category.id)}
                      className="group overflow-hidden rounded-[2rem] border border-white bg-white text-left shadow-lg ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-100"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                        <Image
                          src={
                            category.posterUrl ||
                            "/images/placeholder-dress.svg"
                          }
                          alt={`${category.name} category poster`}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY PAGINATION */}
              {totalPages > 1 && (
                <nav
                  className="mt-10 flex flex-wrap items-center justify-center gap-2"
                  aria-label="Category pagination"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      navigate("", "All", "All", page - 1)
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &#8592; Previous
                  </button>

                  {pageNumbers.map((number, index) => {
                    const previous = pageNumbers[index - 1];

                    const showGap =
                      previous &&
                      number - previous > 1;

                    return (
                      <span
                        key={number}
                        className="flex items-center gap-2"
                      >
                        {showGap && (
                          <span className="px-1 text-slate-400">
                            &#8230;
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "",
                              "All",
                              "All",
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
                        "",
                        "All",
                        "All",
                        page + 1,
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next &#8594;
                  </button>
                </nav>
              )}
            </>
          ) : (
            <>
              {/* CATEGORY DRESS VIEW */}
              <div className="mb-8">

                <button
                  type="button"
                  onClick={backToCategories}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2 text-sm font-black text-pink-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50"
                >
                  &#8592; All Categories
                </button>

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
                  Category Collection
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  {selectedCategory || "Dresses"}
                </h2>

                <p className="mt-2 text-sm text-slate-500 md:text-base">
                  {firstItem}-{lastItem} of {total} dresses · sorted
                  alphabetically
                </p>
              </div>

              {/* LOADING */}
              {isPending ? (
                <div className="rounded-[2rem] border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-pink-600" />

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    Loading dresses...
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Please wait while we load this collection.
                  </p>

                </div>
              ) : dresses.length === 0 ? (

                /* NO DRESSES */
                <div className="rounded-[2rem] border border-dashed border-pink-200 bg-white px-6 py-16 text-center shadow-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-3xl">
                    &#128269;
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    No dresses found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    This category does not have any matching dresses yet.
                  </p>

                </div>

              ) : (

                /* DRESS CARDS */
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">

                  {dresses.map((dress) => {
                    const selected =
                      selectedSizeFor(dress);

                    return (
                      <div
                        key={dress.id}
                        className="group transition duration-300 hover:-translate-y-1"
                      >
                        <DressCard
                          dress={dress}
                          selectedSize={selected?.size ?? ""}
                          selectedPrice={selected?.price ?? 0}
                          onSizeChange={(size) =>
                            updateSize(
                              dress.id,
                              size,
                            )
                          }
                          onView={() => {
                            window.setTimeout(() => {
                              setSelectedDress(dress);
                            }, 50);
                          }}
                          contactLinks={links(dress)}
                        />
                      </div>
                    );
                  })}

                </div>
              )}

              {/* DRESS PAGINATION */}
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
                    &#8592; Previous
                  </button>

                  {pageNumbers.map((number, index) => {
                    const previous =
                      pageNumbers[index - 1];

                    const showGap =
                      previous &&
                      number - previous > 1;

                    return (
                      <span
                        key={number}
                        className="flex items-center gap-2"
                      >

                        {showGap && (
                          <span className="px-1 text-slate-400">
                            &#8230;
                          </span>
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
                    Next &#8594;
                  </button>

                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* CONTACT CTA                                               */}
      {/* ========================================================= */}

      <section className="px-4 pb-12 md:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 px-6 py-10 text-white shadow-xl ring-1 ring-white/40 md:px-12">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-100">
                Need help choosing?
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Find the right dress for your event &#128149;
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-pink-50 md:text-base">
                Select a dress and contact us directly from the dress card.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetFilters();
                scrollToSection("contact");
              }}
              className="inline-flex w-fit items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-pink-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="inline-flex items-center gap-2">
                Contact Us

                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </span>
            </button>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* GOOGLE REVIEWS                                            */}
      {/* ========================================================= */}

      <section
        id="reviews"
        className="border-t border-pink-100 bg-gradient-to-b from-pink-50/40 via-white to-white px-4 py-14 md:px-8 md:py-16"
      >
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-pink-600 shadow-sm">

                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58-4.78-4.66 6.6-.96L12 2.5z" />
                </svg>

                Google Reviews
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                What our customers say
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                See what customers have shared about their experience with{" "}
                {shopName}.
              </p>

            </div>

            <div className="flex items-center gap-4 rounded-[1.5rem] border border-pink-100 bg-white px-5 py-4 shadow-lg shadow-pink-100/40">

              <div className="text-center">

                <div className="text-3xl font-black text-slate-950">
                  4.8
                </div>

                <div className="mt-1 flex justify-center gap-0.5 text-amber-400">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58-4.78-4.66 6.6-.96L12 2.5z" />
                    </svg>
                  ))}

                </div>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Google rating
                </p>

              </div>

              <div className="h-12 w-px bg-slate-100" />

              <div>

                <p className="text-xl font-black text-slate-900">
                  100+
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  customer reviews
                </p>

              </div>

            </div>

          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {mockGoogleReviews.map((review) => (
              <article
                key={review.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="absolute right-5 top-5 text-pink-100 transition group-hover:text-pink-200">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-9 w-9"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7.2 5.5C4.88 5.5 3 7.38 3 9.7v.55c0 2.32 1.88 4.2 4.2 4.2h.55c.2 0 .4-.02.59-.04C8.05 16.56 6.58 18.1 5 19.5l2.1 1.7c2.67-2.15 4.55-4.3 5.65-6.45.78-1.53 1.15-3.06 1.15-4.6C13.9 7.58 11.18 5.5 7.2 5.5Zm9.8 0c-2.32 0-4.2 1.88-4.2 4.2v.55c0 2.32 1.88 4.2 4.2 4.2h.55c.2 0 .4-.02.59-.04-1.09 2.15-2.56 3.69-4.14 5.09l2.1 1.7c2.67-2.15 4.55-4.3 5.65-6.45.78-1.53 1.15-3.06 1.15-4.6 0-2.57-2.72-4.65-4.75-4.65Z" />
                  </svg>

                </div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-sm font-black text-pink-700">
                    {review.reviewerName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <h3 className="truncate text-sm font-black text-slate-900">
                      {review.reviewerName}
                    </h3>

                    <p className="text-xs font-semibold text-slate-400">
                      {review.date}
                    </p>

                  </div>

                  <div className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">

                    <span className="text-sm font-black text-amber-500">
                      {review.rating.toFixed(1)}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 text-amber-400"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58-4.78-4.66 6.6-.96L12 2.5z" />
                    </svg>

                  </div>

                </div>

                <div className="mt-5 flex gap-0.5 text-amber-400">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "text-amber-400"
                          : "text-slate-200"
                      }`}
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58-4.78-4.66 6.6-.96L12 2.5z" />
                    </svg>
                  ))}

                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  &quot;{review.text}&quot;
                </p>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-pink-600"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58-4.78-4.66 6.6-.96L12 2.5z" />
                  </svg>

                  <span className="text-xs font-bold text-slate-400">
                    Google review
                  </span>

                </div>

              </article>
            ))}

          </div>

          <div className="mt-8 flex justify-center">

            <a
              href="https://maps.app.goo.gl/pnGViXSGMkGe6m5s7"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
            >
              Read all reviews on Google

              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>

            </a>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER / CONTACT                                          */}
      {/* ========================================================= */}

      <footer
        id="contact"
        className="border-t border-pink-100 bg-gradient-to-b from-white to-pink-50/60"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-14">

          <div className="mb-8 rounded-[2rem] border border-pink-100 bg-white/90 p-6 shadow-xl shadow-pink-100/50 backdrop-blur md:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 shadow-md ring-1 ring-pink-100">

                  <Image
                    src="/images/logo.png"
                    alt={`${shopName} logo`}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />

                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
                    Contact Us
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                    Let&apos;s find the perfect costume
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Contact us for school events, annual functions, parties,
                    competitions and bulk requirements.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[560px]">

                {/* CALL */}
                <a
                  href={`tel:${sellerPhone}`}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"
                >

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"
                      />
                    </svg>

                  </span>

                  <span className="min-w-0">

                    <span className="block text-xs font-bold text-slate-500">
                      Call us
                    </span>

                    <span className="block truncate text-sm font-black text-slate-900 group-hover:text-green-700">
                      {sellerPhone}
                    </span>

                  </span>

                </a>

                {/* WHATSAPP */}
                <a
                  href={whatsappContactLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
                >

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
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

                  </span>

                  <span className="min-w-0">

                    <span className="block text-xs font-bold text-slate-500">
                      WhatsApp us
                    </span>

                    <span className="block truncate text-sm font-black text-slate-900 group-hover:text-emerald-700">
                      Chat with us on WhatsApp
                    </span>

                  </span>

                </a>

                {/* EMAIL */}
                <a
                  href={`mailto:${sellerEmail}`}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50"
                >

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m22 6-10 7L2 6"
                      />
                    </svg>

                  </span>

                  <span className="min-w-0">

                    <span className="block text-xs font-bold text-slate-500">
                      Email us
                    </span>

                    <span className="block truncate text-sm font-black text-slate-900 group-hover:text-purple-700">
                      {sellerEmail}
                    </span>

                  </span>

                </a>

                {/* MAPS */}
                <a
                  href="https://maps.app.goo.gl/pnGViXSGMkGe6m5s7"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50"
                >

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-700 shadow-sm">

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"
                      />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                      />
                    </svg>

                  </span>

                  <span className="min-w-0">

                    <span className="block text-xs font-bold text-slate-500">
                      Find us on Maps
                    </span>

                    <span className="block truncate text-sm font-black text-slate-900 group-hover:text-pink-600">
                      Open in Google Maps
                    </span>

                  </span>

                  <span
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-pink-600"
                    aria-hidden="true"
                  >

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>

                  </span>

                </a>

              </div>

            </div>
          </div>

          {/* FOOTER LINKS */}
          <div className="grid gap-8 md:grid-cols-2">

            <div>

              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
                Browse
              </h3>

              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">

                <button
                  type="button"
                  onClick={() => {
                    resetFilters();

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="block transition hover:translate-x-1 hover:text-pink-600"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetFilters();

                    setTimeout(() => {
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }, 100);
                  }}
                  className="block transition hover:translate-x-1 hover:text-pink-600"
                >
                  Dress Catalog
                </button>

              </div>

            </div>

            <div>

              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
                Need help?
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Share the character, size and event requirement for faster
                assistance.
              </p>

              <p className="mt-3 text-xs font-semibold text-slate-400">
                Quick response for school events and bulk orders.
              </p>

            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="mt-10 flex flex-col gap-3 border-t border-pink-100 pt-5 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <span>
              &#169; {new Date().getFullYear()} {shopName}. All rights reserved.
            </span>

            <span className="font-semibold text-slate-400">
              Made for memorable celebrations &#10024;
            </span>

          </div>

        </div>
      </footer>

      {/* DRESS MODAL */}
      {selectedDress && (
        <DressDetailsModal
          dress={selectedDress}
          selectedSize={
            selectedSizeFor(selectedDress)?.size ?? ""
          }
          onSizeChange={(size) =>
            updateSize(
              selectedDress.id,
              size,
            )
          }
          onClose={() => setSelectedDress(null)}
          contactLinks={links(selectedDress)}
        />
      )}

    </main>
  );
}