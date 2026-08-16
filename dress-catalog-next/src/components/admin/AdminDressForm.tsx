"use client";

import { useRef, useState, useTransition } from "react";

type Props = { createDressAction: (formData: FormData) => Promise<void> };

export default function AdminDressForm({ createDressAction }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      try {
        await createDressAction(formData);
        formRef.current?.reset();
        setMessage("Dress added successfully.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to add dress.",
        );
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={submit}
      className="rounded-3xl bg-white p-5 shadow-sm"
    >
      <h2 className="text-2xl font-black text-slate-950">Add New Dress</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload a dress image to Cloudinary or paste an image URL.
      </p>
      {message && (
        <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          name="category"
          placeholder="Category"
          required
          className="rounded-2xl border border-slate-300 p-3"
        />
        <input
          name="subcategory"
          placeholder="Subcategory"
          required
          className="rounded-2xl border border-slate-300 p-3"
        />
        <input
          name="characterName"
          placeholder="Character Name"
          required
          className="rounded-2xl border border-slate-300 p-3"
        />
        <label className="text-sm font-bold text-slate-700 md:col-span-2">
          Main Image
        </label>
        <input
          name="imageUrl"
          placeholder="Main image URL, optional if uploading file"
          className="rounded-2xl border border-slate-300 p-3 md:col-span-2"
        />
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          className="rounded-2xl border border-slate-300 bg-white p-3 md:col-span-2"
        />
        <textarea
          name="description"
          placeholder="Description"
          required
          className="min-h-24 rounded-2xl border border-slate-300 p-3 md:col-span-2"
        />
        <input
          name="sizes"
          defaultValue="S, M, L"
          required
          className="rounded-2xl border border-slate-300 p-3"
        />
        <input
          name="prices"
          defaultValue="1000, 1200, 1400"
          required
          className="rounded-2xl border border-slate-300 p-3"
        />
        <label className="text-sm font-bold text-slate-700 md:col-span-2">
          Gallery Images (one URL per line)
        </label>
        <textarea
          name="galleryUrls"
          placeholder="Optional gallery image URLs, one per line"
          className="min-h-24 rounded-2xl border border-slate-300 p-3 md:col-span-2"
        />
      </div>
      <button
        disabled={isPending}
        type="submit"
        className="mt-4 rounded-2xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add Dress"}
      </button>
    </form>
  );
}
