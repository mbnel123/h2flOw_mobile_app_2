// src/components/WarningModal.tsx - React Native version
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from 'react-native';

interface WarningModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
  targetHours: number;
  theme?: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
  };
}

const WarningModal: React.FC<WarningModalProps> = ({ 
  isOpen, 
  onAccept, 
  onCancel, 
  targetHours,
  theme = {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#3B82F6',
    border: '#E5E7EB'
  }
}) => {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    if (hasAccepted) {
      onAccept();
      setHasAccepted(false); // Reset for next time
    }
  };

  const handleCancel = () => {
    onCancel();
    setHasAccepted(false); // Reset for next time
  };

  const healthWarnings = [
    "TESTConsult your doctor before extended fasting",
    "DO NOT fast if pregnant, breastfeeding, or under 18",
    "Stop immediately if you feel dizzy or unwell",
    "Drink at least 2-3 liters of water daily",
    "Listen to your body and stop if needed",
    "This app does NOT provide medical advice"
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Health & Safety Notice
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleCancel}
                style={[styles.closeButton, { backgroundColor: theme.background === '#111827' ? '#374151' : '#F3F4F6' }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              You're about to start a {targetHours}h fast. Please read these important reminders.
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.warningsContainer}>
              {healthWarnings.map((warning, index) => (
                <View key={index} style={[styles.warningItem, {
                  backgroundColor: theme.background === '#111827' ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7',
                  borderColor: theme.background === '#111827' ? 'rgba(245, 158, 11, 0.3)' : '#F59E0B'
                }]}>
                  <Text style={styles.warningItemIcon}>⚠️</Text>
                  <Text style={[styles.warningText, {
                    color: theme.background === '#111827' ? '#FCD34D' : '#92400E'
                  }]}>
                    {warning}
                  </Text>
                </View>
              ))}
            </View>

            {/* Legal Disclaimer */}
            <View style={[styles.disclaimerContainer, {
              backgroundColor: theme.background === '#111827' ? '#374151' : '#F3F4F6',
              borderColor: theme.border
            }]}>
              <Text style={[styles.disclaimerTitle, { color: theme.text }]}>
                ⚖️ Legal Disclaimer
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                This app is for educational purposes only. We are not liable for any health complications. 
                Fasting is at your own risk and responsibility. Always consult a qualified healthcare 
                professional before starting any fasting regimen.
              </Text>
            </View>

            {/* Acceptance Checkbox */}
            <View style={styles.acceptanceContainer}>
              <View style={styles.acceptanceRow}>
                <Switch
                  value={hasAccepted}
                  onValueChange={setHasAccepted}
                  trackColor={{ 
                    false: theme.background === '#111827' ? '#374151' : '#E5E7EB', 
                    true: theme.primary 
                  }}
                  thumbColor={hasAccepted ? '#FFFFFF' : '#9CA3AF'}
                />
                <View style={styles.acceptanceTextContainer}>
                  <Text style={[styles.acceptanceText, { color: theme.textSecondary }]}>
                    <Text style={[styles.acceptanceBold, { color: theme.text }]}>I understand the risks</Text>
                    {' '}and confirm that I have consulted with a healthcare professional if needed. 
                    I accept full responsibility for my fasting decisions.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.cancelButton, {
                backgroundColor: theme.background === '#111827' ? '#374151' : '#F3F4F6'
              }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAccept}
              disabled={!hasAccepted}
              style={[styles.acceptButton, {
                backgroundColor: hasAccepted ? theme.primary : (theme.background === '#111827' ? '#374151' : '#E5E7EB'),
                opacity: hasAccepted ? 1 : 0.5
              }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.acceptButtonText, {
                color: hasAccepted ? '#FFFFFF' : theme.textSecondary
              }]}>
                ✓ Start Fast
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    borderRadius: 16,
    maxWidth: 450,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  warningsContainer: {
    marginBottom: 24,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  warningItemIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  disclaimerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  acceptanceContainer: {
    marginBottom: 8,
  },
  acceptanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  acceptanceTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginTop: 2,
  },
  acceptanceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  acceptanceBold: {
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WarningModal;
