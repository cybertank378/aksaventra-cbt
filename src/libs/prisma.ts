import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import mariadb from "mariadb";
import { Pool } from "pg";
import { env } from "@/core/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPoolMax(): number {
  const raw = Number.parseInt(process.env.DB_POOL_MAX || "20", 10);
  if (!Number.isFinite(raw) || raw < 5) return 20;
  return Math.min(raw, 100);
}

function getAcquireTimeoutMs(): number {
  const raw = Number.parseInt(process.env.DB_ACQUIRE_TIMEOUT_MS || "10000", 10);
  if (!Number.isFinite(raw) || raw < 1000) return 10000;
  return raw;
}

function parseConnectionOptions(rawUrl: string) {
  const connectionLimit = getPoolMax();
  const acquireTimeout = getAcquireTimeoutMs();

  try {
    const parsed = new URL(rawUrl);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: parsed.pathname.replace(/^\//, "") || "aksaventra_cbt",
      connectTimeout: 5000,
      acquireTimeout,
      connectionLimit,
    };
  } catch {
    return {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "aksaventra_cbt",
      connectTimeout: 5000,
      acquireTimeout,
      connectionLimit,
    };
  }
}

export function createPrismaClient(): PrismaClient {
  if (
    env.DATABASE_PROVIDER === "mariadb" ||
    env.DATABASE_PROVIDER === "mysql"
  ) {
    const pool = mariadb.createPool(parseConnectionOptions(env.DATABASE_URL));
    const adapter = new PrismaMariaDb(pool);
    return new PrismaClient({ adapter });
  }

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: getPoolMax(),
    connectionTimeoutMillis: getAcquireTimeoutMs(),
    idleTimeoutMillis: 30_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export type { PrismaClient } from "@prisma/client";
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
