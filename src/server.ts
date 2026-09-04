import { buildApp } from "./app";
import { getEnvironment } from "./config/env";

async function start(): Promise<void> {
  const env = getEnvironment();
  const app = await buildApp({ serviceName: env.serviceName });

  await app.listen({ port: env.port, host: "0.0.0.0" });
}

void start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
