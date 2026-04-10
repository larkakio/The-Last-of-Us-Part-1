import type { LevelDef } from "./types";

const W = "wall" as const;
const F = "floor" as const;
const H = "hazard" as const;
const H2 = "hazard2" as const;
const E = "exit" as const;
const S = "spawn" as const;
const P = "pickup" as const;

function build(rows: string[][]): LevelDef["tiles"] {
  const map: Record<string, import("./types").TileKind> = {
    ".": "floor",
    "#": "wall",
    "h": "hazard",
    "x": "hazard2",
    "E": "exit",
    "S": "spawn",
    "p": "pickup",
  };
  return rows.map((row) =>
    row.map((ch) => map[ch] ?? "floor"),
  );
}

/** Level 1 — 5×5 tutorial grid */
export const level1: LevelDef = {
  id: 1,
  name: "Sector 7 — Perimeter",
  width: 5,
  height: 5,
  maxMoves: 40,
  tiles: build([
    [W, W, W, W, W],
    [W, S, F, H, W],
    [W, F, W, F, W],
    [W, P, F, F, E],
    [W, W, W, W, W],
  ]),
};

/** Level 2 — 7×7 unlocked after beating level 1 */
export const level2: LevelDef = {
  id: 2,
  name: "Sector 12 — Deep Grid",
  width: 7,
  height: 7,
  maxMoves: 55,
  tiles: build([
    [W, W, W, W, W, W, W],
    [W, S, F, H, F, H2, W],
    [W, F, W, F, W, F, W],
    [W, P, F, H2, F, P, W],
    [W, F, W, F, W, F, W],
    [W, H, F, F, F, F, E],
    [W, W, W, W, W, W, W],
  ]),
};

export const levels: Record<1 | 2, LevelDef> = {
  1: level1,
  2: level2,
};
