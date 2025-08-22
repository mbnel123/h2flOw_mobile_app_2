// src/components/SuccessAnimations.tsx - React Native version
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Success Animation Component
interface SuccessAnimationProps {
  type: 'milestone' | 'goal_reached' | 'phase_transition' | 'achievement_unlocked' | 'fast_completed';
  title: string;
  description: string;
  icon?: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  type, 
  title, 
  description, 
  icon, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'milestone':
        return 'rgba(0, 0, 0, 0.7)';
      case 'phase_transition':
        return 'rgba(59, 130, 246, 0.2)';
      case 'goal_reached':
        return 'rgba(16, 185, 129, 0.2)';
      case 'achievement_unlocked':
        return 'rgba(245, 158, 11, 0.2)';
      case 'fast_completed':
        return 'rgba(139, 92, 246, 0.2)';
      default:
        return 'rgba(0, 0, 0, 0.7)';
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'milestone':
        return '🎯';
      case 'phase_transition':
        return '⚡';
      case 'goal_reached':
        return '🏆';
      case 'achievement_unlocked':
        return '🏅';
      case 'fast_completed':
        return '❤️';
      default:
        return '⭐';
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={[styles.overlay, { backgroundColor: getBackgroundColor() }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          onPress={handleClose}
          activeOpacity={1}
        >
          <Animated.View 
            style={[
              styles.card,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }
            ]}
          >
            {/* Floating particles effect */}
            <View style={styles.particlesContainer}>
              {[...Array(8)].map((_, i) => (
                <FloatingParticle key={i} index={i} />
              ))}
            </View>

            {/* Main content */}
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {icon || getDefaultIcon()}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Description */}
              <Text style={styles.description}>{description}</Text>

              {/* Progress bar animation */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <ProgressBar />
                </View>
              </View>

              {/* Action button */}
              <TouchableOpacity
                onPress={handleClose}
                style={styles.button}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Awesome! 🎉</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// Floating Particle Component
const FloatingParticle: React.FC<{ index: number }> = ({ index }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 1000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const delay = setTimeout(animate, index * 300);
    return () => clearTimeout(delay);
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          transform: [{ translateY }],
          opacity,
        }
      ]}
    />
  );
};

// Progress Bar Component
const ProgressBar: React.FC = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.progressFill,
        {
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }
      ]}
    />
  );
};

