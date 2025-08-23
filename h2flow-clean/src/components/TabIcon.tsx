// src/components/TabIcon.tsx
import React from 'react';
import { Text, useColorScheme } from 'react-native';

// Theme colors
const colors = {
  light: {
    primary: '#3B82F6',
    textSecondary: '#6B7280',
  },
  dark: {
    primary: '#3B82F6',
    textSecondary: '#9CA3AF',
  }
};

interface TabIconProps {
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  
  const icons = {
    Timer: '⏱️',
    Water: '💧', 
    History: '📊',
    Settings: '⚙️'
  };

  return (
    <Text style={{ 
      fontSize: 24, 
      opacity: focused ? 1 : 0.6,
      color: focused ? theme.primary : theme.textSecondary 
    }}>
      {icons[name as keyof typeof icons]}
    </Text>
  );
};

export default TabIcon;
