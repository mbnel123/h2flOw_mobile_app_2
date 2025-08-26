import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(-15)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(-50),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => {
      setIsVisible(true);
      
      // Main card animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();

      // Particle animations
      particleAnims.forEach((anim, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: height + 100,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 2800,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.spring(anim.scale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
              }),
              Animated.timing(anim.scale, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
        }, index * 100);
      });
    }, 100);

    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Exit animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: type === 'milestone' ? 15 : -10,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      onClose();
    });
  };

  const getBackgroundColors = () => {
    switch (type) {
      case 'milestone':
        return ['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.7)'];
      case 'phase_transition':
        return ['rgba(59, 130, 246, 0.3)', 'rgba(147, 51, 234, 0.3)'];
      case 'goal_reached':
        return ['rgba(34, 197, 94, 0.3)', 'rgba(16, 185, 129, 0.3)'];
      case 'achievement_unlocked':
        return ['rgba(245, 158, 11, 0.3)', 'rgba(249, 115, 22, 0.3)'];
      case 'fast_completed':
        return ['rgba(147, 51, 234, 0.3)', 'rgba(236, 72, 153, 0.3)'];
      default:
        return ['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.7)'];
    }
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'milestone':
        return 'target';
      case 'phase_transition':
        return 'flash';
      case 'goal_reached':
        return 'trophy';
      case 'achievement_unlocked':
        return 'ribbon';
      case 'fast_completed':
        return 'heart';
      default:
        return 'star';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'milestone':
        return '#3B82F6';
      case 'phase_transition':
        return '#8B5CF6';
      case 'goal_reached':
        return '#10B981';
      case 'achievement_unlocked':
        return '#F59E0B';
      case 'fast_completed':
        return '#EC4899';
      default:
        return '#3B82F6';
    }
  };

  if (!shouldRender) return null;

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      <TouchableOpacity 
        style={[styles.overlay, { backgroundColor: getBackgroundColors()[0] }]}
        activeOpacity={1}
        onPress={handleClose}
      >
        {/* Floating particles */}
        {particleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: Math.random() * (width - 20),
                backgroundColor: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'][
                  Math.floor(Math.random() * 6)
                ],
                transform: [
                  { translateY: anim.translateY },
                  { scale: anim.scale },
                  { rotate: `${Math.random() * 360}deg` },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Main content */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                { rotateZ: rotateAnim.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                }) },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Icon or Emoji */}
          <View style={styles.iconContainer}>
            {icon ? (
              <Text style={styles.emoji}>{icon}</Text>
            ) : (
              <Ionicons
                name={getIconName()}
                size={48}
                color={getIconColor()}
              />
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: isVisible ? '100%' : '0%',
                },
              ]}
            />
          </View>

          {/* Action button */}
          <TouchableOpacity style={styles.button} onPress={handleClose}>
            <Text style={styles.buttonText}>Awesome! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Milestone Tracker Hook - Adapted for React Native
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
          icon: milestone.icon,
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
        icon: "🏆",
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
        icon: "📈",
      });
    }
  };

  const checkFastCompletion = (actualDuration: number, targetDuration: number) => {
    if (hasCompletedFastRef.current) {
      console.log('🚫 Fast completion already shown');
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
        icon: "🎊",
      });
    } else if (completionRate >= 80) {
      addCelebration({
        type: 'fast_completed',
        title: "Excellent Progress!",
        description: `You completed ${Math.round(completionRate)}% of your goal. That's still a fantastic achievement!`,
        icon: "👏",
      });
    } else if (completionRate >= 50) {
      addCelebration({
        type: 'fast_completed',
        title: "Good Effort!",
        description: `You made it ${Math.round(completionRate)}% of the way. Every fast is progress toward your goals!`,
        icon: "💪",
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
    resetTracking,
  };
};

// Timer Celebrations Component
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
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: width * 0.85,
    maxWidth: 400,
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
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7DD3FC',
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#7DD3FC',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -50,
  },
});
