"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DressDetailsModal from "@/components/DressDetailsModal";
import type { DressDto } from "@/lib/dress-types";

type Props = {
  dress: DressDto;
  sellerPhone: string;
  sellerEmail: string;
};

export default function DressDetailsPageClient({
  dress,
  sellerPhone,
  sellerEmail,
}: Props) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(dress.sizes[0]?.size ?? "");

  const selectedSizeData =
    dress.sizes.find((size) => size.size === selectedSize) ?? dress.sizes[0];

  const message = `Hello, I am interested in this dress.\nCategory: ${dress.categoryRef.name}\nSubcategory: ${dress.subcategory ?? ""}\nCharacter Name: ${dress.characterName}\nSelected Size: ${selectedSizeData?.size ?? ""}\nPrice: ₹${selectedSizeData?.price ?? ""}`;
  const encodedMessage = encodeURIComponent(message);

  return (
    <DressDetailsModal
      dress={dress}
      selectedSize={selectedSize}
      onSizeChange={setSelectedSize}
      onClose={() => router.back()}
      contactLinks={{
        whatsapp: `https://wa.me/${sellerPhone}?text=${encodedMessage}`,
        email: `mailto:${sellerEmail}?subject=${encodeURIComponent(
          `Dress Inquiry - ${dress.characterName}`,
        )}&body=${encodedMessage}`,
        sms: `sms:+${sellerPhone}?body=${encodedMessage}`,
      }}
    />
  );
}
