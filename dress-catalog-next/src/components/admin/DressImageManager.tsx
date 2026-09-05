"use client";

import { useState, useTransition } from "react";
import type { DressDto } from "@/lib/dress-types";

type Props = {
  dress: DressDto;
  addGalleryImageAction: (formData: FormData) => Promise<void>;
  replaceDressImageAction: (formData: FormData) => Promise<void>;
  deleteDressImageAction: (formData: FormData) => Promise<void>;
  setMainDressImageAction: (formData: FormData) => Promise<void>;
};

export default function DressImageManager({
  dress,
  addGalleryImageAction,
  replaceDressImageAction,
  deleteDressImageAction,
  setMainDressImageAction,
}: Props) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(
    action: (formData: FormData) => Promise<void>,
    formData: FormData,
    success: string,
  ) {
    setMessage("");
    startTransition(async () => {
      try {
        await action(formData);
        setMessage(success);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Action failed.");
      }
    });
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">Manage Images</h2>
      <p className="text-sm text-slate-500">
        Replace, delete, or set main image for {dress.characterName}.
      </p>
      {message && (
        <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dress.images.map((image) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
          >
            <div className="aspect-[4/3] bg-slate-200">
              <img
                src={image.url}
                alt={image.altText ?? dress.characterName}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="space-y-3 p-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span
                  className={image.isMain ? "text-pink-600" : "text-slate-500"}
                >
                  {image.isMain ? "Main Image" : "Gallery Image"}
                </span>
                <span className="text-slate-400">ID: {image.id}</span>
              </div>
              <form
                action={(fd) =>
                  run(
                    replaceDressImageAction,
                    fd,
                    "Image replaced successfully.",
                  )
                }
                className="space-y-2"
              >
                <input type="hidden" name="imageId" value={image.id} />
                <input
                  name="imageUrl"
                  placeholder="New image URL, optional if uploading file"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                />
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 text-sm"
                />
                <button
                  disabled={isPending}
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  Replace Image
                </button>
              </form>
              <div className="grid grid-cols-2 gap-2">
                {!image.isMain && (
                  <form
                    action={(fd) =>
                      run(
                        setMainDressImageAction,
                        fd,
                        "Main image updated successfully.",
                      )
                    }
                  >
                    <input type="hidden" name="imageId" value={image.id} />
                    <button
                      disabled={isPending}
                      type="submit"
                      className="w-full rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-60"
                    >
                      Set Main
                    </button>
                  </form>
                )}
                <form
                  action={(fd) =>
                    run(
                      deleteDressImageAction,
                      fd,
                      "Image removed from dress. Cloudinary asset retained.",
                    )
                  }
                  onSubmit={(event) => {
                    if (
                      !confirm(
                        "Remove this image from this dress? The Cloudinary asset will be kept for reuse.",
                      )
                    ) {
                      event.preventDefault();
                      return;
                    }
                    const pin = window.prompt(
                      "Enter your admin security PIN to remove this image:",
                    );
                    if (pin === null) {
                      event.preventDefault();
                      return;
                    }
                    const input =
                      event.currentTarget.querySelector<HTMLInputElement>(
                        "input[name=pin]",
                      );
                    if (input) input.value = pin;
                  }}
                  className={!image.isMain ? "" : "col-span-2"}
                >
                  <input type="hidden" name="imageId" value={image.id} />
                  <input type="hidden" name="pin" value="" />
                  <button
                    disabled={isPending}
                    type="submit"
                    className="w-full rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Delete Image
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form
        action={(fd) =>
          run(addGalleryImageAction, fd, "Gallery image added successfully.")
        }
        className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-3"
      >
        <input type="hidden" name="dressId" value={dress.id} />
        <input
          name="imageUrl"
          placeholder="Gallery image URL, optional if uploading file"
          className="rounded-xl border border-slate-300 p-2 text-sm md:col-span-2"
        />
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          className="rounded-xl border border-slate-300 bg-white p-2 text-sm"
        />
        <button
          disabled={isPending}
          type="submit"
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60 md:col-span-3"
        >
          Add Gallery Image
        </button>
      </form>
    </section>
  );
}
