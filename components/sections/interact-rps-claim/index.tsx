import { Button, Card, Input, message, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useContractRead, useContractWrite } from "wagmi";
import rpsAbi from "abi/rps.json";
import { useWalletContext } from "context/wallet-context";
import { formatEther, parseEther } from "ethers";

const { Title } = Typography;

export default function Claim() {
  const { address } = useWalletContext();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [isTimeout, setIsTimeout] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [claimReason, setClaimReason] = useState("");

  const { data: j1 } = useContractRead<typeof rpsAbi, 'j1', string>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "j1",
    watch: true,
  });

  const { data: j2 } = useContractRead<typeof rpsAbi, 'j2', string>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "j2",
    watch: true,
  });

  const { data: TIMEOUT, isLoading: isTimeoutLoading } = useContractRead<typeof rpsAbi, 'TIMEOUT', bigint>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "TIMEOUT",
    watch: true,
  });

  const { data: lastAction, isLoading: isLastActionLoading } = useContractRead<typeof rpsAbi, 'lastAction', number>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "lastAction",
    watch: true,
  });

  const { data: stake } = useContractRead<typeof rpsAbi, 'stake', bigint>({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "stake",
    watch: true,
  });

  const { write: j1Timeout, isLoading: isJ1TimeoutLoading, isSuccess: isJ1TimeoutSuccess } = useContractWrite({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "j1Timeout",
  });

  const { write: j2Timeout, isLoading: isJ2TimeoutLoading, isSuccess: isJ2TimeoutSuccess } = useContractWrite({
    address: contractAddress,
    abi: rpsAbi,
    functionName: "j2Timeout",
  });

  const handleClaimStakes = async () => {
    if (!address || !contractAddress || !isTimeout || !canClaim) return;

    try {
      if (address === j1) {
        await j2Timeout?.();
      } else if (address === j2) {
        await j1Timeout?.();
      }
    } catch (error) {
      console.error("Error claiming stakes:", error);
      message.error("Failed to claim stakes. Please try again.");
    }
  };

  useEffect(() => {
    if (lastAction && TIMEOUT) {
      const lastActionTime = Number(lastAction);
      const timeoutValue = Number(TIMEOUT);
      const currentTime = Math.floor(Date.now() / 1000);

      if (currentTime - lastActionTime > timeoutValue) {
        setIsTimeout(true);
        setRemainingTime(null);

        if (stake === BigInt(0)) {
          setCanClaim(false);
          setClaimReason("The stakes have already been claimed.");
        } else {
          if (address === j1) {
            setCanClaim(true);
            setClaimReason("Player 2 did not play within the timeout period. You can claim the stakes.");
          } else if (address === j2) {
            setCanClaim(true);
            setClaimReason("Player 1 did not reveal their move within the timeout period. You can claim the stakes.");
          }
        }
      } else {
        const remainingSeconds = timeoutValue - (currentTime - lastActionTime);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        setRemainingTime(`${minutes}m ${seconds}s`);
      }
    }
  }, [lastAction, TIMEOUT, address, j1, j2, stake]);

  return (
    <Card className="shadow-xl">
      <div className="flex flex-col gap-6">
        <Title level={1}>Claim Stakes 💰</Title>
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
        {(j1 === address || j2 === address) && (
          <>
            {isTimeoutLoading || isLastActionLoading ? (
              <Card className="shadow-md">
                <Spin size="large" />
              </Card>
            ) : isTimeout ? (
              <>
                  {canClaim ? (
                    <>
                      <Card className="shadow-md">
                        <Title level={3}>
                          You can claim{" "}
                          {stake ? (
                            address === j1 ? (
                              `${formatEther(stake.toString())} Eth`
                            ) : (
                              `${formatEther((stake * BigInt(2)).toString())} Eth`
                            )
                          ) : (
                            ""
                          )}
                        </Title>
                        <p>{claimReason}</p>
                      </Card>
                      <Button
                        onClick={handleClaimStakes}
                        disabled={!address || !contractAddress || isJ1TimeoutSuccess || isJ2TimeoutSuccess}
                        loading={isJ1TimeoutLoading || isJ2TimeoutLoading}
                        block
                        size="large"
                        className="rounded-lg font-medium text-xl"
                      >
                        Claim Stakes
                      </Button>
                      {(isJ1TimeoutSuccess || isJ2TimeoutSuccess) && (
                        <Card className="shadow-md mt-4">
                          <Title level={3}>Stakes claimed successfully!</Title>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card className="shadow-md">
                      <Title level={3}>{claimReason}</Title>
                    </Card>
                  )}
              </>
            ) : (
              <Card className="shadow-md">
                <Title level={3}>The game will timeout in {remainingTime}</Title>
              </Card>
            )}
          </>
        )}
        {j1 && j2 && j1.length > 0 && j2.length > 0 && j1 !== address && j2 !== address && (
          <Card className="shadow-md">
            <Title level={3}>You are not a participant in this game.</Title>
          </Card>
        )}
      </div>
    </Card>
  );
}