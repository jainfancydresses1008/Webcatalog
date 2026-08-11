'use client';

import { useTransition } from 'react';

export default function DeleteDressButton({ dressId, dressName, deleteDressAction }: { dressId: number; dressName: string; deleteDressAction: (formData: FormData) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`Delete ${dressName}? This cannot be undone.`)) return;
    const formData = new FormData();
    formData.set('dressId', String(dressId));
    startTransition(async () => deleteDressAction(formData));
  }

  return <button disabled={isPending} type="button" onClick={onDelete} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">{isPending ? 'Deleting...' : 'Delete'}</button>;
}
