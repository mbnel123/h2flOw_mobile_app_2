// src/components/history/AnalyticsBar.tsx
import React from 'react';
import { FastStreak, Fast } from '../../firebase/databaseService';

interface AnalyticsBarProps {
  fastingStreak: FastStreak | null;
  fastHistory: Fast[];
}

const AnalyticsBar: React.FC<AnalyticsBarProps> = ({ fastingStreak, fastHistory }) => {
  // Enhanced streak emoji based on current streak
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

  // Quarterly trend calculation
  const getQuarterlyTrend = () => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const prevQuarter = (currentQuarter + 3 - 1) % 4;
    const currentYear = now.getFullYear();
    
    const getQuarterFasts = (year: number, quarter: number) => fastHistory.filter(fast => {
      const d = new Date(fast.startTime);
      return d.getFullYear() === year && Math.floor(d.getMonth() / 3) === quarter;
    });
    
    const currentQ = getQuarterFasts(currentYear, currentQuarter);
    const prevQ = getQuarterFasts(currentYear, prevQuarter);
    const currentAvg = currentQ.length > 0 ? currentQ.reduce((a, b) => a + (b.actualDuration || b.plannedDuration), 0) / currentQ.length : 0;
    const prevAvg = prevQ.length > 0 ? prevQ.reduce((a, b) => a + (b.actualDuration || b.plannedDuration), 0) / prevQ.length : 0;
    
    if (prevAvg === 0) return null;
    return Number(((currentAvg - prevAvg) / prevAvg) * 100).toFixed(2);
  };

  // Predictive: voorspelling op basis van laatste 4 fasts
  const getNextPrediction = () => {
    if (fastHistory.length < 2) return null;
    const sorted = [...fastHistory].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const recent = sorted.slice(0, 4);
    const avg = recent.reduce((a, b) => a + (b.actualDuration || b.plannedDuration), 0) / recent.length;
    return Number(avg).toFixed(2);
  };

  // Personal Records
  const getPersonalRecords = () => {
    if (fastHistory.length === 0) return {};
    return {
      longestFast: Number(Math.max(...fastHistory.map(f => f.actualDuration || f.plannedDuration))).toFixed(2),
      mostFastsInWeek: Math.max(...[...Array(52)].map((_, i) => {
        const weekStart = new Date(new Date().getFullYear(), 0, 1 + i * 7);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return fastHistory.filter(f => new Date(f.startTime) >= weekStart && new Date(f.startTime) < weekEnd).length;
      })),
      mostHoursInMonth: Number(Math.max(...[...Array(12)].map((_, i) => {
        const month = i;
        return fastHistory.filter(f => new Date(f.startTime).getMonth() === month).reduce((a, b) => a + (b.actualDuration || b.plannedDuration), 0);
      }))).toFixed(2),
    };
  };

  // Monthly chart data
  const getMonthlyChartData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return months.map(month => fastHistory.filter(f => new Date(f.startTime).getMonth() === month).reduce((a, b) => a + (b.actualDuration || b.plannedDuration), 0));
  };

  const streak = fastingStreak?.currentStreak || 0;
  const quarterlyTrend = getQuarterlyTrend();
  const nextPrediction = getNextPrediction();
  const records = getPersonalRecords();
  const monthlyChart = getMonthlyChartData();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
      <div className="flex flex-wrap gap-8 items-center justify-between">
        {/* Enhanced Streak with Database Data */}
        <div className="flex flex-col items-center">
          <span className="text-4xl">{getStreakEmoji(streak)}</span>
          <div className="text-lg font-bold text-blue-900">{streak} day streak</div>
          <div className="text-xs text-gray-500">Consecutive fasting days</div>
          {fastingStreak && fastingStreak.longestStreak > streak && (
            <div className="text-xs text-gray-400 mt-1">Best: {fastingStreak.longestStreak} days</div>
          )}
        </div>
        
        {/* Quarterly Trend */}
        <div className="flex flex-col items-center">
          <span className="text-4xl">📈</span>
          <div className="text-lg font-bold text-green-900">
            {quarterlyTrend !== null ? (Number(quarterlyTrend) > 0 ? '+' : '') + quarterlyTrend + '%' : '–'}
          </div>
          <div className="text-xs text-gray-500">Quarterly trend</div>
        </div>
        
        {/* Prediction */}
        <div className="flex flex-col items-center">
          <span className="text-4xl">🔮</span>
          <div className="text-lg font-bold text-purple-900">
            {nextPrediction ? `${nextPrediction}h` : '–'}
          </div>
          <div className="text-xs text-gray-500">Predicted next fast</div>
        </div>
        
        {/* Personal Records */}
        <div className="flex flex-col items-center">
          <span className="text-4xl">🏅</span>
          <div className="text-xs text-gray-500">PRs</div>
          <div className="text-sm text-gray-700">Longest: {records.longestFast ? records.longestFast : '–'}h</div>
          <div className="text-sm text-gray-700">Most/wk: {records.mostFastsInWeek || '–'}</div>
          <div className="text-sm text-gray-700">Most/mo: {records.mostHoursInMonth ? records.mostHoursInMonth : '–'}h</div>
        </div>
        
        {/* Monthly Chart */}
        <div className="flex flex-col items-center">
          <span className="text-4xl">📊</span>
          <svg width="120" height="40">
            {monthlyChart.map((val, i) => (
              <rect
                key={i}
                x={i * 10}
                y={40 - (val / Math.max(...monthlyChart, 1)) * 35}
                width="8"
                height={(val / Math.max(...monthlyChart, 1)) * 35}
                fill="#6366f1"
                opacity={val > 0 ? 1 : 0.2}
              />
            ))}
          </svg>
          <div className="text-xs text-gray-500">Hours/month</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsBar;
