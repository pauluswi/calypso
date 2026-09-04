import { type Wallet } from "@prisma/client";
import { getPrismaClient } from "../config/prisma";

type CreateWalletInput = {
  playerId: string;
  address: string;
};

export class WalletRepository {
  async upsert(input: CreateWalletInput): Promise<Wallet> {
    const prisma = getPrismaClient();
    return prisma.wallet.upsert({
      where: { playerId: input.playerId },
      create: {
        playerId: input.playerId,
        address: input.address,
      },
      update: {
        address: input.address,
      },
    });
  }

  async findByPlayerId(playerId: string): Promise<Wallet | null> {
    return getPrismaClient().wallet.findUnique({
      where: { playerId },
    });
  }

  async findByAddress(address: string): Promise<Wallet | null> {
    return getPrismaClient().wallet.findUnique({
      where: { address },
    });
  }
}
