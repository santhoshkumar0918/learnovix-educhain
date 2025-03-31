import { defineChain } from "viem";

export const eduChain = defineChain({
  id: 656476,
  name: "EduChain",
  nativeCurrency: {
    decimals: 18,
    name: "EduChain",
    symbol: "EDU",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
    public: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://edu-chain-testnet.blockscout.com",
    },
  },
  testnet: true,
});
