// src/screens/TimerScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  StatusBar, 
  useColorScheme, 
  ScrollView
} from 'react-native';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/authService';
import { useTimerLogic } from '../hooks/useTimerLogic';

// Import success animations
import { useMilestoneTracker, TimerCelebrations } from '../components/SuccessAnimations';

// Import existing components
import TimerLoadingSkeleton from '../components/timer/TimerLoadingSkeleton';
import CircularProgress from '../components/timer/CircularProgress';
import TimerControls from '../components/timer/TimerControls';
import PhaseInfo from '../components/timer/PhaseInfo';
import TemplateInfo from '../components/timer/TemplateInfo';
import WarningModal from '../components/WarningModal';
import TemplateSelectorScreen from './TemplateSelectorScreen';
import ExtendedFastWarningModal from '../components/ExtendedFastWarningModal';

const colors = {
  light: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    gradient: ['#F9FAFB', '#F3F4F6', '#F9FAFB'],
    error: '#EF4444',
  },
  dark: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
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

  // Refs to prevent infinite loops
  const milestonesChecked = useRef(new Set<number>());
  const lastElapsedHour = useRef(-1);
  const trackingInitialized = useRef(false);

  // State for extended fast warning
  const [showExtendedFastWarning, setShowExtendedFastWarning] = useState(false);
  const [hasAcceptedExtendedFastRisk, setHasAcceptedExtendedFastRisk] = useState(false);

  // Use custom hook for timer logic
  const {
    currentFast,
    loading,
    initialLoading,
    error,
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
    setShowWarningModal,
    resetElapsedTime // Nieuwe functie toevoegen aan de hook
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

  const getProgress = () => {
    const targetSeconds = targetHours * 3600;
    // Toon 0% progress als er geen actieve fast is en elapsedTime > 0
    if (!isActive && elapsedTime > 0) {
      return 0;
    }
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

  // Auth state management
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setCurrentView('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // Milestone checking - only when celebrations are enabled
  useEffect(() => {
    if (!isActive || !showCelebrations || elapsedTime <= 0) return;
    
    const currentHours = elapsedTime / 3600; // Get precise hours
    const flooredHour = Math.floor(currentHours);
    
    if (flooredHour !== lastElapsedHour.current && flooredHour > 0) {
      lastElapsedHour.current = flooredHour;
      
      if (!milestonesChecked.current.has(flooredHour)) {
        milestonesChecked.current.add(flooredHour);
        console.log(`Checking milestones for ${flooredHour}h (actual: ${currentHours.toFixed(2)}h)`);
        
        checkMilestones(currentHours);
        checkGoalCompletion(targetHours, currentHours);
        
        // Check for personal record if you have access to previous records
        // You'll need to implement this based on your data structure
        // checkPersonalRecord(currentHours, previousRecord);
      }
    }
  }, [isActive, showCelebrations, elapsedTime, targetHours]);

  // 72-hour warning check
  useEffect(() => {
    if (isActive && elapsedTime > 0 && showCelebrations) {
      const currentHours = elapsedTime / 3600;
      if (currentHours >= 71.5 && currentHours < 72 && !hasAcceptedExtendedFastRisk) {
        setShowExtendedFastWarning(true);
      }
    }
  }, [isActive, elapsedTime, showCelebrations, hasAcceptedExtendedFastRisk]);

  // Fast completion check
  useEffect(() => {
    if (isActive && showCelebrations && targetHours > 0) {
      const currentHours = elapsedTime / 3600;
      const targetReached = currentHours >= targetHours;
      
      if (targetReached) {
        checkFastCompletion(targetHours);
      }
    }
  }, [isActive, elapsedTime, targetHours, showCelebrations]);

  // Reset tracking when starting a new fast
  useEffect(() => {
    if (isActive && !trackingInitialized.current) {
      resetTracking();
      milestonesChecked.current.clear();
      lastElapsedHour.current = -1;
      trackingInitialized.current = true;
    } else if (!isActive) {
      trackingInitialized.current = false;
    }
  }, [isActive]);

  // Reset elapsed time when no active fast
  useEffect(() => {
    if (!isActive && elapsedTime > 0) {
      resetElapsedTime();
    }
  }, [isActive, elapsedTime]);

  // Loading state
  if (initialLoading) {
    return <TimerLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>Error: {error}</Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            Please try again later
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Success Animations */}
      <TimerCelebrations 
        celebrations={celebrations}
        onRemoveCelebration={removeCelebration}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Fasting Timer</Text>
        </View>

        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <CircularProgress
            progress={getProgress()}
            elapsedTime={elapsedTime}
            targetHours={targetHours}
            isActive={isActive}
            theme={theme}
          />
        </View>

        {/* Timer Controls */}
        <TimerControls
          isActive={isActive}
          elapsedTime={elapsedTime}
          targetHours={targetHours}
          onStart={handleStartFast}
          onPause={pauseFast}
          onResume={resumeFast}
          onStop={() => setShowStopConfirmation(true)}
          theme={theme}
        />

        {/* Phase Information */}
        <PhaseInfo
          currentPhase={getCurrentPhase()}
          timeToNextPhase={getTimeToNextPhase()}
          theme={theme}
        />

        {/* Template Information */}
        <TemplateInfo
          currentTemplate={currentTemplate}
          recentTemplates={recentTemplates}
          onSelectTemplate={() => setShowTemplateSelector(true)}
          theme={theme}
        />

        {/* Water Intake */}
        {dailyWaterIntake > 0 && (
          <View style={[styles.waterContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.waterTitle, { color: theme.text }]}>💧 Daily Water Goal</Text>
            <Text style={[styles.waterAmount, { color: theme.text }]}>
              {dailyWaterIntake}ml
            </Text>
            <Text style={[styles.waterSubtext, { color: theme.textSecondary }]}>
              Stay hydrated during your fast
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Template Selector Modal */}
      <TemplateSelectorScreen
        userId={user?.uid || ''}
        visible={showTemplateSelector}
        selectedDuration={elapsedTime > 0 ? Math.floor(elapsedTime / 3600) : undefined}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Stop Confirmation Modal */}
      <WarningModal
        visible={showStopConfirmation}
        title="Stop Fast"
        message="Are you sure you want to stop your fast? This action cannot be undone."
        confirmText="Stop Fast"
        cancelText="Continue Fasting"
        onConfirm={stopFast}
        onCancel={() => setShowStopConfirmation(false)}
        theme={theme}
      />

      {/* Extended Fast Warning Modal */}
      <ExtendedFastWarningModal
        visible={showExtendedFastWarning}
        onConfirm={() => {
          setHasAcceptedExtendedFastRisk(true);
          setShowExtendedFastWarning(false);
        }}
        onCancel={() => {
          setShowExtendedFastWarning(false);
          // Optioneel: pauzeer de fast automatisch
          pauseFast();
        }}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  waterContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  waterSubtext: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TimerScreen;
