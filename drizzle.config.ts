import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// DIRECT_URL (session pooler, port 5432) est préférée pour `drizzle-kit push`.
const url =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
});
