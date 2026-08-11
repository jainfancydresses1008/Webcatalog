'use client';

import Image from 'next/image';
import type { DressDto } from '@/lib/dress-types';

type DressCardProps = {
  dress: DressDto[];
  selectedSize: string;
  selectedPrice: number;
  onSizeChange: (size: string) => void;
  onView: () => void;
  contactLinks: {
    whatsapp: string;
    email: string;
    sms: string;
  };
};

export default function DressCard({
  dress,
  selectedSize,
  selectedPrice,
  onSizeChange,
  onView,
  contactLinks,
}: DressCardProps) {
  const mainImage =
    dress.images[0]?.url ?? '/images/placeholder-dress.svg';

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
        ring-1
        ring-slate-100
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        hover:ring-pink-100
      "
    >
      {/* Image Area */}
      <button
        type="button"
        onClick={onView}
        className="
          relative
          block
          aspect-[3/4]
          w-full
          overflow-hidden
          bg-gradient-to-br
          from-pink-50
          via-white
          to-purple-50
          text-left
        "
      >
        <Image
          src={mainImage}
          alt={dress.characterName}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          className="
            object-cover
            transition
            duration-500
            group-hover:scale-105
          "
        />

        {/* Image overlay */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/20
            via-transparent
            to-transparent
            opacity-0
            transition
            duration-300
            group-hover:opacity-100
          "
        />

        {/* Category Badge */}
        <span
          className="
            absolute
            left-3
            top-3
            rounded-full
            bg-white/90
            px-3
            py-1.5
            text-xs
            font-black
            text-slate-800
            shadow-sm
            backdrop-blur
          "
        >
          {dress.category}
        </span>

        {/* Price Badge */}
        <span
          className="
            absolute
            bottom-3
            right-3
            rounded-full
            bg-gradient-to-r
            from-pink-600
            to-purple-600
            px-3
            py-1.5
            text-sm
            font-black
            text-white
            shadow-lg
          "
        >
          ₹{selectedPrice}
        </span>

        {/* View button */}
        <span
          className="
            absolute
            bottom-3
            left-3
            rounded-full
            bg-white/90
            px-3
            py-1.5
            text-xs
            font-bold
            text-slate-800
            opacity-0
            shadow-md
            backdrop-blur
            transition
            duration-300
            group-hover:opacity-100
          "
        >
          View Details
        </span>
      </button>

      {/* Card Content */}
      <div className="p-4">
        {/* Dress name */}
        <button
          type="button"
          onClick={onView}
          className="w-full text-left"
        >
          <h2 className="line-clamp-1 text-base font-black text-slate-950">
            {dress.characterName}
          </h2>

          <p className="mt-1 line-clamp-2 min-h-[32px] text-xs font-medium leading-4 text-slate-500">
            {dress.description}
          </p>
        </button>

        {/* Size selection */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              Select Size
            </span>

            <span className="text-xs font-bold text-pink-600">
              {selectedSize || 'Select'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {dress.sizes.map((item) => {
              const active = selectedSize === item.size;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSizeChange(item.size);
                  }}
                  className={`
                    min-w-10
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-xs
                    font-black
                    transition-all
                    duration-200
                    ${
                      active
                        ? 'border-pink-600 bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700'
                    }
                  `}
                >
                  {item.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onView}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2.5
              text-xs
              font-black
              text-slate-700
              transition
              hover:border-pink-200
              hover:bg-pink-50
              hover:text-pink-700
            "
          >
            View Details
          </button>

          <a
            href={contactLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="
              rounded-xl
              bg-[#25D366]
              px-3
              py-2.5
              text-center
              text-xs
              font-black
              text-white
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}