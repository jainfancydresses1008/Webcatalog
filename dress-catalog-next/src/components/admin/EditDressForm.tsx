'use client';

import { useState, useTransition } from 'react';
import type { DressDto } from '@/lib/dress-types';

type Props = { dress: DressDto & { isActive?: boolean }; updateDressDetailsAction: (formData: FormData) => Promise<void> };

export default function EditDressForm({ dress, updateDressDetailsAction }: Props) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const defaultSizes = dress.sizes.map((i) => i.size).join(', ');
  const defaultPrices = dress.sizes.map((i) => i.price).join(', ');

  function submit(formData: FormData) {
    setMessage('');
    startTransition(async () => {
      try {
        await updateDressDetailsAction(formData);
        setMessage('Dress updated successfully.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to update dress.');
      }
    });
  }

  return (
    <form action={submit} className="rounded-3xl bg-white p-5 shadow-sm">
      <input type="hidden" name="dressId" value={dress.id} />
      <h2 className="text-2xl font-black text-slate-950">Edit Dress Details</h2>
      {message && <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">{message}</div>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input name="category" defaultValue={dress.category} required className="rounded-2xl border border-slate-300 p-3" />
        <input name="characterName" defaultValue={dress.characterName} required className="rounded-2xl border border-slate-300 p-3" />
        <textarea name="description" defaultValue={dress.description} required className="min-h-24 rounded-2xl border border-slate-300 p-3 md:col-span-2" />
        <input name="sizes" defaultValue={defaultSizes} required className="rounded-2xl border border-slate-300 p-3" />
        <input name="prices" defaultValue={defaultPrices} required className="rounded-2xl border border-slate-300 p-3" />
        <label className="flex items-center gap-2 rounded-2xl border border-slate-300 p-3 text-sm font-bold text-slate-700 md:col-span-2">
          <input name="isActive" type="checkbox" defaultChecked={dress.isActive ?? true} />
          Display this dress on public catalog
        </label>
      </div>
      <button disabled={isPending} type="submit" className="mt-4 rounded-2xl bg-pink-600 px-5 py-3 font-bold text-white hover:bg-pink-700 disabled:opacity-60">{isPending ? 'Saving...' : 'Save Changes'}</button>
    </form>
  );
}
