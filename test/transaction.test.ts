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

describe("Transaction Tracking API (Phase 6)", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-tx-test" });
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

  it("retrieves a blockchain transaction record by ID after minting", async () => {
    const assetRes = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Shadow Dagger",
        description: "Deadly stealth dagger",
        assetType: "WEAPON",
        metadataUri: "ipfs://shadow-dagger",
      },
    });
    const asset = assetRes.json() as { id: string };

    const walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { walletAddress },
    });
    const mintData = mintRes.json() as { txHash: string; tokenId: number };

    const prisma = getPrismaClient();
    const storedTx = await prisma.blockchainTransaction.findFirst({
      where: { assetId: asset.id },
    });
    expect(storedTx).not.toBeNull();
    const txId = storedTx!.id;

    const txRes = await app.inject({
      method: "GET",
      url: `/transactions/${txId}`,
    });

    expect(txRes.statusCode).toBe(200);
    const txData = txRes.json() as {
      id: string;
      assetId: string;
      walletAddress: string;
      operation: string;
      txHash: string;
      tokenId: number;
      status: string;
    };

    expect(txData.id).toBe(txId);
    expect(txData.operation).toBe("MINT");
    expect(txData.txHash).toBe(mintData.txHash);
    expect(txData.tokenId).toBe(mintData.tokenId);
    expect(txData.status).toBe("CONFIRMED");
  });

  it("returns 404 TRANSACTION_NOT_FOUND for non-existent transaction", async () => {
    const fakeTxId = "00000000-0000-0000-0000-000000000099";
    const response = await app.inject({
      method: "GET",
      url: `/transactions/${fakeTxId}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "TRANSACTION_NOT_FOUND",
        message: "Transaction was not found",
      },
    });
  });
});
