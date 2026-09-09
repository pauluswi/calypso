import { AppError } from "../shared/errors";

export type BlockchainNetwork = "LOCAL" | "TESTNET";

export type BlockchainConfig = {
  network: BlockchainNetwork;
  rpcUrl?: string;
  privateKey?: string;
  contractAddress?: string;
  useMock: boolean;
};

export function getBlockchainConfig(
  environment: NodeJS.ProcessEnv = process.env
): BlockchainConfig {
  const networkValue = environment.BLOCKCHAIN_NETWORK?.toUpperCase() ?? "LOCAL";
  if (networkValue !== "LOCAL" && networkValue !== "TESTNET") {
    throw new AppError(
      "VALIDATION_ERROR",
      "BLOCKCHAIN_NETWORK must be LOCAL or TESTNET",
      500
    );
  }

  const network = networkValue as BlockchainNetwork;
  const rpcUrl = environment.BLOCKCHAIN_RPC_URL;
  const privateKey = environment.BLOCKCHAIN_PRIVATE_KEY;
  const contractAddress = environment.NFT_CONTRACT_ADDRESS;
  const useMock = environment.USE_MOCK_BLOCKCHAIN !== "false";

  if (network === "TESTNET" && (!rpcUrl || !privateKey || !contractAddress)) {
    throw new AppError(
      "BLOCKCHAIN_UNAVAILABLE",
      "TESTNET requires BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, and NFT_CONTRACT_ADDRESS",
      500
    );
  }

  return {
    network,
    rpcUrl,
    privateKey,
    contractAddress,
    useMock: network === "LOCAL" ? useMock || !rpcUrl || !privateKey || !contractAddress : useMock,
  };
}
