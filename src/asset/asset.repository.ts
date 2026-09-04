import { type Asset } from "@prisma/client";
import { getPrismaClient } from "../config/prisma";
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

export class AssetRepository {
  async create(input: CreateAssetInput): Promise<Asset> {
    return getPrismaClient().asset.create({ data: input });
  }

  async findById(id: string): Promise<Asset | null> {
    return getPrismaClient().asset.findUnique({ where: { id } });
  }

  async list(): Promise<Asset[]> {
    return getPrismaClient().asset.findMany({ orderBy: { createdAt: "desc" } });
  }

  async update(id: string, input: UpdateAssetInput): Promise<Asset | null> {
    const prisma = getPrismaClient();
    const existing = await prisma.asset.findUnique({ where: { id } });

    if (!existing) {
      return null;
    }

    return prisma.asset.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    const existing = await prisma.asset.findUnique({ where: { id } });

    if (!existing) {
      return false;
    }

    await prisma.asset.delete({ where: { id } });
    return true;
  }
}
