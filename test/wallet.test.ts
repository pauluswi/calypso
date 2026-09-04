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

describe("Wallet API integration (Phase 3)", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = prepareSqliteTestDatabase();
    app = await buildApp({ serviceName: "calypso-wallet-test" });
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

  it("associates a valid EVM wallet with a player and retrieves it", async () => {
    const playerRes = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "crypto_player" },
    });
    const player = playerRes.json() as { id: string };

    const validAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

    const associateRes = await app.inject({
      method: "POST",
      url: `/players/${player.id}/wallet`,
      payload: { address: validAddress },
    });

    expect(associateRes.statusCode).toBe(201);
    const wallet = associateRes.json() as {
      id: string;
      playerId: string;
      address: string;
    };
    expect(wallet.playerId).toBe(player.id);
    expect(wallet.address.toLowerCase()).toBe(validAddress.toLowerCase());

    const getWalletRes = await app.inject({
      method: "GET",
      url: `/players/${player.id}/wallet`,
    });

    expect(getWalletRes.statusCode).toBe(200);
    expect((getWalletRes.json() as { address: string }).address.toLowerCase()).toBe(
      validAddress.toLowerCase()
    );
  });

  it("rejects an invalid EVM wallet address with INVALID_WALLET_ADDRESS", async () => {
    const playerRes = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "invalid_wallet_player" },
    });
    const player = playerRes.json() as { id: string };

    const response = await app.inject({
      method: "POST",
      url: `/players/${player.id}/wallet`,
      payload: { address: "not-an-evm-address" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_WALLET_ADDRESS",
        message: "Invalid EVM wallet address",
      },
    });
  });

  it("returns 404 PLAYER_NOT_FOUND when associating wallet for non-existent player", async () => {
    const randomUuid = "00000000-0000-0000-0000-000000000099";
    const validAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

    const response = await app.inject({
      method: "POST",
      url: `/players/${randomUuid}/wallet`,
      payload: { address: validAddress },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "PLAYER_NOT_FOUND",
        message: "Player was not found",
      },
    });
  });

  it("returns 404 WALLET_NOT_FOUND when fetching wallet for player without a wallet", async () => {
    const playerRes = await app.inject({
      method: "POST",
      url: "/players",
      payload: { username: "walletless_player" },
    });
    const player = playerRes.json() as { id: string };

    const response = await app.inject({
      method: "GET",
      url: `/players/${player.id}/wallet`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "WALLET_NOT_FOUND",
        message: "Wallet was not found for this player",
      },
    });
  });
});
