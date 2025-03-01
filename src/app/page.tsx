"use client";

import { Cell, Team, WinningLine, GameItem } from '@/types/game';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createBoard, checkWinningLines } from '@/utils/gameLogic';
import defaultItems from '@/data/items.json';
import { 
  GameSettings 
} from '@/components/GameSettings';
import { WinDialog } from '@/components/WinDialog';

const GameBoard = dynamic(() => import('@/components/GameBoard'), {
  ssr: false,
});

const BOARD_ROWS = 8;
const BOARD_COLS = 10;

export default function Home() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [teams, setTeams] = useState<Team[]>([
    { name: 'Ekipa 1', color: '#FF0000' },
    { name: 'Ekipa 2', color: '#00FF00' },
    { name: 'Ekipa 3', color: '#0000FF' }
  ]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
  const [winner, setWinner] = useState<string>();
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [boardItems, setBoardItems] = useState<GameItem[]>(defaultItems.items);

  useEffect(() => {
    // Try to load items from localStorage first
    const savedItems = localStorage.getItem('boardItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setBoardItems(parsedItems);
        const newBoard = createBoard(parsedItems, BOARD_ROWS, BOARD_COLS);
        setBoard(newBoard);
      } catch (error) {
        console.error('Error loading items from localStorage:', error);
        // Fallback to default items
        const newBoard = createBoard(defaultItems.items, BOARD_ROWS, BOARD_COLS);
        setBoard(newBoard);
      }
    } else {
      // Use default items if no saved items
      const newBoard = createBoard(defaultItems.items, BOARD_ROWS, BOARD_COLS);
      setBoard(newBoard);
    }
  }, []);

  const handleCellUpdate = (row: number, col: number, color?: string) => {
    const newBoard = [...board];
    newBoard[row] = [...newBoard[row]];
    newBoard[row][col] = {
      ...newBoard[row][col],
      color: color
    };
    setBoard(newBoard);

    if (color) {
      const lines = checkWinningLines(newBoard, row, col, color, 3, winningLines);
      console.log("🚀 ~ file: page.tsx:58 ~ lines:", lines)
      setWinningLines(lines);

      // Подсчитываем количество линий каждого цвета
      const linesByColor = lines.reduce((acc, line) => {
        acc[line.color] = (acc[line.color] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Находим цвет с наибольшим количеством линий
      let maxLines = 0;
      let winningColor = '';
      for (const [color, count] of Object.entries(linesByColor)) {
        if (count > maxLines) {
          maxLines = count;
          winningColor = color;
        }
      }

      // Если есть победитель
      if (winningColor) {
        const winningTeam = teams.find(team => team.color === winningColor);
        if (winningTeam) {
          setWinner(winningTeam.name);
          setShowWinDialog(true);
        }
      }
    }

    // Переход хода к следующей команде
    setCurrentTeam((currentTeam + 1) % teams.length);
  };

  const handleBoardItemsUpdate = (items: GameItem[]) => {
    setBoardItems(items);
    const newBoard = createBoard(items, BOARD_ROWS, BOARD_COLS);
    setBoard(newBoard);
    // Reset game state when board is updated
    setWinningLines([]);
    setWinner(undefined);
    setShowWinDialog(false);
    setCurrentTeam(0);
  };

  const handleRestart = () => {
    const newBoard = createBoard(boardItems, BOARD_ROWS, BOARD_COLS);
    setBoard(newBoard);
    setWinningLines([]);
    setWinner(undefined);
    setShowWinDialog(false);
    setCurrentTeam(0);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <GameSettings 
        teams={teams} 
        onTeamUpdate={setTeams} 
        onBoardItemsUpdate={handleBoardItemsUpdate}
      />
      
      <div className="flex-1 flex items-center justify-center p-4 dark:bg-stone-800">
        {board.length > 0 && (
          <GameBoard
            board={board}
            teams={teams}
            currentTeam={teams[currentTeam]}
            onCellUpdate={handleCellUpdate}
            winningLines={winningLines}
          />
        )}
      </div>

      <WinDialog 
        open={showWinDialog} 
        onOpenChange={setShowWinDialog} 
        winner={winner || ''} 
        onPlayAgain={handleRestart}
      />
    </main>
  );
}