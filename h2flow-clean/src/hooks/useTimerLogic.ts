// src/hooks/useTimerLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import { 
  startFast, 
  endFast, 
  getCurrentFast, 
  updateFastStatus,
  subscribeToCurrentFast,
  Fast
} from '../firebase/databaseService';
import { FastTemplate, templateService } from '../services/templateService';

// Define FastStreak interface if not exported from databaseService
interface FastStreak {
  currentStreak: number;
  longestStreak: number;
  totalFasts: number;
  lastFastDate?: string;
}

export const useTimerLogic = (user: User | null, setCurrentView: (view: string) => void) => {
  // Firebase state
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Streak state
  const [fastingStreak, setFastingStreak] = useState<FastStreak | null>(null);
  const [streakLoading, setStreakLoading] = useState(false);

  // Real-time sync state
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'offline' | 'error'>('connecting');
  const [multiDeviceActivity, setMultiDeviceActivity] = useState<string | null>(null);

  // Template state
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<FastTemplate | null>(null);
  const [recentTemplates, setRecentTemplates] = useState<FastTemplate[]>([]);

  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetHours, setTargetHours] = useState(24);
  const [dailyWaterIntake, setDailyWaterIntake] = useState(0);
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);

  // Warning state
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Success animations state
  const [previousElapsedTime, setPreviousElapsedTime] = useState(0);
  const [personalRecord, setPersonalRecord] = useState(0);
  const [showCelebrations, setShowCelebrations] = useState(true);

  // Real-time listener ref and tracking
  const realtimeUnsubscribe = useRef<(() => void) | null>(null);
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // ---- EXTRA: Bereken huidige fase ----
  const fastingPhases = [
    { hours: 0, title: "Fast begins" },
    { hours: 6, title: "Glycogen use" },
    { hours: 12, title: "Ketosis start" },
    { hours: 18, title: "Deep ketosis" },
    { hours: 24, title: "Autophagy" },
    { hours: 48, title: "Deep autophagy" },
    { hours: 72, title: "Immune reset" }
  ];

  const elapsedHours = Math.floor(elapsedTime / 3600);
  const currentPhase = fastingPhases.reduce((phase, p) => {
    if (elapsedHours >= p.hours) return p;
    return phase;
  }, fastingPhases[0]);

  // ---- Load streak data - placeholder implementation ----
  const loadStreakData = useCallback(async (userId: string) => {
    if (streakLoading) return;
    setStreakLoading(true);
    try {
      // For now, just set a default streak until calculateFastingStreak is implemented
      // You'll need to implement this function in your databaseService
      const defaultStreak: FastStreak = {
        currentStreak: 0,
        longestStreak: 0,
        totalFasts: 0
      };
      setFastingStreak(defaultStreak);
      
      // TODO: Replace with actual implementation when available
      // const { streak, error } = await calculateFastingStreak(userId);
      // if (!error) setFastingStreak(streak);
    } catch (err) {
      console.error('Error loading streak:', err);
    } finally {
      setStreakLoading(false);
    }
  }, [streakLoading]);

  // ---- Handle realtime updates ----
  const handleRealtimeUpdate = useCallback((updatedFast: Fast | null) => {
    const wasActive = currentFast?.status === 'active';
    const nowCompleted = updatedFast?.status === 'completed';

    if (!updatedFast) {
      if (currentFast && user) {
        setMultiDeviceActivity('Fast ended on another device');
        setTimeout(() => setMultiDeviceActivity(null), 3000);
        loadStreakData(user.uid);
      }
      setCurrentFast(null);
      setIsActive(false);
      setStartTime(null);
      setElapsedTime(0);
      setDailyWaterIntake(0);
      return;
    }

    setCurrentFast(updatedFast);

    if (wasActive && nowCompleted && user) {
      loadStreakData(user.uid);
    }

    if (updatedFast.status === 'active') {
      setIsActive(true);
      const fastStartTime = new Date(updatedFast.startTime).getTime();
      setStartTime(fastStartTime);
      setElapsedTime(Math.floor((Date.now() - fastStartTime) / 1000));
    } else {
      setIsActive(updatedFast.status === 'active');
    }

    setTargetHours(updatedFast.plannedDuration);
    const totalWater = updatedFast.waterIntake?.reduce((total, entry) => total + entry.amount, 0) || 0;
    setDailyWaterIntake(totalWater);
  }, [currentFast, user, loadStreakData]);

  // ---- Load current fast ----
  const loadCurrentFast = useCallback(async (userId: string) => {
    if (!initialLoading) return;
    try {
      const fast = await getCurrentFast(userId);
      
      if (fast) {
        setCurrentFast(fast);
        if (fast.status === 'active') {
          setIsActive(true);
          const fastStartTime = new Date(fast.startTime).getTime();
          setStartTime(fastStartTime);
          setElapsedTime(Math.floor((Date.now() - fastStartTime) / 1000));
        }
        setTargetHours(fast.plannedDuration);
        const totalWater = fast.waterIntake?.reduce((total, entry) => total + entry.amount, 0) || 0;
        setDailyWaterIntake(totalWater);
      } else {
        setCurrentFast(null);
        setIsActive(false);
        setStartTime(null);
        setElapsedTime(0);
        setDailyWaterIntake(0);
      }
      setSyncStatus('connected');
    } catch (err) {
      setError('Failed to load fasting data: ' + (err instanceof Error ? err.message : String(err)));
      setSyncStatus('error');
    } finally {
      setInitialLoading(false);
    }
  }, [initialLoading]);

  // ---- Setup realtime sync ----
  const setupRealtimeSync = useCallback(async (userId: string) => {
    if (currentUserId.current === userId && realtimeUnsubscribe.current) return;
    try {
      setSyncStatus('connecting');
      if (realtimeUnsubscribe.current) realtimeUnsubscribe.current();
      await loadCurrentFast(userId);
      await loadStreakData(userId);
      const unsubscribe = subscribeToCurrentFast(userId, (updatedFast) => {
        handleRealtimeUpdate(updatedFast);
        setLastSyncTime(new Date());
        setSyncStatus('connected');
      });
      realtimeUnsubscribe.current = unsubscribe;
      currentUserId.current = userId;
    } catch (err) {
      setSyncStatus('error');
    }
  }, [loadCurrentFast, loadStreakData, handleRealtimeUpdate]);

  // ---- Actions ----
  const handleStartFast = async () => {
    if (!user) return setError('Please log in to start fasting');
    if (!isOnline) return setError('Cannot start fast while offline');
    if (!targetHours || targetHours <= 0 || targetHours > 168) {
      return setError('Please set a valid target duration (1-168h)');
    }
    setShowWarningModal(true);
  };

  const proceedWithFastStart = async () => {
    setShowWarningModal(false);
    setLoading(true);
    try {
      const result = await startFast(user!.uid, targetHours);
      if (result.error) setError(`Failed to start fast: ${result.error}`);
      else {
        setPreviousElapsedTime(0);
        setShowCelebrations(true);
      }
    } catch (err) {
      setError('Failed to start fast');
    }
    setLoading(false);
  };

  const pauseFast = async () => {
    if (!currentFast?.id || !isOnline) return;
    try { 
      await updateFastStatus(currentFast.id, 'paused'); 
    }
    catch { 
      setError('Failed to pause fast'); 
    }
  };

  const resumeFast = async () => {
    if (!currentFast?.id || !isOnline) return;
    try { 
      await updateFastStatus(currentFast.id, 'active'); 
    }
    catch { 
      setError('Failed to resume fast'); 
    }
  };

  const stopFast = async () => {
    if (!currentFast?.id || !isOnline) return;
    setLoading(true);
    try {
      const { error } = await endFast(currentFast.id);
      if (error) setError(error);
      else {
        setShowStopConfirmation(false);
        if (user) await loadStreakData(user.uid);
      }
    } catch {
      setError('Failed to end fast');
    }
    setLoading(false);
  };

  const handleSelectTemplate = (template: FastTemplate) => {
    setCurrentTemplate(template);
    setTargetHours(template.duration);
  };

  // ---- Effects ----
  useEffect(() => {
    const unsubscribe = templateService.subscribe(() => {
      setRecentTemplates(templateService.getRecentlyUsed(3));
    });
    setRecentTemplates(templateService.getRecentlyUsed(3));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !isInitialized.current) {
      setupRealtimeSync(user.uid);
      isInitialized.current = true;
    }
    if (!user) {
      isInitialized.current = false;
      currentUserId.current = null;
    }
  }, [user, setupRealtimeSync]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setPreviousElapsedTime(elapsedTime);
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { 
      if (interval) clearInterval(interval); 
    };
  }, [isActive, startTime, elapsedTime]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsOnline(connected ?? false);
      setSyncStatus(connected ? 'connected' : 'offline');
      if (connected) setLastSyncTime(new Date());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (realtimeUnsubscribe.current) realtimeUnsubscribe.current();
    };
  }, []);

  // ---- Expose ----
  return {
    // State
    currentFast,
    loading,
    initialLoading,
    error,
    fastingStreak,
    streakLoading,
    isOnline,
    lastSyncTime,
    syncStatus,
    multiDeviceActivity,
    showTemplateSelector,
    currentTemplate,
    recentTemplates,
    isActive,
    startTime,
    elapsedTime,
    elapsedHours,
    targetHours,
    dailyWaterIntake,
    showStopConfirmation,
    showWarningModal,
    previousElapsedTime,
    personalRecord,
    showCelebrations,
    currentPhase,

    // Actions
    handleStartFast,
    proceedWithFastStart,
    pauseFast,
    resumeFast,
    stopFast,
    handleSelectTemplate,
    setError,
    setShowStopConfirmation,
    setShowTemplateSelector,
    setShowCelebrations,
    setCurrentTemplate,
    setTargetHours,
    setShowWarningModal,

    // Stop confirm handlers
    onStopConfirmation: () => setShowStopConfirmation(true),
    onConfirmStop: stopFast,
    onCancelStop: () => setShowStopConfirmation(false),
  };
};
