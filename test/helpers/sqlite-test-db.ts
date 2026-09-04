import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

const TEST_DATABASE_URL = "file:./prisma/test.db";

export function prepareSqliteTestDatabase(): string {
  const workspaceRoot = process.cwd();
  const dbFilePath = path.join(workspaceRoot, "prisma", "test.db");

  rmSync(dbFilePath, { force: true });

  execSync("npx prisma migrate deploy", {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
    },
    stdio: "pipe",
  });

  return TEST_DATABASE_URL;
}

export function cleanupSqliteTestDatabase(): void {
  const workspaceRoot = process.cwd();
  const dbFilePath = path.join(workspaceRoot, "prisma", "test.db");
  rmSync(dbFilePath, { force: true });
}
