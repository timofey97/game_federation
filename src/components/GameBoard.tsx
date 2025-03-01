'use client';

import React, { useState, useEffect } from 'react';
import { Cell, Team, WinningLine } from '@/types/game';
import dynamic from 'next/dynamic';
import { Lock } from 'lucide-react';

const CircularMenu = dynamic(() => import('./CircularMenu'), {
  ssr: false,
});

interface GameBoardProps {
  board: Cell[][];
  currentTeam: Team;
  teams?: Team[];
  onCellUpdate: (row: number, col: number, color?: string) => void;
  winningLines: WinningLine[];
}

export default function GameBoard({ board, currentTeam, teams = [], onCellUpdate, winningLines }: GameBoardProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [cellColumnSize, setCellColumnSize] = useState(50); // Default size
  const [cellRowSize, setCellRowSize] = useState(50); // Default size

  // Use all teams if provided, otherwise use just the current team
  const allTeams = teams.length > 0 ? teams : [currentTeam];

  useEffect(() => {
    const calculateSize = () => {
      const newSize = Math.min(
        Math.floor((window.innerHeight - 100) / board.length),
        Math.floor((window.innerWidth - 300) / board[0].length)
      );
      setCellColumnSize(9.8);
      setCellRowSize(7.8);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [board]);

  const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (isCellInWinningLine(row, col)) return;
  
    if (selectedCell?.row === row && selectedCell?.col === col) {
      handleMenuClose();
      return;
    }
  
    const rect = e.currentTarget.getBoundingClientRect();
    const gridRect = e.currentTarget.closest(".grid")?.getBoundingClientRect(); // Получаем координаты сетки
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    let x;
    if (gridRect) {
      // Смещаем `x`, чтобы учитывать границы сетки
      x = rect.left + scrollX + rect.width / 2;
    } else {
      x = rect.left + scrollX + rect.width / 2;
    }
  
    const y = rect.top + scrollY + rect.height / 2 + 10;
    
    setSelectedCell({ row, col });
    setMenuPosition({ x, y });
  };

  const handleColorSelect = (color: string) => {
    if (selectedCell) {
      onCellUpdate(selectedCell.row, selectedCell.col, color);
      handleMenuClose();
    }
  };

  const handleReset = () => {
    if (selectedCell) {
      onCellUpdate(selectedCell.row, selectedCell.col, undefined);
      handleMenuClose();
    }
  };

  const handleMenuClose = () => {
    setSelectedCell(null);
    setMenuPosition(null);
  };

  const isCellInWinningLine = (row: number, col: number) => {
    return winningLines.some(line =>
      line.cells.some(pos => pos.row === row && pos.col === col)
    );
  };

  return (
    <div className="h-[calc(100vh-110px)]">
      <div
        className={`grid gap-1 grid-cols-10 h-full`}
        // style={{
        //   gridTemplateColumns: `repeat(${board?.[0]?.length || 1}, ${cellColumnSize}vw)`,
        //   gridTemplateRows: `repeat(${board?.length || 1}, ${cellRowSize}vh)`
        // }}
      >
        {board?.length > 0 ? board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`relative border rounded hover:bg-gray-50 transition-colors dark:bg-gray-700 ${
                colIndex === Math.floor((board[0].length - 1) / 2) ? 'border-r-4 border-r-gray-400' : ''
              } ${
                colIndex === Math.floor((board[0].length - 1) / 2) + 1 ? 'border-l-4 border-l-gray-400' : ''
              }`}
              style={{ backgroundColor: cell.color }}
              onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
            >
              {cell.item.name && (
                <div className="">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 dark:text-white">{cell.item.name}</div>
                    {cell.item.icon && (
                      <div className="text-2xl">
                        {cell.item.icon}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isCellInWinningLine(rowIndex, colIndex) && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white " />
                </div>
              )}
            </button>
          ))
        )) : null}
      </div>

      {menuPosition && selectedCell && (
        <CircularMenu
          position={menuPosition}
          teams={allTeams}
          onColorSelect={handleColorSelect}
          onReset={handleReset}
          onClose={handleMenuClose}
          isLocked={isCellInWinningLine(selectedCell.row, selectedCell.col)}
          hasColor={!!board[selectedCell.row][selectedCell.col].color}
        />
      )}
    </div>
  );
}
