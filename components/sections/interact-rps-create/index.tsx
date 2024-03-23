import { Button, Card, Col, Input, InputNumber, Row, Slider, Typography } from "antd";
import { ethers, parseEther } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { sepolia, useBalance, useWaitForTransaction } from "wagmi";
import rpsAbi from "abi/rps.json";
import { rpsBytecode } from "bytecode/rpsBytecode";
import { useWalletContext } from "context/wallet-context";
import { generateCommitmentHash } from "utils/helper";

const { Title } = Typography;

export default function Create() {
  const { address, walletClient,chain } = useWalletContext();
  const [player2, setPlayer2] = useState("");
  const [stakeAmount, setStakeAmount] = useState(0);
  const [move, setMove] = useState(0);
  const [salt, setSalt] = useState("");
  const [transactionAddress, setTransactionAddress] = useState<`0x${string}` | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 20;
  const retryDelay = 5000;

  const { data: balance } = useBalance({ address });

  const generateRandomSalt = () => {
    const randomSalt = ethers.randomBytes(32);
    setSalt(ethers.hexlify(randomSalt));
  };

  const commitmentHash = useMemo(() => generateCommitmentHash({move, salt}), [move, salt]);

  const { data: txReceipt, isLoading: txLoading, isSuccess: txSuccess, isError, refetch } = useWaitForTransaction({
    hash: transactionAddress,
    enabled: false,
    chainId: chain?.id,
  });

  useEffect(() => {
    if (transactionAddress && !txSuccess) {
      refetch();
    }
  }, [transactionAddress, txSuccess, refetch]);

  useEffect(() => {
    if (isError && retryCount < maxRetries) {
      console.log("Transaction not found. Retrying...");
      const timer = setTimeout(() => {
        setRetryCount((prevCount) => prevCount + 1);
        refetch();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [isError, retryCount, refetch]);

  const handleCreateGame = async () => {
    if (!address || !player2 || !move || !salt) return;

    setRetryCount(0);

    try {
      const value = stakeAmount ? parseEther(stakeAmount.toString()) : undefined;

      const result = await walletClient?.deployContract({
        abi: rpsAbi,
        bytecode: `0x${rpsBytecode}`,
        args: [commitmentHash, player2],
        value,
        account: address,
      });

      console.log("Deployment Transaction Hash:", result);

      const txHash = result;
      setTransactionAddress(txHash);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const copyContractAddressAsQuery = () => {
    if (txReceipt?.contractAddress) {
      const url = `${window.location.origin}?contract=${txReceipt.contractAddress}`;
      navigator.clipboard.writeText(url);
    }
  };


  return (
    <Card className="shadow-xl">
      <div className="flex flex-col gap-6">
        <Title level={1}>Host new game 🤟</Title>
        <Card className="shadow-md">
          <Title level={3} className="text-left pb-2">Player 2 Address</Title>
          <Input
            placeholder="Input Address..."
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="text-xl"
          />
        </Card>
        <Card className="shadow-md p-4">
          <Title level={3} className="mb-0 text-left">Stake</Title>
          {balance && balance.formatted !== "0.0" ? (
            <div>
              <div className="mb-4">
                <Slider
                  min={0}
                  max={parseFloat(balance.formatted)}
                  step={0.001}
                  value={stakeAmount}
                  onChange={(value) => setStakeAmount(value)}
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-xl font-medium">Amount:</span>
                <InputNumber
                  min={0}
                  max={parseFloat(balance.formatted)}
                  step={0.001}
                  value={stakeAmount}
                  onChange={(value) => setStakeAmount(value || 0)}
                  style={{ width: "120px" }}
                  className="mr-2 text-xl"
                />
                <span className="text-xl font-medium">ETH</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 font-medium">
              Insufficient ETH balance
            </div>
          )}
        </Card>
        <Card className="shadow-md">
          <Title level={3} className="text-left pb-2">Your Pick</Title>
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
          <Title level={3} className="text-left pb-2">Salt</Title>
          <Row gutter={16}>
            <Col flex="auto">
              <Input
                placeholder="Salt"
                value={salt}
                maxLength={32}
                onChange={(e) => setSalt(e.target.value)}
                className="text-black text-xl"
              />
            </Col>
            <Col>
              <Button onClick={generateRandomSalt} className="rounded-lg px-4 py-4 font-medium text-xl flex items-center justify-center">Generate</Button>
            </Col>
            <Col>
              <CopyToClipboard text={salt}>
                <Button className="rounded-lg px-4 py-4 font-medium text-xl flex items-center justify-center">Copy</Button>
              </CopyToClipboard>
            </Col>
          </Row>
        </Card>
        <Button
          onClick={handleCreateGame}
          disabled={!address || !player2 || !move || !salt}
          loading={txLoading && !txSuccess}
          block
          type='default'
          className="rounded-lg px-4 py-8 font-medium text-xl flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          Host Game
        </Button>
        {txSuccess && (
          <Card className="shadow-md">
            <Title level={3}>Game created successfully!</Title>
            <p className="text-xl mb-4">Contract Address: {txReceipt?.contractAddress}</p>
            <Button onClick={copyContractAddressAsQuery}>
              Copy Contract Address as URL Query
            </Button>
          </Card>
        )}
      </div>
    </Card>
  );
}