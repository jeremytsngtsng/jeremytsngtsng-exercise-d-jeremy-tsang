import { FetchBalanceResult } from "@wagmi/core"
import { Popover } from "antd"
import { Chain } from "wagmi"

interface IData {
  address: string | undefined
  name: string | undefined | null
  chain: (Chain & { unsupported?: boolean }) | undefined
  accountBalance: FetchBalanceResult | undefined
}

interface IDetailAccount {
  data: IData
}

export const DetailAcountPopover = ({ data }: IDetailAccount) => {
  const { address, chain, accountBalance } = data

  return (
    <div suppressHydrationWarning={true}>
      <Popover
        content={
          <>
            <div className="flex flex-col gap-[10px] text-2xl p-6">
              <div>
                <h1>Wallet Address:</h1>
                <div suppressHydrationWarning={true}>{address ? address : "-"}</div>
              </div>
              <div>
                <h1>Chain</h1>
                <div suppressHydrationWarning={true}> {chain ? chain.name : "-"}</div>
              </div>
              <div>
                <h1>Account Balance</h1>
                <div suppressHydrationWarning={true}> {accountBalance ? `${accountBalance?.formatted} ETH` : "-"}</div>
              </div>
            </div>
          </>
        }
        trigger="click"
        placement="bottomRight"
      >
        <button className="px-4 py-2 text-2xl text-white bg-blue-500 rounded-md hover:bg-blue-600">
          <span suppressHydrationWarning>
            Wallet details
          </span>
        </button>
      </Popover>
    </div>
  )
}
