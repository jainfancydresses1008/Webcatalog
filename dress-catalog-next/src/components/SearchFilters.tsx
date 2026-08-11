"use client";
type Props = {
  categories: string[];
  searchText: string;
  selectedCategory: string;
  onSearchTextChange: (v: string) => void;
  onSelectedCategoryChange: (v: string) => void;
};
export default function SearchFilters({
  categories,
  searchText,
  selectedCategory,
  onSearchTextChange,
  onSelectedCategoryChange,
}: Props) {
  return (
    <section className="mb-8 rounded-3xl bg-white p-4 shadow-sm md:p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <input
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Search by character, category or description"
          className="rounded-2xl border border-slate-300 bg-slate-50 p-3 outline-none transition focus:border-pink-400 focus:bg-white md:col-span-2"
        />

      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectedCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-slate-950 text-white shadow-md" : "bg-pink-50 text-slate-700 hover:bg-pink-100"}`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}
