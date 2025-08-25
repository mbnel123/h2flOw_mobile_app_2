// App.tsx - AANGEPAST VOOR ALLE SCHERMEN
import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import alle schermen
import TimerScreen from './src/screens/TimerScreen';
import WaterScreen from './src/screens/WaterScreen'; 
import HistoryScreen from './src/screens/HistoryScreen';
import InfoScreen from './src/screens/InfoScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen'; // Moet je nog maken

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
  const [currentView, setCurrentView] = useState('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Render het juiste scherm gebaseerd op currentView
  const renderCurrentView = () => {
    switch (currentView) {
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
                    case 'History':
                      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                      break;
                    case 'Info':
                      iconName = focused ? 'information-circle' : 'information-circle-outline';
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
              <Tab.Screen name="History" component={HistoryScreen} />
              <Tab.Screen name="Info" component={InfoScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        );
      default:
        return <WelcomeScreen setCurrentView={setCurrentView} />;
    }
  };

  return renderCurrentView();
}
