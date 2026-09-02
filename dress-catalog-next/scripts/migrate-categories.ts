import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type LegacyDress = {
  id: number;
  category: string | null;
};

function createDescription(categoryName: string): string {
  return `${categoryName}-themed fancy dress costumes for children, suitable for school events, fancy dress competitions, role-play and special occasions.`;
}

async function main() {
  console.log("Starting category migration...\n");

  /*
   * The old Dress.category column is no longer part of schema.prisma,
   * so Prisma cannot read it through prisma.dress. Read the legacy
   * column directly with SQL, then populate Category and categoryId.
   */
  const dresses = await prisma.$queryRaw<LegacyDress[]>`
    SELECT "id", "category"
    FROM "Dress"
    ORDER BY "id" ASC
  `;

  console.log(`Existing dresses found: ${dresses.length}`);

  if (dresses.length === 0) {
    console.log("No dresses found. Nothing to migrate.");
    return;
  }

  const invalidDresses = dresses.filter(
    (dress) => !dress.category || dress.category.trim() === "",
  );

  if (invalidDresses.length > 0) {
    console.error(
      `ERROR: ${invalidDresses.length} dress(es) have an empty legacy category.`,
    );
    console.error("Migration stopped. No dress/category records were modified.");
    console.error(
      "Dress IDs without category:",
      invalidDresses.map((dress) => dress.id).join(", "),
    );
    process.exitCode = 1;
    return;
  }

  const categoryNames = new Map<string, string>();

  for (const dress of dresses) {
    const categoryName = dress.category!.trim();
    const normalized = categoryName.toLowerCase();

    if (!categoryNames.has(normalized)) {
      categoryNames.set(normalized, categoryName);
    }
  }

  console.log(`Unique categories found: ${categoryNames.size}\n`);

  const categoryMap = new Map<string, number>();

  await prisma.$transaction(
    async (tx) => {
      for (const [normalizedName, categoryName] of categoryNames) {
        let category = await tx.category.findFirst({
          where: {
            name: {
              equals: categoryName,
              mode: "insensitive",
            },
          },
        });

        if (!category) {
          category = await tx.category.create({
            data: {
              name: categoryName,
              description: createDescription(categoryName),
              posterUrl: null,
              publicId: null,
            },
          });

          console.log(`Created category: ${categoryName}`);
        } else {
          console.log(`Existing category reused: ${category.name}`);
        }

        categoryMap.set(normalizedName, category.id);
      }

      for (const dress of dresses) {
        const normalizedName = dress.category!.trim().toLowerCase();
        const categoryId = categoryMap.get(normalizedName);

        if (!categoryId) {
          throw new Error(
            `Could not find Category Master record for dress ID ${dress.id}`,
          );
        }

        await tx.dress.update({
          where: { id: dress.id },
          data: { categoryId },
        });
      }
    },
    {
      maxWait: 10000,
      timeout: 60000,
    },
  );

  const [verification, totalCategories, linkedDresses] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Dress"
      WHERE "categoryId" IS NULL
    `,
    prisma.category.count(),
    prisma.dress.count(),
  ]);

  const dressesWithoutCategory = Number(verification[0]?.count ?? 0);

  console.log("\n========================================");
  console.log("CATEGORY MIGRATION COMPLETE");
  console.log("========================================");
  console.log(`Existing dresses        : ${dresses.length}`);
  console.log(`Category master records : ${totalCategories}`);
  console.log(`Dresses linked          : ${linkedDresses}`);
  console.log(`Dresses without category: ${dressesWithoutCategory}`);
  console.log("========================================\n");

  if (dressesWithoutCategory !== 0) {
    throw new Error(
      "VERIFICATION FAILED: Some dresses are still without a category.",
    );
  }

  if (linkedDresses !== dresses.length) {
    throw new Error(
      "VERIFICATION FAILED: Not all dresses were linked.",
    );
  }

  console.log(
    "SUCCESS: Every existing dress is linked to a Category Master record.",
  );
}

main()
  .catch((error) => {
    console.error("\nCATEGORY MIGRATION FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
