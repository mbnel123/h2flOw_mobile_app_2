// src/components/timer/TemplateInfo.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TemplateInfoProps {
  template: {
    icon: string;
    name: string;
    duration: number;
    category: string;
    description?: string;
  };
  onRemove: () => void;
  theme: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const TemplateInfo: React.FC<TemplateInfoProps> = ({ template, onRemove, theme }) => {
  // Create gradient-like background colors
  const backgroundColor = theme.background === '#111827' 
    ? 'rgba(88, 28, 135, 0.2)'  // Dark mode: purple gradient
    : 'rgba(196, 181, 253, 0.3)'; // Light mode: purple gradient

  const borderColor = theme.background === '#111827'
    ? '#7C3AED'  // Dark mode purple border
    : '#A855F7'; // Light mode purple border

  const textColor = theme.background === '#111827'
    ? '#C4B5FD'  // Dark mode purple text
    : '#7C3AED'; // Light mode purple text

  const secondaryTextColor = theme.background === '#111827'
    ? '#A78BFA'  // Dark mode secondary purple
    : '#8B5CF6'; // Light mode secondary purple

  return (
    <View style={[styles.container, { 
      backgroundColor,
      borderColor,
    }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{template.icon}</Text>
          <View style={styles.info}>
            <Text style={[styles.name, { color: textColor }]}>
              {template.name}
            </Text>
            <Text style={[styles.details, { color: secondaryTextColor }]}>
              {template.duration}h • {template.category}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.removeText, { 
            color: theme.background === '#111827' ? '#A78BFA' : '#8B5CF6' 
          }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>
      
      {template.description && (
        <Text style={[styles.description, { 
          color: theme.background === '#111827' ? '#A78BFA' : '#7C3AED' 
        }]}>
          {template.description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 500,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
  },
  removeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
});

export default TemplateInfo;
