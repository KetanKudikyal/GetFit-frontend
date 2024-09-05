import { BETTING_CONTRACT_ABI } from "@/abi/BETTING_CONTRACT_ABI";
import { USDC_ABI } from "@/abi/USDC_ABI";
import { BETTING_CONTRACT_ADDRESS, USDC_ADDRESS } from "@/config/addresses";
import { getXmtpFrameMessage } from "@coinbase/onchainkit/xmtp";
import { NextRequest, NextResponse } from "next/server";
import { Address, encodeFunctionData, parseUnits } from "viem";
import { morphHolesky, spicy } from "viem/chains";

type AddressMap = {
  [chainId: number]: {
    USDC_TOKEN_ADDRESS: Address;
    BETTING_CONTRACT_ADDRESS: Address;
  };
};

const ADDRESS_MAP: AddressMap = {
  [morphHolesky.id]: {
    USDC_TOKEN_ADDRESS: "0x94c17DD37ED3Ca85764b35BfD4d1CCc543b1bE3E",
    BETTING_CONTRACT_ADDRESS: "0x14097485976CB545d743452f66604bEAC141Cc98",
  },
  [spicy.id]: {
    USDC_TOKEN_ADDRESS: "0xF99b791257ab50be7F235BC825E7d4B83942cf38",
    BETTING_CONTRACT_ADDRESS: "0x9d24c52916A14afc31D86B5Aa046b252383ee444",
  },
};

const getAddressesForChain = (chainId: number) => ADDRESS_MAP[chainId];

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
  const body = await req.json();
  const state = body.untrustedData.state;

  const chain = state.chain;

  const addresses = getAddressesForChain(chain ?? morphHolesky.id);

  console.log("addresses", addresses);

  delete body.untrustedData.state;

  const { isValid } = await getXmtpFrameMessage(body);

  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  const approvalUsdcAmount = state.amount;
  const approvePriceInUsdc = parseUnits(approvalUsdcAmount, 6);

  const approvalData = encodeFunctionData({
    abi: USDC_ABI,
    functionName: "approve",
    args: [BETTING_CONTRACT_ADDRESS, approvePriceInUsdc],
  });

  const approvalTransaction = {
    to: USDC_ADDRESS,
    data: approvalData,
  };

  const betData = encodeFunctionData({
    abi: BETTING_CONTRACT_ABI,
    functionName: "placeBet",
    args: [state.name, approvePriceInUsdc],
  });

  const betTransaction = {
    to: BETTING_CONTRACT_ADDRESS,
    data: betData,
  };

  const txs: {
    to: string;
    data: `0x${string}`;
  }[] = [approvalTransaction, betTransaction];

  return NextResponse.json({ transactions: txs });
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}
