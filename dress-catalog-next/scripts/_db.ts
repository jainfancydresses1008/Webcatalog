import { PrismaClient } from "@prisma/client";
import { loadProjectEnv, requireEnv } from "./_env";

loadProjectEnv();
requireEnv("DATABASE_URL");

export const prisma = new PrismaClient();
