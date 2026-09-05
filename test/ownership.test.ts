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

describe("Ownership Lookup API (Phase 7)", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-ownership-test" });
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

  describe("GET /players/:id/assets", () => {
    it("returns player's assets with associated NFT info", async () => {
      const playerRes = await app.inject({
        method: "POST",
        url: "/players",
        payload: { username: "asset_owner" },
      });
      const player = playerRes.json() as { id: string };

      const walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      await app.inject({
        method: "POST",
        url: `/players/${player.id}/wallet`,
        payload: { address: walletAddress },
      });

      const assetRes = await app.inject({
        method: "POST",
        url: "/assets",
        payload: {
          name: "Golden Helm",
          description: "Shiny golden helmet",
          assetType: "ARMOR",
          metadataUri: "ipfs://golden-helm",
        },
      });
      const asset = assetRes.json() as { id: string };

      await app.inject({
        method: "POST",
        url: `/assets/${asset.id}/mint`,
        payload: { playerId: player.id },
      });

      const playerAssetsRes = await app.inject({
        method: "GET",
        url: `/players/${player.id}/assets`,
      });

      expect(playerAssetsRes.statusCode).toBe(200);
      const assets = playerAssetsRes.json() as Array<{
        id: string;
        name: string;
        nft: { tokenId: number; txHash: string; status: string };
      }>;

      expect(assets).toHaveLength(1);
      expect(assets[0].id).toBe(asset.id);
      expect(assets[0].name).toBe("Golden Helm");
      expect(typeof assets[0].nft.tokenId).toBe("number");
      expect(assets[0].nft.status).toBe("CONFIRMED");
    });

    it("returns empty array for player without wallet or minted assets", async () => {
      const playerRes = await app.inject({
        method: "POST",
        url: "/players",
        payload: { username: "empty_player" },
      });
      const player = playerRes.json() as { id: string };

      const response = await app.inject({
        method: "GET",
        url: `/players/${player.id}/assets`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it("returns 404 for non-existent player", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000099";
      const response = await app.inject({
        method: "GET",
        url: `/players/${fakeId}/assets`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /assets/:id/owner", () => {
    it("returns authoritative blockchain owner for a minted asset", async () => {
      const walletAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

      const assetRes = await app.inject({
        method: "POST",
        url: "/assets",
        payload: {
          name: "Magic Wand",
          description: "Casts fireballs",
          assetType: "WEAPON",
          metadataUri: "ipfs://magic-wand",
        },
      });
      const asset = assetRes.json() as { id: string };

      const mintRes = await app.inject({
        method: "POST",
        url: `/assets/${asset.id}/mint`,
        payload: { walletAddress },
      });
      const mintData = mintRes.json() as { tokenId: number };

      const ownerRes = await app.inject({
        method: "GET",
        url: `/assets/${asset.id}/owner`,
      });

      expect(ownerRes.statusCode).toBe(200);
      const ownerData = ownerRes.json() as {
        assetId: string;
        tokenId: number;
        ownerAddress: string;
      };

      expect(ownerData.assetId).toBe(asset.id);
      expect(ownerData.tokenId).toBe(mintData.tokenId);
      expect(ownerData.ownerAddress.toLowerCase()).toBe(walletAddress.toLowerCase());
    });

    it("returns 404 ASSET_NOT_FOUND if asset has not been minted", async () => {
      const assetRes = await app.inject({
        method: "POST",
        url: "/assets",
        payload: {
          name: "Unminted Bow",
          description: "Wooden bow",
          assetType: "WEAPON",
          metadataUri: "ipfs://unminted-bow",
        },
      });
      const asset = assetRes.json() as { id: string };

      const ownerRes = await app.inject({
        method: "GET",
        url: `/assets/${asset.id}/owner`,
      });

      expect(ownerRes.statusCode).toBe(404);
      expect(ownerRes.json()).toEqual({
        error: {
          code: "ASSET_NOT_FOUND",
          message: "Asset has not been minted as an NFT",
        },
      });
    });
  });
});
