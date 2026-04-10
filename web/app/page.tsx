"use client";

import { useCallback, useEffect, useState } from "react";
import { ConnectWallet } from "@/components/connect-wallet";
import { CheckInPanel } from "@/components/check-in-panel";
import { GameBoard } from "@/components/game-board";
import { getMaxUnlockedLevel } from "@/lib/game/engine";

export default function Home() {
  const [levelId, setLevelId] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0);

  const bumpProgress = useCallback(() => setProgress((p) => p + 1), []);

  useEffect(() => {
    const onStorage = () => bumpProgress();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [bumpProgress]);

  const maxUnlocked = getMaxUnlockedLevel();

  return (
    <main
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 pb-16 pt-8 sm:pt-12"
      data-unlock-version={progress}
    >
      <header className="relative overflow-hidden rounded-2xl border border-[#00fff7]/25 bg-gradient-to-br from-[#060818]/95 via-[#100818]/95 to-[#080620]/95 p-6 shadow-[0_0_40px_rgba(0,255,247,0.12)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#ff00aa]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#00fff7]/15 blur-3xl" />
        <p className="mb-1 font-display text-[10px] uppercase tracking-[0.5em] text-[#00fff7]/80">
          Base · Neon Wasteland
        </p>
        <h1 className="font-display text-2xl font-black tracking-tight text-[#f0f8ff] sm:text-3xl">
          Outskirts
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#9aaccc]">
          Swipe the field to move through the quarantine grid. Reach the exit before
          spores drain your signal. Clear Sector 7 to unlock Sector 12.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ConnectWallet />
          {maxUnlocked >= 2 && (
            <span className="rounded border border-[#00ffaa]/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#66ffcc]">
              Sector 12 online
            </span>
          )}
        </div>
      </header>

      <section className="rounded-2xl border border-[#bf00ff]/20 bg-[#040208]/60 p-4 backdrop-blur-sm">
        <GameBoard
          key={levelId}
          levelId={levelId}
          onLevelIdChange={setLevelId}
          onLevel1Cleared={bumpProgress}
        />
      </section>

      <CheckInPanel />

      <footer className="text-center text-[10px] uppercase tracking-widest text-[#445566]">
        English UI · Standard web + wallet · No notifications · Builder attribution on
        check-in
      </footer>
    </main>
  );
}
