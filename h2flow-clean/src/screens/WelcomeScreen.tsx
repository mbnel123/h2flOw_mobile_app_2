// src/screens/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const colors = {
  light: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    gradient: ['#EFF6FF', '#DBEAFE', '#EFF6FF']
  },
  dark: {
    primary: '#3B82F6',
    background: '#111827',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    gradient: ['#111827', '#1F2937', '#111827']
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
      <LinearGradient
        colors={theme.gradient}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>💧</Text>
          
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
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.textSecondary + '20' }]}
              onPress={() => setCurrentView('info')}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                Learn About Fasting
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Track your journey • Stay safe • See the science
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
