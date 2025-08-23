// src/hooks/useTimerLogic.ts - FIXED INFINITE LOOP
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  startFast, 
  endFast, 
  getCurrentFast, 
  updateFastStatus,
  subscribeToCurrentFast,
  calculateFastingStreak,
  Fast,
  FastStreak
} from '../firebase/databaseService';
import { FastTemplate, templateService } from '../services/templateService';

export const useTimerLogic = (user: User | null, setCurrentView: (view: string) => void) => {
  // Firebase state
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Streak state
  const [fastingStreak, setFastingStreak] = useState<FastStreak | null>(null);
  const [streakLoading, setStreakLoading] = useState(false);

  // Real-time sync state (simplified)
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

  // Load streak data - MEMOIZED
  const loadStreakData = useCallback(async (userId: string) => {
    if (streakLoading) return; // Prevent multiple calls
    
    setStreakLoading(true);
    try {
      const { streak, error } = await calculateFastingStreak(userId);
      if (error) {
        console.error('Failed to load streak:', error);
      } else {
        setFastingStreak(streak);
      }
    } catch (err) {
      console.error('Error loading streak:', err);
    } finally {
      setStreakLoading(false);
    }
  }, [streakLoading]);

  // Handle real-time updates - MEMOIZED
  const handleRealtimeUpdate = useCallback((updatedFast: Fast | null) => {
    const wasActive = currentFast?.status === 'active';
    const nowCompleted = updatedFast?.status === 'completed';
    
    if (!updatedFast) {
      if (currentFast) {
        setMultiDeviceActivity('Fast ended on another device');
        setTimeout(() => setMultiDeviceActivity(null), 3000);
        
        if (user) loadStreakData(user.uid);
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
      console.log('🔥 Fast completed, refreshing streak...');
      loadStreakData(user.uid);
    }

    if (updatedFast.status === 'active') {
      setIsActive(true);
      const fastStartTime = new Date(updatedFast.startTime).getTime();
      setStartTime(fastStartTime);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - fastStartTime) / 1000);
      setElapsedTime(elapsedSeconds);
    } else {
      setIsActive(updatedFast.status === 'active');
    }

    setTargetHours(updatedFast.plannedDuration);
    const totalWater = updatedFast.waterIntake?.reduce((total, entry) => total + entry.amount, 0) || 0;
    setDailyWaterIntake(totalWater);
  }, [currentFast, user, loadStreakData]);

  // Load current fast - MEMOIZED
  const loadCurrentFast = useCallback(async (userId: string) => {
    if (initialLoading === false) return; // Prevent reload
    
    try {
      setError(null);
      const result = await getCurrentFast(userId);
      
      if (result.error) {
        setError(`Failed to load data: ${result.error}`);
        setSyncStatus('error');
        return;
      }
      
      const { fast } = result;
      
      if (fast) {
        setCurrentFast(fast);
        
        if (fast.status === 'active') {
          setIsActive(true);
          const fastStartTime = new Date(fast.startTime).getTime();
          setStartTime(fastStartTime);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - fastStartTime) / 1000);
          setElapsedTime(elapsedSeconds);
        } else {
          setIsActive(false);
          setStartTime(null);
          setElapsedTime(0);
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
      console.error('loadCurrentFast error:', err);
      setError('Failed to load fasting data: ' + (err instanceof Error ? err.message : String(err)));
      setSyncStatus('error');
    } finally {
      setInitialLoading(false);
    }
  }, [initialLoading]);

  // Setup real-time sync - MEMOIZED
  const setupRealtimeSync = useCallback(async (userId: string) => {
    // Prevent multiple setups for same user
    if (currentUserId.current === userId && realtimeUnsubscribe.current) {
      return;
    }
    
    try {
      setSyncStatus('connecting');
      
      // Cleanup previous listener
      if (realtimeUnsubscribe.current) {
        realtimeUnsubscribe.current();
        realtimeUnsubscribe.current = null;
      }

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
      console.error('Failed to setup real-time sync:', err);
      setSyncStatus('error');
    }
  }, [loadCurrentFast, loadStreakData, handleRealtimeUpdate]);

  // Action handlers
  const handleStartFast = async () => {
    if (!user) {
      setError('Please log in to start fasting');
      return;
    }
    
    if (!targetHours || targetHours <= 0 || targetHours > 168) {
      setError('Please set a valid target duration in Settings (1-168 hours)');
      return;
    }

    if (!isOnline) {
      setError('Cannot start fast while offline');
      return;
    }

    setShowWarningModal(true);
  };

  const proceedWithFastStart = async () => {
    setShowWarningModal(false);
    setLoading(true);
    setError(null);
    
    try {
      const result = await startFast(user!.uid, targetHours);
      
      if (result.error) {
        setError(`Failed to start fast: ${result.error}`);
      } else if (result.id) {
        setPreviousElapsedTime(0);
        setShowCelebrations(true);
        console.log('✅ Fast started successfully');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError('Failed to start fast: ' + (err instanceof Error ? err.message : String(err)));
    }
    
    setLoading(false);
  };

  const pauseFast = async () => {
    if (!currentFast?.id || !isOnline) return;
    try {
      await updateFastStatus(currentFast.id, 'paused');
    } catch (err) {
      setError('Failed to pause fast');
    }
  };

  const resumeFast = async () => {
    if (!currentFast?.id || !isOnline) return;
    try {
      await updateFastStatus(currentFast.id, 'active');
    } catch (err) {
      setError('Failed to resume fast');
    }
  };

  const stopFast = async () => {
    if (!currentFast?.id) return;
    
    if (!isOnline) {
      setError('Cannot stop fast while offline');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await endFast(currentFast.id);
      if (error) {
        setError(error);
      } else {
        setShowStopConfirmation(false);

        if (user) {
          console.log('🔥 Fast completed! Refreshing streak...');
          await loadStreakData(user.uid);
        }
      }
    } catch (err) {
      setError('Failed to end fast');
    }
    
    setLoading(false);
  };

  const handleSelectTemplate = (template: FastTemplate) => {
    setCurrentTemplate(template);
    setTargetHours(template.duration);
  };

  // Initialize templates - ONLY ONCE
  useEffect(() => {
    const updateRecentTemplates = () => {
      setRecentTemplates(templateService.getRecentlyUsed(3));
    };
    
    const unsubscribeTemplates = templateService.subscribe(updateRecentTemplates);
    updateRecentTemplates();
    
    return () => unsubscribeTemplates();
  }, []);

  // Setup real-time sync when user changes - ONLY ONCE PER USER
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

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setPreviousElapsedTime(elapsedTime);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime, elapsedTime]);

  // Network status - SET ONCE
  useEffect(() => {
    setIsOnline(true);
    setSyncStatus('connected');
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (realtimeUnsubscribe.current) {
        realtimeUnsubscribe.current();
        realtimeUnsubscribe.current = null;
      }
    };
  }, []);

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
    targetHours,
    dailyWaterIntake,
    showStopConfirmation,
    showWarningModal,
    previousElapsedTime,
    personalRecord,
    showCelebrations,

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
    setShowWarningModal
  };
};