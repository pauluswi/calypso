import { Prisma } from "@prisma/client";
import { AssetRepository } from "../asset/asset.repository";
import { AppError } from "../shared/errors";
import { TransactionRepository } from "../transaction/transaction.repository";
import { WalletRepository } from "../wallet/wallet.repository";
import { PlayerRepository } from "./player.repository";

type CreatePlayerInput = {
  username: string;
};

type UpdatePlayerInput = {
  username: string;
};

export class PlayerService {
  constructor(
    private readonly repository: PlayerRepository = new PlayerRepository(),
    private readonly walletRepository: WalletRepository = new WalletRepository(),
    private readonly transactionRepository: TransactionRepository = new TransactionRepository(),
    private readonly assetRepository: AssetRepository = new AssetRepository()
  ) {}

  async createPlayer(input: CreatePlayerInput) {
    try {
      return await this.repository.create({ username: input.username.trim() });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Username is already in use",
          409
        );
      }

      throw error;
    }
  }

  async getPlayerById(id: string) {
    const player = await this.repository.findById(id);
    if (!player) {
      throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
    }

    return player;
  }

  async listPlayers() {
    return this.repository.list();
  }

  async updatePlayer(id: string, input: UpdatePlayerInput) {
    try {
      const player = await this.repository.update(id, { username: input.username.trim() });

      if (!player) {
        throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
      }

      return player;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Username is already in use",
          409
        );
      }

      throw error;
    }
  }

  async deletePlayer(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
    }
  }

  async getPlayerAssets(playerId: string) {
    const player = await this.getPlayerById(playerId);
    const wallet = await this.walletRepository.findByPlayerId(player.id);
    if (!wallet) {
      return [];
    }

    const confirmedTxs = await this.transactionRepository.findConfirmedByWalletAddress(
      wallet.address
    );

    const playerAssets = [];
    for (const tx of confirmedTxs) {
      const asset = await this.assetRepository.findById(tx.assetId);
      if (asset) {
        playerAssets.push({
          id: asset.id,
          name: asset.name,
          description: asset.description,
          assetType: asset.assetType,
          metadataUri: asset.metadataUri,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
          nft: {
            tokenId: tx.tokenId !== null ? Number(tx.tokenId) : null,
            txHash: tx.txHash,
            status: tx.status,
          },
        });
      }
    }

    return playerAssets;
  }
}
