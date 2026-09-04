import { type Player } from "@prisma/client";
import { getPrismaClient } from "../config/prisma";

type CreatePlayerInput = {
  username: string;
};

type UpdatePlayerInput = {
  username: string;
};

export class PlayerRepository {
  async create(input: CreatePlayerInput): Promise<Player> {
    return getPrismaClient().player.create({ data: input });
  }

  async findById(id: string): Promise<Player | null> {
    return getPrismaClient().player.findUnique({ where: { id } });
  }

  async list(): Promise<Player[]> {
    return getPrismaClient().player.findMany({ orderBy: { createdAt: "desc" } });
  }

  async update(id: string, input: UpdatePlayerInput): Promise<Player | null> {
    const prisma = getPrismaClient();
    const existing = await prisma.player.findUnique({ where: { id } });

    if (!existing) {
      return null;
    }

    return prisma.player.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<boolean> {
    const prisma = getPrismaClient();
    const existing = await prisma.player.findUnique({ where: { id } });

    if (!existing) {
      return false;
    }

    await prisma.player.delete({ where: { id } });
    return true;
  }
}
