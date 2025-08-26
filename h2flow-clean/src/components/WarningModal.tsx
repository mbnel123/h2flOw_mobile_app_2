// src/components/WarningModal.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WarningModalProps {
  setHasAcceptedRisks: (accepted: boolean) => void;
  setCurrentView: (view: string) => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  setHasAcceptedRisks,
  setCurrentView
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    card: isDark ? '#1F1F1F' : '#FFFFFF',
    border: isDark ? '#374151' : '#E5E7EB',
    primary: '#7DD3FC',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    orange: {
      50: isDark ? '#7C2D12' : '#FFF7ED',
      100: isDark ? '#9A3412' : '#FFEDD5',
      500: '#F59E0B',
      600: '#D97706',
    },
    red: {
      50: isDark ? '#7F1D1D' : '#FEF2F2',
      100: isDark ? '#991B1B' : '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.orange[50] }]}>
            <Ionicons name="warning" size={32} color={theme.orange[500]} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Medical Safety Confirmation</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Before starting your fast</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.warningCard, { backgroundColor: theme.orange[50], borderColor: theme.orange[100] }]}>
            <Text style={[styles.warningTitle, { color: theme.orange[600] }]}>
              Please confirm that you:
            </Text>
            <View style={styles.list}>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.listText, { color: theme.orange[600] }]}>
                  Have consulted with a healthcare professional if you have any medical conditions
                </Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.listText, { color: theme.orange[600] }]}>
                  Are not pregnant, breastfeeding, or under 18 years of age
                </Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.listText, { color: theme.orange[600] }]}>
                  Have read and understand the risks of water fasting
                </Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.listText, { color: theme.orange[600] }]}>
                  Will stop immediately if you experience any concerning symptoms
                </Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.listText, { color: theme.orange[600] }]}>
                  Have adequate water and electrolytes available
                </Text>
              </View>
            </View>
          </View>

          {/* Legal Disclaimer */}
          <View style={[styles.disclaimerCard, { backgroundColor: theme.red[50], borderColor: theme.red[100] }]}>
            <Text style={[styles.disclaimerTitle, { color: theme.red[600] }]}>⚖️ LEGAL DISCLAIMER</Text>
            <Text style={[styles.disclaimerText, { color: theme.red[600] }]}>
              <Text style={styles.bold}>By clicking "I Agree" you acknowledge that:</Text>{'\n'}
              • You are solely responsible for any health consequences that may result from this fast{'\n'}
              • H2Flow and its creators are NOT liable for any health complications, injuries, or damages{'\n'}
              • This app is for educational purposes only and does NOT provide medical advice{'\n'}
              • Fasting is undertaken at your own risk
            </Text>
          </View>
        </View>
        
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.agreeButton, { backgroundColor: theme.success }]}
            onPress={() => {
              setHasAcceptedRisks(true);
              setCurrentView('timer');
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.agreeButtonText}>I Agree & Accept Full Responsibility - Start Fast</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setCurrentView('welcome')}
          >
            <Text style={[styles.backButtonText, { color: theme.text }]}>Back to start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  },
  content: {
    gap: 16,
    marginBottom: 32,
  },
  warningCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  disclaimerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttons: {
    gap: 12,
  },
  agreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WarningModal;
