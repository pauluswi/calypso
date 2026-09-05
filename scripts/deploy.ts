import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying GameAsset contract with account:", deployer.address);

  const GameAssetFactory = await ethers.getContractFactory("GameAsset");
  const gameAsset = await GameAssetFactory.deploy();
  await gameAsset.waitForDeployment();

  const contractAddress = await gameAsset.getAddress();
  console.log("GameAsset contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
