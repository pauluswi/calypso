import { Prisma } from "@prisma/client";
import { AppError } from "../shared/errors";
import { PlayerRepository } from "./player.repository";

type CreatePlayerInput = {
  username: string;
};

type UpdatePlayerInput = {
  username: string;
};

export class PlayerService {
  constructor(private readonly repository: PlayerRepository = new PlayerRepository()) {}

  async createPlayer(input: CreatePlayerInput) {
    try {
      return await this.repository.create({ username: input.username.trim() });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Username is already in use",
          409
        );
      }

      throw error;
    }
  }

  async getPlayerById(id: string) {
    const player = await this.repository.findById(id);
    if (!player) {
      throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
    }

    return player;
  }

  async listPlayers() {
    return this.repository.list();
  }

  async updatePlayer(id: string, input: UpdatePlayerInput) {
    try {
      const player = await this.repository.update(id, { username: input.username.trim() });

      if (!player) {
        throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
      }

      return player;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Username is already in use",
          409
        );
      }

      throw error;
    }
  }

  async deletePlayer(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
    }
  }
}
