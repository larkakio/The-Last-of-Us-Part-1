"use client";

import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useCallback, useEffect } from "react";
import { checkInAbi } from "@/lib/abi/checkIn";
import { getBuilderDataSuffix } from "@/lib/builder";
import { targetChain } from "@/lib/wagmi";

const contractAddress = process.env
  .NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS as `0x${string}` | undefined;

export function CheckInPanel() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { data: lastDay, refetch } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: "lastCheckDay",
    args: address ? [address] : undefined,
    chainId: targetChain.id,
    query: { enabled: Boolean(contractAddress && address && isConnected) },
  });

  const {
    writeContractAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) void refetch();
  }, [isSuccess, refetch]);

  const handleCheckIn = useCallback(async () => {
    if (!contractAddress) return;
    reset();
    if (chainId !== targetChain.id) {
      await switchChainAsync({ chainId: targetChain.id });
    }
    const suffix = getBuilderDataSuffix();
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: targetChain.id,
      value: 0n,
      ...(suffix ? { dataSuffix: suffix } : {}),
    });
  }, [chainId, reset, switchChainAsync, writeContractAsync]);

  if (!contractAddress) {
    return (
      <section className="rounded-2xl border border-[#ffcc00]/30 bg-black/30 p-4 text-sm text-[#ccbbaa]">
        <h3 className="mb-1 font-display text-lg text-[#ffee88]">Daily check-in</h3>
        <p>Set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS after deploying the contract.</p>
      </section>
    );
  }

  if (!isConnected) {
    return (
      <section className="rounded-2xl border border-[#00fff7]/25 bg-black/25 p-4">
        <h3 className="mb-1 font-display text-lg text-[#00fff7]">Daily check-in</h3>
        <p className="text-sm text-[#aabccc]">
          Connect a wallet on Base to record your streak on-chain (gas only).
        </p>
      </section>
    );
  }

  const today = Math.floor(Date.now() / 1000 / 86400);
  const already = lastDay !== undefined && lastDay === BigInt(today);

  return (
    <section className="rounded-2xl border border-[#bf00ff]/35 bg-gradient-to-br from-[#0a0618]/90 to-[#120820]/90 p-5 shadow-[0_0_32px_rgba(191,0,255,0.15)]">
      <h3 className="mb-2 font-display text-xl tracking-wide text-[#ff66ee]">
        Daily check-in
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-[#c5d0e0]">
        One check per calendar day on Base. Streaks grow when you return on consecutive
        days. No tips — you only pay L2 gas.
      </p>
      {already ? (
        <p className="text-sm font-medium text-[#00ffaa]">
          You are checked in for today. Come back after UTC midnight.
        </p>
      ) : (
        <button
          type="button"
          disabled={isWritePending || isConfirming}
          onClick={() => void handleCheckIn()}
          className="w-full rounded-lg border-2 border-[#ffcc00] bg-[#ffcc00]/10 py-3 text-sm font-bold uppercase tracking-widest text-[#ffee88] shadow-[0_0_16px_rgba(255,204,0,0.35)] transition hover:bg-[#ffcc00]/20 disabled:opacity-50"
        >
          {isWritePending || isConfirming ? "Confirm in wallet…" : "Check in on-chain"}
        </button>
      )}
      {writeError && (
        <p className="mt-2 text-xs text-[#ff6688]">{writeError.message}</p>
      )}
      {txHash && (
        <p className="mt-2 truncate font-mono text-[10px] text-[#8899aa]">
          Tx: {txHash}
        </p>
      )}
    </section>
  );
}
