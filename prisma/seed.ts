import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.player.upsert({
    where: { username: "wied" },
    create: { username: "wied" },
    update: {},
  });

  await prisma.asset.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Dragon Sword",
      description: "A legendary sword",
      assetType: "WEAPON",
      metadataUri: "ipfs://dragon-sword",
    },
    update: {},
  });
}

void main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
