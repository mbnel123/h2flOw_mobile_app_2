import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgeVerificationProps {
  setAgeVerified: (verified: boolean) => void;
  setCurrentView: (view: string) => void;
  showOnboarding: boolean;
  setShowPrivacyPolicy: (show: boolean) => void;
  setShowTermsOfService: (show: boolean) => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({
  setAgeVerified,
  setCurrentView,
  showOnboarding,
  setShowPrivacyPolicy,
  setShowTermsOfService
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const handleUnder18 = () => {
    Alert.alert(
      'Age Restriction',
      'H2Flow is only available for adults 18 years and older. Please consult with a healthcare professional about safe nutrition practices for your age.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="warning" size={32} color={theme.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Age Verification Required</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>H2Flow is designed for adults only</Text>

        <View style={[styles.warningBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <Ionicons name="information-circle" size={20} color={theme.text} style={styles.warningIcon} />
          <Text style={[styles.warningText, { color: theme.text }]}>
            <Text style={styles.bold}>Important:</Text> Extended water fasting can be dangerous and is not recommended for anyone under 18 years of age.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              setAgeVerified(true);
              setCurrentView(showOnboarding ? 'onboarding' : 'welcome');
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.primaryButtonText}>I am 18 years or older</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={handleUnder18}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>I am under 18</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={() => setShowPrivacyPolicy(true)}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTermsOfService(true)}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const colors = {
  light: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
  dark: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AgeVerification;
