// src/components/history/AchievementsSection.tsx
import React, { useState } from 'react';
import { Share2, Copy, Download } from 'lucide-react';
import { FastStreak } from '../../firebase/databaseService';
import { ShareService } from '../../services/shareService';

interface AchievementsSectionProps {
  stats: {
    totalFasts: number;
    longestFast: number;
    immuneResets: number;
    completionRate: number;
    ketosisHours: number;
  };
  fastingStreak: FastStreak | null;
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ stats, fastingStreak }) => {
  const [sharingId, setSharingId] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<string>('');

  const achievements = [];

  // Basic achievements
  if (stats.totalFasts >= 5) {
    achievements.push({
      emoji: '🎯',
      title: 'Dedicated Faster',
      description: 'Completed 5+ fasts',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      subtextColor: 'text-yellow-600'
    });
  }

  if (stats.longestFast >= 24) {
    achievements.push({
      emoji: '🔄',
      title: 'Autophagy Master',
      description: 'Reached 24+ hour fast',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      subtextColor: 'text-purple-600'
    });
  }

  if (stats.longestFast >= 48) {
    achievements.push({
      emoji: '🛡️',
      title: 'Cellular Warrior',
      description: 'Reached 48+ hour fast',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      subtextColor: 'text-green-600'
    });
  }

  if (stats.immuneResets >= 1) {
    achievements.push({
      emoji: '🌟',
      title: 'Immune Reset Champion',
      description: 'Completed 72+ hour fast',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      subtextColor: 'text-blue-600'
    });
  }

  if (stats.completionRate >= 80 && stats.totalFasts >= 3) {
    achievements.push({
      emoji: '💎',
      title: 'Consistency Champion',
      description: '80%+ completion rate',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800',
      subtextColor: 'text-indigo-600'
    });
  }

  if (stats.ketosisHours >= 100) {
    achievements.push({
      emoji: '⚡',
      title: 'Ketosis Explorer',
      description: '100+ hours in ketosis',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      subtextColor: 'text-emerald-600'
    });
  }

  // Streak achievements
  if (fastingStreak && fastingStreak.currentStreak >= 7) {
    achievements.push({
      emoji: '🔥',
      title: 'Week Warrior',
      description: '7+ day fasting streak',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      subtextColor: 'text-orange-600'
    });
  }

  if (fastingStreak && fastingStreak.currentStreak >= 30) {
    achievements.push({
      emoji: '🔥🚀',
      title: 'Monthly Master',
      description: '30+ day fasting streak',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      subtextColor: 'text-red-600'
    });
  }

  if (fastingStreak && fastingStreak.longestStreak >= 100) {
    achievements.push({
      emoji: '🔥💎',
      title: 'Legendary Faster',
      description: '100+ day streak achieved',
      bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      subtextColor: 'text-purple-600'
    });
  }

  const handleShare = async (achievement: any, index: number) => {
    setSharingId(index);
    setShareStatus('Generating image...');

    try {
      const extendedStats = {
        ...stats,
        currentStreak: fastingStreak?.currentStreak || 0
      };

      const success = await ShareService.shareAchievement(
        achievement,
        extendedStats,
        'Faster' // You could get actual user name here
      );

      if (success) {
        setShareStatus('Shared successfully! 🎉');
      } else {
        setShareStatus('Failed to share');
      }
    } catch (error) {
      setShareStatus('Error sharing');
      console.error('Share error:', error);
    }

    setTimeout(() => {
      setSharingId(null);
      setShareStatus('');
    }, 3000);
  };

  const handleCopyText = async (achievement: any, index: number) => {
    setSharingId(index);
    setShareStatus('Copying...');

    try {
      const extendedStats = {
        ...stats,
        currentStreak: fastingStreak?.currentStreak || 0
      };

      const success = await ShareService.copyAchievementText(achievement, extendedStats);

      if (success) {
        setShareStatus('Text copied! 📋');
      } else {
        setShareStatus('Failed to copy');
      }
    } catch (error) {
      setShareStatus('Error copying');
    }

    setTimeout(() => {
      setSharingId(null);
      setShareStatus('');
    }, 2000);
  };

  if (achievements.length === 0) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Achievements</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🎯</div>
          <p>Keep fasting to unlock achievements!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Achievements</h3>
      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement, index) => (
          <div 
            key={index}
            className={`${achievement.bgColor} border ${achievement.borderColor} rounded-lg p-4 flex items-center justify-between`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{achievement.emoji}</span>
              <div>
                <div className={`font-medium ${achievement.textColor}`}>{achievement.title}</div>
                <div className={`text-sm ${achievement.subtextColor}`}>{achievement.description}</div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center space-x-2">
              {sharingId === index ? (
                <div className="text-xs text-gray-600 px-3 py-1 bg-white/50 rounded-full">
                  {shareStatus}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleShare(achievement, index)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Share achievement"
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleCopyText(achievement, index)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Copy text"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Share instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Share your achievements to inspire others on their fasting journey! 
          The share button creates a beautiful image perfect for social media.
        </p>
      </div>
    </div>
  );
};

export default AchievementsSection;
