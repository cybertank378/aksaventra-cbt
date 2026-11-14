import { describe, expect, it } from "vitest";
import { validateEnv } from "@/core/env";
import { createPrismaClient, prisma } from "@/libs/prisma";

describe("Prisma Lib & Dual-Database Support (PostgreSQL & MariaDB)", () => {
  it("should export a singleton PrismaClient instance", () => {
    expect(prisma).toBeDefined();
    // Importing or referencing should refer to the same instance
    const globalPrisma = (globalThis as unknown as { prisma?: unknown }).prisma;
    expect(globalPrisma).toBe(prisma);
  });

  it("createPrismaClient should instantiate without throwing", () => {
    const client = createPrismaClient();
    expect(client).toBeDefined();
    expect(client.$connect).toBeDefined();
    expect(typeof client.$disconnect).toBe("function");
  });

  it("validateEnv should correctly parse valid configuration", () => {
    const valid = validateEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/cbt",
      CBT_JWT_SECRET: "test-secret-key-123",
      NODE_ENV: "test",
    });

    expect(valid.DATABASE_URL).toBe(
      "postgresql://postgres:postgres@localhost:5432/cbt",
    );
    expect(valid.CBT_JWT_SECRET).toBe("test-secret-key-123");
    expect(valid.DATABASE_PROVIDER).toBe("postgresql");
  });

  it("validateEnv should auto-detect mariadb mode from DATABASE_URL", () => {
    const mariadbEnv = validateEnv({
      DATABASE_URL: "mariadb://root:pass@localhost:3306/aksaventra",
      CBT_JWT_SECRET: "secret",
    });

    expect(mariadbEnv.DATABASE_PROVIDER).toBe("mariadb");
  });

  it("validateEnv should accept explicit DATABASE_PROVIDER", () => {
    const custom = validateEnv({
      DATABASE_URL: "postgresql://localhost:5432/test",
      DATABASE_PROVIDER: "mariadb",
      CBT_JWT_SECRET: "secret",
    });

    expect(custom.DATABASE_PROVIDER).toBe("mariadb");
  });

  it("validateEnv should throw when required variables are missing", () => {
    expect(() =>
      validateEnv({
        CBT_JWT_SECRET: "secret",
      }),
    ).toThrow(/DATABASE_URL is required/);

    expect(() =>
      validateEnv({
        DATABASE_URL: "postgresql://localhost:5432/test",
      }),
    ).toThrow(/CBT_JWT_SECRET is required/);
  });
});
