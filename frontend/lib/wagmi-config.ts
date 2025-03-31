import { http, createConfig } from "@wagmi/core";
import { mainnet, sepolia } from "@wagmi/core/chains";
import { eduChain } from "./chains";

// Define a contract address (to be updated after deployment)
export const LEARNOPOLY_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000000";

export const config = createConfig({
  chains: [eduChain, mainnet, sepolia],
  transports: {
    [eduChain.id]: http("https://rpc.open-campus-codex.gelato.digital"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
