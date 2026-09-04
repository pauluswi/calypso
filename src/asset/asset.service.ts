import { AppError } from "../shared/errors";
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

export class AssetService {
  constructor(private readonly repository: AssetRepository = new AssetRepository()) {}

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
}
