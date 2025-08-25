// src/screens/AuthScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';

interface AuthScreenProps {
  setCurrentView: (view: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ setCurrentView }) => {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login / Signup</Text>
        <Text style={styles.subtitle}>Authentication will be implemented here</Text>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentView('welcome')}
        >
          <Text style={styles.backButtonText}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  backButton: {
    padding: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default AuthScreen;
