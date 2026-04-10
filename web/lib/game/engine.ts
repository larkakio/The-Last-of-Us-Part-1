import type { Direction, GameState, LevelDef, TileKind } from "./types";
import { levels } from "./levels";

const STORAGE_KEY = "nw_max_unlocked_level";
const L1_KEY = "nw_level1_complete";

export function getMaxUnlockedLevel(): 1 | 2 {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 1;
  return n >= 2 ? 2 : 1;
}

export function isLevel1Complete(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(L1_KEY) === "1";
}

export function persistLevel1Win(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(L1_KEY, "1");
  window.localStorage.setItem(STORAGE_KEY, "2");
}

function findSpawn(level: LevelDef): { x: number; y: number } {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x] === "spawn") return { x, y };
    }
  }
  return { x: 1, y: 1 };
}

function tileAt(level: LevelDef, x: number, y: number): TileKind {
  if (y < 0 || y >= level.height || x < 0 || x >= level.width) return "wall";
  return level.tiles[y][x];
}

export function createInitialState(levelId: 1 | 2): GameState {
  const level = levels[levelId];
  const spawn = findSpawn(level);
  return {
    levelId,
    player: spawn,
    health: 3,
    moves: 0,
    score: 0,
    status: "playing",
    collected: new Set(),
    message:
      levelId === 1
        ? "Swipe on the field to move. Reach the exit. Avoid crimson spores and violet rifts."
        : "Deeper sector — tighter turns. Crimson costs 1 HP; violet costs 2. Supplies restore 1 HP.",
  };
}

export function applyMove(
  prev: GameState,
  dir: Direction,
): GameState {
  if (prev.status !== "playing") return prev;

  const level = levels[prev.levelId];
  const maxMoves = level.maxMoves ?? 999;
  const delta =
    dir === "up"
      ? { x: 0, y: -1 }
      : dir === "down"
        ? { x: 0, y: 1 }
        : dir === "left"
          ? { x: -1, y: 0 }
          : { x: 1, y: 0 };

  const nx = prev.player.x + delta.x;
  const ny = prev.player.y + delta.y;
  const t = tileAt(level, nx, ny);

  if (t === "wall") {
    return {
      ...prev,
      message: "Blocked — find another route.",
    };
  }

  let health = prev.health;
  let score = prev.score;
  let message = "";
  const collected = new Set(prev.collected);
  const here = `${nx},${ny}`;

  if (t === "hazard") {
    health -= 1;
    message = "Spore contact — −1 HP.";
  } else if (t === "hazard2") {
    health -= 2;
    message = "Rift surge — −2 HP.";
  } else if (t === "pickup" && !collected.has(here)) {
    health = Math.min(5, health + 1);
    score += 50;
    collected.add(here);
    message = "Supply cache — +1 HP (cap 5).";
  } else if (t === "pickup" && collected.has(here)) {
    message = "Empty cache.";
  }

  const moves = prev.moves + 1;

  if (health <= 0) {
    return {
      ...prev,
      player: { x: nx, y: ny },
      health: 0,
      moves,
      score,
      collected,
      status: "lost",
      message: "Signal lost. Patch your route and retry.",
    };
  }

  if (t === "exit") {
    if (prev.levelId === 1) {
      persistLevel1Win();
    }
    return {
      ...prev,
      player: { x: nx, y: ny },
      health,
      moves,
      score: score + 100,
      collected,
      status: "won",
      message:
        prev.levelId === 1
          ? "Sector cleared. Sector 12 unlocked — deeper grid awaits."
          : "All sectors cleared. You survived the neon wastes.",
    };
  }

  if (moves >= maxMoves) {
    return {
      ...prev,
      player: { x: nx, y: ny },
      health,
      moves,
      score,
      collected,
      status: "lost",
      message: "Move limit exceeded — the dark closes in.",
    };
  }

  return {
    ...prev,
    player: { x: nx, y: ny },
    health,
    moves,
    score,
    collected,
    status: "playing",
    message: message || "Move registered.",
  };
}
