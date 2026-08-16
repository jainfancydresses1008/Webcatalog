import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const stats = await prisma.siteStats.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        visitorCount: 1,
      },
      update: {
        visitorCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      visitorCount: stats.visitorCount,
    });
  } catch (error) {
    console.error("Visitor count update failed:", error);

    return NextResponse.json(
      {
        error: "Unable to update visitor count.",
      },
      {
        status: 500,
      },
    );
  }
}
