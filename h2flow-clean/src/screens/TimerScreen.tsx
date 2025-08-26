// TimerScreen.tsx - AANGEPAST VOOR NAVIGATIE
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  StatusBar, 
  useColorScheme, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/authService';
import { useTimerLogic } from '../hooks/useTimerLogic';
import { useMilestoneTracker } from '../components/SuccessAnimations';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

// Import components
import TimerLoadingSkeleton from '../components/timer/TimerLoadingSkeleton';
import CircularProgress from '../components/timer/CircularProgress';
import TimerControls from '../components/timer/TimerControls';
import PhaseInfo from '../components/timer/PhaseInfo';
import NextPhaseInfo from '../components/timer/NextPhaseInfo';
import TemplateInfo from '../components/timer/TemplateInfo';
import WarningModal from '../components/WarningModal';
import TemplateSelectorScreen from './TemplateSelectorScreen';
import TimerCelebrations from '../components/SuccessAnimations';

type TimerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Info'>;

// Theme colors - Updated with baby blue
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
  const navigation = useNavigation<TimerScreenNavigationProp>();

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
    { hours: 0, title: "Fast begins", description: "Using glucose from last meal" },
    { hours: 6, title: "Glycogen use", description: "Using stored energy" },
    { hours: 12, title: "Ketosis start", description: "Fat burning begins" },
    { hours: 18, title: "Deep ketosis", description: "Mental clarity improves" },
    { hours: 24, title: "Autophagy", description: "Cellular repair starts" },
    { hours: 48, title: "Deep autophagy", description: "Maximum cleansing" },
    { hours: 72, title: "Immune reset", description: "Complete renewal" }
  ];

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

  // Run only on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setCurrentView('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // Milestone check
  useEffect(() => {
    if (!isActive || !showCelebrations || elapsedTime <= 0) return;
    const currentHours = Math.floor(elapsedTime / 3600);
    if (currentHours !== lastElapsedHour.current && currentHours > 0) {
      lastElapsedHour.current = currentHours;
      if (!milestonesChecked.current.has(currentHours)) {
        milestonesChecked.current.add(currentHours);
        checkMilestones(currentHours);
        checkGoalCompletion(targetHours, currentHours);
      }
    }
  }, [isActive, showCelebrations, elapsedTime]);

  // Reset tracking on new fast
  useEffect(() => {
    const isNewFast = isActive && startTime && elapsedTime < 60;
    if (isNewFast && !trackingInitialized.current) {
      resetTracking();
      milestonesChecked.current.clear();
      lastElapsedHour.current = -1;
      trackingInitialized.current = true;
    }
    if (!isActive) trackingInitialized.current = false;
  }, [isActive, startTime, elapsedTime]);

  const currentPhase = getCurrentPhase();
  const nextPhaseInfo = getTimeToNextPhase();

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

  if (initialLoading) return <TimerLoadingSkeleton theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />

      {showCelebrations && (
        <TimerCelebrations
          celebrations={celebrations}
          onRemoveCelebration={(id) => removeCelebration(id)}
        />
      )}

      {error && (
        <View style={[styles.errorContainer, { 
          backgroundColor: isDark ? 'rgba(153, 27, 27, 0.2)' : '#FEF2F2',
          borderBottomColor: isDark ? '#DC2626' : '#FECACA'
        }]}>
          <Text style={[styles.errorText, { color: isDark ? '#F87171' : '#DC2626' }]}>{error}</Text>
          <Text onPress={() => setError(null)} style={[styles.dismissText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
            Dismiss
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentTemplate && !isActive && (
          <View style={styles.templateContainer}>
            <TemplateInfo 
              template={currentTemplate}
              onRemove={() => setCurrentTemplate(null)}
              theme={theme}
            />
          </View>
        )}

        <View style={styles.timerContainer}>
          <CircularProgress 
            progress={getProgress()} 
            elapsedTime={elapsedTime}
            targetHours={targetHours}
            theme={theme}
          />
        </View>
        
        {isActive && (
          <View style={styles.phaseContainer}>
            <PhaseInfo 
              currentPhase={currentPhase}
              dailyWaterIntake={dailyWaterIntake}
              elapsedTime={elapsedTime}
              theme={theme}
            />
            {nextPhaseInfo && (
              <View style={[styles.nextPhaseContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <Text style={[styles.nextPhaseTitle, { color: theme.text }]}>
                  Next: {nextPhaseInfo.nextPhase.title}
                </Text>
                <Text style={[styles.nextPhaseTime, { color: theme.textSecondary }]}>
                  in {nextPhaseInfo.hours}h {nextPhaseInfo.minutes}m
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Controls at bottom - always visible */}
      <View style={styles.controlsContainer}>
        <TimerControls
          isActive={isActive}
          startTime={startTime}
          loading={loading}
          isOnline={true}
          targetHours={targetHours}
          recentTemplates={recentTemplates}
          showCelebrations={showCelebrations}
          showStopConfirmation={showStopConfirmation}
          onStartFast={handleStartFast}
          onResumeFast={resumeFast}
          onPauseFast={pauseFast}
          onStopConfirmation={() => setShowStopConfirmation(true)}
          onConfirmStop={stopFast}
          onCancelStop={() => setShowStopConfirmation(false)}
          onShowTemplateSelector={() => setShowTemplateSelector(true)}
          onSelectTemplate={handleSelectTemplate}
          onToggleCelebrations={() => setShowCelebrations(!showCelebrations)}
        />
      </View>

      <WarningModal
        isOpen={showWarningModal}
        onAccept={proceedWithFastStart}
        onCancel={() => setShowWarningModal(false)}
        targetHours={targetHours}
        theme={theme}
      />

      {showTemplateSelector && user && (
        <TemplateSelectorScreen
          userId={user.uid}
          visible={showTemplateSelector}
          selectedDuration={targetHours}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24,
    paddingBottom: 20 
  },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lockIcon: { fontSize: 64, marginBottom: 16 },
  lockText: { fontSize: 16 },
  errorContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  errorText: { fontSize: 14 },
  dismissText: { fontSize: 12, marginTop: 4, textDecorationLine: 'underline' },
  contentContainer: { flex: 1, paddingHorizontal: 24 },
  templateContainer: { marginTop: 20, marginBottom: 20 },
  timerContainer: { alignItems: 'center', justifyContent: 'center', minHeight: 400, marginVertical: 20 },
  phaseContainer: { 
    width: '100%', 
    maxWidth: 500, 
    alignSelf: 'center', 
    gap: 16,
    marginBottom: 20
  },
  nextPhaseContainer: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextPhaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextPhaseTime: {
    fontSize: 12,
  },
  controlsContainer: { 
    paddingHorizontal: 24, 
    paddingBottom: 24, 
    paddingTop: 16,
    backgroundColor: 'transparent'
  },
  startContainer: { gap: 16, width: '100%', maxWidth: 400, alignSelf: 'center' },
  startButton: { padding: 20, borderRadius: 16, alignItems: 'center' },
  startButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  templateButton: { padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2 },
  templateButtonText: { fontSize: 18, fontWeight: '600' },
});

export default TimerScreen;
