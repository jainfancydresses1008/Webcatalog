export type DressSizeDto = {
  id: number;
  size: string;
  price: number;
};

export type DressImageDto = {
  id: number;
  url: string;
  altText: string | null;
  isMain: boolean;
  sortOrder: number;
};

export type DressDto = {
  id: number;
  category: string;
  characterName: string;
  description: string;
  sizes: DressSizeDto[];
  images: DressImageDto[];
};
