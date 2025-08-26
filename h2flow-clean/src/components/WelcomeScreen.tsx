// src/screens/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const colors = {
  light: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE']
  },
  dark: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    card: '#1F1F1F',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    gradient: ['#111827', '#1F2937', '#374151']
  }
};

interface WelcomeScreenProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  setShowOnboarding: (show: boolean) => void;
  setCurrentView: (view: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onboardingStep,
  setOnboardingStep,
  setShowOnboarding,
  setCurrentView
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const onboardingSteps = [
    {
      title: "Welcome to H2Flow! 💧",
      description: "Your comprehensive water fasting companion. Track your fasting journey with science-backed insights and achieve your wellness goals.",
      icon: "🌊",
      gradient: ['#E0F2FE', '#BAE6FD', '#7DD3FC']
    },
    {
      title: "Stay Informed & Safe ⚡", 
      description: "Your wellbeing is our priority. Access detailed safety information, learn warning signs, and fast responsibly with our guidance.",
      icon: "🛡️",
      gradient: ['#F0FDF4', '#DCFCE7', '#BBF7D0']
    },
    {
      title: "Track Your Progress 📊",
      description: "Monitor fasting phases, water intake, and build a complete history of your fasting achievements and milestones.",
      icon: "📈",
      gradient: ['#FEF7FF', '#F3E8FF', '#E9D5FF']
    },
    {
      title: "Science-Based Insights 🔬",
      description: "Discover the biology of fasting with peer-reviewed research on autophagy, ketosis, and cellular renewal processes.",
      icon: "🧪",
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A']
    }
  ];

  const currentStep = onboardingSteps[onboardingStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={currentStep.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.appName, { color: theme.text }]}>H2Flow</Text>
            <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
              Water Fasting Companion
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.emoji}>{currentStep.icon}</Text>
            
            <Text style={[styles.title, { color: theme.text }]}>
              {currentStep.title}
            </Text>
            
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {currentStep.description}
            </Text>
            
            <View style={styles.progressContainer}>
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
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {onboardingStep + 1} of {onboardingSteps.length}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: theme.background }]}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                {
                  backgroundColor: onboardingStep === 0 ? 'transparent' : theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: onboardingStep === 0 ? 0.5 : 1
                }
              ]}
              onPress={() => {
                if (onboardingStep > 0) {
                  setOnboardingStep(onboardingStep - 1);
                }
              }}
              disabled={onboardingStep === 0}
            >
              <Ionicons 
                name="arrow-back" 
                size={20} 
                color={onboardingStep === 0 ? theme.textSecondary : theme.text} 
              />
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
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.getStartedButton, { backgroundColor: theme.success }]}
                onPress={() => {
                  setShowOnboarding(false);
                  setCurrentView('welcome');
                }}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  getStartedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
