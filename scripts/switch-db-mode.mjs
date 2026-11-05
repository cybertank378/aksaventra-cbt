import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const arg = process.argv[2]?.toLowerCase();
let mode = arg;

if (!mode) {
  const providerEnv = process.env.DATABASE_PROVIDER?.toLowerCase();
  const dbUrl = process.env.DATABASE_URL?.toLowerCase() ?? "";

  if (
    providerEnv === "mariadb" ||
    providerEnv === "mysql" ||
    dbUrl.startsWith("mysql:") ||
    dbUrl.startsWith("mariadb:")
  ) {
    mode = "mariadb";
  } else {
    mode = "postgresql";
  }
}

const isMaria = mode === "mariadb" || mode === "mysql";
const normalizedMode = isMaria ? "mariadb" : "postgresql";
const sourceFile = isMaria
  ? path.resolve("prisma/schema.mariadb.prisma")
  : path.resolve("prisma/schema.postgresql.prisma");
const targetFile = path.resolve("prisma/schema.prisma");

fs.copyFileSync(sourceFile, targetFile);
console.log(
  `[aksaventra-db] Prisma schema updated to ${normalizedMode.toUpperCase()} (source: ${path.basename(sourceFile)})`,
);

try {
  console.log(
    `[aksaventra-db] Running prisma generate for ${normalizedMode}...`,
  );
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log(
    `[aksaventra-db] Prisma client successfully generated for ${normalizedMode}.`,
  );
} catch (error) {
  console.error(`[aksaventra-db] Failed to generate Prisma Client:`, error);
  process.exit(1);
}
