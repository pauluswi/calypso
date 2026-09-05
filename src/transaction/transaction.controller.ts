import { type FastifyInstance } from "fastify";
import { TransactionService } from "./transaction.service";

const transactionIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

export async function registerTransactionRoutes(app: FastifyInstance): Promise<void> {
  const transactionService = new TransactionService();

  app.get(
    "/transactions/:id",
    {
      schema: {
        tags: ["transaction"],
        params: transactionIdParamsSchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      return transactionService.getTransactionById(params.id);
    }
  );
}
