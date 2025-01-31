'use client';

import React, { useEffect, useRef } from 'react';
import { Team } from '@/types/game';
import { X, Trash2 } from 'lucide-react';

interface CircularMenuProps {
  teams: Team[];
  onColorSelect: (color: string) => void;
  onReset?: () => void;
  onClose?: () => void;
  isLocked?: boolean;
  position?: { x: number; y: number };
  hasColor?: boolean;
}

export default function CircularMenu({ 
  teams, 
  onColorSelect, 
  onReset, 
  onClose,
  isLocked, 
  position,
  hasColor 
}: CircularMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const preventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!position) return null;

  return (
    <div 
      ref={menuRef}
      className="game-menu menu-open"
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={preventDefault}
    >
      <a 
        href="#" 
        className="menu-item center-button"
        onClick={(e) => { preventDefault(e); onClose?.(); }}
      >
        <X className="w-6 h-6 text-white" />
      </a>
      {!isLocked && (
        <>
          {hasColor ? (
            <a 
              href="#" 
              className="menu-item delete-button" 
              onClick={(e) => { preventDefault(e); onReset?.(); }}
            >
              <Trash2 className="w-6 h-6" />
            </a>
          ) : (
            teams.map((team, index) => (
              <a
                key={index}
                href="#"
                className="menu-item"
                style={{ backgroundColor: team.color }}
                onClick={(e) => { preventDefault(e); onColorSelect(team.color); }}
              >
                <span className="text-white font-bold text-xl">{team.name[0]}</span>
              </a>
            ))
          )}
        </>
      )}
    </div>
  );
}
