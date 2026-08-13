"use client";

type Props = {
  categories: string[];
  subcategories: string[];
  searchText: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onSearchTextChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onSelectedSubcategoryChange: (value: string) => void;
};

export default function SearchFilters({
  categories,
  subcategories,
  searchText,
  selectedCategory,
  selectedSubcategory,
  onSearchTextChange,
  onSelectedCategoryChange,
  onSelectedSubcategoryChange,
}: Props) {
  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-4 shadow-sm md:p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Search by character, category or description"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-pink-400 focus:bg-white"
        />

        <select
          value={selectedCategory}
          onChange={(event) => onSelectedCategoryChange(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-pink-400"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>

        <select
          value={selectedSubcategory}
          onChange={(event) =>
            onSelectedSubcategoryChange(event.target.value)
          }
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-pink-400"
          disabled={subcategories.length === 0}
        >
          <option value="All">All Subcategories</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectedCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-slate-950 text-white shadow-md"
                  : "bg-pink-50 text-slate-700 hover:bg-pink-100"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {subcategories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <span className="px-2 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
            Subcategory
          </span>

          {["All", ...subcategories].map((subcategory) => {
            const active = selectedSubcategory === subcategory;

            return (
              <button
                key={subcategory}
                type="button"
                onClick={() => onSelectedSubcategoryChange(subcategory)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-pink-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-pink-50"
                }`}
              >
                {subcategory}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
