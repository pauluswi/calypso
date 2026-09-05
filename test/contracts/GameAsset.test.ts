import { expect } from "chai";
import { ethers } from "hardhat";
import { GameAsset } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("GameAsset Smart Contract", () => {
  let gameAsset: GameAsset;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, player1, player2] = await ethers.getSigners();
    const GameAssetFactory = await ethers.getContractFactory("GameAsset");
    gameAsset = await GameAssetFactory.deploy();
    await gameAsset.waitForDeployment();
  });

  describe("Deployment", () => {
    it("has correct name and symbol", async () => {
      expect(await gameAsset.name()).to.equal("GameAsset");
      expect(await gameAsset.symbol()).to.equal("GA");
    });

    it("sets deployer as contract owner", async () => {
      expect(await gameAsset.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", () => {
    it("allows contract owner to mint an asset to a player", async () => {
      const tx = await gameAsset.mint(player1.address);
      await expect(tx)
        .to.emit(gameAsset, "AssetMinted")
        .withArgs(player1.address, 1n);

      expect(await gameAsset.ownerOf(1n)).to.equal(player1.address);
    });

    it("increments tokenId sequentially for successive mints", async () => {
      await gameAsset.mint(player1.address);
      await gameAsset.mint(player2.address);

      expect(await gameAsset.ownerOf(1n)).to.equal(player1.address);
      expect(await gameAsset.ownerOf(2n)).to.equal(player2.address);
    });

    it("reverts when a non-owner attempts to mint", async () => {
      await expect(
        gameAsset.connect(player1).mint(player1.address)
      ).to.be.revertedWithCustomError(gameAsset, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transferring & Ownership", () => {
    beforeEach(async () => {
      await gameAsset.mint(player1.address);
    });

    it("allows token owner to transfer using transferAsset and emits AssetTransferred", async () => {
      const tx = await gameAsset.connect(player1).transferAsset(player1.address, player2.address, 1n);
      await expect(tx)
        .to.emit(gameAsset, "AssetTransferred")
        .withArgs(player1.address, player2.address, 1n);

      expect(await gameAsset.ownerOf(1n)).to.equal(player2.address);
    });

    it("allows standard ERC721 transferFrom", async () => {
      await gameAsset.connect(player1).transferFrom(player1.address, player2.address, 1n);
      expect(await gameAsset.ownerOf(1n)).to.equal(player2.address);
    });

    it("reverts when non-owner attempts to transfer", async () => {
      await expect(
        gameAsset.connect(player2).transferFrom(player1.address, player2.address, 1n)
      ).to.be.revertedWithCustomError(gameAsset, "ERC721InsufficientApproval");
    });
  });
});
