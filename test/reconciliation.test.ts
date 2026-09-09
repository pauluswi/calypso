import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { buildApp } from "../src/app";
import { BlockchainService } from "../src/blockchain/blockchain.service";
import { disconnectPrisma, getPrismaClient } from "../src/config/prisma";
import {
  cleanupSqliteTestDatabase,
  prepareSqliteTestDatabase,
} from "./helpers/sqlite-test-db";

let app: Awaited<ReturnType<typeof buildApp>>;

describe("Reconciliation API", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-reconciliation-test" });
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

  it("returns MATCH when database and blockchain owners agree", async () => {
    const walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    const assetResponse = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Reconciled Staff",
        description: "Arcane staff",
        assetType: "WEAPON",
        metadataUri: "ipfs://reconciled-staff",
      },
    });
    const asset = assetResponse.json() as { id: string };

    const mintResponse = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { walletAddress },
    });
    expect(mintResponse.statusCode).toBe(200);

    const response = await app.inject({
      method: "POST",
      url: `/reconciliation/assets/${asset.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      assetId: asset.id,
      dbOwnerWallet: walletAddress,
      blockchainOwnerWallet: walletAddress,
      status: "MATCH",
    });
  });

  it("returns OWNERSHIP_MISMATCH when blockchain owner differs", async () => {
    const databaseWallet = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    const blockchainWallet = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
    const assetResponse = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Mismatched Amulet",
        description: "Ownership drift example",
        assetType: "ACCESSORY",
        metadataUri: "ipfs://mismatched-amulet",
      },
    });
    const asset = assetResponse.json() as { id: string };

    const mintResponse = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { walletAddress: databaseWallet },
    });
    const mint = mintResponse.json() as { tokenId: number };
    BlockchainService.setMockOwner(mint.tokenId, blockchainWallet);

    const response = await app.inject({
      method: "POST",
      url: `/reconciliation/assets/${asset.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      assetId: asset.id,
      dbOwnerWallet: databaseWallet,
      blockchainOwnerWallet: blockchainWallet,
      status: "OWNERSHIP_MISMATCH",
    });
  });

  it("returns 404 when the asset has not been minted", async () => {
    const assetResponse = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Unminted Ring",
        description: "Simple ring",
        assetType: "ACCESSORY",
        metadataUri: "ipfs://unminted-ring",
      },
    });
    const asset = assetResponse.json() as { id: string };

    const response = await app.inject({
      method: "POST",
      url: `/reconciliation/assets/${asset.id}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "ASSET_NOT_FOUND",
        message: "Asset has not been minted as an NFT",
      },
    });
  });
});
