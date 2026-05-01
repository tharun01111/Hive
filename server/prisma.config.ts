import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const migrationUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: migrationUrl,
  },
  migrate: {
    adapter() {
      return new PrismaPg({ connectionString: migrationUrl });
    },
  },
});
