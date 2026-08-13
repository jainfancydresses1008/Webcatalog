"use client";

import { useState, useTransition } from "react";
import type { DressDto } from "@/lib/dress-types";

type Props = {
  dress: DressDto & {
    isActive?: boolean;
  };
  updateDressDetailsAction: (formData: FormData) => Promise<void>;
};

export default function EditDressForm({
  dress,
  updateDressDetailsAction,
}: Props) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const defaultSizes = dress.sizes.map((item) => item.size).join(", ");

  const defaultPrices = dress.sizes.map((item) => item.price).join(", ");

  function submit(formData: FormData) {
    setMessage("");

    startTransition(async () => {
      try {
        await updateDressDetailsAction(formData);
        setMessage("Dress updated successfully.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to update dress.",
        );
      }
    });
  }

  return (
    <form
      action={submit}
      className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-lg md:p-7"
    >
      {/* Hidden Dress ID */}
      <input type="hidden" name="dressId" value={dress.id} />

      {/* Heading */}
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
          Admin Panel
        </p>

        <h2 className="mt-1 text-3xl font-black text-slate-950">
          Edit Dress Details
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update the category, character, description, sizes and prices.
        </p>
      </div>

      {/* Success / Error Message */}
      {message && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* ================= CATEGORY ================= */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Category
          </label>

          <input
            id="category"
            name="category"
            defaultValue={dress.category}
            placeholder="Enter category"
            required
            className="
              w-full
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-pink-500
              focus:ring-4
              focus:ring-pink-100
            "
          />
        </div>
        {/* ================= SUB CATEGORY ================= */}

        <div>
          <label
            htmlFor="subcategory"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Subcategory
          </label>
          <input
            id="subcategory"
            name="subcategory"
            defaultValue={dress.subcategory ?? ""}
            placeholder="Enter subcategory"
          />
        </div>

        {/* ================= CHARACTER NAME ================= */}
        <div>
          <label
            htmlFor="characterName"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Character Name
          </label>

          <input
            id="characterName"
            name="characterName"
            defaultValue={dress.characterName}
            placeholder="Enter character name"
            required
            className="
              w-full
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-pink-500
              focus:ring-4
              focus:ring-pink-100
            "
          />
        </div>

        {/* ================= DESCRIPTION ================= */}
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            defaultValue={dress.description}
            placeholder="Describe the dress..."
            required
            rows={5}
            className="
              w-full
              resize-y
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-pink-500
              focus:ring-4
              focus:ring-pink-100
            "
          />
        </div>

        {/* ================= SIZES ================= */}
        <div>
          <label
            htmlFor="sizes"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Available Sizes
          </label>

          <input
            id="sizes"
            name="sizes"
            defaultValue={defaultSizes}
            placeholder="Example: S, M, L, XL"
            required
            className="
              w-full
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-pink-500
              focus:ring-4
              focus:ring-pink-100
            "
          />

          <p className="mt-2 text-xs font-medium text-slate-400">
            Separate sizes with commas.
          </p>
        </div>

        {/* ================= PRICES ================= */}
        <div>
          <label
            htmlFor="prices"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Prices
          </label>

          <input
            id="prices"
            name="prices"
            defaultValue={defaultPrices}
            placeholder="Example: 1000, 1200, 1400"
            required
            className="
              w-full
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-pink-500
              focus:ring-4
              focus:ring-pink-100
            "
          />

          <p className="mt-2 text-xs font-medium text-slate-400">
            Enter prices in the same order as the sizes.
          </p>
        </div>

        {/* ================= PUBLIC DISPLAY ================= */}
        <label
          htmlFor="isActive"
          className="
            md:col-span-2
            flex
            cursor-pointer
            items-center
            gap-3
            rounded-2xl
            border
            border-pink-100
            bg-pink-50/50
            p-4
            transition
            hover:bg-pink-50
          "
        >
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={dress.isActive ?? true}
            className="h-5 w-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
          />

          <div>
            <p className="font-black text-slate-800">
              Display this dress on public catalog
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Uncheck this if you want to temporarily hide the dress.
            </p>
          </div>
        </label>
      </div>

      {/* ================= SAVE BUTTON ================= */}
      <div className="mt-7 flex justify-end">
        <button
          disabled={isPending}
          type="submit"
          className="
            rounded-2xl
            bg-gradient-to-r
            from-pink-600
            via-fuchsia-600
            to-purple-600
            px-7
            py-3.5
            text-sm
            font-black
            text-white
            shadow-lg
            transition
            hover:-translate-y-0.5
            hover:shadow-xl
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isPending ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
