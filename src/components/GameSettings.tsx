"use client";

import { useState, useEffect, useRef } from "react";
import { Team, GameItem } from "@/types/game";
import { Button } from "@/components/ui/button";
import { ModeToggle } from '@/components/ui/mode-toggle';
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
import dynamic from 'next/dynamic';
import { useTranslation } from '@/i18n/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import defaultItems from '@/data/items.json';
import { BoardSetupRef } from './BoardSetup';
import { TeamSetupRef } from './TeamSetup';

const TeamSetup = dynamic(() => import('@/components/TeamSetup'), {
  ssr: false,
});

const BoardSetup = dynamic(() => import('@/components/BoardSetup'), {
  ssr: false,
});

interface GameSettingsProps {
  teams: Team[];
  onTeamUpdate: (teams: Team[]) => void;
  onBoardItemsUpdate?: (items: GameItem[]) => void;
}

export function GameSettings({ teams, onTeamUpdate, onBoardItemsUpdate }: GameSettingsProps) {
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  const [boardItems, setBoardItems] = useState<GameItem[]>(defaultItems.items);
  const { t } = useTranslation();
  const boardSetupRef = useRef<BoardSetupRef>(null);
  const teamSetupRef = useRef<TeamSetupRef>(null);

  // Load board items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('boardItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setBoardItems(parsedItems);
        // Don't call onBoardItemsUpdate here to avoid infinite update loop
      } catch (error) {
        console.error('Error loading items from localStorage:', error);
      }
    }
  }, []);

  const handleBoardItemsUpdate = (items: GameItem[]) => {
    console.log("🚀 ~ file: GameSettings.tsx:57 ~ items:", items)
    setBoardItems(items);
    if (onBoardItemsUpdate) {
      onBoardItemsUpdate(items);
    }
  };

  return (
    <div className="w-full p-4 flex justify-between items-center bg-white dark:bg-gray-950 border-b">
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setShowTeamSettings(true)}>
          {t('game.settings.teams')}
        </Button>
        <Button variant="outline" onClick={() => setShowBoardSettings(true)}>
          {t('game.settings.board')}
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ModeToggle />
      </div>

      {/* Team Settings Dialog */}
      <AlertDialog open={showTeamSettings} onOpenChange={setShowTeamSettings}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('game.settings.teams')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('game.settings.teamsDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <TeamSetup ref={teamSetupRef} teams={teams} onTeamUpdate={onTeamUpdate} />
          </div>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="dark:text-white dark:bg-stone-800 dark:hover:bg-stone-700" onClick={() => setShowTeamSettings(false)}>{t('game.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="dark:text-white dark:bg-stone-600 dark:hover:bg-stone-500" 
              onClick={() => {
                // Save teams and close dialog
                const currentTeams = teamSetupRef.current?.getCurrentTeams();
                if (currentTeams) {
                  onTeamUpdate(currentTeams);
                }
                setShowTeamSettings(false);
              }}
            >
              {t('game.actions.saveAndApply')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Board Settings Dialog */}
      <AlertDialog open={showBoardSettings} onOpenChange={setShowBoardSettings}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('game.settings.board')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('game.settings.boardDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <BoardSetup ref={boardSetupRef} items={boardItems} onItemsUpdate={handleBoardItemsUpdate} />
          </div>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="dark:text-white dark:bg-stone-800 dark:hover:bg-stone-700" onClick={() => setShowBoardSettings(false)}>{t('game.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="dark:text-white dark:bg-stone-600 dark:hover:bg-stone-500" 
              onClick={() => {
                // Save to localStorage and apply changes
                const currentItems = boardSetupRef.current?.getCurrentItems();
                if (currentItems) {
                  handleBoardItemsUpdate(currentItems);
                  localStorage.setItem('boardItems', JSON.stringify(currentItems));
                }
                setShowBoardSettings(false);
              }}
            >
              {t('game.actions.saveAndApply')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
