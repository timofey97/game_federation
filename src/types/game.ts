export interface GameItem {
  name: string;
  icon: string;
}

export interface Cell {
  item: GameItem;
  color?: string;
  locked: boolean;
}

export interface Team {
  name: string;
  color: string;
}

export interface WinningLine {
  cells: { row: number; col: number; }[];
  color: string;
}

export interface GameState {
  board: Cell[][];
  teams: Team[];
  currentTeam: number;
  winningLines: WinningLine[];
  winner?: string;
}
