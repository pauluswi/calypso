import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { buildApp } from "../src/app";
import { disconnectPrisma, getPrismaClient } from "../src/config/prisma";
import {
  cleanupSqliteTestDatabase,
  prepareSqliteTestDatabase,
} from "./helpers/sqlite-test-db";

let app: Awaited<ReturnType<typeof buildApp>>;

describe("Player and Asset CRUD integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-test" });
  });

  beforeEach(async () => {
    const prisma = getPrismaClient();
    await prisma.blockchainTransaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.player.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await disconnectPrisma();
    cleanupSqliteTestDatabase();
  });

  it("creates, reads, updates, and deletes a player", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "wied" },
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPlayer = createResponse.json() as { id: string; username: string };
    expect(createdPlayer.username).toBe("wied");

    const getResponse = await app.inject({
      method: "GET",
      url: `/players/${createdPlayer.id}`,
    });

    expect(getResponse.statusCode).toBe(200);
    expect((getResponse.json() as { username: string }).username).toBe("wied");

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/players/${createdPlayer.id}`,
      payload: { username: "wied-updated" },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect((updateResponse.json() as { username: string }).username).toBe("wied-updated");

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/players/${createdPlayer.id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    const getAfterDeleteResponse = await app.inject({
      method: "GET",
      url: `/players/${createdPlayer.id}`,
    });

    expect(getAfterDeleteResponse.statusCode).toBe(404);
  });

  it("creates and fetches an asset by id", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Dragon Sword",
        description: "A legendary sword",
        assetType: "WEAPON",
        metadataUri: "ipfs://dragon-sword",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const createdAsset = createResponse.json() as { id: string; name: string };
    expect(createdAsset.name).toBe("Dragon Sword");

    const getResponse = await app.inject({
      method: "GET",
      url: `/assets/${createdAsset.id}`,
    });

    expect(getResponse.statusCode).toBe(200);
    expect((getResponse.json() as { metadataUri: string }).metadataUri).toBe(
      "ipfs://dragon-sword"
    );
  });

  it("lists assets after creation", async () => {
    await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Magic Shield",
        description: "A shield with arcane power",
        assetType: "ARMOR",
        metadataUri: "ipfs://magic-shield",
      },
    });

    const listResponse = await app.inject({
      method: "GET",
      url: "/assets",
    });

    expect(listResponse.statusCode).toBe(200);
    const assets = listResponse.json() as Array<{ name: string; assetType: string }>;
    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({
      name: "Magic Shield",
      assetType: "ARMOR",
    });
  });
});
