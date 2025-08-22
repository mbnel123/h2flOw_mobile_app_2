// src/hooks/useTimerLogic.ts
import { useState, useEffect, useRef } from 'react';
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
import { notificationService } from '../services/notificationService.ts';
import { serviceWorkerManager } from '../services/serviceWorkerManager.ts';
import { FastTemplate, templateService } from '../services/templateService.ts';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'offline' | 'error'>('connecting');
  const [multiDeviceActivity, setMultiDeviceActivity] = useState<string | null>(null);

  // Phase notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Background timer state
  const [backgroundTimerActive, setBackgroundTimerActive] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'loading' | 'active' | 'error' | 'unsupported'>('loading');

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

  // Real-time listener ref
  const realtimeUnsubscribe = useRef<(() => void) | null>(null);

  // Load streak data
  const loadStreakData = async (userId: string) => {
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
  };

  // Setup real-time sync
  const setupRealtimeSync = async (userId: string) => {
    try {
      setSyncStatus('connecting');
      if (realtimeUnsubscribe.current) {
        realtimeUnsubscribe.current();
      }

      await loadCurrentFast(userId);
      await loadStreakData(userId);

      const unsubscribe = subscribeToCurrentFast(userId, (updatedFast) => {
        handleRealtimeUpdate(updatedFast);
        setLastSyncTime(new Date());
        setSyncStatus('connected');
      });

      realtimeUnsubscribe.current = unsubscribe;
    } catch (err) {
      console.error('Failed to setup real-time sync:', err);
      setSyncStatus('error');
    }
  };

  // Handle real-time updates
  const handleRealtimeUpdate = (updatedFast: Fast | null) => {
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
  };

  // Load current fast
  const loadCurrentFast = async (userId: string) => {
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
  };

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

    // Show warning modal instead of starting immediately
    setShowWarningModal(true);
  };

  // Actual fast start after warning acceptance
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
        
        if (notificationPermission !== 'granted') {
          const permission = await notificationService.requestPermission();
          setNotificationPermission(permission);
        }
        
        if (serviceWorkerStatus === 'active') {
          const backgroundSuccess = await serviceWorkerManager.startBackgroundTimer({
            userId: user!.uid,
            fastId: result.id,
            startTime: new Date(),
            targetHours,
            plannedDuration: targetHours
          });
          
          if (backgroundSuccess) {
            setBackgroundTimerActive(true);
          }
        }
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
        
        if (backgroundTimerActive && user) {
          await serviceWorkerManager.stopBackgroundTimer(user.uid);
          setBackgroundTimerActive(false);
        }

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

  // Initialize services
  useEffect(() => {
    setNotificationPermission(notificationService.getPermissionStatus());
    
    const initServiceWorker = async () => {
      const success = await serviceWorkerManager.initializeServiceWorker();
      setServiceWorkerStatus(success ? 'active' : 'unsupported');
    };
    
    initServiceWorker();

    const updateRecentTemplates = () => {
      setRecentTemplates(templateService.getRecentlyUsed(3));
    };
    
    const unsubscribeTemplates = templateService.subscribe(updateRecentTemplates);
    updateRecentTemplates();
    
    return () => unsubscribeTemplates();
  }, []);

  // Setup real-time sync when user changes
  useEffect(() => {
    if (user) {
      setupRealtimeSync(user.uid);
    }
  }, [user]);

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
  }, [isActive, startTime]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('connecting');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (realtimeUnsubscribe.current) {
        realtimeUnsubscribe.current();
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
    notificationPermission,
    backgroundTimerActive,
    serviceWorkerStatus,
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
