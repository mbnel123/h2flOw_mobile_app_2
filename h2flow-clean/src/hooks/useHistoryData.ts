// src/hooks/useHistoryData.ts
import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  getFastingHistory, 
  getFastingStreak, 
  getFastingStats,
  Fast,
  FastStreak
} from '../firebase/databaseService';

export const useHistoryData = (user: FirebaseUser | null) => {
  const [fastHistory, setFastHistory] = useState<Fast[]>([]);
  const [fastingStreak, setFastingStreak] = useState<FastStreak | null>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setFastHistory([]);
      setFastingStreak(null);
      setStats({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [history, streak, statistics] = await Promise.all([
        getFastingHistory(user.uid),
        getFastingStreak(user.uid),
        getFastingStats(user.uid)
      ]);

      setFastHistory(history);
      setFastingStreak(streak);
      setStats(statistics);
    } catch (err) {
      console.error('Error fetching history data:', err);
      setError('Failed to load history data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    fastHistory,
    fastingStreak,
    stats,
    loading,
    error,
    setError,
    refreshData // Make sure this is returned
  };
};
