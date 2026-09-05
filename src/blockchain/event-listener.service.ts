import { EventEmitter } from "node:events";
import { ethers } from "ethers";
import { TransactionRepository } from "../transaction/transaction.repository";
import { BlockchainService } from "./blockchain.service";
import { GAME_ASSET_ABI } from "./contract";

export class EventListenerService extends EventEmitter {
  private provider?: ethers.JsonRpcProvider;
  private contract?: ethers.Contract;
  private isListening: boolean = false;

  constructor(
    private readonly transactionRepository: TransactionRepository = new TransactionRepository()
  ) {
    super();
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

    if (rpcUrl && contractAddress && process.env.USE_MOCK_BLOCKCHAIN !== "true") {
      try {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.contract = new ethers.Contract(
          contractAddress,
          GAME_ASSET_ABI,
          this.provider
        );
      } catch {
        // Fallback to manual/mock mode if provider connection fails
      }
    }
  }

  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;

    if (this.contract) {
      this.contract.on(
        "AssetMinted",
        (to: string, tokenId: bigint, event: { log: { transactionHash: string } }) => {
          const txHash = event?.log?.transactionHash;
          void this.handleAssetMinted(to, Number(tokenId), txHash);
        }
      );

      this.contract.on(
        "AssetTransferred",
        (
          from: string,
          to: string,
          tokenId: bigint,
          event: { log: { transactionHash: string } }
        ) => {
          const txHash = event?.log?.transactionHash;
          void this.handleAssetTransferred(from, to, Number(tokenId), txHash);
        }
      );
    }
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    if (this.contract) {
      this.contract.removeAllListeners();
    }

    this.isListening = false;
  }

  async handleAssetMinted(
    toAddress: string,
    tokenId: number,
    txHash?: string
  ): Promise<void> {
    const normalizedTo = ethers.getAddress(toAddress);
    BlockchainService.setMockOwner(tokenId, normalizedTo);

    this.emit("AssetMinted", {
      to: normalizedTo,
      tokenId,
      txHash,
    });
  }

  async handleAssetTransferred(
    fromAddress: string,
    toAddress: string,
    tokenId: number,
    txHash?: string
  ): Promise<void> {
    const normalizedFrom = ethers.getAddress(fromAddress);
    const normalizedTo = ethers.getAddress(toAddress);

    BlockchainService.setMockOwner(tokenId, normalizedTo);

    const existingTx = await this.transactionRepository.findFirstByTokenId(tokenId);

    if (existingTx) {
      const transferTxHash =
        txHash ??
        ethers.keccak256(
          ethers.toUtf8Bytes(
            `transfer-${normalizedFrom}-${normalizedTo}-${tokenId}-${Date.now()}`
          )
        );

      await this.transactionRepository.create({
        assetId: existingTx.assetId,
        walletAddress: normalizedTo,
        operation: "TRANSFER",
        status: "CONFIRMED",
        txHash: transferTxHash,
        tokenId: BigInt(tokenId),
      });
    }

    this.emit("AssetTransferred", {
      from: normalizedFrom,
      to: normalizedTo,
      tokenId,
      txHash,
    });
  }
}
