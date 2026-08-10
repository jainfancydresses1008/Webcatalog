'use client';

import { useRef, useState, useTransition } from 'react';

type AdminDressFormProps = {
  createDressAction: (formData: FormData) => Promise<void>;
};

export default function AdminDressForm({ createDressAction }: AdminDressFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function onSubmit(formData: FormData) {
    setMessage('');
    startTransition(async () => {
      try {
        await createDressAction(formData);
        formRef.current?.reset();
        setMessage('Dress added successfully.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to add dress.');
      }
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Admin Add Dress Form</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload a dress image to Cloudinary or paste an image URL. Sizes and prices must match by position.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <input name="adminPassword" type="password" placeholder="Admin password" required className="rounded-2xl border border-slate-300 p-3 md:col-span-2" />
        <input name="category" placeholder="Category, example Princess" required className="rounded-2xl border border-slate-300 p-3" />
        <input name="characterName" placeholder="Character Name, example Elsa" required className="rounded-2xl border border-slate-300 p-3" />
        <input name="imageUrl" placeholder="Main image URL, optional if uploading file" className="rounded-2xl border border-slate-300 p-3 md:col-span-2" />
        <input name="imageFile" type="file" accept="image/*" className="rounded-2xl border border-slate-300 bg-white p-3 md:col-span-2" />
        <textarea name="description" placeholder="Description" required className="min-h-24 rounded-2xl border border-slate-300 p-3 md:col-span-2" />
        <input name="sizes" defaultValue="S, M, L" placeholder="Sizes, example S, M, L" required className="rounded-2xl border border-slate-300 p-3" />
        <input name="prices" defaultValue="1000, 1200, 1400" placeholder="Prices, example 1000, 1200, 1400" required className="rounded-2xl border border-slate-300 p-3" />
        <textarea name="galleryUrls" placeholder="Optional gallery image URLs, one URL per line" className="min-h-24 rounded-2xl border border-slate-300 p-3 md:col-span-2" />
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <button disabled={isPending} type="submit" className="rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60">
          {isPending ? 'Adding...' : 'Add Dress to Catalog'}
        </button>
        <button type="reset" className="rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-300">
          Clear Form
        </button>
      </div>
    </form>
  );
}
