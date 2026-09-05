import { type FastifyInstance } from "fastify";
import { PlayerService } from "./player.service";

const playerIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

const playerBodySchema = {
  type: "object",
  required: ["username"],
  properties: {
    username: { type: "string", minLength: 3, maxLength: 32 },
  },
} as const;

export async function registerPlayerRoutes(app: FastifyInstance): Promise<void> {
  const playerService = new PlayerService();

  app.post(
    "/players",
    {
      schema: {
        tags: ["player"],
        body: playerBodySchema,
      },
    },
    async (request, reply) => {
      const body = request.body as { username: string };
      const player = await playerService.createPlayer(body);
      return reply.code(201).send(player);
    }
  );

  app.get(
    "/players",
    {
      schema: {
        tags: ["player"],
      },
    },
    async () => {
      return playerService.listPlayers();
    }
  );

  app.get(
    "/players/:id",
    {
      schema: {
        tags: ["player"],
        params: playerIdParamsSchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      return playerService.getPlayerById(params.id);
    }
  );

  app.put(
    "/players/:id",
    {
      schema: {
        tags: ["player"],
        params: playerIdParamsSchema,
        body: playerBodySchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      const body = request.body as { username: string };
      return playerService.updatePlayer(params.id, body);
    }
  );

  app.delete(
    "/players/:id",
    {
      schema: {
        tags: ["player"],
        params: playerIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      await playerService.deletePlayer(params.id);
      return reply.code(204).send();
    }
  );

  app.get(
    "/players/:id/assets",
    {
      schema: {
        tags: ["player"],
        params: playerIdParamsSchema,
      },
    },
    async (request) => {
      const params = request.params as { id: string };
      return playerService.getPlayerAssets(params.id);
    }
  );
}
