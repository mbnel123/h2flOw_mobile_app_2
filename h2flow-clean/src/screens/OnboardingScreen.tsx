// src/screens/OnboardingScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface OnboardingProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  setShowOnboarding: (show: boolean) => void;
  setCurrentView: (view: string) => void;
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({
  onboardingStep,
  setOnboardingStep,
  setShowOnboarding,
  setCurrentView,
  onComplete
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const colors = {
    primary: '#7DD3FC',
    background: isDark ? '#000000' : '#FFFFFF',
    backgroundSecondary: isDark ? '#1F1F1F' : '#F8F9FA',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    gradient: isDark ? ['#111827', '#1F2937', '#111827'] as const : ['#F9FAFB', '#F3F4F6', '#F9FAFB'] as const,
  };

  const onboardingSteps = [
    {
      title: "Welcome to H2flOw! 💧",
      description: "Your comprehensive water fasting companion. Track your fasting journey with science-backed insights.",
      icon: "water"
    },
    {
      title: "Stay informed and safe", 
      description: "Fasting involves certain risks. Listen to your body, stay hydrated, and be aware of warning signs. Your wellbeing comes first.",
      icon: "warning"
    },
    {
      title: "Track your progress",
      description: "Monitor your fasting phases, water intake, and build a history of your fasting journey.",
      icon: "bar-chart"
    },
    {
      title: "Science-based insights",
      description: "Learn about autophagy, ketosis, and the biological benefits of fasting with peer-reviewed research.",
      icon: "flask"
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradient}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons 
              name={onboardingSteps[onboardingStep].icon as any} 
              size={48} 
              color={colors.primary} 
            />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            {onboardingSteps[onboardingStep].title}
          </Text>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {onboardingSteps[onboardingStep].description}
          </Text>
          
          <View style={styles.progressDots}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === onboardingStep ? colors.primary : colors.textSecondary + '40'
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
                backgroundColor: onboardingStep === 0 ? colors.textSecondary + '20' : colors.textSecondary + '40',
                borderColor: colors.border
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
              { color: onboardingStep === 0 ? colors.textSecondary : colors.text }
            ]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          {onboardingStep < onboardingSteps.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={() => setOnboardingStep(onboardingStep + 1)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={onComplete}
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
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
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
    borderWidth: 1,
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
