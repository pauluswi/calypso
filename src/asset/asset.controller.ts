import { type FastifyInstance } from "fastify";
import { AssetService } from "./asset.service";
import { ASSET_TYPES, type AssetType } from "./asset.types";

const assetIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const assetBodySchema = {
  type: "object",
  required: ["name", "description", "assetType", "metadataUri"],
  properties: {
    name: { type: "string", minLength: 2, maxLength: 80 },
    description: { type: "string", minLength: 2, maxLength: 500 },
    assetType: { type: "string", enum: [...ASSET_TYPES] },
    metadataUri: { type: "string", minLength: 1, maxLength: 3000 },
  },
} as const;

export async function registerAssetRoutes(app: FastifyInstance): Promise<void> {
  const assetService = new AssetService();

  app.post(
    "/assets",
    {
      schema: {
        tags: ["asset"],
        body: assetBodySchema,
      },
    },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        description: string;
        assetType: AssetType;
        metadataUri: string;
      };
      const asset = await assetService.createAsset(body);
      return reply.code(201).send(asset);
    }
  );

  app.get(
    "/assets",
    {
      schema: {
        tags: ["asset"],
      },
    },
    async () => {
      return assetService.listAssets();
    }
  );

  app.get(
    "/assets/:id",
    {
      schema: {
        tags: ["asset"],
        params: assetIdParamsSchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      return assetService.getAssetById(params.id);
    }
  );

  app.put(
    "/assets/:id",
    {
      schema: {
        tags: ["asset"],
        params: assetIdParamsSchema,
        body: assetBodySchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      const body = request.body as {
        name: string;
        description: string;
        assetType: AssetType;
        metadataUri: string;
      };
      return assetService.updateAsset(params.id, body);
    }
  );

  app.delete(
    "/assets/:id",
    {
      schema: {
        tags: ["asset"],
        params: assetIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      await assetService.deleteAsset(params.id);
      return reply.code(204).send();
    }
  );
}
