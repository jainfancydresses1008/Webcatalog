'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { DressDto } from '@/lib/dress-types';

type DressDetailsModalProps = {
  dress: DressDto;
  selectedSize: string;
  senderContact: string;
  onSizeChange: (size: string) => void;
  onSenderContactChange: (value: string) => void;
  onClose: () => void;
  contactLinks: { whatsapp: string; email: string; sms: string };
};

export default function DressDetailsModal({
  dress,
  selectedSize,
  senderContact,
  onSizeChange,
  onSenderContactChange,
  onClose,
  contactLinks
}: DressDetailsModalProps) {
  const firstImage = dress.images[0]?.url ?? '/images/placeholder-dress.svg';
  const [activeImage, setActiveImage] = useState(firstImage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{dress.characterName}</h2>
            <p className="text-sm text-slate-500">{dress.category} Dress Details</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200">Close</button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <div>
            <div className="relative h-[480px] overflow-hidden rounded-3xl bg-slate-100">
              <Image src={activeImage} alt={dress.characterName} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {dress.images.map((image) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setActiveImage(image.url)}
                  className={`relative h-24 overflow-hidden rounded-2xl border-2 ${activeImage === image.url ? 'border-slate-900' : 'border-transparent'}`}
                >
                  <Image src={image.url} alt={image.altText ?? 'Dress thumbnail'} fill sizes="25vw" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">Dress Information</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p><span className="font-semibold">Category:</span> {dress.category}</p>
                <p><span className="font-semibold">Character Name:</span> {dress.characterName}</p>
                <p><span className="font-semibold">Description:</span> {dress.description}</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">All Sizes and Prices</h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700"><tr><th className="p-3">Size</th><th className="p-3">Price</th></tr></thead>
                  <tbody>
                    {dress.sizes.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-3 font-semibold">{item.size}</td>
                        <td className="p-3">₹{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">Contact Seller</h3>
              <p className="mt-1 text-sm text-slate-600">Enter your contact number before sending inquiry.</p>
              <input value={senderContact} onChange={(event) => onSenderContactChange(event.target.value)} placeholder="Sender contact number" className="mt-4 w-full rounded-2xl border border-slate-300 p-3" />
              <select value={selectedSize} onChange={(event) => onSizeChange(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-300 p-3">
                {dress.sizes.map((item) => (<option key={item.id} value={item.size}>{item.size} - ₹{item.price}</option>))}
              </select>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center font-semibold">
                <a href={contactLinks.whatsapp} target="_blank" rel="noreferrer" className="rounded-2xl bg-green-600 px-4 py-3 text-white">WhatsApp</a>
                <a href={contactLinks.email} className="rounded-2xl bg-blue-600 px-4 py-3 text-white">Email</a>
                <a href={contactLinks.sms} className="rounded-2xl bg-slate-700 px-4 py-3 text-white">SMS</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
