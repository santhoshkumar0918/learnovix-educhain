import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { eduChain } from "./chain";

// Define a contract address (to be updated after deployment)
export const LEARNOPOLY_CONTRACT_ADDRESS =
  "0x11A662B3A8F3D772F3Fa354F576b71D4894819D8";

export const config = createConfig({
  chains: [eduChain, mainnet, sepolia],
  transports: {
    [eduChain.id]: http("https://rpc.open-campus-codex.gelato.digital"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
