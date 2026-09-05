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

describe("NFT Minting API (Phase 5)", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-mint-test" });
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

  it("mints an NFT for an asset using an associated player wallet", async () => {
    const playerRes = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "minting_hero" },
    });
    const player = playerRes.json() as { id: string };

    const validAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    await app.inject({
      method: "POST",
      url: `/players/${player.id}/wallet`,
      payload: { address: validAddress },
    });

    const assetRes = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Excalibur",
        description: "The Holy Sword",
        assetType: "WEAPON",
        metadataUri: "ipfs://excalibur",
      },
    });
    const asset = assetRes.json() as { id: string };

    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { playerId: player.id },
    });

    expect(mintRes.statusCode).toBe(200);
    const mintData = mintRes.json() as {
      assetId: string;
      tokenId: number;
      txHash: string;
      status: string;
    };

    expect(mintData.assetId).toBe(asset.id);
    expect(typeof mintData.tokenId).toBe("number");
    expect(mintData.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(mintData.status).toBe("CONFIRMED");
  });

  it("mints an NFT directly specifying a wallet address", async () => {
    const assetRes = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Aegis Shield",
        description: "Divine Shield",
        assetType: "ARMOR",
        metadataUri: "ipfs://aegis-shield",
      },
    });
    const asset = assetRes.json() as { id: string };

    const validAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { walletAddress: validAddress },
    });

    expect(mintRes.statusCode).toBe(200);
    const mintData = mintRes.json() as {
      assetId: string;
      tokenId: number;
      txHash: string;
      status: string;
    };

    expect(mintData.assetId).toBe(asset.id);
    expect(mintData.status).toBe("CONFIRMED");
  });

  it("returns 404 ASSET_NOT_FOUND when minting a non-existent asset", async () => {
    const fakeAssetId = "00000000-0000-0000-0000-000000000099";
    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${fakeAssetId}/mint`,
      payload: { walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    });

    expect(mintRes.statusCode).toBe(404);
    expect(mintRes.json()).toEqual({
      error: {
        code: "ASSET_NOT_FOUND",
        message: "Asset was not found",
      },
    });
  });

  it("returns 404 WALLET_NOT_FOUND when minting for a player without a wallet", async () => {
    const playerRes = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "walletless_minter" },
    });
    const player = playerRes.json() as { id: string };

    const assetRes = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Speed Boots",
        description: "Boots of Swiftness",
        assetType: "ACCESSORY",
        metadataUri: "ipfs://speed-boots",
      },
    });
    const asset = assetRes.json() as { id: string };

    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { playerId: player.id },
    });

    expect(mintRes.statusCode).toBe(404);
    expect(mintRes.json()).toEqual({
      error: {
        code: "WALLET_NOT_FOUND",
        message: "Player does not have an associated wallet",
      },
    });
  });

  it("returns 400 INVALID_WALLET_ADDRESS when given an invalid wallet address", async () => {
    const assetRes = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Health Potion",
        description: "Restores HP",
        assetType: "CONSUMABLE",
        metadataUri: "ipfs://health-potion",
      },
    });
    const asset = assetRes.json() as { id: string };

    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { walletAddress: "invalid-address" },
    });

    expect(mintRes.statusCode).toBe(400);
    expect(mintRes.json()).toEqual({
      error: {
        code: "INVALID_WALLET_ADDRESS",
        message: "Invalid EVM wallet address",
      },
    });
  });
});
