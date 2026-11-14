import "dotenv/config";
import { z } from "zod";

export type DatabaseProvider = "postgresql" | "mariadb" | "mysql";

export const envSchema = z
  .object({
    DATABASE_URL: z
      .string({ message: "DATABASE_URL is required" })
      .min(1, { message: "DATABASE_URL is required" }),
    DATABASE_PROVIDER: z.enum(["postgresql", "mariadb", "mysql"]).optional(),
    CBT_JWT_SECRET: z
      .string({ message: "CBT_JWT_SECRET is required" })
      .min(1, { message: "CBT_JWT_SECRET is required" }),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  })
  .transform((data) => {
    let resolvedProvider: DatabaseProvider =
      data.DATABASE_PROVIDER ?? "postgresql";
    if (!data.DATABASE_PROVIDER) {
      const lowerUrl = data.DATABASE_URL.toLowerCase();
      if (lowerUrl.startsWith("mysql:") || lowerUrl.startsWith("mariadb:")) {
        resolvedProvider = "mariadb";
      } else {
        resolvedProvider = "postgresql";
      }
    }
    return {
      ...data,
      DATABASE_PROVIDER: resolvedProvider,
    };
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(input: Record<string, unknown> = process.env): Env {
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `[${issue.path.join(".")}]: ${issue.message}`)
      .join("; ");
    throw new Error(`Environment validation failed: ${issues}`);
  }

  return parsed.data;
}

export const env: Env = validateEnv();
