// src/components/timer/TimerView.tsx
import React, { useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../../firebase/authService';
import { TimerCelebrations, useMilestoneTracker } from '../SuccessAnimations';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TimerLoadingSkeleton, 
  CircularProgress, 
  TemplateInfo,
  PhaseInfo,
  NextPhaseInfo
} from './TimerComponents';
import TemplateSelector from '../TemplateSelector';
import IntegratedStatsDisplay from './IntegratedStatsDisplay';
import TimerHeader from './TimerHeader';
import TimerControls from './TimerControls';
import WarningModal from '../WarningModal';
import { useTimerLogic } from '../../hooks/useTimerLogic';

interface TimerViewProps {
  setCurrentView: (view: string) => void;
}

const TimerView: React.FC<TimerViewProps> = ({ setCurrentView }) => {
  const { resolvedTheme } = useTheme();
  const [user, setUser] = React.useState<User | null>(null);

  // Use custom hook for timer logic
  const {
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
    showCelebrations,
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
    setShowWarningModal
  } = useTimerLogic(user, setCurrentView);

  // Success animations integration
  const { 
    celebrations,
    removeCelebration,
    checkMilestones, 
    checkGoalCompletion, 
    checkPersonalRecord,
    checkFastCompletion,
    resetTracking
  } = useMilestoneTracker();

  // Fasting phases
  const fastingPhases = [
    { hours: 0, title: "Fast Begins", description: "Using glucose from last meal" },
    { hours: 6, title: "Glycogen Use", description: "Using stored energy" },
    { hours: 12, title: "Ketosis Start", description: "Fat burning begins" },
    { hours: 18, title: "Deep Ketosis", description: "Mental clarity improves" },
    { hours: 24, title: "Autophagy", description: "Cellular repair starts" },
    { hours: 48, title: "Deep Autophagy", description: "Maximum cleansing" },
    { hours: 72, title: "Immune Reset", description: "Complete renewal" }
  ];

  // Helper functions
  const getProgress = () => {
    const targetSeconds = targetHours * 3600;
    return Math.min((elapsedTime / targetSeconds) * 100, 100);
  };

  const getCurrentPhase = () => {
    const hours = elapsedTime / 3600;
    return fastingPhases.slice().reverse().find(phase => hours >= phase.hours) || fastingPhases[0];
  };

  const getNextPhase = () => {
    const hours = elapsedTime / 3600;
    return fastingPhases.find(phase => hours < phase.hours);
  };

  const getTimeToNextPhase = () => {
    const nextPhase = getNextPhase();
    if (!nextPhase) return null;
    const hoursToNext = nextPhase.hours - (elapsedTime / 3600);
    const hours = Math.floor(hoursToNext);
    const minutes = Math.floor((hoursToNext - hours) * 60);
    return { hours, minutes, nextPhase };
  };

  // Auth setup
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setCurrentView('auth');
      }
    });
    return () => unsubscribe();
  }, [setCurrentView]);

  // Milestone checking
  useEffect(() => {
    if (isActive && showCelebrations && elapsedTime > 0) {
      const currentHours = elapsedTime / 3600;
      
      checkMilestones(currentHours);
      checkGoalCompletion(targetHours, currentHours);
    }
  }, [Math.floor(elapsedTime / 3600), isActive, showCelebrations]);

  // Reset tracking when starting a new fast
  useEffect(() => {
    if (isActive && startTime && previousElapsedTime === 0 && elapsedTime < 60) {
      console.log('🆕 New fast detected, resetting tracking');
      resetTracking();
    }
  }, [isActive, startTime, elapsedTime, previousElapsedTime, resetTracking]);

  const currentPhase = getCurrentPhase();
  const nextPhaseInfo = getTimeToNextPhase();

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-theme ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className={`transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Please log in to use the timer
          </p>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return <TimerLoadingSkeleton />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-theme ${
      resolvedTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100'
    }`}>
      {/* Success Animations */}
      {showCelebrations && (
        <TimerCelebrations
          celebrations={celebrations}
          onRemoveCelebration={(id) => {
            removeCelebration(id);
            console.log('🎉 Celebration completed');
          }}
        />
      )}

      {/* Header */}
      <TimerHeader
        resolvedTheme={resolvedTheme}
        setCurrentView={setCurrentView}
        syncStatus={syncStatus}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
        multiDeviceActivity={multiDeviceActivity}
        getProgress={getProgress}
      />

      {/* Error Display */}
      {error && (
        <div className={`p-4 border-b transition-theme ${
          resolvedTheme === 'dark'
            ? 'bg-red-900/20 border-red-800'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm transition-theme ${
            resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </p>
          <button 
            onClick={() => setError(null)}
            className={`text-xs mt-1 underline transition-theme ${
              resolvedTheme === 'dark' 
                ? 'text-red-300 hover:text-red-200' 
                : 'text-red-800 hover:text-red-900'
            }`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Timer Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* Integrated Stats */}
        {fastingStreak && (
          <div className="w-full max-w-md mb-6">
            <IntegratedStatsDisplay 
              streak={fastingStreak} 
              loading={streakLoading} 
              resolvedTheme={resolvedTheme}
              isActive={isActive}
              elapsedTime={elapsedTime}
              targetHours={targetHours}
            />
          </div>
        )}

        {/* Current Template Info */}
        {currentTemplate && !isActive && (
          <TemplateInfo 
            template={currentTemplate}
            onRemove={() => setCurrentTemplate(null)}
          />
        )}

        <div className="relative mb-6">
          <CircularProgress 
            progress={getProgress()} 
            elapsedTime={elapsedTime}
            targetHours={targetHours}
          />
          <div className={`absolute top-4 right-4 rounded-full px-3 py-1 shadow-lg border transition-theme ${
            resolvedTheme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <span className="text-sm font-semibold text-sky-600">{Math.round(getProgress())}%</span>
          </div>
        </div>
        
        {isActive && (
          <div className="text-center max-w-lg space-y-4">
            <PhaseInfo 
              currentPhase={currentPhase}
              dailyWaterIntake={dailyWaterIntake}
              elapsedTime={elapsedTime}
            />

            {nextPhaseInfo && (
              <NextPhaseInfo nextPhase={nextPhaseInfo} />
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <TimerControls
        isActive={isActive}
        startTime={startTime}
        loading={loading}
        isOnline={isOnline}
        resolvedTheme={resolvedTheme}
        recentTemplates={recentTemplates}
        showCelebrations={showCelebrations}
        onStartFast={handleStartFast}
        onResumeFast={resumeFast}
        onPauseFast={pauseFast}
        onStopConfirmation={() => setShowStopConfirmation(true)}
        onShowTemplateSelector={() => setShowTemplateSelector(true)}
        onSelectTemplate={handleSelectTemplate}
        onToggleCelebrations={() => setShowCelebrations(!showCelebrations)}
      />

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarningModal}
        onAccept={proceedWithFastStart}
        onCancel={() => setShowWarningModal(false)}
        targetHours={targetHours}
      />

      {/* Stop Confirmation Modal */}
      {showStopConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 mx-4 max-w-sm w-full transition-theme ${
            resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-theme ${
              resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Stop Your Fast?
            </h3>
            <p className={`mb-6 transition-theme ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Are you sure you want to end your fast? You've been fasting for {Math.floor(elapsedTime / 3600)}h {Math.floor((elapsedTime % 3600) / 60)}m.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowStopConfirmation(false)} 
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Continue Fasting
              </button>
              <button 
                onClick={stopFast} 
                disabled={loading || !isOnline}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Stopping...' : 'Stop Fast'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && user && (
        <TemplateSelector
          userId={user.uid}
          selectedDuration={targetHours}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
};

export default TimerView;
