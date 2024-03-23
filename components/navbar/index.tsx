import { ReactNode, useEffect, useState } from "react";
import { MetaMaskConnector } from "components/connector/metamask-connector";
import { IInitialContextState } from "utils/interface_type";
import { sepolia } from "wagmi";
import { RenderFunction } from "antd/es/_util/getRenderPropValue";

interface INavbar {
  config: IInitialContextState;
  details: ReactNode | RenderFunction;
}

export default function Navbar({ config, details }: INavbar) {
  const { connect, connectors, disconnect, isConnected, chain, switchNetwork } = config;

  const [currentNetwork, setCurrentNetwork] = useState<number | undefined>(chain?.id);

  useEffect(() => {
    setCurrentNetwork(chain?.id);
  }, [chain]);

  const isSepolia = currentNetwork === sepolia.id;

  const handleSwitchNetwork = () => {
    switchNetwork?.(sepolia.id);
  };

  return (
    <div className="flex justify-end p-4">
      <div className="flex gap-2">
        {!isConnected && (
          <div>
            <MetaMaskConnector config={{ connectors, connect, isConnected }} />
          </div>
        )}
        {isConnected && (
          <button
            onClick={() => disconnect!()}
            className="px-4 py-2 text-2xl text-gray-500 bg-white border border-gray-500 rounded-md hover:bg-gray-100"
          >
            <span suppressHydrationWarning>
              Disconnect
            </span>
          </button>
        )}

        {isConnected && 
          <>
            {details}
          </>
        }

        {isConnected && chain && !isSepolia && (
          <button
            onClick={handleSwitchNetwork}
            className="px-4 py-2 text-2xl text-white bg-gray-500 rounded-md hover:bg-gray-600"
          >
            <span suppressHydrationWarning>
              Switch to Sepolia
            </span>
          </button>
        )}
      </div>
    </div>
  );
}