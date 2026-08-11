'use client';

import { useState, useTransition } from 'react';
import type { DressDto } from '@/lib/dress-types';

type AdminDressManagerProps = {
  dresses: DressDto[];
  addGalleryImageAction: (formData: FormData) => Promise<void>;
  replaceDressImageAction: (formData: FormData) => Promise<void>;
  deleteDressImageAction: (formData: FormData) => Promise<void>;
  setMainDressImageAction: (formData: FormData) => Promise<void>;
  deleteDressAction: (formData: FormData) => Promise<void>;
};

export default function AdminDressManager({
  dresses,
  addGalleryImageAction,
  replaceDressImageAction,
  deleteDressImageAction,
  setMainDressImageAction,
  deleteDressAction,
}: AdminDressManagerProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function runAction(action: (formData: FormData) => Promise<void>, formData: FormData, successMessage: string) {
    setMessage('');
    formData.set('adminPassword', adminPassword);

    startTransition(async () => {
      try {
        await action(formData);
        setMessage(successMessage);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Action failed.');
      }
    });
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-slate-950">Manage Existing Dresses</h2>
        <p className="mt-1 text-sm text-slate-600">
          Replace images, add gallery images, delete gallery images, mark a main image, or delete an entire dress.
        </p>
      </div>

      <input
        type="password"
        value={adminPassword}
        onChange={(event) => setAdminPassword(event.target.value)}
        placeholder="Admin password required for all actions"
        className="mb-4 w-full rounded-2xl border border-slate-300 p-3"
      />

      {message && (
        <div className="mb-4 rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}

      {dresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No dresses found.
        </div>
      ) : (
        <div className="space-y-6">
          {dresses.map((dress) => (
            <div key={dress.id} className="rounded-3xl border border-slate-200 p-4">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-950">{dress.characterName}</h3>
                  <p className="text-sm text-slate-500">{dress.category}</p>
                </div>

                <form
                  action={(formData) => runAction(deleteDressAction, formData, 'Dress deleted successfully.')}
                  onSubmit={(event) => {
                    if (!confirm(`Delete ${dress.characterName}? This removes the dress and all related image records.`)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="dressId" value={dress.id} />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Delete Dress
                  </button>
                </form>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dress.images.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="aspect-[4/3] bg-slate-200">
                      <img src={image.url} alt={image.altText ?? dress.characterName} className="h-full w-full object-cover" />
                    </div>

                    <div className="space-y-3 p-3">
                      <div className="flex items-center justify-between gap-3 text-xs font-bold">
                        <span className={image.isMain ? 'text-pink-600' : 'text-slate-500'}>
                          {image.isMain ? 'Main image' : 'Gallery image'}
                        </span>
                        <span className="text-slate-400">ID: {image.id}</span>
                      </div>

                      <form action={(formData) => runAction(replaceDressImageAction, formData, 'Image replaced successfully.')} className="space-y-2">
                        <input type="hidden" name="imageId" value={image.id} />
                        <input name="imageUrl" placeholder="New image URL, optional if uploading file" className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
                        <input name="imageFile" type="file" accept="image/*" className="w-full rounded-xl border border-slate-300 bg-white p-2 text-sm" />
                        <button disabled={isPending} type="submit" className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                          Replace Image
                        </button>
                      </form>

                      <div className="grid grid-cols-2 gap-2">
                        {!image.isMain && (
                          <form action={(formData) => runAction(setMainDressImageAction, formData, 'Main image updated successfully.')}>
                            <input type="hidden" name="imageId" value={image.id} />
                            <button disabled={isPending} type="submit" className="w-full rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-60">
                              Set Main
                            </button>
                          </form>
                        )}

                        <form
                          action={(formData) => runAction(deleteDressImageAction, formData, 'Image deleted successfully.')}
                          onSubmit={(event) => {
                            if (!confirm('Delete this image? If this is the last image, deletion will be blocked.')) {
                              event.preventDefault();
                            }
                          }}
                          className={!image.isMain ? '' : 'col-span-2'}
                        >
                          <input type="hidden" name="imageId" value={image.id} />
                          <button disabled={isPending} type="submit" className="w-full rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
                            Delete Image
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form action={(formData) => runAction(addGalleryImageAction, formData, 'Gallery image added successfully.')} className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-3">
                <input type="hidden" name="dressId" value={dress.id} />
                <input name="imageUrl" placeholder="Gallery image URL, optional if uploading file" className="rounded-xl border border-slate-300 p-2 text-sm md:col-span-2" />
                <input name="imageFile" type="file" accept="image/*" className="rounded-xl border border-slate-300 bg-white p-2 text-sm" />
                <button disabled={isPending} type="submit" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60 md:col-span-3">
                  Add Gallery Image
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
