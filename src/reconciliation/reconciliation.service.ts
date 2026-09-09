import { AssetRepository } from "../asset/asset.repository";
import { NFTService } from "../blockchain/nft.service";
import { AppError } from "../shared/errors";
import { TransactionRepository } from "../transaction/transaction.repository";

export type ReconciliationResult = {
  assetId: string;
  tokenId: number;
  dbOwnerWallet: string;
  blockchainOwnerWallet: string;
  status: "MATCH" | "OWNERSHIP_MISMATCH";
};

export class ReconciliationService {
  constructor(
    private readonly assetRepository: AssetRepository = new AssetRepository(),
    private readonly transactionRepository: TransactionRepository =
      new TransactionRepository(),
    private readonly nftService: NFTService = new NFTService()
  ) {}

  async reconcileAsset(assetId: string): Promise<ReconciliationResult> {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) {
      throw new AppError("ASSET_NOT_FOUND", "Asset was not found", 404);
    }

    const confirmedTransaction =
      await this.transactionRepository.findConfirmedByAssetId(asset.id);
    if (!confirmedTransaction || confirmedTransaction.tokenId === null) {
      throw new AppError(
        "ASSET_NOT_FOUND",
        "Asset has not been minted as an NFT",
        404
      );
    }

    const tokenId = Number(confirmedTransaction.tokenId);
    const dbOwnerWallet = confirmedTransaction.walletAddress;
    const blockchainOwnerWallet = await this.nftService.getOwnerOf(tokenId);

    return {
      assetId: asset.id,
      tokenId,
      dbOwnerWallet,
      blockchainOwnerWallet,
      status:
        dbOwnerWallet.toLowerCase() === blockchainOwnerWallet.toLowerCase()
          ? "MATCH"
          : "OWNERSHIP_MISMATCH",
    };
  }
}
