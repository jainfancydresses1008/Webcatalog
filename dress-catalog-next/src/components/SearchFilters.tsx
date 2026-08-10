'use client';

type SearchFiltersProps = {
  categories: string[];
  searchText: string;
  selectedCategory: string;
  senderContact: string;
  onSearchTextChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onSenderContactChange: (value: string) => void;
};

export default function SearchFilters({
  categories,
  searchText,
  selectedCategory,
  senderContact,
  onSearchTextChange,
  onSelectedCategoryChange,
  onSenderContactChange
}: SearchFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-3">
      <input
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        placeholder="Search by category, character or description"
        className="rounded-2xl border border-slate-300 p-3 md:col-span-2"
      />

      <select
        value={selectedCategory}
        onChange={(event) => onSelectedCategoryChange(event.target.value)}
        className="rounded-2xl border border-slate-300 p-3"
      >
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <input
        value={senderContact}
        onChange={(event) => onSenderContactChange(event.target.value)}
        placeholder="Sender contact number"
        className="rounded-2xl border border-slate-300 p-3 md:col-span-3"
      />
    </div>
  );
}
