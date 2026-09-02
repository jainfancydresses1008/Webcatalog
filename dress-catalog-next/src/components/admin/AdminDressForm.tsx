"use client";

import { type ChangeEvent, type FormEvent, useRef, useState, useTransition } from "react";
import type { CategoryDto } from "@/lib/dress-types";

type Props = {
  createDressAction: (formData: FormData) => Promise<void>;
  categories: Pick<CategoryDto, "id" | "name">[];
};
type ImageItem = { id: string; file: File; isMain: boolean };

export default function AdminDressForm({ createDressAction, categories }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const mainFileRef = useRef<HTMLInputElement>(null);
  const galleryFilesRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState("");

  function syncFiles(items: ImageItem[]) {
    const main = items.find((x) => x.isMain)?.file;
    const gallery = items.filter((x) => !x.isMain).map((x) => x.file);
    if (mainFileRef.current) {
      const dt = new DataTransfer();
      if (main) dt.items.add(main);
      mainFileRef.current.files = dt.files;
    }
    if (galleryFilesRef.current) {
      const dt = new DataTransfer();
      gallery.forEach((file) => dt.items.add(file));
      galleryFilesRef.current.files = dt.files;
    }
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const added = Array.from(files).map((file, i) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${i}-${Date.now()}`,
      file,
      isMain: false,
    }));
    setImages((current) => {
      const next = [...current, ...added];
      if (!next.some((x) => x.isMain) && next.length) next[0].isMain = true;
      syncFiles(next);
      return next;
    });
    if (pickerRef.current) pickerRef.current.value = "";
  }

  function setMain(id: string) {
    setImages((current) => {
      const next = current.map((x) => ({ ...x, isMain: x.id === id }));
      syncFiles(next);
      return next;
    });
    setMainImageUrl("");
  }

  function removeImage(id: string) {
    setImages((current) => {
      let next = current.filter((x) => x.id !== id);
      if (current.find((x) => x.id === id)?.isMain && next.length) {
        next = next.map((x, i) => ({ ...x, isMain: i === 0 }));
      }
      syncFiles(next);
      return next;
    });
  }

  function useMainUrl(value: string) {
    setMainImageUrl(value);
    if (value.trim()) {
      setImages((current) => {
        const next = current.map((x) => ({ ...x, isMain: false }));
        syncFiles(next);
        return next;
      });
    }
  }

  function submit(formData: FormData) {
    syncFiles(images);
    setMessage("");
    startTransition(async () => {
      try {
        await createDressAction(formData);
        formRef.current?.reset();
        setImages([]);
        setMainImageUrl("");
        setMessage("Dress added successfully.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to add dress.");
      }
    });
  }

  function handleSubmit(_event: FormEvent<HTMLFormElement>) {
    syncFiles(images);
  }

  return (
    <form ref={formRef} action={submit} onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_35px_rgba(236,72,153,0.08)] md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-pink-600">Admin Panel</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Add New Dress</h2>
            <p className="mt-1 text-sm text-slate-500 md:text-base">Add dress details and manage all images before saving.</p>
          </div>
          <a href="/admin/manage" className="inline-flex w-fit rounded-full border border-pink-200 bg-pink-50 px-5 py-3 text-sm font-black text-pink-600 hover:bg-pink-100">← Back to Manage Dresses</a>
        </div>
        {message && <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50 p-4 text-sm font-semibold text-pink-700">{message}</div>}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-xl font-black text-slate-950">Dress Details</h3>
        <p className="mt-1 text-sm text-slate-500">Enter the information that will appear in the catalog.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <select name="categoryId" required defaultValue="" className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100">
            <option value="" disabled>Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input name="subcategory" placeholder="Subcategory" className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100" />
          <input name="characterName" placeholder="Character Name" required className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 md:col-span-2" />
          <textarea name="description" placeholder="Description" required className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 md:col-span-2" />
          <input name="sizes" defaultValue="S, M, L" placeholder="Sizes: S, M, L" required className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100" />
          <input name="prices" defaultValue="1000, 1200, 1400" placeholder="Prices: 1000, 1200, 1400" required className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100" />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white p-5 shadow-[0_10px_35px_rgba(236,72,153,0.08)] md:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-xl text-pink-600">♡</div>
              <div>
                <h3 className="text-2xl font-black text-slate-950">Manage Images</h3>
                <p className="text-sm text-slate-500">Upload images, choose the main image and remove unwanted images.</p>
              </div>
            </div>
          </div>
        </div>

        <input ref={pickerRef} type="file" accept="image/*" multiple onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)} className="hidden" />
        <input ref={mainFileRef} name="imageFile" type="file" accept="image/*" className="hidden" tabIndex={-1} aria-hidden="true" />
        <input ref={galleryFilesRef} name="galleryFiles" type="file" accept="image/*" multiple className="hidden" tabIndex={-1} aria-hidden="true" />

        <button type="button" onClick={() => pickerRef.current?.click()} className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-50/70 to-white px-5 py-6 text-center hover:border-pink-400 hover:bg-pink-50">
          <span className="text-3xl text-pink-500">↑</span>
          <span className="mt-2 text-sm font-black text-pink-600">Upload Images</span>
          <span className="mt-1 text-xs text-slate-500">Select multiple images at once. The first image becomes Main by default.</span>
        </button>

        {images.length ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-500">Selected Images ({images.length})</h4>
              <span className="hidden text-xs font-semibold text-slate-400 md:block">Choose which image should be the main image.</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((image) => {
                const preview = URL.createObjectURL(image.file);
                return (
                  <div key={image.id} className={`overflow-hidden rounded-2xl border-2 bg-white ${image.isMain ? "border-pink-400 shadow-[0_8px_25px_rgba(236,72,153,0.14)]" : "border-slate-100"}`}>
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <img src={preview} alt={image.file.name} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(image.id)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sm font-black shadow hover:bg-red-50 hover:text-red-600">×</button>
                      {image.isMain && <span className="absolute left-2 top-2 rounded-full bg-pink-600 px-3 py-1 text-[11px] font-black text-white">MAIN IMAGE</span>}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-xs font-bold text-slate-600">{image.file.name}</p>
                      {!image.isMain ? <button type="button" onClick={() => setMain(image.id)} className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-pink-600">Set as Main</button> : <div className="mt-3 rounded-xl bg-pink-50 px-3 py-2 text-center text-xs font-black text-pink-600">Primary catalog image</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
            <div className="text-3xl">🖼️</div>
            <p className="mt-2 text-sm font-black text-slate-700">No images selected yet</p>
            <p className="mt-1 text-xs text-slate-500">Upload one or more images. The first image becomes the Main Image.</p>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50/60 p-4 text-sm text-slate-600"><span className="font-black text-pink-600">Tip:</span> The image marked <strong>Main Image</strong> becomes the primary catalog image. All others are saved as gallery images.</div>

      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <button disabled={isPending} type="submit" className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 px-6 py-4 text-base font-black text-white shadow-[0_10px_25px_rgba(219,39,119,0.25)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? "Adding Dress..." : "＋ Add Dress"}</button>
      </section>
    </form>
  );
}
