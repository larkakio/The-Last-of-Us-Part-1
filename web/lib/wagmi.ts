import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import type { CreateConnectorFn } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, baseAccount, walletConnect } from "wagmi/connectors";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");
export const targetChain = chainId === baseSepolia.id ? baseSepolia : base;

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors: CreateConnectorFn[] = [
  injected(),
  baseAccount({ appName: "Neon Wasteland: Outskirts" }),
  ...(wcId
    ? [
        walletConnect({
          projectId: wcId,
          showQrModal: true,
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [targetChain] as const,
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
