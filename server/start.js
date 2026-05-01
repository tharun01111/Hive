import { execSync } from "child_process";
import { config } from "dotenv";

config();

const runMigrations = () => {
  console.log("Running database migrations...");
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const migrateEnv = {
      ...process.env,
      DATABASE_URL: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    };

    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: migrateEnv,
    });
    console.log("Migrations complete.");

    console.log("Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit", env: process.env });
    console.log("Prisma Client generated.");
  } catch (err) {
    console.error("Migration/Generation failed:", err);
    process.exit(1);
  }
};

runMigrations();

if (process.argv.includes("--serve")) {
  await import("./index.js");
}
