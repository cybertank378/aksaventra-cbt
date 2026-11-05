import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import mariadb from "mariadb";
import { Pool } from "pg";
import { env } from "@/core/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function createPrismaClient(): PrismaClient {
  if (
    env.DATABASE_PROVIDER === "mariadb" ||
    env.DATABASE_PROVIDER === "mysql"
  ) {
    const formattedUrl = env.DATABASE_URL.startsWith("mysql://")
      ? env.DATABASE_URL.replace(/^mysql:\/\//, "mariadb://")
      : env.DATABASE_URL;

    const pool = mariadb.createPool(formattedUrl);
    const adapter = new PrismaMariaDb(pool);
    return new PrismaClient({ adapter });
  }

  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
