import Fastify, { type FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { disconnectPrisma } from "./config/prisma";
import { registerAssetRoutes } from "./asset/asset.controller";
import { registerPlayerRoutes } from "./player/player.controller";
import { AppError } from "./shared/errors";

type ValidationLikeError = {
  validation?: unknown;
  message?: string;
};

function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

type BuildAppOptions = {
  serviceName?: string;
};

export async function buildApp(
  options: BuildAppOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  const serviceName = options.serviceName ?? "calypso";

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Calypso API",
        description: "Web3 game asset backend",
        version: "0.1.0",
      },
      servers: [],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  app.get("/health", async () => {
    return {
      status: "UP",
      service: serviceName,
    };
  });

  await registerPlayerRoutes(app);
  await registerAssetRoutes(app);

  app.setErrorHandler((error, request, reply) => {
    if (isAppError(error)) {
      return reply.code(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    const maybeValidationError = error as ValidationLikeError;
    if (maybeValidationError.validation) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: maybeValidationError.message ?? "Request validation failed",
        },
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    });
  });

  app.addHook("onClose", async () => {
    await disconnectPrisma();
  });

  return app;
}
