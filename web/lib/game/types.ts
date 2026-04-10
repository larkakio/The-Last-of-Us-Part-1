export type Direction = "up" | "down" | "left" | "right";

export type TileKind =
  | "floor"
  | "wall"
  | "hazard"
  | "hazard2"
  | "exit"
  | "spawn"
  | "pickup";

export interface LevelDef {
  id: 1 | 2;
  name: string;
  width: number;
  height: number;
  /** row-major: grid[y][x] */
  tiles: TileKind[][];
  maxMoves?: number;
}

export interface GameState {
  levelId: 1 | 2;
  player: { x: number; y: number };
  health: number;
  moves: number;
  score: number;
  status: "playing" | "won" | "lost";
  message: string;
  /** Pickups already collected (key "x,y") */
  collected: Set<string>;
}
