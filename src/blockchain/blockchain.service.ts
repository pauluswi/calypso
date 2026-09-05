import { ethers } from "ethers";
import { AppError } from "../shared/errors";
import { GAME_ASSET_ABI } from "./contract";

export type MintResult = {
  txHash: string;
  tokenId: number;
};

export class BlockchainService {
  private provider?: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private contractAddress?: string;
  private isMockMode: boolean;
  private mockTokenCounter: number = 100;

  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    this.contractAddress = process.env.NFT_CONTRACT_ADDRESS;

    this.isMockMode =
      process.env.USE_MOCK_BLOCKCHAIN === "true" ||
      !rpcUrl ||
      !privateKey ||
      !this.contractAddress;

    if (!this.isMockMode && rpcUrl && privateKey) {
      try {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
      } catch {
        this.isMockMode = true;
      }
    }
  }

  async mintNFT(toAddress: string): Promise<MintResult> {
    if (this.isMockMode || !this.wallet || !this.contractAddress) {
      this.mockTokenCounter += 1;
      const tokenId = this.mockTokenCounter;
      const mockTxHash = ethers.keccak256(
        ethers.toUtf8Bytes(`mint-${toAddress}-${tokenId}-${Date.now()}-${Math.random()}`)
      );
      return {
        txHash: mockTxHash,
        tokenId,
      };
    }

    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        GAME_ASSET_ABI,
        this.wallet
      );
      const tx = await contract.mint(toAddress);
      const receipt = await tx.wait();

      let tokenId: number | undefined;
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === "AssetMinted") {
              tokenId = Number(parsed.args.tokenId);
              break;
            }
          } catch {
            // Ignore unparseable logs from standard transfers
          }
        }
      }

      if (tokenId === undefined) {
        tokenId = this.mockTokenCounter + 1;
        this.mockTokenCounter = tokenId;
      }

      return {
        txHash: receipt.hash,
        tokenId,
      };
    } catch (error) {
      throw new AppError(
        "TRANSACTION_FAILED",
        `Blockchain mint transaction failed: ${
          error instanceof Error ? error.message : "Unknown blockchain error"
        }`,
        500
      );
    }
  }
}
