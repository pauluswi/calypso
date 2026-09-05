import { AppError } from "../shared/errors";
import { TransactionRepository } from "./transaction.repository";

export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository = new TransactionRepository()
  ) {}

  async createPendingTransaction(
    assetId: string,
    walletAddress: string,
    operation: string = "MINT"
  ) {
    return this.repository.create({
      assetId,
      walletAddress,
      operation,
      status: "PENDING",
    });
  }

  async markConfirmed(id: string, txHash: string, tokenId: number | bigint) {
    return this.repository.update(id, {
      status: "CONFIRMED",
      txHash,
      tokenId: BigInt(tokenId),
      confirmedAt: new Date(),
    });
  }

  async markFailed(id: string, txHash?: string) {
    return this.repository.update(id, {
      status: "FAILED",
      txHash: txHash ?? null,
    });
  }

  async getTransactionById(id: string) {
    const tx = await this.repository.findById(id);
    if (!tx) {
      throw new AppError("TRANSACTION_NOT_FOUND", "Transaction was not found", 404);
    }
    return {
      id: tx.id,
      assetId: tx.assetId,
      walletAddress: tx.walletAddress,
      operation: tx.operation,
      txHash: tx.txHash,
      tokenId: tx.tokenId !== null ? Number(tx.tokenId) : null,
      status: tx.status,
      createdAt: tx.createdAt,
      confirmedAt: tx.confirmedAt,
    };
  }
}
