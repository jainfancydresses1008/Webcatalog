"use client";

import Image from "next/image";
import type { DressDto } from "@/lib/dress-types";

type ContactLinks = {
  whatsapp: string;
  email: string;
  sms: string;
};

type Props = {
  dress: DressDto;
  selectedSize: string;
  selectedPrice: number;
  onSizeChange: (size: string) => void;
  onView: () => void;
  contactLinks: ContactLinks;
};

export default function DressCard({
  dress,
  selectedSize,
  selectedPrice,
  onSizeChange,
  onView,
  contactLinks,
}: Props) {
  const mainImage =
    dress.images.find((image) => image.isMain) ??
    [...dress.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return (
    <article className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:shadow-xl">
      <button
        type="button"
        onClick={onView}
        className="group block w-full text-left"
        aria-label={`View ${dress.characterName}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
          {mainImage ? (
            <>
              <Image
                src={mainImage.url}
                alt={mainImage.altText ?? dress.characterName}
                fill
                draggable={false}
                onContextMenu={(event) => event.preventDefault()}
                className="select-none object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Watermark overlay */}

              <Image
                src="/watermark/jain-fancy-dresses-watermark.png"
                alt=""
                fill
                aria-hidden="true"
                className="pointer-events-none object-contain opacity-40 mix-blend-multiply"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
              No image
            </div>
          )}

          {dress.images.length > 1 && (
            <span className="absolute right-3 top-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-black text-white">
              {dress.images.length} photos
            </span>
          )}
        </div>
      </button>

      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-pink-600">
          {dress.categoryRef.name}
          {dress.subcategory ? ` · ${dress.subcategory}` : ""}
        </p>

        <button
          type="button"
          onClick={onView}
          className="mt-1 text-left text-base font-black text-slate-950 hover:text-pink-600"
        >
          {dress.characterName}
        </button>

        {dress.sizes.length > 0 && (
          <select
            value={selectedSize}
            onChange={(event) => onSizeChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-pink-400"
            aria-label={`Size for ${dress.characterName}`}
          >
            {dress.sizes.map((size) => (
              <option key={size.id} value={size.size}>
                {size.size} — ₹{size.price}
              </option>
            ))}
          </select>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-black text-slate-950">₹{selectedPrice}</p>
          <button
            type="button"
            onClick={onView}
            className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-pink-600"
          >
            View
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <a
            href={contactLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-50 px-2 py-2 text-center text-[10px] font-black text-green-700 hover:bg-green-100"
          >
            WhatsApp
          </a>
          <a
            href={contactLinks.email}
            className="rounded-xl bg-pink-50 px-2 py-2 text-center text-[10px] font-black text-pink-700 hover:bg-pink-100"
          >
            Email
          </a>
          <a
            href={contactLinks.sms}
            className="rounded-xl bg-slate-100 px-2 py-2 text-center text-[10px] font-black text-slate-700 hover:bg-slate-200"
          >
            SMS
          </a>
        </div>
      </div>
    </article>
  );
}
