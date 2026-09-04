import "dotenv/config";

type Environment = {
  port: number;
  serviceName: string;
  databaseUrl: string;
};

const DEFAULT_PORT = 3000;
const DEFAULT_SERVICE_NAME = "calypso";
const DEFAULT_DATABASE_URL = "file:./prisma/dev.db";

function parseDatabaseUrl(input: string | undefined): string {
  return input ?? DEFAULT_DATABASE_URL;
}

function parsePort(input: string | undefined): number {
  if (!input) {
    return DEFAULT_PORT;
  }

  const parsed = Number(input);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error("Invalid PORT: expected integer in range 1-65535");
  }

  return parsed;
}

export function getEnvironment(): Environment {
  return {
    port: parsePort(process.env.PORT),
    serviceName: process.env.SERVICE_NAME ?? DEFAULT_SERVICE_NAME,
    databaseUrl: parseDatabaseUrl(process.env.DATABASE_URL),
  };
}
