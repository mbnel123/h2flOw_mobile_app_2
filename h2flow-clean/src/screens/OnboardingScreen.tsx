// src/screens/OnboardingScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
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

interface OnboardingProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  setShowOnboarding: (show: boolean) => void;
  setCurrentView: (view: string) => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({
  onboardingStep,
  setOnboardingStep,
  setShowOnboarding,
  setCurrentView
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const onboardingSteps = [
    {
      title: "TEST - Welcome to H2flOw! 💧",
      description: "Your comprehensive water fasting companion. Track your fasting journey with science-backed insights.",
      icon: "🌊"
    },
    {
      title: "Stay informed and safe ⚠️", 
      description: "Fasting involves certain risks. Listen to your body, stay hydrated, and be aware of warning signs. Detailed safety information is available in the app. Your wellbeing comes first.",
      icon: "🏥"
    },
    {
      title: "Track your progress 📈",
      description: "Monitor your fasting phases, water intake, and build a history of your fasting journey.",
      icon: "📊"
    },
    {
      title: "Science-based insights 🔬",
      description: "Learn about autophagy, ketosis, and the biological benefits of fasting with peer-reviewed research.",
      icon: "🧬"
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>{onboardingSteps[onboardingStep].icon}</Text>
          
          <Text style={[styles.title, { color: theme.text }]}>
            {onboardingSteps[onboardingStep].title}
          </Text>
          
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {onboardingSteps[onboardingStep].description}
          </Text>
          
          <View style={styles.progressDots}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === onboardingStep ? theme.primary : theme.textSecondary + '40'
                  }
                ]}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                backgroundColor: onboardingStep === 0 ? theme.textSecondary + '20' : theme.textSecondary + '40'
              }
            ]}
            onPress={() => {
              if (onboardingStep > 0) {
                setOnboardingStep(onboardingStep - 1);
              }
            }}
            disabled={onboardingStep === 0}
          >
            <Text style={[
              styles.navButtonText,
              { color: onboardingStep === 0 ? theme.textSecondary : theme.text }
            ]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          {onboardingStep < onboardingSteps.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.primary }]}
              onPress={() => setOnboardingStep(onboardingStep + 1)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: '#10B981' }]}
              onPress={() => {
                setShowOnboarding(false);
                setCurrentView('welcome');
              }}
            >
              <Text style={styles.nextButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
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
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    gap: 16,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
