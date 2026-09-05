import { getAddress, isAddress } from "ethers";
import { NFTService } from "../blockchain/nft.service";
import { AppError } from "../shared/errors";
import { TransactionRepository } from "../transaction/transaction.repository";
import { TransactionService } from "../transaction/transaction.service";
import { WalletRepository } from "../wallet/wallet.repository";
import { AssetRepository } from "./asset.repository";
import { type AssetType } from "./asset.types";

type CreateAssetInput = {
  name: string;
  description: string;
  assetType: AssetType;
  metadataUri: string;
};

type UpdateAssetInput = {
  name: string;
  description: string;
  assetType: AssetType;
  metadataUri: string;
};

type MintAssetInput = {
  assetId: string;
  playerId?: string;
  walletAddress?: string;
};

export class AssetService {
  constructor(
    private readonly repository: AssetRepository = new AssetRepository(),
    private readonly walletRepository: WalletRepository = new WalletRepository(),
    private readonly transactionService: TransactionService = new TransactionService(),
    private readonly nftService: NFTService = new NFTService(),
    private readonly transactionRepository: TransactionRepository = new TransactionRepository()
  ) {}

  async createAsset(input: CreateAssetInput) {
    return this.repository.create({
      name: input.name.trim(),
      description: input.description.trim(),
      assetType: input.assetType,
      metadataUri: input.metadataUri.trim(),
    });
  }

  async getAssetById(id: string) {
    const asset = await this.repository.findById(id);
    if (!asset) {
      throw new AppError("ASSET_NOT_FOUND", "Asset was not found", 404);
    }

    return asset;
  }

  async listAssets() {
    return this.repository.list();
  }

  async updateAsset(id: string, input: UpdateAssetInput) {
    const asset = await this.repository.update(id, {
      name: input.name.trim(),
      description: input.description.trim(),
      assetType: input.assetType,
      metadataUri: input.metadataUri.trim(),
    });

    if (!asset) {
      throw new AppError("ASSET_NOT_FOUND", "Asset was not found", 404);
    }

    return asset;
  }

  async deleteAsset(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError("ASSET_NOT_FOUND", "Asset was not found", 404);
    }
  }

  async mintAsset(input: MintAssetInput) {
    const asset = await this.getAssetById(input.assetId);

    let targetWalletAddress: string | undefined;

    if (input.walletAddress) {
      if (!isAddress(input.walletAddress)) {
        throw new AppError(
          "INVALID_WALLET_ADDRESS",
          "Invalid EVM wallet address",
          400
        );
      }
      targetWalletAddress = getAddress(input.walletAddress);
    } else if (input.playerId) {
      const wallet = await this.walletRepository.findByPlayerId(input.playerId);
      if (!wallet) {
        throw new AppError(
          "WALLET_NOT_FOUND",
          "Player does not have an associated wallet",
          404
        );
      }
      targetWalletAddress = wallet.address;
    } else {
      throw new AppError(
        "WALLET_NOT_FOUND",
        "Player ID or wallet address is required to mint asset",
        400
      );
    }

    const pendingTx = await this.transactionService.createPendingTransaction(
      asset.id,
      targetWalletAddress,
      "MINT"
    );

    try {
      const mintResult = await this.nftService.mint(targetWalletAddress);
      const confirmedTx = await this.transactionService.markConfirmed(
        pendingTx.id,
        mintResult.txHash,
        mintResult.tokenId
      );

      return {
        assetId: asset.id,
        tokenId: Number(confirmedTx.tokenId),
        txHash: confirmedTx.txHash,
        status: confirmedTx.status,
      };
    } catch (error) {
      await this.transactionService.markFailed(pendingTx.id);
      throw error;
    }
  }

  async getAssetOwner(assetId: string) {
    const asset = await this.getAssetById(assetId);
    const confirmedTx =
      await this.transactionRepository.findConfirmedByAssetId(asset.id);

    if (!confirmedTx || confirmedTx.tokenId === null) {
      throw new AppError(
        "ASSET_NOT_FOUND",
        "Asset has not been minted as an NFT",
        404
      );
    }

    const ownerAddress = await this.nftService.getOwnerOf(
      Number(confirmedTx.tokenId)
    );

    return {
      assetId: asset.id,
      tokenId: Number(confirmedTx.tokenId),
      ownerAddress,
    };
  }
}
