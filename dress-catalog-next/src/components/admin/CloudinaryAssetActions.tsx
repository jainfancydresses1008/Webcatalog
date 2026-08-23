"use client";

import { useRef } from "react";
import {
  attachCloudinaryImage,
  permanentlyDeleteCloudinaryImage,
} from "@/app/actions";

type DressOption = {
  id: number;
  characterName: string;
};

export default function CloudinaryAssetActions({
  publicId,
  url,
  dressOptions,
}: {
  publicId: string;
  url: string;
  dressOptions: DressOption[];
}) {
  const attachFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  function attach() {
    const dressId = window.prompt(
      `Enter Dress ID to reuse this image:\n\n${dressOptions
        .slice(0, 30)
        .map((dress) => `${dress.id}: ${dress.characterName}`)
        .join("\n")}`,
    );

    if (!dressId) return;

    const dress = dressOptions.find(
      (item) => item.id === Number(dressId),
    );

    if (!dress) {
      window.alert("Invalid Dress ID.");
      return;
    }

    const pin = window.prompt(
      `Enter admin PIN to attach this image to ${dress.characterName}:`,
    );

    if (pin === null) return;

    const form = attachFormRef.current;

    if (!form) return;

    const dressIdInput = form.elements.namedItem(
      "dressId",
    ) as HTMLInputElement;

    const publicIdInput = form.elements.namedItem(
      "publicId",
    ) as HTMLInputElement;

    const urlInput = form.elements.namedItem(
      "url",
    ) as HTMLInputElement;

    const pinInput = form.elements.namedItem(
      "pin",
    ) as HTMLInputElement;

    dressIdInput.value = dressId;
    publicIdInput.value = publicId;
    urlInput.value = url;
    pinInput.value = pin;

    form.requestSubmit();
  }

  function remove() {
    if (
      !window.confirm(
        `Permanently delete Cloudinary image ${publicId}? This cannot be undone.`,
      )
    ) {
      return;
    }

    const pin = window.prompt(
      "Enter admin PIN to permanently delete this Cloudinary image:",
    );

    if (pin === null) return;

    const form = deleteFormRef.current;

    if (!form) return;

    const publicIdInput = form.elements.namedItem(
      "publicId",
    ) as HTMLInputElement;

    const urlInput = form.elements.namedItem(
      "url",
    ) as HTMLInputElement;

    const pinInput = form.elements.namedItem(
      "pin",
    ) as HTMLInputElement;

    publicIdInput.value = publicId;
    urlInput.value = url;
    pinInput.value = pin;

    form.requestSubmit();
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <form
        ref={attachFormRef}
        action={attachCloudinaryImage}
      >
        <input type="hidden" name="dressId" />
        <input type="hidden" name="publicId" />
        <input type="hidden" name="url" />
        <input type="hidden" name="pin" />

        <button
          type="button"
          onClick={attach}
          className="w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          Reuse
        </button>
      </form>

      <form
        ref={deleteFormRef}
        action={permanentlyDeleteCloudinaryImage}
      >
        <input type="hidden" name="publicId" />
        <input type="hidden" name="url" />
        <input type="hidden" name="pin" />

        <button
          type="button"
          onClick={remove}
          className="w-full rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
        >
          Delete
        </button>
      </form>
    </div>
  );
}