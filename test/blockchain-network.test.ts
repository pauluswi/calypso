import { describe, expect, it } from "vitest";
import { getBlockchainConfig } from "../src/blockchain/network";

const testPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const testContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

describe("Blockchain network configuration", () => {
  it("defaults to mock LOCAL mode when no blockchain settings exist", () => {
    const config = getBlockchainConfig({});

    expect(config).toMatchObject({
      network: "LOCAL",
      useMock: true,
    });
  });

  it("supports explicit TESTNET configuration without making a network call", () => {
    const config = getBlockchainConfig({
      BLOCKCHAIN_NETWORK: "TESTNET",
      BLOCKCHAIN_RPC_URL: "https://polygon-amoy.example",
      BLOCKCHAIN_PRIVATE_KEY: testPrivateKey,
      NFT_CONTRACT_ADDRESS: testContractAddress,
      USE_MOCK_BLOCKCHAIN: "true",
    });

    expect(config).toMatchObject({
      network: "TESTNET",
      useMock: true,
      rpcUrl: "https://polygon-amoy.example",
      contractAddress: testContractAddress,
    });
  });

  it("rejects TESTNET mode without required settings", () => {
    expect(() =>
      getBlockchainConfig({
        BLOCKCHAIN_NETWORK: "TESTNET",
      })
    ).toThrow("TESTNET requires BLOCKCHAIN_RPC_URL");
  });

  it("rejects unknown network names", () => {
    expect(() =>
      getBlockchainConfig({
        BLOCKCHAIN_NETWORK: "DEVNET",
      })
    ).toThrow("BLOCKCHAIN_NETWORK must be LOCAL or TESTNET");
  });
});
