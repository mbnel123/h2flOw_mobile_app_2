// src/components/timer/PhaseInfo.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type PhaseInfoNavigationProp = StackNavigationProp<RootStackParamList, 'Info'>;

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
  const navigation = useNavigation<PhaseInfoNavigationProp>();

  const navigateToInfoScreen = () => {
    navigation.navigate('Info', { 
      scrollToTimeline: true,
      highlightPhase: currentPhase.title 
    });
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background, 
      borderColor: theme.border,
    }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {currentPhase.title}
        </Text>
        
        <TouchableOpacity 
          style={styles.infoLink}
          onPress={navigateToInfoScreen}
        >
          <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
          <Text style={[styles.infoLinkText, { color: theme.primary }]}>
            More about this phase
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
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
