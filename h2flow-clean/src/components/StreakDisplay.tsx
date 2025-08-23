// src/components/StreakDisplay.tsx
import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { FastStreak } from '../firebase/databaseService';

interface StreakDisplayProps {
  streak: FastStreak;
  loading: boolean;
  resolvedTheme: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, loading, resolvedTheme }) => {
  const getDaysUntilNextMilestone = () => {
    const milestones = [7, 14, 21, 30, 50, 100, 365];
    const nextMilestone = milestones.find(m => m > streak.currentStreak);
    return nextMilestone ? nextMilestone - streak.currentStreak : null;
  };

  const getStreakEmoji = (streakDays: number) => {
    if (streakDays >= 100) return '🔥💎';
    if (streakDays >= 50) return '🔥⭐';
    if (streakDays >= 30) return '🔥🚀';
    if (streakDays >= 14) return '🔥💪';
    if (streakDays >= 7) return '🔥✨';
    if (streakDays >= 3) return '🔥🌟';
    if (streakDays >= 1) return '🔥';
    return '💭';
  };

  const daysToMilestone = getDaysUntilNextMilestone();

  if (loading) {
    return (
      <div className={`rounded-xl p-4 border transition-theme ${
        resolvedTheme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-4 border transition-theme ${
      resolvedTheme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            streak.currentStreak > 0 
              ? 'bg-gradient-to-br from-orange-500 to-red-500' 
              : resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <span className="text-xl">
              {streak.currentStreak > 0 ? getStreakEmoji(streak.currentStreak) : '💭'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-lg transition-theme ${
                resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
              </span>
              {streak.currentStreak > 0 && (
                <Flame className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <p className={`text-sm transition-theme ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Current streak
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-4 h-4 transition-theme ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`font-semibold transition-theme ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {streak.longestStreak}
            </span>
          </div>
          <p className={`text-xs transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Best streak
          </p>
        </div>
      </div>

      {/* Next milestone */}
      {daysToMilestone && streak.currentStreak > 0 && (
        <div className={`mt-3 pt-3 border-t transition-theme ${
          resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-theme ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Next milestone: {streak.currentStreak + daysToMilestone} days
            </span>
            <span className={`text-sm font-medium transition-theme ${
              resolvedTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {daysToMilestone} to go!
            </span>
          </div>
          
          {/* Progress bar */}
          <div className={`mt-2 h-2 rounded-full transition-theme ${
            resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ 
                width: `${(streak.currentStreak / (streak.currentStreak + daysToMilestone)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Motivational message */}
      {streak.currentStreak === 0 && (
        <div className={`mt-3 pt-3 border-t transition-theme ${
          resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm text-center transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            🎯 Complete your first fast to start your streak!
          </p>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
