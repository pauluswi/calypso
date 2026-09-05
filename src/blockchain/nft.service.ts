import { BlockchainService, type MintResult } from "./blockchain.service";

export class NFTService {
  constructor(
    private readonly blockchainService: BlockchainService = new BlockchainService()
  ) {}

  async mint(toAddress: string): Promise<MintResult> {
    return this.blockchainService.mintNFT(toAddress);
  }
}
