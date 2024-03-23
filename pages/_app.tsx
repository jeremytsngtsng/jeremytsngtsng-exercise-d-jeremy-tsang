import { AppProps } from "next/app"

import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"

import { publicProvider } from "wagmi/providers/public"
import { infuraProvider } from "wagmi/providers/infura";
import "../styles/tailwind.css"
import { WalletContextProvider } from "context/wallet-context"
import { GameProvider } from "context/game-context";


function MyApp({ Component, pageProps }: AppProps) {
  const { chains, publicClient } = configureChains([sepolia],
    [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY || "" }) // publicProvider is too slow :(
    ]
)

  const config = createConfig({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({
        chains,
        options: {
          shimDisconnect: true,
          UNSTABLE_shimOnConnectSelectAccount: true,
        },
      }),
    ],
    publicClient,
  })

  return (
    <WagmiConfig config={config}>
      <WalletContextProvider config={config}>
        <GameProvider>
          <Component {...pageProps} />
        </GameProvider>
      </WalletContextProvider>
    </WagmiConfig>
  )
}

export default MyApp
