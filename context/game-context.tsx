import React, { createContext, useContext, useState } from "react";

interface GameContextType {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  salt: string;
  setSalt: React.Dispatch<React.SetStateAction<string>>;
  move: number;
  setMove: React.Dispatch<React.SetStateAction<number>>;
  gameContract: `0x${string}` | undefined;
  setGameContract: React.Dispatch<React.SetStateAction<`0x${string}` | undefined>>;
  player2: string;
  setPlayer2: React.Dispatch<React.SetStateAction<string>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("");
  const [salt, setSalt] = useState("");
  const [move, setMove] = useState(0);
  const [gameContract, setGameContract] = useState<`0x${string}` | undefined>();
  const [player2, setPlayer2] = useState("")

  const contextValue: GameContextType = {
    activeTab,
    setActiveTab,
    salt,
    setSalt,
    move,
    setMove,
    gameContract,
    setGameContract,
    player2,
    setPlayer2,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};