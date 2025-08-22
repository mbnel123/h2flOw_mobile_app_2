// src/hooks/useHistoryData.ts
import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getFastHistory, calculateFastingStreak, Fast, FastStreak } from '../firebase/databaseService';

export const useHistoryData = (user: FirebaseUser | null) => {
  const [fastHistory, setFastHistory] = useState<Fast[]>([]);
  const [fastingStreak, setFastingStreak] = useState<FastStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load both fast history and streak data
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Load fast history
      const { fasts, error: historyError } = await getFastHistory(userId);
      if (historyError) {
        setError(historyError);
      } else {
        setFastHistory(fasts);
      }

      // Load streak data using database function
      const { streak, error: streakError } = await calculateFastingStreak(userId);
      if (streakError) {
        console.error('Failed to load streak:', streakError);
        // Don't set error for streak failure, just log it
      } else {
        setFastingStreak(streak);
      }

    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced statistics calculation
  const calculateAdvancedStats = () => {
    const completedFasts = fastHistory.filter(fast => fast.status === 'completed');
    const totalFasts = fastHistory.length;
    const totalHours = fastHistory.reduce((sum, fast) => {
      return sum + (fast.actualDuration || fast.plannedDuration);
    }, 0);
    const averageDuration = totalFasts > 0 ? Math.round(totalHours / totalFasts) : 0;
    const longestFast = Math.max(...fastHistory.map(fast => fast.actualDuration || fast.plannedDuration), 0);
    const completionRate = totalFasts > 0 ? Math.round((completedFasts.length / totalFasts) * 100) : 0;
    
    // Calculate yearly averages
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const thisYearFasts = fastHistory.filter(fast => new Date(fast.startTime) >= oneYearAgo);
    const fastsPerYear = thisYearFasts.length;
    const hoursPerYear = thisYearFasts.reduce((sum, fast) => sum + (fast.actualDuration || fast.plannedDuration), 0);
    
    // Calculate monthly averages
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisMonthFasts = fastHistory.filter(fast => new Date(fast.startTime) >= oneMonthAgo);
    const fastsPerMonth = thisMonthFasts.length;
    const hoursPerMonth = thisMonthFasts.reduce((sum, fast) => sum + (fast.actualDuration || fast.plannedDuration), 0);
    
    // Calculate weekly averages
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekFasts = fastHistory.filter(fast => new Date(fast.startTime) >= oneWeekAgo);
    
    // Calculate ketosis hours (12+ hour fasts)
    const ketosisHours = fastHistory
      .filter(fast => (fast.actualDuration || fast.plannedDuration) >= 12)
      .reduce((sum, fast) => sum + Math.max(0, (fast.actualDuration || fast.plannedDuration) - 12), 0);
    
    // Calculate autophagy hours (24+ hour fasts)
    const autophagyHours = fastHistory
      .filter(fast => (fast.actualDuration || fast.plannedDuration) >= 24)
      .reduce((sum, fast) => sum + Math.max(0, (fast.actualDuration || fast.plannedDuration) - 24), 0);
    
    // Calculate damaged cells cleared (rough scientific estimate)
    const damagedCellsCleared = Math.round(autophagyHours * 1200000); // ~1.2M cells per hour estimate
    
    // Calculate immune system resets (72+ hour fasts)
    const immuneResets = fastHistory.filter(fast => (fast.actualDuration || fast.plannedDuration) >= 72).length;
    
    // Calculate growth hormone boost hours (estimated)
    const growthHormoneHours = fastHistory.reduce((sum, fast) => {
      const duration = fast.actualDuration || fast.plannedDuration;
      if (duration >= 16) return sum + duration;
      return sum;
    }, 0);
    
    // Account age calculation
    const oldestFast = fastHistory.reduce((oldest, fast) => {
      const fastDate = new Date(fast.startTime);
      return fastDate < oldest ? fastDate : oldest;
    }, new Date());
    
    const accountAgeDays = Math.floor((now.getTime() - oldestFast.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalFasts,
      totalHours,
      averageDuration,
      longestFast,
      completionRate,
      ketosisHours,
      autophagyHours,
      damagedCellsCleared,
      immuneResets,
      growthHormoneHours,
      thisWeekFasts: thisWeekFasts.length,
      fastsPerYear,
      hoursPerYear,
      fastsPerMonth,
      hoursPerMonth,
      accountAgeDays
    };
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    }
  }, [user]);

  return {
    fastHistory,
    fastingStreak,
    loading,
    error,
    stats: calculateAdvancedStats(),
    loadUserData,
    setError
  };
};
