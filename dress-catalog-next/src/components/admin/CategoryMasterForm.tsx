"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import type { CategoryDto } from "@/lib/dress-types";

type Props = {
  category?: CategoryDto | null;
  createCategoryAction: (formData: FormData) => Promise<void>;
  updateCategoryAction: (formData: FormData) => Promise<void>;
};

export default function CategoryMasterForm({
  category,
  createCategoryAction,
  updateCategoryAction,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const editing = Boolean(category);

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      try {
        if (editing) {
          await updateCategoryAction(formData);
          setMessage("Category updated successfully.");
        } else {
          await createCategoryAction(formData);
          formRef.current?.reset();
          setMessage("Category added successfully.");
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to save category.",
        );
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!editing) return;
    // The server action is attached through the form action below.
    // This handler intentionally does not prevent the native submission.
    void event;
  }

  return (
    <form
      ref={formRef}
      action={submit}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <span className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-pink-600">
            Category Master
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {editing ? "Edit Category" : "Add Category"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Maintain the category name, description and Cloudinary poster used by the catalog.
          </p>
        </div>
        {editing && (
          <a
            href="/admin/categories"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            + New Category
          </a>
        )}
      </div>

      {message && (
        <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50 p-4 text-sm font-semibold text-pink-700">
          {message}
        </div>
      )}

      {editing && <input type="hidden" name="categoryId" value={category!.id} />}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Category ID
          </label>
          <input
            value={category?.id ?? "Auto-generated"}
            readOnly
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-3.5 font-bold text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Category ID is generated automatically by PostgreSQL/Prisma.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Category Name <span className="text-pink-600">*</span>
          </label>
          <input
            name="name"
            required
            defaultValue={category?.name ?? ""}
            placeholder="e.g. Princess"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={category?.description ?? ""}
            placeholder="Description for this category"
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Cloudinary Poster URL
          </label>
          <input
            name="posterUrl"
            defaultValue={category?.posterUrl ?? ""}
            placeholder="https://res.cloudinary.com/..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />
          <p className="mt-1 text-xs text-slate-400">
            Paste the Cloudinary secure URL, or upload a poster below.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Upload Poster to Cloudinary
          </label>
          <input
            name="posterFile"
            type="file"
            accept="image/*"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-600"
          />
          <p className="mt-1 text-xs text-slate-400">
            An uploaded file takes priority over the URL.
          </p>
        </div>
      </div>

      {category?.posterUrl && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img
            src={category.posterUrl}
            alt={`${category.name} poster`}
            className="h-52 w-full object-cover"
          />
        </div>
      )}

      <button
        disabled={isPending}
        type="submit"
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? editing
            ? "Updating Category..."
            : "Adding Category..."
          : editing
            ? "Save Category Changes"
            : "＋ Add Category"}
      </button>
    </form>
  );
}
