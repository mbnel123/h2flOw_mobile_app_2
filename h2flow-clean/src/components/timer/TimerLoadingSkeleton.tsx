// src/components/timer/TimerLoadingSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TimerLoadingSkeletonProps {
  theme: {
    gradient: string[];
    background: string;
    backgroundSecondary: string;
    border: string;
    text: string;
  };
}

const SkeletonItem: React.FC<{ width: number; height: number; style?: any; theme: any }> = ({ 
  width, 
  height, 
  style, 
  theme 
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.border,
          borderRadius: 8,
          opacity,
        },
        style,
      ]}
    />
  );
};

const TimerLoadingSkeleton: React.FC<TimerLoadingSkeletonProps> = ({ theme }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.header, { 
        backgroundColor: theme.background,
        borderBottomColor: theme.border 
      }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SkeletonItem width={48} height={48} style={styles.appIcon} theme={theme} />
            <View>
              <SkeletonItem width={80} height={24} style={styles.titleSkeleton} theme={theme} />
              <SkeletonItem width={120} height={16} style={styles.subtitleSkeleton} theme={theme} />
            </View>
          </View>
          <View style={styles.headerRight}>
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonItem key={i} width={40} height={40} style={styles.headerButton} theme={theme} />
            ))}
          </View>
        </View>
        
        {/* Connection status skeleton */}
        <View style={styles.statusRow}>
          <View style={styles.connectionStatus}>
            <SkeletonItem width={16} height={16} theme={theme} />
            <SkeletonItem width={48} height={12} theme={theme} />
          </View>
        </View>
        
        {/* Progress bar skeleton */}
        <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
          <SkeletonItem width={120} height={2} theme={theme} />
        </View>
      </View>

      {/* Main Timer Area Skeleton */}
      <View style={styles.mainContent}>
        {/* Circular progress skeleton */}
        <View style={styles.circularContainer}>
          <SkeletonItem width={320} height={320} style={styles.circularProgress} theme={theme} />
          
          {/* Center content skeleton */}
          <View style={[styles.centerContent, { 
            backgroundColor: theme.background,
            borderColor: theme.border 
          }]}>
            <SkeletonItem width={96} height={48} style={styles.mainTimeSkeleton} theme={theme} />
            <SkeletonItem width={128} height={32} style={styles.subTimeSkeleton} theme={theme} />
            <SkeletonItem width={80} height={16} style={styles.targetSkeleton} theme={theme} />
          </View>
          
          {/* Progress indicator skeleton */}
          <View style={[styles.progressBadge, { 
            backgroundColor: theme.background,
            borderColor: theme.border 
          }]}>
            <SkeletonItem width={32} height={16} theme={theme} />
          </View>
        </View>

        {/* Phase info skeleton */}
        <View style={styles.phaseSection}>
          <View style={[styles.phaseCard, { 
            backgroundColor: theme.background,
            borderColor: theme.border 
          }]}>
            <SkeletonItem width={128} height={24} style={styles.phaseTitleSkeleton} theme={theme} />
            <SkeletonItem width={192} height={16} style={styles.phaseDescSkeleton} theme={theme} />
            
            <View style={styles.phaseStats}>
              <View style={styles.statItem}>
                <SkeletonItem width={48} height={24} style={styles.statValueSkeleton} theme={theme} />
                <SkeletonItem width={64} height={12} style={styles.statLabelSkeleton} theme={theme} />
              </View>
              <View style={styles.statItem}>
                <SkeletonItem width={32} height={24} style={styles.statValueSkeleton} theme={theme} />
                <SkeletonItem width={48} height={12} style={styles.statLabelSkeleton} theme={theme} />
              </View>
            </View>
          </View>

          {/* Next phase skeleton */}
          <View style={[styles.nextPhaseCard, { 
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border 
          }]}>
            <SkeletonItem width={160} height={20} style={styles.nextPhaseTitleSkeleton} theme={theme} />
            <SkeletonItem width={128} height={24} style={styles.nextPhaseTimeSkeleton} theme={theme} />
            <SkeletonItem width={224} height={16} style={styles.nextPhaseDescSkeleton} theme={theme} />
          </View>
        </View>
      </View>

      {/* Control Buttons Skeleton */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <SkeletonItem width={192} height={56} style={styles.controlButtonSkeleton} theme={theme} />
          <SkeletonItem width={128} height={56} style={styles.controlButtonSkeleton} theme={theme} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    borderRadius: 16,
    marginRight: 16,
  },
  titleSkeleton: {
    marginBottom: 4,
  },
  subtitleSkeleton: {
    // No additional styles needed
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  circularProgress: {
    borderRadius: 160,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  mainTimeSkeleton: {
    marginBottom: 8,
  },
  subTimeSkeleton: {
    marginBottom: 8,
  },
  targetSkeleton: {
    // No additional styles needed
  },
  progressBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  phaseSection: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  phaseCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  phaseTitleSkeleton: {
    marginBottom: 12,
  },
  phaseDescSkeleton: {
    marginBottom: 16,
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValueSkeleton: {
    marginBottom: 4,
  },
  statLabelSkeleton: {
    // No additional styles needed
  },
  nextPhaseCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  nextPhaseTitleSkeleton: {
    marginBottom: 12,
  },
  nextPhaseTimeSkeleton: {
    marginBottom: 12,
  },
  nextPhaseDescSkeleton: {
    // No additional styles needed
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlButtonSkeleton: {
    borderRadius: 16,
  },
});

export default TimerLoadingSkeleton;
