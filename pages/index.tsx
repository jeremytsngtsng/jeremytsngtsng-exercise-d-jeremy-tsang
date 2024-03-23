import { DetailAcountPopover } from "components/popover/detail-account";
import Navbar from "components/navbar";
import { useWalletContext } from "context/wallet-context";
import { useEffect, useState } from "react";
import Create from "components/sections/interact-rps-create";
import { Button } from "antd";
import Join from "components/sections/interact-rps-join";
import Result from "components/sections/interact-rps-result";
import Claim from "components/sections/interact-rps-claim";
import { useGameContext } from "context/game-context";

export default function App() {
  const { connect, connectors, disconnect, isConnected, address, name, chain, accountBalance, switchNetwork } =
    useWalletContext();


  const { activeTab, setActiveTab } = useGameContext();

  useEffect(() => {
    !isConnected && setActiveTab("");
  }, [isConnected]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contractParam = urlParams.get("contract");
    if (contractParam && isConnected) {
      setActiveTab("join")
    }
  }, [isConnected]);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-white dark:bg-gray-900 flex-grow">
        <Navbar
          config={{ connect, connectors, disconnect, isConnected, address, chain, switchNetwork }}
          details={<DetailAcountPopover data={{ address, name, chain, accountBalance }} />}
        />

        <div className="mx-auto grid max-w-screen-xl px-16 py-8 text-center lg:py-8">
          {isConnected ? (
            <div className="flex justify-center space-x-8 my-8">
              <Button
                className={`rounded-lg shadow-md px-4 py-6 text-2xl flex items-center justify-center ${activeTab === "create" ? "bg-blue-100 border-blue-500" : ""
                  }`}
                onClick={() => (activeTab === "create" ? setActiveTab("") : setActiveTab("create"))}
              >
                New Game
              </Button>
              <Button
                className={`rounded-lg shadow-md px-4 py-6 text-2xl flex items-center justify-center ${activeTab === "join" ? "bg-blue-100 border-blue-500" : ""
                  }`}
                onClick={() => (activeTab === "join" ? setActiveTab("") : setActiveTab("join"))}
              >
                Join Game
              </Button>
              <Button
                className={`rounded-lg shadow-md px-4 py-6 text-2xl flex items-center justify-center ${activeTab === "result" ? "bg-blue-100 border-blue-500" : ""
                  }`}
                onClick={() => (activeTab === "result" ? setActiveTab("") : setActiveTab("result"))}
              >
                Solve Game
              </Button>
              <Button
                className={`rounded-lg shadow-md px-4 py-6 text-2xl flex items-center justify-center ${activeTab === "claim" ? "bg-blue-100 border-blue-500" : ""
                  }`}
                onClick={() => (activeTab === "claim" ? setActiveTab("") : setActiveTab("claim"))}
              >
                Claim Stake
              </Button>
            </div>
          ) : (
            ""
          )}

          {activeTab === "" && (
            <div className="flex flex-col items-center justify-center">
              {!isConnected ? (
                <>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-16 mt-48">
                    Let&apos;s play
                  </h1>
                  <span className="text-6xl md:text-7xl lg:text-8xl mb-16">✊ 🖐️ ✌️ 🖖 🤏</span>
                  <span className="text-2xl md:text-3xl lg:text-4xl text-gray-500">Connect wallet to begin!</span>
                </>
              ) : (
                <>
                  <span className="text-6xl md:text-7xl lg:text-8xl mb-8 mt-16">👆</span>
                  <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-8">
                    Ready to play?
                  </span>
                  <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-tight">
                    Create or Join a game!
                  </span>
                </>
              )}
            </div>
          )}
          {activeTab === "create" && <Create />}
          {activeTab === "join" && <Join />}
          {activeTab === "result" && <Result />}
          {activeTab === "claim" && <Claim />}
        </div>
      </section>
      <footer className="bg-gray-100 py-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">
            Made with ❤️ ️️ ️b️y️ ️J️e️r️e️m️y️ ️T️s️a️n️g️
          </p>
        </div>
      </footer>
    </div>
  );
}