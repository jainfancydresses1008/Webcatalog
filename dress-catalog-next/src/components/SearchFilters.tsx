"use client";

import { useEffect, useRef, useState } from "react";

export type SearchSuggestion = {
  type: "character" | "category" | "subcategory";
  value: string;
  category?: string;
  subcategory?: string | null;
  count?: number;
};

type Props = {
  categories: string[];
  subcategories: string[];
  searchText: string;
  selectedCategory: string;
  selectedSubcategory: string;
  suggestions: SearchSuggestion[];
  suggestionsLoading?: boolean;
  onSearchTextChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  onSelectedCategoryChange: (value: string) => void;
  onSelectedSubcategoryChange: (value: string) => void;
};

export default function SearchFilters({
  categories,
  subcategories,
  searchText,
  selectedCategory,
  selectedSubcategory,
  suggestions,
  suggestionsLoading = false,
  onSearchTextChange,
  onSearchSubmit,
  onSuggestionSelect,
  onSelectedCategoryChange,
  onSelectedSubcategoryChange,
}: Props) {
  const visibleCategories = [...new Set(categories.filter(Boolean))];
  const visibleSubcategories = [...new Set(subcategories.filter(Boolean))];
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const showSuggestions =
    isSearchFocused &&
    searchText.trim().length > 0 &&
    (suggestionsLoading || suggestions.length > 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        const activeElement = document.activeElement as HTMLElement | null;
        activeElement?.blur();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="w-full rounded-3xl border border-pink-100 bg-white p-4 shadow-sm md:p-5">
      <div className="relative" ref={searchRef}>
        <label
          htmlFor="dress-search"
          className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400"
        >
          Search
        </label>

        <div className="relative">
          <input
            id="dress-search"
            value={searchText}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(event) => {
              setIsSearchFocused(true);
              onSearchTextChange(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setIsSearchFocused(false);
                onSearchSubmit();
              }

              if (event.key === "Escape") {
                setIsSearchFocused(false);
                onSearchTextChange("");
              }
            }}
            autoComplete="off"
            placeholder="Search by character, category or description"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-24 text-sm outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />

          {searchText.trim() && (
            <button
              type="button"
              onClick={() => {
                setIsSearchFocused(false);
                onSearchTextChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {showSuggestions && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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
                    onClick={() => {
                      setIsSearchFocused(false);
                      onSuggestionSelect(suggestion);
                    }}
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

      <div className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <label
              htmlFor="dress-category"
              className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400"
            >
              Category
            </label>
            <p className="mt-1 text-xs text-slate-400">
              Select a category to show only dresses from that category
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-700">
            {Math.max(visibleCategories.length - 1, 0)} categories
          </span>
        </div>

        <div className="relative">
          <select
            id="dress-category"
            value={selectedCategory}
            onChange={(event) => onSelectedCategoryChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-bold text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          >
            {visibleCategories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            ▾
          </span>
        </div>
      </div>

      {selectedCategory !== "All" && visibleSubcategories.length > 0 && (
        <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">
              {selectedCategory}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Subcategories
            </span>
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={`${selectedCategory} subcategories`}
          >
            {["All", ...visibleSubcategories].map((subcategory) => {
              const active = selectedSubcategory === subcategory;

              return (
                <button
                  key={subcategory}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectedSubcategoryChange(subcategory)}
                  className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "border-pink-600 bg-pink-600 text-white shadow-sm"
                      : "border-pink-100 bg-white text-slate-700 hover:border-pink-300 hover:text-pink-700"
                  }`}
                >
                  {subcategory === "All"
                    ? `All ${selectedCategory}`
                    : subcategory}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
