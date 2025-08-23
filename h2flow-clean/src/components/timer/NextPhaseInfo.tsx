// src/components/timer/NextPhaseInfo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NextPhaseInfoProps {
  nextPhase: {
    hours: number;
    minutes: number;
    nextPhase: {
      title: string;
      description: string;
    };
  };
  theme: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const NextPhaseInfo: React.FC<NextPhaseInfoProps> = ({ nextPhase, theme }) => {
  // Create background color with opacity for the gradient effect
  const backgroundColor = theme.primary === '#3B82F6' 
    ? (theme.background === '#111827' 
        ? 'rgba(14, 165, 233, 0.1)'  // Dark mode
        : 'rgba(14, 165, 233, 0.05)') // Light mode
    : theme.primary + '20';

  const borderColor = theme.primary === '#3B82F6'
    ? (theme.background === '#111827'
        ? 'rgba(14, 165, 233, 0.3)'  // Dark mode
        : 'rgba(14, 165, 233, 0.2)') // Light mode
    : theme.primary + '40';

  return (
    <View style={[styles.container, { 
      backgroundColor,
      borderColor
    }]}>
      <Text style={[styles.label, { color: theme.primary }]}>
        Next: {nextPhase.nextPhase.title}
      </Text>
      
      <Text style={[styles.timeRemaining, { color: theme.primary }]}>
        {nextPhase.hours > 0 && `${nextPhase.hours}h `}
        {nextPhase.minutes}m remaining
      </Text>
      
      <Text style={[styles.timeLabel, { color: theme.primary }]}>
        until next phase
      </Text>
      
      <Text style={[styles.description, { color: theme.primary }]}>
        {nextPhase.nextPhase.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NextPhaseInfo;
