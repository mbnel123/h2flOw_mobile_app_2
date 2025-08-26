// src/components/timer/PhaseInfo.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface PhaseInfoProps {
  currentPhase: {
    title: string;
    description: string;
  };
  dailyWaterIntake: number;
  elapsedTime: number;
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
  };
}

const PhaseInfo: React.FC<PhaseInfoProps> = ({ 
  currentPhase, 
  dailyWaterIntake, 
  elapsedTime, 
  theme 
}) => {
  const navigation = useNavigation();

  const handleLearnMore = () => {
    // Navigeer naar het InfoScreen
    navigation.navigate('Info' as never);
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background, 
      borderColor: theme.border,
      shadowColor: theme.text,
    }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {currentPhase.title}
        </Text>
        
        <TouchableOpacity 
          onPress={handleLearnMore}
          style={styles.learnMoreButton}
        >
          <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
          <Text style={[styles.learnMoreText, { color: theme.primary }]}>
            Learn more
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {currentPhase.description}
      </Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {Math.round(dailyWaterIntake)}ml
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Water today
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {Math.floor(elapsedTime / 3600)}h
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Elapsed
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  learnMoreText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 20,
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default PhaseInfo;
