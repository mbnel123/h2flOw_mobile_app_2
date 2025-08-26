// App.tsx - AANGEPAST VOOR STACK NAVIGATION
import React, { useState, useEffect } from 'react';
import { useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
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
import AgeVerification from './src/screens/AgeVerification';
import SettingsScreen from './src/screens/SettingsScreen';

// Import ThemeProvider
import { ThemeProvider } from './src/contexts/ThemeContext';
import { TabParamList, RootStackParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Theme colors
const colors = {
  light: {
    primary: '#7DD3FC',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
  },
  dark: {
    primary: '#7DD3FC',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    tabBar: '#000000',
    tabBarBorder: '#374151',
  }
};

// Tab Navigator component
function TabNavigator() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  return (
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
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
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
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Water" component={WaterScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator component
function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen name="Info" component={InfoScreen} />
    </Stack.Navigator>
  );
}

function MainApp() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const [currentView, setCurrentView] = useState('age-verification');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 App: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChange((currentUser) => {
      console.log('👤 App: Auth state changed:', currentUser ? 'User logged in' : 'User logged out');
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        console.log('✅ App: User authenticated, redirecting to main app');
        setCurrentView('main');
      } else if (currentView === 'main') {
        console.log('🚪 App: User logged out, going back to welcome');
        setCurrentView('welcome');
      }
    });

    return () => {
      console.log('🧹 App: Cleaning up auth listener');
      unsubscribe();
    };
  }, [currentView]);

  const renderCurrentView = () => {
    if (authLoading && (currentView === 'auth' || currentView === 'main' || currentView === 'welcome')) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.text }}>Checking authentication...</Text>
        </View>
      );
    }

    switch (currentView) {
      case 'age-verification':
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
            <StackNavigator />
          </NavigationContainer>
        );
      default:
        return <WelcomeScreen setCurrentView={setCurrentView} />;
    }
  };

  return renderCurrentView();
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
