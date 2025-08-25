// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUp, signIn } from '../firebase/authService';

const colors = {
  light: {
    primary: '#7DD3FC', // Babyblauw
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    danger: '#DC2626',
  },
  dark: {
    primary: '#7DD3FC', // Babyblauw
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    danger: '#DC2626',
  }
};

interface AuthScreenProps {
  setCurrentView: (view: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ setCurrentView }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign in
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          // Succesvol ingelogd - redirect naar main
          console.log('✅ Login successful, redirecting to main app');
          setCurrentView('main');
        }
      } else {
        // Sign up
        const { error } = await signUp(email, password);
        if (error) {
          setError(error);
        } else {
          // Succesvol geregistreerd - redirect naar main
          console.log('✅ Sign up successful, redirecting to main app');
          Alert.alert('Success', 'Account created successfully!');
          setCurrentView('main');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    console.log('Going back to welcome screen');
    setCurrentView('welcome');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.authContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.header}>
              <Ionicons name="water" size={48} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>H2Flow</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </Text>
            </View>

            <View style={styles.toggleContainer}>
              <View style={[styles.toggleBackground, { backgroundColor: theme.background }]}>
                <TouchableOpacity
                  style={[styles.toggleButton, isLogin && [styles.toggleButtonActive, { backgroundColor: theme.primary }]]}
                  onPress={() => setIsLogin(true)}
                >
                  <Ionicons name="log-in" size={16} color={isLogin ? 'white' : theme.textSecondary} />
                  <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !isLogin && [styles.toggleButtonActive, { backgroundColor: theme.primary }]]}
                  onPress={() => setIsLogin(false)}
                >
                  <Ionicons name="person-add" size={16} color={!isLogin ? 'white' : theme.textSecondary} />
                  <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.background, 
                    borderColor: theme.border,
                    color: theme.text 
                  }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.background, 
                    borderColor: theme.border,
                    color: theme.text 
                  }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: `${theme.danger}20` }]}>
                  <Ionicons name="warning" size={16} color={theme.danger} />
                  <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.primary }, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name={isLogin ? "log-in" : "person-add"} size={20} color="white" />
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Login' : 'Create Account'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToWelcome}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={16} color={theme.textSecondary} />
              <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>Back to Welcome</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authContainer: {
    borderRadius: 16,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  toggleContainer: {
    marginBottom: 24,
  },
  toggleBackground: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: 'white',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
  },
});

export default AuthScreen;
