import { execSync } from "child_process";

const runMigrations = () => {
  console.log("Running database migrations...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Migrations complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigrations();

if (process.argv.includes("--serve")) {
  await import("./index.js");
}
