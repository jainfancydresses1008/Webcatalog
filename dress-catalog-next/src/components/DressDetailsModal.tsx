"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { DressDto } from "@/lib/dress-types";

type ContactLinks = {
  whatsapp: string;
  email: string;
  sms: string;
};

type Props = {
  dress: DressDto;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  onClose: () => void;
  contactLinks: ContactLinks;
};

export default function DressDetailsModal({
  dress,
  selectedSize,
  onSizeChange,
  onClose,
  contactLinks,
}: Props) {
  const images = [...dress.images].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [dress.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (images.length > 1 && event.key === "ArrowRight") {
        setSelectedIndex((current) => (current + 1) % images.length);
      }
      if (images.length > 1 && event.key === "ArrowLeft") {
        setSelectedIndex(
          (current) => (current - 1 + images.length) % images.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  const selectedImage = images[selectedIndex];
  const selectedSizeData =
    dress.sizes.find((size) => size.size === selectedSize) ?? dress.sizes[0];

  function previousImage() {
    setSelectedIndex(
      (current) => (current - 1 + images.length) % images.length,
    );
  }

  function nextImage() {
    setSelectedIndex((current) => (current + 1) % images.length);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${dress.characterName} dress details`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl font-black text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-white"
        >
          ×
        </button>

        <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2 md:p-8">
          <div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-100">
              {selectedImage ? (
                <>
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.altText ?? dress.characterName}
                    fill
                    priority
                    draggable={false}
                    onContextMenu={(event) => event.preventDefault()}
                    className="select-none object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <Image
                    src="/watermark/jain-fancy-dresses-watermark.png"
                    alt=""
                    fill
                    aria-hidden="true"
                    className="pointer-events-none object-contain opacity-40 mix-blend-multiply"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                  No image available
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-slate-800 shadow-lg hover:bg-white"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-slate-800 shadow-lg hover:bg-white"
                  >
                    →
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white">
                    {selectedIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === selectedIndex}
                    className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-24 sm:w-20 ${
                      index === selectedIndex
                        ? "ring-pink-600"
                        : "ring-transparent hover:ring-pink-200"
                    }`}
                  >
                    <>
                      <Image
                        src={image.url}
                        alt={image.altText ?? `Image ${index + 1}`}
                        fill
                        draggable={false}
                        onContextMenu={(event) => event.preventDefault()}
                        className="select-none object-cover"
                        sizes="80px"
                      />
                      {/* Watermark overlay */}
                      <Image
                        src="/watermark/jain-fancy-dresses-watermark.png"
                        alt=""
                        aria-hidden="true"
                        fill
                        className="pointer-events-none object-contain opacity-40 mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
              {dress.categoryRef.name}
              {dress.subcategory ? ` · ${dress.subcategory}` : ""}
            </p>

            <h2 className="mt-2 pr-10 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {dress.characterName}
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
              {dress.description}
            </p>

            {dress.sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-black text-slate-900">Choose size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dress.sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => onSizeChange(size.size)}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                        selectedSize === size.size
                          ? "border-pink-600 bg-pink-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50"
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-pink-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-600">
                Price
              </p>
              <p className="mt-1 text-3xl font-black text-slate-950">
                ₹{selectedSizeData?.price ?? "—"}
              </p>
              {selectedSizeData && (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Size {selectedSizeData.size}
                </p>
              )}
            </div>

            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-3">
              <a
                href={contactLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-black text-white shadow-sm hover:bg-green-700"
              >
                WhatsApp
              </a>
              <a
                href={contactLinks.email}
                className="rounded-2xl bg-pink-600 px-4 py-3 text-center text-sm font-black text-white shadow-sm hover:bg-pink-700"
              >
                Email
              </a>
              <a
                href={contactLinks.sms}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-black text-white shadow-sm hover:bg-slate-800"
              >
                SMS
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
