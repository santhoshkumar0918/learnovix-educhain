import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      evmVersion: "paris",
    },
  },
  networks: {
    educhain: {
      url:
        process.env.EDUCHAIN_RPC_URL ||
        "https://rpc.open-campus-codex.gelato.digital",
      chainId: 656476,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1_000_000_000, // 1 gwei
      gas: 10_000_000, // 5M gas
      timeout: 120_000, // 1 minute timeout
    },
  },
  etherscan: {
    apiKey: {
      "educhain-testnet": process.env.BLOCKSCOUT_KEY || "",
    },
    customChains: [
      {
        network: "educhain-testnet",
        chainId: 656476,
        urls: {
          apiURL: "https://edu-chain-testnet.blockscout.com/api",
          browserURL: "https://edu-chain-testnet.blockscout.com",
        },
      },
    ],
  },
};

export default config;
