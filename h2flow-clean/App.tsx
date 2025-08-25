// App.tsx - AANGEPAST VOOR AGE VERIFICATION
import React, { useState, useEffect } from 'react';
import { useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Firebase auth service
import { onAuthStateChange, User } from './src/firebase/authService';

// Import alle schermen
import TimerScreen from './src/screens/TimerScreen';
import WaterScreen from './src/screens/WaterScreen'; 
import HistoryScreen from './src/screens/HistoryScreen';
import InfoScreen from './src/screens/InfoScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import AgeVerification from './src/screens/AgeVerification'; // NIEUW: Age verification

const Tab = createBottomTabNavigator();

// Theme colors
const colors = {
  light: {
    primary: '#000000',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
  },
  dark: {
    primary: '#FFFFFF',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    tabBar: '#000000',
    tabBarBorder: '#374151',
  }
};

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const [currentView, setCurrentView] = useState('age-verification'); // NIEUW: Start met age verification
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false); // NIEUW: Age verification state
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false); // NIEUW: Privacy policy
  const [showTermsOfService, setShowTermsOfService] = useState(false); // NIEUW: Terms of service
  // NIEUW: State voor auth management
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // NIEUW: Luister naar auth state changes
  useEffect(() => {
    console.log('🔄 App: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChange((currentUser) => {
      console.log('👤 App: Auth state changed:', currentUser ? 'User logged in' : 'User logged out');
      setUser(currentUser);
      setAuthLoading(false);

      // Redirect naar main scherm als gebruiker ingelogd is
      if (currentUser) {
        console.log('✅ App: User authenticated, redirecting to main app');
        setCurrentView('main');
      } else if (currentView === 'main') {
        // Als gebruiker uitlogt terwijl ze in main zijn, ga terug naar welcome
        console.log('🚪 App: User logged out, going back to welcome');
        setCurrentView('welcome');
      }
    });

    // Cleanup functie
    return () => {
      console.log('🧹 App: Cleaning up auth listener');
      unsubscribe();
    };
  }, [currentView]);

  // Render het juiste scherm gebaseerd op currentView
  const renderCurrentView = () => {
    // Toon loading indicator tijdens auth check
    if (authLoading && (currentView === 'auth' || currentView === 'main' || currentView === 'welcome')) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.text }}>Checking authentication...</Text>
        </View>
      );
    }

    switch (currentView) {
      case 'age-verification': // NIEUW: Age verification screen
        return (
          <AgeVerification
            setAgeVerified={setAgeVerified}
            setCurrentView={setCurrentView}
            showOnboarding={showOnboarding}
            setShowPrivacyPolicy={setShowPrivacyPolicy}
            setShowTermsOfService={setShowTermsOfService}
          />
        );
      case 'welcome':
        return <WelcomeScreen setCurrentView={setCurrentView} />;
      case 'onboarding':
        return (
          <OnboardingScreen
            onboardingStep={onboardingStep}
            setOnboardingStep={setOnboardingStep}
            setShowOnboarding={setShowOnboarding}
            setCurrentView={setCurrentView}
          />
        );
      case 'auth':
        return <AuthScreen setCurrentView={setCurrentView} />;
      case 'main':
        return (
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, size }) => {
                  let iconName: keyof typeof Ionicons.glyphMap;

                  switch (route.name) {
                    case 'Timer':
                      iconName = focused ? 'time' : 'time-outline';
                      break;
                    case 'Water':
                      iconName = focused ? 'water' : 'water-outline';
                      break;
                    case 'Info':
                      iconName = focused ? 'information-circle' : 'information-circle-outline';
                      break;
                    case 'History':
                      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                      break;
                    default:
                      iconName = 'help-outline';
                  }

                  return (
                    <Ionicons
                      name={iconName}
                      size={size}
                      color={focused ? theme.primary : theme.textSecondary}
                    />
                  );
                },
                tabBarStyle: {
                  backgroundColor: theme.tabBar,
                  borderTopColor: theme.tabBarBorder,
                  borderTopWidth: 1,
                  paddingBottom: 12,
                  paddingTop: 12,
                  height: 90,
                  elevation: 0,
                  shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: '500',
                  marginTop: 4,
                },
                tabBarActiveTintColor={theme.primary},
                tabBarInactiveTintColor={theme.textSecondary},
                tabBarItemStyle: {
                  paddingVertical: 4,
                },
              })}
            >
              <Tab.Screen name="Timer" component={TimerScreen} />
              <Tab.Screen name="Water" component={WaterScreen} />
              <Tab.Screen name="Info" component={InfoScreen} />
              <Tab.Screen name="History" component={HistoryScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        );
      default:
        return <WelcomeScreen setCurrentView={setCurrentView} />;
    }
  };

  return renderCurrentView();
}
