"use client";

import { useRef, useState } from "react";

export default function RestoreDressButton({
  dressId,
  dressName,
  restoreDressAction,
}: {
  dressId: number;
  dressName: string;
  restoreDressAction: (fd: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);

  function onRestore() {
    const pin = window.prompt(
      `Enter your admin security PIN to restore ${dressName}:`,
    );

    if (pin === null) return;

    const pinInput = formRef.current?.elements.namedItem(
      "pin",
    ) as HTMLInputElement | null;

    if (!pinInput) return;

    pinInput.value = pin;

    setIsPending(true);

    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        try {
          await restoreDressAction(formData);
          window.location.reload();
        } catch (error) {
          setIsPending(false);
          alert(
            error instanceof Error
              ? error.message
              : "Unable to restore dress.",
          );
        }
      }}
    >
      <input type="hidden" name="dressId" value={dressId} />
      <input type="hidden" name="pin" />

      <button
        disabled={isPending}
        type="button"
        onClick={onRestore}
        className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>
    </form>
  );
}