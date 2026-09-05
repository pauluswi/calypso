import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { buildApp } from "../src/app";
import { EventListenerService } from "../src/blockchain/event-listener.service";
import { disconnectPrisma, getPrismaClient } from "../src/config/prisma";
import {
  cleanupSqliteTestDatabase,
  prepareSqliteTestDatabase,
} from "./helpers/sqlite-test-db";

let app: Awaited<ReturnType<typeof buildApp>>;

describe("Event Listener Service (Phase 8)", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-event-test" });
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

  it("handles AssetMinted event correctly", async () => {
    const listener = new EventListenerService();
    const toAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

    let emittedData: { to: string; tokenId: number } | undefined;
    listener.on("AssetMinted", (data) => {
      emittedData = data;
    });

    await listener.handleAssetMinted(toAddress, 999, "0xmocktxhash");

    expect(emittedData).toBeDefined();
    expect(emittedData?.to.toLowerCase()).toBe(toAddress.toLowerCase());
    expect(emittedData?.tokenId).toBe(999);
  });

  it("handles AssetTransferred event and updates local database state", async () => {
    const player1Res = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "sender_player" },
    });
    const player1 = player1Res.json() as { id: string };
    const wallet1Address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    await app.inject({
      method: "POST",
      url: `/players/${player1.id}/wallet`,
      payload: { address: wallet1Address },
    });

    const player2Res = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "receiver_player" },
    });
    const player2 = player2Res.json() as { id: string };
    const wallet2Address = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
    await app.inject({
      method: "POST",
      url: `/players/${player2.id}/wallet`,
      payload: { address: wallet2Address },
    });

    const assetRes = await app.inject({
      method: "POST",
      url: "/assets",
      payload: {
        name: "Dragon Scale Shield",
        description: "Impenetrable dragon shield",
        assetType: "ARMOR",
        metadataUri: "ipfs://dragon-shield",
      },
    });
    const asset = assetRes.json() as { id: string };

    const mintRes = await app.inject({
      method: "POST",
      url: `/assets/${asset.id}/mint`,
      payload: { playerId: player1.id },
    });
    const mintData = mintRes.json() as { tokenId: number };

    const listener = new EventListenerService();
    let transferredData: { from: string; to: string; tokenId: number } | undefined;
    listener.on("AssetTransferred", (data) => {
      transferredData = data;
    });

    const mockTransferTxHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    await listener.handleAssetTransferred(
      wallet1Address,
      wallet2Address,
      mintData.tokenId,
      mockTransferTxHash
    );

    expect(transferredData).toBeDefined();
    expect(transferredData?.from.toLowerCase()).toBe(wallet1Address.toLowerCase());
    expect(transferredData?.to.toLowerCase()).toBe(wallet2Address.toLowerCase());
    expect(transferredData?.tokenId).toBe(mintData.tokenId);

    const ownerRes = await app.inject({
      method: "GET",
      url: `/assets/${asset.id}/owner`,
    });
    expect(ownerRes.statusCode).toBe(200);
    expect((ownerRes.json() as { ownerAddress: string }).ownerAddress.toLowerCase()).toBe(
      wallet2Address.toLowerCase()
    );

    const player2AssetsRes = await app.inject({
      method: "GET",
      url: `/players/${player2.id}/assets`,
    });
    expect(player2AssetsRes.statusCode).toBe(200);
    const p2Assets = player2AssetsRes.json() as Array<{ id: string }>;
    expect(p2Assets).toHaveLength(1);
    expect(p2Assets[0].id).toBe(asset.id);
  });
});
