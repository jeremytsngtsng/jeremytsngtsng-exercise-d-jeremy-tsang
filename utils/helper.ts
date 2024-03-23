import { ethers } from "ethers";

export const generateCommitmentHash = ({move, salt}: {move: number, salt: string}) => {
  if (!move || !salt) return ""
  return ethers.solidityPackedKeccak256(["uint8", "uint256"], [move, salt])
}
