import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/models/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
