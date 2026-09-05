export function slugifyDressName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dressSlug(characterName: string, id: number): string {
  const base = slugifyDressName(characterName) || "fancy-dress";
  return `${base}-${id}`;
}
