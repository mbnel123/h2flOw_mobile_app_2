// src/components/timer/CircularProgress.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface CircularProgressProps {
  progress: number;
  elapsedTime: number;
  targetHours: number;
  theme: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  progress, 
  elapsedTime, 
  targetHours, 
  theme 
}) => {
  const size = 320;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: remainingSeconds.toString().padStart(2, '0')
    };
  };

  const timeDisplay = formatTime(elapsedTime);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7DD3FC" />
            <Stop offset="50%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0EA5E9" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#waterGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* Center content - EXACT match to webapp */}
      <View style={[styles.centerContent, { 
        backgroundColor: theme.background, 
        borderColor: theme.border,
        shadowColor: theme.text,
      }]}>
        <Text style={[styles.mainTime, { color: theme.text }]}>
          {timeDisplay.hours}
          <Text style={[styles.timeUnit, { color: theme.textSecondary }]}>h</Text>
        </Text>
        <Text style={[styles.subTime, { color: theme.text }]}>
          {timeDisplay.minutes}
          <Text style={[styles.timeUnit, { color: theme.textSecondary }]}>m</Text>
          {' '}
          {timeDisplay.seconds}
          <Text style={[styles.timeUnit, { color: theme.textSecondary }]}>s</Text>
        </Text>
        <Text style={[styles.targetText, { color: theme.textSecondary }]}>
          Target: {targetHours} hours
        </Text>
      </View>

      {/* Progress badge - EXACT position like webapp */}
      <View style={[styles.progressBadge, { 
        backgroundColor: theme.background, 
        borderColor: theme.border,
        shadowColor: theme.text,
      }]}>
        <Text style={[styles.progressText, { color: theme.primary }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    // SVG styling if needed
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
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
  mainTime: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 4,
  },
  subTime: {
    fontSize: 20,
    fontWeight: '300',
    marginBottom: 8,
  },
  timeUnit: {
    fontSize: 16,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CircularProgress;
