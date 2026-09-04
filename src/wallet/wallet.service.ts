import { getAddress, isAddress } from "ethers";
import { PlayerRepository } from "../player/player.repository";
import { AppError } from "../shared/errors";
import { WalletRepository } from "./wallet.repository";

type AssociateWalletInput = {
  playerId: string;
  address: string;
};

export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository = new WalletRepository(),
    private readonly playerRepository: PlayerRepository = new PlayerRepository()
  ) {}

  async associateWallet(input: AssociateWalletInput) {
    if (!input.address || !isAddress(input.address)) {
      throw new AppError(
        "INVALID_WALLET_ADDRESS",
        "Invalid EVM wallet address",
        400
      );
    }

    const player = await this.playerRepository.findById(input.playerId);
    if (!player) {
      throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
    }

    const normalizedAddress = getAddress(input.address);

    const existingWalletWithAddress =
      await this.walletRepository.findByAddress(normalizedAddress);
    if (
      existingWalletWithAddress &&
      existingWalletWithAddress.playerId !== input.playerId
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Wallet address is already associated with another player",
        409
      );
    }

    return this.walletRepository.upsert({
      playerId: input.playerId,
      address: normalizedAddress,
    });
  }

  async getWalletByPlayerId(playerId: string) {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new AppError("PLAYER_NOT_FOUND", "Player was not found", 404);
    }

    const wallet = await this.walletRepository.findByPlayerId(playerId);
    if (!wallet) {
      throw new AppError(
        "WALLET_NOT_FOUND",
        "Wallet was not found for this player",
        404
      );
    }

    return wallet;
  }
}
