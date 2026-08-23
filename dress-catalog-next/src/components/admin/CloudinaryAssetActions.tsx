"use client";

import { useMemo, useRef, useState } from "react";
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

  const [showDressPicker, setShowDressPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedDress, setSelectedDress] = useState<DressOption | null>(null);

  const filteredDresses = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return dressOptions.slice(0, 20);
    }

    return dressOptions
      .filter(
        (dress) =>
          dress.characterName.toLowerCase().includes(query) ||
          String(dress.id).includes(query),
      )
      .slice(0, 20);
  }, [dressOptions, searchText]);

  function openAttachPicker() {
    setSearchText("");
    setSelectedDress(null);
    setShowDressPicker(true);
  }

  function cancelAttach() {
    setShowDressPicker(false);
    setSearchText("");
    setSelectedDress(null);
  }

  function confirmAttach() {
    if (!selectedDress) {
      window.alert("Please select a dress first.");
      return;
    }

    const pin = window.prompt(
      `Enter admin PIN to attach this image to ${selectedDress.characterName}:`,
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

    dressIdInput.value = String(selectedDress.id);
    publicIdInput.value = publicId;
    urlInput.value = url;
    pinInput.value = pin;

    setShowDressPicker(false);
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
    <>
      <div className="grid grid-cols-2 gap-2">
        <form ref={attachFormRef} action={attachCloudinaryImage}>
          <input type="hidden" name="dressId" />
          <input type="hidden" name="publicId" />
          <input type="hidden" name="url" />
          <input type="hidden" name="pin" />

          <button
            type="button"
            onClick={openAttachPicker}
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

      {showDressPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-950">
                Reuse Cloudinary Image
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Search by character name or Dress ID and select the dress.
              </p>
            </div>

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search dress name or ID..."
              autoFocus
              className="mb-3 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
              {filteredDresses.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  No matching dresses found.
                </p>
              ) : (
                filteredDresses.map((dress) => {
                  const isSelected = selectedDress?.id === dress.id;

                  return (
                    <button
                      key={dress.id}
                      type="button"
                      onClick={() => setSelectedDress(dress)}
                      className={`flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-b-0 ${
                        isSelected
                          ? "bg-blue-50 text-blue-900"
                          : "bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold">
                        {dress.characterName}
                      </span>
                      <span className="ml-3 text-xs text-slate-500">
                        ID: {dress.id}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Showing up to 20 matching dresses.
            </p>

            {selectedDress && (
              <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Selected:{" "}
                <span className="font-black">
                  {selectedDress.characterName}
                </span>{" "}
                (ID: {selectedDress.id})
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={cancelAttach}
                className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAttach}
                disabled={!selectedDress}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Attach Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
