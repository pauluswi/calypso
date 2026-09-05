import { BlockchainService, type MintResult } from "./blockchain.service";

export class NFTService {
  constructor(
    private readonly blockchainService: BlockchainService = new BlockchainService()
  ) {}

  async mint(toAddress: string): Promise<MintResult> {
    return this.blockchainService.mintNFT(toAddress);
  }

  async getOwnerOf(tokenId: number): Promise<string> {
    return this.blockchainService.getOwnerOfToken(tokenId);
  }

  async transferAsset(
    fromAddress: string,
    toAddress: string,
    tokenId: number
  ): Promise<{ txHash: string; tokenId: number }> {
    return this.blockchainService.transferNFT(fromAddress, toAddress, tokenId);
  }
}
