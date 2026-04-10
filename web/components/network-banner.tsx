"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { targetChain } from "@/lib/wagmi";

export function NetworkBanner() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (chainId === targetChain.id) return null;

  return (
    <>
      <div className="h-12 w-full shrink-0" aria-hidden />
      <div
        role="alert"
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 border-b border-[#ff00aa]/50 bg-[#0d0221]/95 px-4 py-3 text-center text-sm text-[#f0f4ff] backdrop-blur-md"
      >
      <span className="font-medium tracking-wide text-[#ff3366]">
        Wrong network — switch to {targetChain.name} for on-chain check-in.
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: targetChain.id })}
        className="rounded-md border border-[#00fff7] bg-[#00fff7]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#00fff7] shadow-[0_0_12px_rgba(0,255,247,0.4)] transition hover:bg-[#00fff7]/20 disabled:opacity-50"
      >
        {isPending ? "Switching…" : `Switch to ${targetChain.name}`}
      </button>
    </div>
    </>
  );
}
