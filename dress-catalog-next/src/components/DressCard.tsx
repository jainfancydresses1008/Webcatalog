'use client';

import Image from 'next/image';
import type { DressDto } from '@/lib/dress-types';

type DressCardProps = {
  dress: DressDto;
  selectedSize: string;
  selectedPrice: number;
  onSizeChange: (size: string) => void;
  onView: () => void;
  contactLinks: { whatsapp: string; email: string; sms: string };
};

export default function DressCard({ dress, selectedSize, selectedPrice, onSizeChange, onView, contactLinks }: DressCardProps) {
  const mainImage = dress.images[0]?.url ?? '/images/placeholder-dress.svg';

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <button type="button" onClick={onView} className="relative block h-80 w-full overflow-hidden bg-slate-100 text-left">
        <Image src={mainImage} alt={dress.characterName} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-300 hover:scale-105" />
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{dress.characterName}</h2>
            <p className="mt-1 text-sm text-slate-500">Category: {dress.category}</p>
          </div>
          <button type="button" onClick={onView} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">View</button>
        </div>

        <p className="mt-3 min-h-12 text-sm text-slate-700">{dress.description}</p>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">Available Size</label>
          <select value={selectedSize} onChange={(event) => onSizeChange(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-300 p-3">
            {dress.sizes.map((item) => (<option key={item.id} value={item.size}>{item.size}</option>))}
          </select>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-100 p-4">
          <p className="text-sm text-slate-500">Selected Price</p>
          <p className="text-2xl font-bold text-slate-900">₹{selectedPrice}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
          <a href={contactLinks.whatsapp} target="_blank" rel="noreferrer" className="rounded-xl bg-green-600 px-3 py-2 text-white">WhatsApp</a>
          <a href={contactLinks.email} className="rounded-xl bg-blue-600 px-3 py-2 text-white">Email</a>
          <a href={contactLinks.sms} className="rounded-xl bg-slate-700 px-3 py-2 text-white">SMS</a>
        </div>
      </div>
    </div>
  );
}
