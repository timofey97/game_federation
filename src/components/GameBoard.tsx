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
  teams: Team[];
  onCellUpdate: (row: number, col: number, color?: string) => void;
  winningLines: WinningLine[];
}

export default function GameBoard({ board, teams, onCellUpdate, winningLines }: GameBoardProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [cellSize, setCellSize] = useState(50); // Default size

  useEffect(() => {
    const calculateSize = () => {
      const newSize = Math.min(
        Math.floor((window.innerHeight - 100) / board.length),
        Math.floor((window.innerWidth - 300) / board[0].length)
      );
      setCellSize(newSize);
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
      x = rect.left - gridRect.left + scrollX + rect.width / 2 + 20;
    } else {
      x = rect.left + scrollX + rect.width / 2 + 20;
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
    <div className="relative p-4">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${board?.[0]?.length || 1}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${board?.length || 1}, ${cellSize}px)`
        }}
      >
        {board?.length > 0 ? board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`relative aspect-square border rounded hover:bg-gray-50 transition-colors ${
                colIndex === Math.floor((board[0].length - 1) / 2) ? 'border-r-4 border-r-gray-400' : ''
              } ${
                colIndex === Math.floor((board[0].length - 1) / 2) + 1 ? 'border-l-4 border-l-gray-400' : ''
              }`}
              style={{ backgroundColor: cell.color || 'white' }}
              onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
            >
              {cell.item.name && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{cell.item.name}</div>
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
                  <Lock className="w-6 h-6 text-white" />
                </div>
              )}
            </button>
          ))
        )) : null}
      </div>

      {menuPosition && selectedCell && (
        <CircularMenu
          position={menuPosition}
          teams={teams}
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
