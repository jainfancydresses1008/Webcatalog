"use client";
import Image from "next/image";
import { useState } from "react";
import type { DressDto } from "@/lib/dress-types";
type Props = {
  dress: DressDto;
  selectedSize: string;
  onSizeChange: (s: string) => void;
  onClose: () => void;
  contactLinks: { whatsapp: string; email: string; sms: string };
};
export default function DressDetailsModal({
  dress,
  selectedSize,
  onSizeChange,
  onClose,
  contactLinks,
}: Props) {
  const firstImage = dress.images[0]?.url ?? "/images/placeholder-dress.svg";
  const [activeImage, setActiveImage] = useState(firstImage);
  const selectedPrice =
    dress.sizes.find((x) => x.size === selectedSize)?.price ??
    dress.sizes[0]?.price ??
    0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-pink-600">
              {dress.category}
            </p>
            <h2 className="text-2xl font-black text-slate-950">
              {dress.characterName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <div>
            <div className="relative h-[480px] overflow-hidden rounded-3xl bg-slate-100">
              <Image
                src={activeImage}
                alt={dress.characterName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {dress.images.map((img) => (
                <button
                  type="button"
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative h-24 overflow-hidden rounded-2xl border-2 ${activeImage === img.url ? "border-pink-600" : "border-transparent"}`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? "Dress thumbnail"}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                Dress Information
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-bold">Category:</span> {dress.category}
                </p>
                <p>
                  <span className="font-bold">Subcategory:</span> {dress.subcategory}
                </p>
                <p>
                  <span className="font-bold">Character Name:</span>{" "}
                  {dress.characterName}
                </p>
                <p>
                  <span className="font-bold">Description:</span>{" "}
                  {dress.description}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">Choose Size</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {dress.sizes.map((item) => {
                  const active = selectedSize === item.size;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onSizeChange(item.size)}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition ${active ? "border-pink-600 bg-pink-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-pink-50"}`}
                    >
                      {item.size} · ₹{item.price}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Selected Price</p>
                <p className="text-3xl font-black text-slate-950">
                  ₹{selectedPrice}
                </p>
              </div>
            </div>
            <div id="contact" className="mt-5 rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-950">
                Contact Seller
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Seller contact number is +91 8826163522.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center font-semibold">
                <a
                  href={contactLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-green-600 px-4 py-3 text-white hover:bg-green-700"
                >
                  WhatsApp
                </a>
                <a
                  href={contactLinks.email}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                >
                  Email
                </a>
                <a
                  href={contactLinks.sms}
                  className="rounded-2xl bg-slate-700 px-4 py-3 text-white hover:bg-slate-800"
                >
                  SMS
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
