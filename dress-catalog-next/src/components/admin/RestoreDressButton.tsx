"use client";

import { useRef } from "react";

export default function RestoreDressButton({
  dressId,
  dressName,
  restoreDressAction,
}: {
  dressId: number;
  dressName: string;
  restoreDressAction: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleRestore(event: React.MouseEvent<HTMLButtonElement>) {
    const pin = window.prompt(
      `Enter your admin security PIN to restore ${dressName}:`,
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
    <form ref={formRef} action={restoreDressAction}>
      <input type="hidden" name="dressId" value={dressId} />
      <input type="hidden" name="pin" />

      <button
        type="submit"
        onClick={handleRestore}
        className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
      >
        Restore
      </button>
    </form>
  );
}