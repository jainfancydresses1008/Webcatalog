"use client";

import { useMemo, useState } from "react";

type PriceChartSize = {
  size: string;
  purchasePrice: number;
  price: number;
};

type PriceChartDress = {
  id: number;
  characterName: string;
  isActive: boolean;
  category: string;
  sizes: PriceChartSize[];
};

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function isNotApplicableSize(value: string) {
  const normalized = value.trim().toLowerCase();
  return [
    "",
    "n/a",
    "na",
    "not applicable",
    "not-applicable",
    "not applicable size",
    "one size",
    "one-size",
    "free size",
    "free-size",
    "none",
    "-",
  ].includes(normalized);
}

function isSizeSelectable(dress: PriceChartDress) {
  return !dress.category.trim().toLowerCase().includes("accessor") &&
    dress.sizes.some((item) => !isNotApplicableSize(item.size));
}

function sizeRank(value: string) {
  const normalized = value.trim().toUpperCase();
  if (isNotApplicableSize(value)) return -1;

  const numeric = Number(normalized);
  if (Number.isFinite(numeric)) return 1000 + numeric;

  const letterRanks: Record<string, number> = {
    XS: 2001,
    S: 2002,
    M: 2003,
    L: 2004,
    XL: 2005,
    XXL: 2006,
    XXXL: 2007,
    "4XL": 2008,
    "5XL": 2009,
  };

  if (letterRanks[normalized]) return letterRanks[normalized];

  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) return 900 + Number(numberMatch[1]);

  return 0;
}

function highestSize(dress: PriceChartDress) {
  return [...dress.sizes].sort((a, b) => {
    const rankDifference = sizeRank(b.size) - sizeRank(a.size);
    if (rankDifference !== 0) return rankDifference;
    return a.size.localeCompare(b.size, undefined, { numeric: true, sensitivity: "base" });
  })[0] ?? null;
}

export default function PriceChartClient({ dresses }: { dresses: PriceChartDress[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedDressId, setSelectedDressId] = useState<number | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(dresses.map((dress) => dress.category))).sort((a, b) => a.localeCompare(b)),
    [dresses],
  );

  const filteredDresses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return dresses.filter((dress) => {
      const matchesSearch = !query ||
        dress.characterName.toLowerCase().includes(query) ||
        dress.category.toLowerCase().includes(query) ||
        dress.sizes.some((size) => size.size.toLowerCase().includes(query));
      const matchesCategory = category === "all" || dress.category === category;
      const matchesStatus = status === "all" ||
        (status === "visible" ? dress.isActive : !dress.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [category, dresses, search, status]);

  const displayRows = useMemo(
    () => filteredDresses.map((dress) => ({ dress, size: highestSize(dress) })),
    [filteredDresses],
  );

  const selectedDress = selectedDressId == null
    ? null
    : filteredDresses.find((dress) => dress.id === selectedDressId) ?? dresses.find((dress) => dress.id === selectedDressId) ?? null;

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setSelectedDressId(null);
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-black uppercase tracking-wide text-slate-500">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dress or character..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-pink-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black uppercase tracking-wide text-slate-500">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-pink-400"
            >
              <option value="all">All Categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black uppercase tracking-wide text-slate-500">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-pink-400"
            >
              <option value="all">All</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 md:px-5">
          <div>
            <p className="text-sm font-black text-slate-900">Price overview</p>
            <p className="text-xs font-semibold text-slate-500">Showing the highest applicable size for each dress. Select a row to view all size rates.</p>
          </div>
          <p className="text-sm font-black text-slate-500">{displayRows.length} dress{displayRows.length === 1 ? "" : "es"}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 font-black">Category</th>
                <th className="whitespace-nowrap px-4 py-4 font-black">Dress</th>
                <th className="whitespace-nowrap px-4 py-4 font-black">Highest Size</th>
                <th className="whitespace-nowrap px-4 py-4 font-black">Purchase Rate</th>
                <th className="whitespace-nowrap px-4 py-4 font-black">Selling Rate</th>
                <th className="whitespace-nowrap px-4 py-4 font-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRows.map(({ dress, size }) => {
                const selectable = isSizeSelectable(dress) && Boolean(size);
                const selected = dress.id === selectedDressId;
                const rowClass = `${selectable ? "cursor-pointer hover:bg-pink-50" : "cursor-default bg-slate-50/40"} ${selected ? "bg-pink-50" : ""}`;
                const rowContent = (
                  <>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-600">{dress.category}</td>
                    <td className="min-w-48 px-4 py-4 font-black text-slate-900">{dress.characterName}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-black text-slate-700">{size?.size ?? "N/A"}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-black text-amber-700">{size ? (size.purchasePrice > 0 ? money(size.purchasePrice) : "Not Set") : "N/A"}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-black text-emerald-700">{size ? money(size.price) : "N/A"}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${dress.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {dress.isActive ? "Visible" : "Hidden"}
                      </span>
                    </td>
                  </>
                );

                return selectable ? (
                  <tr
                    key={dress.id}
                    className={rowClass}
                    onClick={() => setSelectedDressId(dress.id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedDressId(dress.id);
                      }
                    }}
                    aria-selected={selected}
                    title="Select to view all size rates"
                  >
                    {rowContent}
                  </tr>
                ) : (
                  <tr key={dress.id} className={rowClass} title="Size not applicable for this accessory">
                    {rowContent}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!displayRows.length && (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">No dresses match the selected filters.</div>
        )}
      </section>

      {selectedDress && isSizeSelectable(selectedDress) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="price-chart-dialog-title"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 md:px-6">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-600">
                  Size Chart
                </p>
                <h3
                  id="price-chart-dialog-title"
                  className="mt-1 text-2xl font-black text-slate-950"
                >
                  {selectedDress.characterName}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Category: <span className="text-slate-700">{selectedDress.category}</span>
                  <span className="mx-2">•</span>
                  Status: <span className="text-slate-700">{selectedDress.isActive ? "Visible" : "Hidden"}</span>
                </p>
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-5 md:px-6">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-black">Size</th>
                      <th className="whitespace-nowrap px-4 py-3 font-black">Purchase Rate</th>
                      <th className="whitespace-nowrap px-4 py-3 font-black">Selling Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...selectedDress.sizes]
                      .sort((a, b) => sizeRank(a.size) - sizeRank(b.size))
                      .map((size, index) => (
                        <tr key={`${selectedDress.id}-${size.size}-${index}`}>
                          <td className="whitespace-nowrap px-4 py-3 font-black text-slate-800">{size.size}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-black text-amber-700">
                            {size.purchasePrice > 0 ? money(size.purchasePrice) : "Not Set"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-black text-emerald-700">
                            {money(size.price)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4 md:px-6">
              <button
                type="button"
                onClick={() => setSelectedDressId(null)}
                className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-black text-white hover:bg-pink-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
