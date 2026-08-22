"use client";
import { useTransition } from "react";
export default function DeleteDressButton({
  dressId,
  dressName,
  deleteDressAction,
}: {
  dressId: number;
  dressName: string;
  deleteDressAction: (fd: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  function onDelete() {
    if (
      !confirm(
        `Move ${dressName} to Deleted Dresses?\n\nThe dress will be hidden, but its database record and Cloudinary images will be retained.`,
      )
    )
      return;
    const pin = window.prompt("Enter your admin security PIN to continue:");
    if (pin === null) return;
    const fd = new FormData();
    fd.set("dressId", String(dressId));
    fd.set("pin", pin);
    startTransition(async () => {
      try {
        await deleteDressAction(fd);
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Unable to delete dress.");
      }
    });
  }
  return (
    <button
      disabled={isPending}
      type="button"
      onClick={onDelete}
      className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
