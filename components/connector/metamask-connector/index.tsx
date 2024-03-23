import { Connector } from "wagmi";

interface IWalletConfig {
  connect?: (args: { connector: Connector<any, any>; }) => Promise<void>;
  connectors?: Connector<any, any>[];
  isConnected?: boolean;
}

interface IMetaMaskConnector {
  config: IWalletConfig;
}

interface IMetaMask extends Connector<any, any> {
  name: string;
  ready: boolean;
}

export const MetaMaskConnector = ({ config }: IMetaMaskConnector) => {
  const { connect, connectors, isConnected } = config;
  const [metaMask] = connectors || [];

  const isMetaMaskInstalled = metaMask?.ready;
  const metaMaskName = metaMask?.name || "MetaMask";

  const handleConnect = async () => {
    if (isMetaMaskInstalled && connect) {
      try {
        await connect({ connector: metaMask as IMetaMask });
      } catch (error) {
        console.error("Failed to connect to MetaMask:", error);
      }
    }
  };

  return (
    <>
      <div>
        <button
          onClick={handleConnect}
          className="flex items-center justify-center w-full px-4 py-2 text-2xl text-white bg-orange-500 rounded-md hover:bg-orange-600"
        >
          <h1 suppressHydrationWarning className="">
            {isConnected ? metaMaskName : "Connect MetaMask"}
          </h1>
        </button>
      </div>
      <h1 className="my-[5px] text-center" suppressHydrationWarning>
        {isMetaMaskInstalled ? '' : `The ${metaMaskName} is not installed`}
      </h1>
    </>
  );
};