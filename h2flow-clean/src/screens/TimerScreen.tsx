// src/screens/TimerScreen.tsx - AANGEPAST MET STARTKNOOP
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  StatusBar, 
  useColorScheme, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/authService';
import { useTimerLogic } from '../hooks/useTimerLogic';
import { useMilestoneTracker } from '../components/SuccessAnimations';

// Import components
import TimerLoadingSkeleton from '../components/timer/TimerLoadingSkeleton';
import CircularProgress from '../components/timer/CircularProgress';
import TimerControls from '../components/timer/TimerControls';
import PhaseInfo from '../components/timer/PhaseInfo';
import NextPhaseInfo from '../components/timer/NextPhaseInfo';
import TemplateInfo from '../components/timer/TemplateInfo';
import WarningModal from '../components/WarningModal';
import StopConfirmationModal from '../components/timer/StopConfirmationModal';
import TemplateSelector from '../components/TemplateSelector';
import TimerCelebrations from '../components/SuccessAnimations';

// Theme colors - Updated with baby blue
const colors = {
  light: {
    primary: '#7DD3FC', // Baby blue instead of dark blue
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

  // Nieuwe functie voor starten zonder template
  const handleStartWithoutTemplate = () => {
    if (!user) return;
    
    // Gebruik standaard template van 16 uur
    const defaultTemplate = {
      id: 'default_16h',
      name: '16h Fast',
      icon: '⏰',
      duration: 16,
      category: 'beginner',
      tags: ['default'],
      isDefault: true,
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      userId: user.uid
    };
    
    handleSelectTemplate(defaultTemplate);
  };

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

  // FIXED: Milestone checking - prevent infinite loops
  useEffect(() => {
    if (!isActive || !showCelebrations || elapsedTime <= 0) {
      return;
    }

    const currentHours = Math.floor(elapsedTime / 3600);
    
    // Only check milestones once per hour
    if (currentHours !== lastElapsedHour.current && currentHours > 0) {
      lastElapsedHour.current = currentHours;
      
      if (!milestonesChecked.current.has(currentHours)) {
        console.log(`🎯 Checking milestones for hour ${currentHours}`);
        milestonesChecked.current.add(currentHours);
        
        checkMilestones(currentHours);
        checkGoalCompletion(targetHours, currentHours);
      }
    }
  }, [isActive, showCelebrations, Math.floor(elapsedTime / 3600)]);

  // FIXED: Reset tracking - only once per new fast
  useEffect(() => {
    const isNewFast = isActive && startTime && elapsedTime < 60;
    
    if (isNewFast && !trackingInitialized.current) {
      console.log('🆕 New fast detected, resetting tracking');
      resetTracking();
      milestonesChecked.current.clear();
      lastElapsedHour.current = -1;
      trackingInitialized.current = true;
    }
    
    if (!isActive) {
      trackingInitialized.current = false;
    }
  }, [isActive, startTime, elapsedTime < 60]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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

      {/* Main Content Area - FIXED LAYOUT */}
      <View style={styles.contentContainer}>
        {/* Current Template Info */}
        {currentTemplate && !isActive && (
          <View style={styles.templateContainer}>
            <TemplateInfo 
              template={currentTemplate}
              onRemove={() => setCurrentTemplate(null)}
              theme={theme}
            />
          </View>
        )}

        {/* Circular Progress - CENTERED */}
        <View style={styles.timerContainer}>
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

      {/* Control Buttons - FIXED POSITION */}
      <View style={styles.controlsContainer}>
        {!isActive && !currentTemplate ? (
          // Start buttons wanneer er geen actieve fasting is en geen template
          <View style={styles.startContainer}>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={handleStartWithoutTemplate}
              disabled={loading}
            >
              <Text style={styles.startButtonText}>
                {loading ? 'Starting...' : 'Start 16h Fast'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.templateButton, { borderColor: theme.primary }]}
              onPress={() => setShowTemplateSelector(true)}
            >
              <Text style={[styles.templateButtonText, { color: theme.primary }]}>
                Choose Template
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Normale timer controls wanneer er een actieve fasting of template is
          <TimerControls
            isActive={isActive}
            startTime={startTime}
            loading={loading}
            isOnline={true}
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
        )}
      </View>

      {/* Modals */}
      <WarningModal
        isOpen={showWarningModal}
        onAccept={proceedWithFastStart}
        onCancel={() => setShowWarningModal(false)}
        targetHours={targetHours}
        theme={theme}
      />

      <StopConfirmationModal
        isVisible={showStopConfirmation}
        onCancel={() => setShowStopConfirmation(false)}
        onConfirm={stopFast}
        elapsedTime={elapsedTime}
        loading={loading}
        isOnline={true}
        theme={theme}
      />

      {showTemplateSelector && user && (
        <TemplateSelector
          userId={user.uid}
          selectedDuration={targetHours}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
          theme={theme}
        />
      )}
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  templateContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 400,
  },
  phaseContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingBottom: 20,
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    paddingTop: 20,
  },
  // Nieuwe styles voor start buttons
  startContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  startButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  templateButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  templateButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TimerScreen;
