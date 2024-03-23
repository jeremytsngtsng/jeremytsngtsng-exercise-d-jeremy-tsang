import { Button, Card, Input, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useContractRead, useContractWrite } from "wagmi";
import rpsAbi from "abi/rps.json";
import { useWalletContext } from "context/wallet-context";
import { useGameContext } from "context/game-context";

const { Title } = Typography;

export default function Result() {
  const game = useGameContext();
  const { gameContract, setGameContract, move, setMove, salt, setSalt } = useGameContext();
  const { address } = useWalletContext();
  const [isTimeout, setIsTimeout] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const { data: j1 } = useContractRead<typeof rpsAbi, 'j1', string>({
    address: gameContract,
    abi: rpsAbi,
    functionName: "j1",
    watch: true,
  });
  
  const { data: c2 } = useContractRead<typeof rpsAbi, 'c2', number>({
    address: gameContract,
    abi: rpsAbi,
    functionName: "c2",
    watch: true,
  });

  const { data: TIMEOUT, isLoading: isTimeoutLoading } = useContractRead<typeof rpsAbi, 'TIMEOUT', bigint>({
    address: gameContract,
    abi: rpsAbi,
    functionName: "TIMEOUT",
    watch: true,
  });

  const { data: lastAction, isLoading: isLastActionLoading } = useContractRead<typeof rpsAbi, 'lastAction', number>({
    address: gameContract,
    abi: rpsAbi,
    functionName: "lastAction",
    watch: true,
  });

  const { write: solveGame, isLoading: isSolveLoading, isSuccess: isSolveSuccess } = useContractWrite({
    address: gameContract,
    abi: rpsAbi,
    functionName: "solve",
    args: [move, salt],
  });

  const handleSolveGame = async () => {
    if (!address || !gameContract || !move || !salt || isTimeout || c2 === undefined) return;

    try {
      await solveGame?.();

      if (move === c2) {
        setWinner("It's a tie!");
      } else if (move === 0 || c2 === 0) {
        setWinner("Invalid move!");
      } else if ((move % 2 === c2 % 2 && move < c2) || (move % 2 !== c2 % 2 && move > c2)) {
        setWinner("You win!");
      } else {
        setWinner("You lose!");
      }
    } catch (error) {
      console.error("Error solving game:", error);
    }
  };

  useEffect(() => {
    if (lastAction && TIMEOUT) {
      const lastActionTime = Number(lastAction);
      const timeoutValue = Number(TIMEOUT);
      const currentTime = Math.floor(Date.now() / 1000);

      if (currentTime - lastActionTime > timeoutValue) {
        setIsTimeout(true);
      }
    }
  }, [lastAction, TIMEOUT]);

  console.log(game)

  return (
    <Card className="shadow-xl">
      <div className="flex flex-col gap-6">
        <Title level={1}>Solve Game 🎖️</Title>
        <Card className="shadow-md">
          <Title level={3} className="text-left pb-2">
            Game Contract Address
          </Title>
          <Input
            placeholder="Input Contract Address..."
            value={gameContract}
            onChange={(e) => setGameContract(e.target.value as `0x${string}`)}
            className="text-xl"
          />
        </Card>
        {j1 === address && (
          <>
            {isTimeoutLoading || isLastActionLoading ? (
              <Card className="shadow-md">
                <Spin size="large" />
              </Card>
            ) : isTimeout ? (
              <Card className="shadow-md">
                <Title level={3}>Timeout has passed. You can no longer solve the game.</Title>
              </Card>
            ) : (
              <>
                <Card className="shadow-md">
                  <Title level={3} className="text-left pb-2">
                    Your Move
                  </Title>
                  <div className="grid grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((option) => (
                      <Button
                        key={option}
                        block
                        onClick={() => setMove(option)}
                        className={`rounded-lg px-4 py-2 h-32 text-6xl flex items-center justify-center hover:bg-blue-50 ${move === option ? "bg-blue-100 border-blue-500" : ""
                          }`}
                      >
                        <span>{["✊", "🖐️", "✌️", "🖖", "🤏"][option - 1]}</span>
                      </Button>
                    ))}
                  </div>
                </Card>
                <Card className="shadow-md">
                  <Title level={3} className="text-left pb-2">
                    Salt
                  </Title>
                  <Input
                    placeholder="Input Salt..."
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    className="text-xl"
                  />
                </Card>
                <Button
                  onClick={handleSolveGame}
                      disabled={!address || !gameContract || !move || !salt || c2 === undefined}
                  loading={isSolveLoading}
                  block
                  type="default"
                  className="rounded-lg px-4 py-8 font-medium text-xl flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                >
                  Solve Game
                </Button>
                {isSolveSuccess && (
                  <Card className="shadow-md">
                    <Title level={3}>Game solved successfully!</Title>
                  </Card>
                )}
                {winner && isSolveSuccess && (
                  <Card className="shadow-md">
                    <Title level={3}>
                      {winner}
                    </Title>
                  </Card>)}
              </>)}
          </>)}
        {j1 && j1.length > 0 && j1 !== address && (
          <Card className="shadow-md"> <Title level={3}>You are not authorized to solve this game.</Title> </Card>)} </div> </Card>);
} 