import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

describe("GET /health", () => {
  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("returns service health status", async () => {
    app = await buildApp({ serviceName: "calypso" });

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "UP",
      service: "calypso",
    });
  });
});
