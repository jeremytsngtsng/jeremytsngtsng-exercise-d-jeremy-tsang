import { Button, Card, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useContractRead, useContractWrite } from "wagmi";
import rpsAbi from "abi/rps.json";
import { useWalletContext } from "context/wallet-context";
import { formatEther } from "ethers";

const { Title } = Typography;

export default function Join() {
  const { address, walletClient } = useWalletContext();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [move, setMove] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contractParam = urlParams.get("contract");
    if (contractParam) {
      setContractAddress(contractParam as `0x${string}`);
    }
  }, []);

  useEffect(() => {
    if (contractAddress?.length === 0 || !contractAddress) {
      setIsTimeout(false);
      setIsValidAddress(false);
    } else {
      setIsValidAddress(true);
    }
  }, [contractAddress]);

  const { data: j1 } = useContractRead<typeof rpsAbi, 'j1', string>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "j1",
    watch: true,
    enabled: isValidAddress,
  });

  const { data: j2 } = useContractRead<typeof rpsAbi, 'j2', string>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "j2",
    watch: true,
    enabled: isValidAddress,
  });

  const { data: c2 } = useContractRead<typeof rpsAbi, 'c2', number>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "c2",
    watch: true,
    enabled: isValidAddress,
  });

  const { data: stake } = useContractRead<typeof rpsAbi, 'stake', bigint>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "stake",
    watch: true,
    enabled: isValidAddress,
  });

  const { data: TIMEOUT } = useContractRead<typeof rpsAbi, 'TIMEOUT', bigint>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "TIMEOUT",
    watch: true,
    enabled: isValidAddress,
  });

  const { data: lastAction } = useContractRead<typeof rpsAbi, 'lastAction', number>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "lastAction",
    watch: true,
    enabled: isValidAddress,
  });

  const { write: playMove, isLoading: isPlayLoading, isSuccess: isPlaySuccess } = useContractWrite({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "play",
    args: [move],
    value: stake as bigint,
  });

  const handleJoinGame = async () => {
    if (!address || !contractAddress || !move) return;

    if (isTimeout) return;

    try {
      await playMove?.();
    } catch (error) {
      console.error("Error joining game:", error);
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

      if (c2 !== 0) {
        setIsPlayed(true);
      }
    }
  }, [lastAction, c2, TIMEOUT]);

  return (
    <Card className="shadow-xl">
      <div className="flex flex-col gap-6">
        <Title level={1}>Join Game 👯</Title>
        <Card className="shadow-md">
          <Title level={3} className="text-left pb-2">
            Game Contract Address
          </Title>
          <Input
            placeholder="Input Contract Address..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value as `0x${string}`)}
            className="text-xl"
          />
        </Card>
        {isValidAddress && (
          <>
            {isTimeout && !isPlayed && (
              <Card className="shadow-md">
                <Title level={3}>Game has timed out!</Title>
              </Card>
            )}
            {isPlayed && (
              <Card className="shadow-md">
                <Title level={3}>Game has already been played!</Title>
              </Card>
            )}
            {!isTimeout && !isPlayed && (
              <>
                <Card className="shadow-md">
                  <Title level={3} className="text-left">
                    You are playing against
                  </Title>
                  <Title level={1} className="text-center">
                    {j1} for {formatEther(stake ?stake.toString() : 0)} eth!
                  </Title>
                </Card>
                <Card className="shadow-md">
                  <Title level={3} className="text-left pb-2">
                    Your Pick
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
                <Button
                  onClick={handleJoinGame}
                  disabled={!address || !contractAddress || !move || isPlaySuccess}
                  loading={isPlayLoading}
                  block
                  type="default"
                  className="rounded-lg px-4 py-8 font-medium text-xl flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                >
                  Join Game
                </Button>
                {isPlaySuccess && (
                  <Card className="shadow-md">
                    <Title level={3}>Joined game successfully!</Title>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}