"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { ReactNode } from "react";

// Define EduChain chain configuration
export const eduChain = {
  id: 656476,
  name: "EduChain Testnet",
  nativeCurrency: {
    name: "EduChain",
    symbol: "EDU",
    decimals: 18,
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
      name: "EduChain Explorer",
      url: "https://edu-chain-testnet.blockscout.com",
    },
  },
};

// Replace with actual contract address after deployment
export const LEARNOPOLY_CONTRACT_ADDRESS =
  "0x11A662B3A8F3D772F3Fa354F576b71D4894819D8";

const queryClient = new QueryClient();

// Creating the wagmi config with proper transports
const config = createConfig({
  chains: [eduChain, mainnet, sepolia],
  transports: {
    [eduChain.id]: http("https://rpc.open-campus-codex.gelato.digital"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [injected()],
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
