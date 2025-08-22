// src/screens/TimerScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, StatusBar, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/authService';
import { useTimerLogic } from '../hooks/useTimerLogic';
import { useMilestoneTracker } from '../components/SuccessAnimations';

// Import components
import TimerLoadingSkeleton from '../components/timer/TimerLoadingSkeleton';
import CircularProgress from '../components/timer/CircularProgress';
import IntegratedStatsDisplay from '../components/timer/IntegratedStatsDisplay';
import TimerHeader from '../components/timer/TimerHeader';
import TimerControls from '../components/timer/TimerControls';
import PhaseInfo from '../components/timer/PhaseInfo';
import NextPhaseInfo from '../components/timer/NextPhaseInfo';
import TemplateInfo from '../components/timer/TemplateInfo';
import WarningModal from '../components/WarningModal';
import StopConfirmationModal from '../components/timer/StopConfirmationModal';
import TemplateSelector from '../components/TemplateSelector';
import TimerCelebrations from '../components/SuccessAnimations';

// Theme colors
const colors = {
  light: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    gradient: ['#F9FAFB', '#F3F4F6', '#F9FAFB'],
    error: '#EF4444',
  },
  dark: {
    primary: '#3B82F6',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    gradient: ['#111827', '#1F2937', '#111827'],
    error: '#EF4444',
  }
};

interface TimerScreenProps {
  setCurrentView?: (view: string) => void;
}

const TimerScreen: React.FC<TimerScreenProps> = ({ setCurrentView = () => {} }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
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

  // Loading state
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={[styles.lockText, { color: theme.textSecondary }]}>
            Please log in to use the timer
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (initialLoading) {
    return <TimerLoadingSkeleton theme={theme} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.gradient[0] }]}>
      <LinearGradient
        colors={theme.gradient}
        style={styles.container}
      >
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />

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
          theme={theme}
          setCurrentView={setCurrentView}
          syncStatus={syncStatus}
          isOnline={isOnline}
          lastSyncTime={lastSyncTime}
          multiDeviceActivity={multiDeviceActivity}
          getProgress={getProgress}
        />

        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, { 
            backgroundColor: isDark ? 'rgba(153, 27, 27, 0.2)' : '#FEF2F2',
            borderBottomColor: isDark ? '#DC2626' : '#FECACA'
          }]}>
            <Text style={[styles.errorText, { 
              color: isDark ? '#F87171' : '#DC2626' 
            }]}>
              {error}
            </Text>
            <Text 
              onPress={() => setError(null)}
              style={[styles.dismissText, { 
                color: isDark ? '#FCA5A5' : '#991B1B' 
              }]}
            >
              Dismiss
            </Text>
          </View>
        )}

        {/* Main Timer Area */}
        <View style={styles.mainContent}>
          {/* Integrated Stats */}
          {fastingStreak && (
            <View style={styles.statsContainer}>
              <IntegratedStatsDisplay 
                streak={fastingStreak} 
                loading={streakLoading} 
                theme={theme}
                isActive={isActive}
                elapsedTime={elapsedTime}
                targetHours={targetHours}
              />
            </View>
          )}

          {/* Current Template Info */}
          {currentTemplate && !isActive && (
            <TemplateInfo 
              template={currentTemplate}
              onRemove={() => setCurrentTemplate(null)}
              theme={theme}
            />
          )}

          {/* Circular Progress */}
          <View style={styles.progressContainer}>
            <CircularProgress 
              progress={getProgress()} 
              elapsedTime={elapsedTime}
              targetHours={targetHours}
              theme={theme}
            />
          </View>
          
          {/* Phase Information */}
          {isActive && (
            <View style={styles.phaseContainer}>
              <PhaseInfo 
                currentPhase={currentPhase}
                dailyWaterIntake={dailyWaterIntake}
                elapsedTime={elapsedTime}
                theme={theme}
              />

              {nextPhaseInfo && (
                <NextPhaseInfo 
                  nextPhase={nextPhaseInfo} 
                  theme={theme}
                />
              )}
            </View>
          )}
        </View>

        {/* Control Buttons */}
        <TimerControls
          isActive={isActive}
          startTime={startTime}
          loading={loading}
          isOnline={isOnline}
          theme={theme}
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
          theme={theme}
        />

        {/* Stop Confirmation Modal */}
        <StopConfirmationModal
          isVisible={showStopConfirmation}
          onCancel={() => setShowStopConfirmation(false)}
          onConfirm={stopFast}
          elapsedTime={elapsedTime}
          loading={loading}
          isOnline={isOnline}
          theme={theme}
        />

        {/* Template Selector Modal */}
        {showTemplateSelector && user && (
          <TemplateSelector
            userId={user.uid}
            selectedDuration={targetHours}
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplateSelector(false)}
            theme={theme}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  lockText: {
    fontSize: 16,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  errorText: {
    fontSize: 14,
  },
  dismissText: {
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  statsContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  phaseContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
});

export default TimerScreen;
