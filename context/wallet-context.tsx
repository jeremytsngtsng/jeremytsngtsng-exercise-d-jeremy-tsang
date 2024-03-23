import * as _tanstack_react_query from "@tanstack/react-query";
import * as _wagmi_core from "@wagmi/core";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ConnectorData,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsName,
  useNetwork,
  useSwitchNetwork,
  useWalletClient,
} from "wagmi";
import { IInitialContextState, IWalletContext } from "utils/interface_type";

let INITIAL_STATE: IInitialContextState = {};

const WalletContext = createContext(INITIAL_STATE);

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider = ({ children, config }: IWalletContext) => {
  const { connectors } = config;

  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
    setContextValue((contextValue) => ({
      ...contextValue,
      address: undefined,
      isConnected: false,
      name: undefined,
      chain: undefined,
      accountBalance: undefined,
      walletClient: undefined,
    }));
  };

  const { connector: activeConnector, isConnected, address } = useAccount();
  const { connect, isLoading, pendingConnector } = useConnect({
    onSuccess(data) {
      const { account: connectedAccount } = data;
    },

    onError(error) {
      console.log(error);
    },
  });

  const { data: name } = useEnsName({
    address,
  });
  const { chain } = useNetwork();
  const { data: accountBalance } = useBalance({
    address,
  });
  const { chains, switchNetwork } = useSwitchNetwork();

  const { data: walletClient } = useWalletClient({ chainId: chain?.id });
  

  const [contextValue, setContextValue] = useState<IInitialContextState>({
    activeConnector,
    connectors,
    connect,
    pendingConnector,
    disconnect: handleDisconnect,
  });

  useEffect(() => {
    const handleConnectorUpdate = (data: ConnectorData) => {
      const { account: connectedAccount } = data;
      if (connectedAccount) {
      }
    };

    if (activeConnector) {
      activeConnector.on("change", handleConnectorUpdate);

      return () => {
        activeConnector.off("change", handleConnectorUpdate);
      };
    }
  }, [activeConnector]);

  useEffect(() => {
    if (isConnected) {
      setContextValue((contextValue) => ({
        ...contextValue,
        address,
        isLoading,
        isConnected,
      }));
    }
  }, [address, isLoading, isConnected]);

  useEffect(() => {
    if (isConnected && name) {
      setContextValue((contextValue) => ({
        ...contextValue,
        name,
      }));
    }
  }, [isConnected, name]);

  useEffect(() => {
    if (isConnected && chain && accountBalance) {
      setContextValue((contextValue) => ({
        ...contextValue,
        chain,
        accountBalance,
      }));
    }
  }, [isConnected, chain, accountBalance]);

  useEffect(() => {
    if (isConnected && chains && switchNetwork) {
      setContextValue((contextValue) => ({
        ...contextValue,
        chains,
        switchNetwork,
      }));
    }
  }, [isConnected, chains, switchNetwork]);

  useEffect(() => {
    if (isConnected && walletClient) {
      setContextValue((contextValue) => ({
        ...contextValue,
        walletClient,
      }));
    }
  }, [isConnected, walletClient]);

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};