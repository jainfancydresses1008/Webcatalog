"use client";

import { useRef } from "react";

export default function DeleteDressButton({
  dressId,
  dressName,
  deleteDressAction,
}: {
  dressId: number;
  dressName: string;
  deleteDressAction: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    const confirmed = window.confirm(
      `Move ${dressName} to Deleted Dresses?\n\n` +
        `The dress will be hidden, but its database record and ` +
        `Cloudinary images will be retained.`,
    );

    if (!confirmed) {
      event.preventDefault();
      return;
    }

    const pin = window.prompt(
      "Enter your admin security PIN to continue:",
    );

    if (pin === null) {
      event.preventDefault();
      return;
    }

    const pinInput = formRef.current?.elements.namedItem(
      "pin",
    ) as HTMLInputElement | null;

    if (pinInput) {
      pinInput.value = pin;
    }
  }

  return (
    <form ref={formRef} action={deleteDressAction}>
      <input type="hidden" name="dressId" value={dressId} />
      <input type="hidden" name="pin" />

      <button
        type="submit"
        onClick={handleDelete}
        className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
      >
        Delete
      </button>
    </form>
  );
}