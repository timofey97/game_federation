"use client";

import { Cell, Team, WinningLine } from '@/types/game';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createBoard, checkWinningLines, calculateBoardSize } from '@/utils/gameLogic';
import items from '@/data/items.json';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const GameBoard = dynamic(() => import('@/components/GameBoard'), {
  ssr: false,
});

const TeamSetup = dynamic(() => import('@/components/TeamSetup'), {
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

  useEffect(() => {
    const newBoard = createBoard(items.items, BOARD_ROWS, BOARD_COLS);
    setBoard(newBoard);
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
      const colorCounts = lines.reduce((counts, line) => {
        counts[line.color] = (counts[line.color] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      // Проверяем, есть ли у какого-то цвета 3 или больше линий
      Object.entries(colorCounts).forEach(([lineColor, count]) => {
        console.log("🚀 ~ file: page.tsx:58 ~ lines:", lines)
        if (count >= 3) {
          const winningTeam = teams.find(team => team.color === lineColor);
          if (winningTeam) {
            setWinner(winningTeam.name);
            setShowWinDialog(true);
          }
        }
      });
    }

    if (!winner) {
      setCurrentTeam((currentTeam + 1) % teams.length);
    }
  };

  const resetGame = () => {
    const newBoard = createBoard(items.items, BOARD_ROWS, BOARD_COLS);
    setBoard(newBoard);
    setWinningLines([]);
    setWinner(undefined);
    setCurrentTeam(0);
    setShowWinDialog(false);
  };

  return (
    <main className="h-screen overflow-hidden bg-stone-500">
      <div className="h-full container mx-auto px-4">
        
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="w-auto  bg-stone-400 p-4 rounded-lg shadow-sm absolute top-0 left-0 transform -translate-x-1 -translate-y-1 mt-4 ml-4">
              <TeamSetup teams={teams} onTeamUpdate={setTeams} />
            </div>
            <div className="flex-1 h-full flex items-center justify-center">
              <GameBoard
                board={board}
                teams={teams}
                onCellUpdate={handleCellUpdate}
                winningLines={winningLines}
              />
            </div>
            {showWinDialog && (
              <AlertDialog open={showWinDialog} onOpenChange={(open) => !open && resetGame()}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Čestitamo!</AlertDialogTitle>
                    <AlertDialogDescription className="text-xl text-center py-4 ">
                     <span className="text-danger">
                     {winner}</span> je zmagal igro!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowWinDialog(false)}>Zapri</AlertDialogCancel>
                    <AlertDialogAction onClick={resetGame}>Igraj Ponovno</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
      </div>
    </main>
  );
}