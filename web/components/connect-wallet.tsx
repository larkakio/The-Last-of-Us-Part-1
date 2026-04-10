"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useRef, useState } from "react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect, isPending, error } = useConnect();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (isConnected && address) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-[#00fff7]/40 bg-black/40 px-3 py-1.5 font-mono text-xs text-[#a8fff9]">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded border border-[#ff3366]/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#ff6699] hover:bg-[#ff3366]/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative z-[100]">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border-2 border-[#00fff7] bg-gradient-to-r from-[#0a1628] to-[#1a0a28] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.2em] text-[#00fff7] shadow-[0_0_20px_rgba(0,255,247,0.35)] transition hover:shadow-[0_0_28px_rgba(0,255,247,0.55)]"
      >
        Connect wallet
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-[110] mt-2 min-w-[min(100%,260px)] rounded-xl border border-[#bf00ff]/40 bg-[#070010]/95 p-2 shadow-[0_0_24px_rgba(191,0,255,0.25)] backdrop-blur-md sm:left-auto sm:right-0 sm:min-w-[260px]"
          role="dialog"
          aria-label="Wallet options"
        >
          <p className="mb-2 px-2 text-[10px] uppercase tracking-widest text-[#8899aa]">
            Choose a wallet
          </p>
          <ul className="flex flex-col gap-1">
            {connectors.map((c) => (
              <li key={c.uid}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector: c });
                    setOpen(false);
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-[#e8f4ff] hover:border-[#00fff7]/50 hover:bg-[#00fff7]/10"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          {error && (
            <p className="mt-2 px-2 text-xs text-[#ff4466]">{error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
