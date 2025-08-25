// src/screens/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  light: {
    primary: '#7DD3FC', // Babyblauw zoals in TimerScreen
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
  dark: {
    primary: '#7DD3FC', // Babyblauw zoals in TimerScreen
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  }
};

interface WelcomeScreenProps {
  setCurrentView: (view: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setCurrentView }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="water" size={48} color={theme.primary} />
          <Ionicons name="time" size={48} color={theme.primary} style={styles.secondIcon} />
        </View>
        
        <Text style={[styles.title, { color: theme.text }]}>
          H2flOw
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your water fasting companion with science-backed insights
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => setCurrentView('auth')}
          >
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.primary }]}
            onPress={() => setCurrentView('info')}
          >
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
              Learn About Fasting
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="timer" size={20} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>Track your journey</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>Stay safe</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flask" size={20} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>See the science</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  secondIcon: {
    position: 'absolute',
    top: 8,
    left: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    maxWidth: 300,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
  },
});

export default WelcomeScreen;
