'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Team } from '@/types/game';
import { Shuffle } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n';

interface TeamSetupProps {
  teams: Team[];
  onTeamUpdate: (teams: Team[]) => void;
}

export interface TeamSetupRef {
  getCurrentTeams: () => Team[];
}

const TeamSetup = forwardRef<TeamSetupRef, TeamSetupProps>(({ teams, onTeamUpdate }, ref) => {
  const { t } = useTranslation();
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentTeams: () => teams
  }));
  
  const handleTeamUpdate = (index: number, field: keyof Team, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    onTeamUpdate(newTeams);
  };

  const generateRandomColors = () => {
    const newTeams = teams.map(team => ({
      ...team,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }));
    onTeamUpdate(newTeams);
  };

  return (
    <div className="space-y-4">
      {teams.map((team, index) => (
        <div key={index} className="space-y-2"> 
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              {t('game.settings.team', { index: index + 1 })}
            </label>
            <div className="flex gap-2" >
              <input
                type="color"
                value={team.color}
                onChange={(e) => handleTeamUpdate(index, 'color', e.target.value)}
                className="mt-1 block  w-10 h-10  rounded-md border-gray-300 bg-gray-200 dark:bg-stone-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                value={team.name}
                onChange={(e) => handleTeamUpdate(index, 'name', e.target.value)}
                className="mt-1 px-2 block dark:text-white rounded-md w-full bg-gray-200 dark:bg-stone-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={generateRandomColors}
        className="mt-4 w-full flex items-center  dark:text-white justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-md transition-colors"
      >
        <Shuffle className="w-4 h-4" />
        {t('game.settings.generateColors')}
      </button>
    </div>
  );
});

TeamSetup.displayName = 'TeamSetup';

export default TeamSetup;
