'use client';

import { useMemo, useState } from 'react';
import type { DressDto } from '@/lib/dress-types';
import AdminDressForm from './AdminDressForm';
import DressCard from './DressCard';
import DressDetailsModal from './DressDetailsModal';
import SearchFilters from './SearchFilters';

type DressCatalogClientProps = {
  dresses: DressDto[];
  sellerPhone: string;
  sellerEmail: string;
  createDressAction: (formData: FormData) => Promise<void>;
  deleteDressAction: (formData: FormData) => Promise<void>;
};

export default function DressCatalogClient({ dresses, sellerPhone, sellerEmail, createDressAction }: DressCatalogClientProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [senderContact, setSenderContact] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedDress, setSelectedDress] = useState<DressDto | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>(
    Object.fromEntries(dresses.map((dress) => [dress.id, dress.sizes[0]?.size ?? '']))
  );

  const categories = useMemo(() => ['All', ...new Set(dresses.map((dress) => dress.category))], [dresses]);

  const filteredDresses = useMemo(() => {
    const search = searchText.toLowerCase();
    return dresses.filter((dress) => {
      const matchesCategory = selectedCategory === 'All' || dress.category === selectedCategory;
      const matchesSearch =
        dress.category.toLowerCase().includes(search) ||
        dress.characterName.toLowerCase().includes(search) ||
        dress.description.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [dresses, searchText, selectedCategory]);

  function selectedSizeFor(dress: DressDto) {
    return dress.sizes.find((item) => item.size === selectedSizes[dress.id]) ?? dress.sizes[0];
  }

  function updateSize(dressId: number, size: string) {
    setSelectedSizes((current) => ({ ...current, [dressId]: size }));
  }

  function getContactLinks(dress: DressDto) {
    const selectedSize = selectedSizeFor(dress);
    const message = encodeURIComponent(
      `Hello, I am interested in this dress.\n\nCategory: ${dress.category}\nCharacter Name: ${dress.characterName}\nSelected Size: ${selectedSize?.size ?? ''}\nPrice: ₹${selectedSize?.price ?? ''}\nSender Contact Number: ${senderContact || 'Not provided'}`
    );

    return {
      whatsapp: `https://wa.me/${sellerPhone}?text=${message}`,
      email: `mailto:${sellerEmail}?subject=Dress Inquiry - ${dress.characterName}&body=${message}`,
      sms: `sms:+${sellerPhone}?body=${message}`
    };
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dress Catalog</h1>
              <p className="mt-2 text-slate-600">Browse dresses by category, character name and description. The first available size and price are shown by default.</p>
            </div>
            <button type="button" onClick={() => setShowAdminForm((current) => !current)} className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">
              {showAdminForm ? 'Hide Admin Form' : 'Admin: Add Dress'}
            </button>
          </div>
        </section>

        {showAdminForm && <AdminDressForm createDressAction={createDressAction} />}

        <SearchFilters
          categories={categories}
          searchText={searchText}
          selectedCategory={selectedCategory}
          senderContact={senderContact}
          onSearchTextChange={setSearchText}
          onSelectedCategoryChange={setSelectedCategory}
          onSenderContactChange={setSenderContact}
        />

        {filteredDresses.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm">No dresses found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredDresses.map((dress) => {
              const selectedSize = selectedSizeFor(dress);
              return (
                <DressCard
                  key={dress.id}
                  dress={dress}
                  selectedSize={selectedSize?.size ?? ''}
                  selectedPrice={selectedSize?.price ?? 0}
                  onSizeChange={(size) => updateSize(dress.id, size)}
                  onView={() => setSelectedDress(dress)}
                  contactLinks={getContactLinks(dress)}
                />
              );
            })}
          </div>
        )}
      </div>

      {selectedDress && (
        <DressDetailsModal
          dress={selectedDress}
          selectedSize={selectedSizeFor(selectedDress)?.size ?? ''}
          senderContact={senderContact}
          onSizeChange={(size) => updateSize(selectedDress.id, size)}
          onSenderContactChange={setSenderContact}
          onClose={() => setSelectedDress(null)}
          contactLinks={getContactLinks(selectedDress)}
        />
      )}
    </main>
  );
}
