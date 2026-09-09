import { type FastifyInstance } from "fastify";
import { ReconciliationService } from "./reconciliation.service";

const assetIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

export async function registerReconciliationRoutes(
  app: FastifyInstance
): Promise<void> {
  const reconciliationService = new ReconciliationService();

  app.post(
    "/reconciliation/assets/:id",
    {
      schema: {
        tags: ["reconciliation"],
        params: assetIdParamsSchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      return reconciliationService.reconcileAsset(params.id);
    }
  );
}
