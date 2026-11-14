import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const rawUrl = env("DATABASE_URL") ?? "";
// Prisma CLI expects mysql:// for MariaDB/MySQL datasource URL
const normalizedUrl = rawUrl.startsWith("mariadb://")
  ? rawUrl.replace(/^mariadb:\/\//, "mysql://")
  : rawUrl;

export default defineConfig({
  datasource: {
    url: normalizedUrl,
  },
});
