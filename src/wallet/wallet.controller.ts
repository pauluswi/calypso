import { type FastifyInstance } from "fastify";
import { WalletService } from "./wallet.service";

const playerIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const walletBodySchema = {
  type: "object",
  required: ["address"],
  properties: {
    address: { type: "string" },
  },
} as const;

export async function registerWalletRoutes(app: FastifyInstance): Promise<void> {
  const walletService = new WalletService();

  app.post(
    "/players/:id/wallet",
    {
      schema: {
        tags: ["wallet"],
        params: playerIdParamsSchema,
        body: walletBodySchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as { address: string };

      const wallet = await walletService.associateWallet({
        playerId: params.id,
        address: body.address,
      });

      return reply.code(201).send(wallet);
    }
  );

  app.get(
    "/players/:id/wallet",
    {
      schema: {
        tags: ["wallet"],
        params: playerIdParamsSchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      return walletService.getWalletByPlayerId(params.id);
    }
  );
}
