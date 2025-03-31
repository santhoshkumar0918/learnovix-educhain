"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { eduChain } from "@/lib/chain";
import { ReactNode } from "react";

// Replace with actual contract address after deployment
export const LEARNOPOLY_CONTRACT_ADDRESS =
  "0x11A662B3A8F3D772F3Fa354F576b71D4894819D8";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [eduChain, mainnet, sepolia],
  transports: {
    [eduChain.id]: injected("https://rpc.open-campus-codex.gelato.digital"),
    [mainnet.id]: injected(),
    [sepolia.id]: injected(),
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
