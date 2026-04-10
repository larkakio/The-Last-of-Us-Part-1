"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Direction } from "@/lib/game/types";
import {
  applyMove,
  createInitialState,
  getMaxUnlockedLevel,
  isLevel1Complete,
} from "@/lib/game/engine";
import type { GameState } from "@/lib/game/types";
import { levels } from "@/lib/game/levels";

const SWIPE_MIN = 44;
const MOVE_COOLDOWN_MS = 140;

function dirFromDelta(dx: number, dy: number): Direction | null {
  if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

function tileVisual(
  base: string,
  x: number,
  y: number,
  collected: Set<string>,
): string {
  if (base === "pickup" && collected.has(`${x},${y}`)) return "floor";
  return base;
}

export function GameBoard({
  levelId,
  onLevelIdChange,
  onLevel1Cleared,
}: {
  levelId: 1 | 2;
  onLevelIdChange: (id: 1 | 2) => void;
  onLevel1Cleared?: () => void;
}) {
  const [game, setGame] = useState<GameState>(() =>
    createInitialState(levelId),
  );
  const lastMoveAt = useRef(0);
  const start = useRef<{ x: number; y: number } | null>(null);

  const winNotified = useRef(false);

  useEffect(() => {
    if (
      game.status === "won" &&
      game.levelId === 1 &&
      !winNotified.current
    ) {
      winNotified.current = true;
      onLevel1Cleared?.();
    }
  }, [game.status, game.levelId, onLevel1Cleared]);

  const level = levels[levelId];

  const tryMove = useCallback(
    (dir: Direction) => {
      const now = Date.now();
      if (now - lastMoveAt.current < MOVE_COOLDOWN_MS) return;
      lastMoveAt.current = now;
      setGame((g) => applyMove(g, dir));
      if (navigator.vibrate) navigator.vibrate(12);
    },
    [],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    const d = dirFromDelta(dx, dy);
    if (d) tryMove(d);
  };

  const reset = () => setGame(createInitialState(levelId));

  const grid = useMemo(() => {
    const rows: React.ReactNode[] = [];
    for (let y = 0; y < level.height; y++) {
      const cells: React.ReactNode[] = [];
      for (let x = 0; x < level.width; x++) {
        const raw = level.tiles[y][x];
        const vis = tileVisual(raw, x, y, game.collected);
        const isPlayer = game.player.x === x && game.player.y === y;
        cells.push(
          <div
            key={`${x}-${y}`}
            className={[
              "relative flex aspect-square items-center justify-center rounded-sm border text-[10px] font-bold sm:text-xs",
              vis === "wall"
                ? "border-[#1a1a2e] bg-[#050508] text-transparent"
                : vis === "hazard"
                  ? "neon-hazard border-[#ff0044]/60 bg-[#2a0510]"
                  : vis === "hazard2"
                    ? "neon-hazard2 border-[#aa00ff]/60 bg-[#180528]"
                    : vis === "exit"
                      ? "neon-exit border-[#00ffaa]/70 bg-[#001a14]"
                      : vis === "spawn"
                        ? "border-[#0088ff]/50 bg-[#050a18]"
                        : vis === "pickup"
                          ? "neon-pickup border-[#ffee00]/50 bg-[#1a1500]"
                          : "border-[#223344]/40 bg-[#0a1018]",
            ].join(" ")}
          >
            {!isPlayer && vis === "hazard" && (
              <span className="text-[#ff2266]">▒</span>
            )}
            {!isPlayer && vis === "hazard2" && (
              <span className="text-[#cc66ff]">✦</span>
            )}
            {vis === "exit" && <span className="text-[#00ffcc]">EXIT</span>}
            {vis === "pickup" && <span className="text-[#ffee66]">+</span>}
            {isPlayer && (
              <span className="neon-player drop-shadow-[0_0_8px_#00fff7] text-lg text-[#00fff7]">
                ◆
              </span>
            )}
          </div>,
        );
      }
      rows.push(
        <div
          key={y}
          className="grid w-full gap-1"
          style={{
            gridTemplateColumns: `repeat(${level.width}, minmax(0, 1fr))`,
          }}
        >
          {cells}
        </div>,
      );
    }
    return rows;
  }, [level, game.player, game.collected]);

  const unlocked = getMaxUnlockedLevel();
  const l1Done = isLevel1Complete();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg text-[#00fff7] sm:text-xl">
            {level.name}
          </h2>
          <p className="text-xs text-[#8899bb]">
            HP {game.health} · Moves {game.moves}
            {level.maxMoves ? ` / ${level.maxMoves}` : ""} · Score {game.score}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onLevelIdChange(1)}
            className={`rounded px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              levelId === 1
                ? "border border-[#00fff7] text-[#00fff7]"
                : "border border-transparent text-[#667788]"
            }`}
          >
            Sector 7
          </button>
          <button
            type="button"
            disabled={unlocked < 2 && !l1Done}
            title={
              unlocked < 2 && !l1Done
                ? "Clear Sector 7 first"
                : "Sector 12 — deep grid"
            }
            onClick={() => onLevelIdChange(2)}
            className={`rounded px-3 py-1 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40 ${
              levelId === 2
                ? "border border-[#ff00aa] text-[#ff66cc]"
                : "border border-transparent text-[#667788]"
            }`}
          >
            Sector 12
          </button>
        </div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          start.current = null;
        }}
        className="scanlines relative touch-none select-none rounded-xl border-2 border-[#00fff7]/30 bg-[#030308]/80 p-3 shadow-[inset_0_0_60px_rgba(0,255,247,0.06)]"
        style={{ touchAction: "none" }}
      >
        <p className="mb-2 text-center text-[11px] uppercase tracking-[0.35em] text-[#556677]">
          Swipe on the field
        </p>
        <div className="flex flex-col gap-1">{grid}</div>
      </div>

      <p
        className={`min-h-[2.5rem] text-sm leading-snug ${
          game.status === "won"
            ? "text-[#00ffaa]"
            : game.status === "lost"
              ? "text-[#ff6688]"
              : "text-[#aab8cc]"
        }`}
      >
        {game.message}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-[#667788] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#ccddee] hover:bg-white/5"
        >
          Reset run
        </button>
        {game.status === "won" && levelId === 1 && (
          <button
            type="button"
            onClick={() => onLevelIdChange(2)}
            className="rounded-lg border-2 border-[#ff00aa] bg-[#ff00aa]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#ff88dd]"
          >
            Continue to Sector 12
          </button>
        )}
      </div>
    </div>
  );
}