// MILESTONE TRACKER HOOK (unchanged logic, just removed lucide imports)
export const useMilestoneTracker = () => {
  const [celebrations, setCelebrations] = useState<Array<{
    id: string;
    type: SuccessAnimationProps['type'];
    title: string;
    description: string;
    icon?: string;
  }>>([]);

  const shownMilestonesRef = useRef<Set<number>>(new Set());
  const hasReachedGoalRef = useRef(false);
  const hasShownPersonalRecordRef = useRef(false);
  const hasCompletedFastRef = useRef(false);
  const lastCheckedHourRef = useRef(-1);

  const addCelebration = (celebration: Omit<SuccessAnimationProps, 'onClose'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    console.log('🎉 Adding celebration:', celebration.title);
    setCelebrations(prev => [...prev, { ...celebration, id }]);
  };

  const removeCelebration = (id: string) => {
    console.log('🗑️ Removing celebration:', id);
    setCelebrations(prev => prev.filter(c => c.id !== id));
  };

  const resetTracking = () => {
    console.log('🔄 Resetting milestone tracking');
    shownMilestonesRef.current = new Set();
    hasReachedGoalRef.current = false;
    hasShownPersonalRecordRef.current = false;
    hasCompletedFastRef.current = false;
    lastCheckedHourRef.current = -1;
    setCelebrations([]);
  };

  const checkMilestones = (elapsedHours: number) => {
    const currentHour = Math.floor(elapsedHours);
    
    if (currentHour <= lastCheckedHourRef.current) {
      return;
    }
    
    console.log(`🕐 Checking milestones for hour ${currentHour}`);
    lastCheckedHourRef.current = currentHour;

    const milestones = [
      { hours: 6, title: "Glycogen Depletion!", description: "Your body is now switching to fat for fuel. Great start!", icon: "⚡" },
      { hours: 12, title: "Ketosis Activated!", description: "Fat burning mode is now active. Mental clarity incoming!", icon: "🧠" },
      { hours: 16, title: "Growth Hormone Boost!", description: "Your growth hormone is surging. Recovery mode activated!", icon: "💪" },
      { hours: 18, title: "Deep Ketosis!", description: "You're in the zone! Maximum fat burning and mental focus.", icon: "🎯" },
      { hours: 24, title: "Autophagy Initiated!", description: "Cellular cleanup has begun. Your body is healing itself!", icon: "🔄" },
      { hours: 36, title: "Autophagy Peak!", description: "Maximum cellular renewal. You're a fasting warrior!", icon: "⚔️" },
      { hours: 48, title: "Deep Autophagy!", description: "Advanced cellular repair. Your body is rebuilding itself!", icon: "🛠️" },
      { hours: 72, title: "Immune System Reset!", description: "Complete immune system regeneration. Incredible achievement!", icon: "🛡️" }
    ];

    milestones.forEach(milestone => {
      if (elapsedHours >= milestone.hours && !shownMilestonesRef.current.has(milestone.hours)) {
        console.log(`🎯 Milestone reached: ${milestone.hours}h - ${milestone.title}`);
        shownMilestonesRef.current.add(milestone.hours);
        addCelebration({
          type: 'phase_transition',
          title: milestone.title,
          description: milestone.description,
          icon: milestone.icon
        });
      }
    });
  };

  const checkGoalCompletion = (targetHours: number, elapsedHours: number) => {
    if (elapsedHours >= targetHours && !hasReachedGoalRef.current) {
      console.log(`🏆 Goal reached: ${targetHours}h`);
      hasReachedGoalRef.current = true;
      addCelebration({
        type: 'goal_reached',
        title: "Goal Achieved!",
        description: `Amazing! You've completed your ${targetHours}h fast. Your dedication is inspiring!`,
        icon: "🏆"
      });
    }
  };

  const checkPersonalRecord = (currentDuration: number, previousRecord: number) => {
    if (currentDuration > previousRecord && previousRecord > 0 && !hasShownPersonalRecordRef.current) {
      console.log(`📈 Personal record: ${currentDuration}h > ${previousRecord}h`);
      hasShownPersonalRecordRef.current = true;
      addCelebration({
        type: 'achievement_unlocked',
        title: "New Personal Record!",
        description: `You've beaten your previous record of ${Math.round(previousRecord)}h! You're getting stronger!`,
        icon: "📈"
      });
    }
  };

  const checkFastCompletion = (actualDuration: number, targetDuration: number) => {
    if (hasCompletedFastRef.current) {
      return;
    }
    
    console.log(`🏁 Fast completed: ${actualDuration}h / ${targetDuration}h`);
    hasCompletedFastRef.current = true;
    const completionRate = (actualDuration / targetDuration) * 100;
    
    if (completionRate >= 100) {
      addCelebration({
        type: 'fast_completed',
        title: "Fast Completed!",
        description: `Congratulations! You've successfully completed your ${targetDuration}h fast. Time to break it mindfully!`,
        icon: "🎊"
      });
    } else if (completionRate >= 80) {
      addCelebration({
        type: 'fast_completed',
        title: "Excellent Progress!",
        description: `You completed ${Math.round(completionRate)}% of your goal. That's still a fantastic achievement!`,
        icon: "👏"
      });
    }
  };

  return {
    celebrations,
    addCelebration,
    removeCelebration,
    checkMilestones,
    checkGoalCompletion,
    checkPersonalRecord,
    checkFastCompletion,
    resetTracking
  };
};

// Main component for TimerView integration
export const TimerCelebrations: React.FC<{
  celebrations: Array<{
    id: string;
    type: SuccessAnimationProps['type'];
    title: string;
    description: string;
    icon?: string;
  }>;
  onRemoveCelebration: (id: string) => void;
}> = ({ celebrations, onRemoveCelebration }) => {
  return (
    <>
      {celebrations.map((celebration) => (
        <SuccessAnimation
          key={celebration.id}
          type={celebration.type}
          title={celebration.title}
          description={celebration.description}
          icon={celebration.icon}
          onClose={() => onRemoveCelebration(celebration.id)}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    maxWidth: 350,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimerCelebrations;
