import { type BlockchainTransaction } from "@prisma/client";
import { getPrismaClient } from "../config/prisma";

type CreateTransactionInput = {
  assetId: string;
  walletAddress: string;
  operation: string;
  status: string;
  txHash?: string | null;
  tokenId?: bigint | null;
};

type UpdateTransactionInput = {
  status?: string;
  txHash?: string | null;
  tokenId?: bigint | null;
  confirmedAt?: Date | null;
};

export class TransactionRepository {
  async create(input: CreateTransactionInput): Promise<BlockchainTransaction> {
    return getPrismaClient().blockchainTransaction.create({
      data: {
        assetId: input.assetId,
        walletAddress: input.walletAddress,
        operation: input.operation,
        status: input.status,
        txHash: input.txHash ?? null,
        tokenId: input.tokenId ?? null,
      },
    });
  }

  async update(
    id: string,
    input: UpdateTransactionInput
  ): Promise<BlockchainTransaction> {
    return getPrismaClient().blockchainTransaction.update({
      where: { id },
      data: input,
    });
  }

  async findById(id: string): Promise<BlockchainTransaction | null> {
    return getPrismaClient().blockchainTransaction.findUnique({
      where: { id },
    });
  }

  async findConfirmedByAssetId(assetId: string): Promise<BlockchainTransaction | null> {
    return getPrismaClient().blockchainTransaction.findFirst({
      where: {
        assetId,
        status: "CONFIRMED",
        tokenId: { not: null },
      },
      orderBy: { confirmedAt: "desc" },
    });
  }

  async findConfirmedByWalletAddress(walletAddress: string): Promise<BlockchainTransaction[]> {
    return getPrismaClient().blockchainTransaction.findMany({
      where: {
        walletAddress,
        status: "CONFIRMED",
        tokenId: { not: null },
      },
      orderBy: { confirmedAt: "desc" },
    });
  }

  async findFirstByTokenId(tokenId: bigint | number): Promise<BlockchainTransaction | null> {
    return getPrismaClient().blockchainTransaction.findFirst({
      where: {
        tokenId: BigInt(tokenId),
        status: "CONFIRMED",
      },
      orderBy: { confirmedAt: "desc" },
    });
  }
}
