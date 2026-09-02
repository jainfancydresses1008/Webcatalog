export type DressSizeDto = {
  id: number;
  size: string;
  price: number;
};

export type DressImageDto = {
  id: number;
  url: string;
  publicId: string | null;
  altText: string | null;
  isMain: boolean;
  sortOrder: number;
};

export type CategoryDto = {
  id: number;
  name: string;
  description: string | null;
  posterUrl: string | null;
  publicId: string | null;
};

export type DressDto = {
  id: number;
  categoryId: number;
  categoryRef: CategoryDto;
  subcategory: string | null;
  characterName: string;
  description: string;
  sizes: DressSizeDto[];
  images: DressImageDto[];
};