// src/components/ExtendedFastWarningModal.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExtendedFastWarningModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
  elapsedHours: number;
  theme?: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    error: string;
  };
}

const ExtendedFastWarningModal: React.FC<ExtendedFastWarningModalProps> = ({ 
  isOpen, 
  onAccept, 
  onCancel, 
  elapsedHours,
  theme = {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#3B82F6',
    border: '#E5E7EB',
    error: '#EF4444'
  }
}) => {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    if (hasAccepted) {
      onAccept();
      setHasAccepted(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    setHasAccepted(false);
  };

  const warnings = [
    "Extended fasting beyond 72 hours requires medical supervision",
    "Risk of electrolyte imbalance and nutrient deficiencies increases significantly",
    "Potential for muscle loss and weakened immune system",
    "May cause dizziness, fatigue, and cognitive impairment",
    "Not recommended for individuals with medical conditions"
  ];

  const recommendations = [
    "Consult with a healthcare professional immediately",
    "Consider breaking your fast and refeeding properly",
    "Ensure adequate electrolyte supplementation if continuing",
    "Monitor vital signs regularly",
    "Have someone check on you regularly"
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
                <Text style={[styles.headerTitle, { color: theme.error }]}>
                  Extended Fast Warning
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
              Your fast has reached {elapsedHours.toFixed(1)} hours
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Warnings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.error }]}>
                ⚠️ Critical Warnings
              </Text>
              {warnings.map((warning, index) => (
                <View key={index} style={[styles.listItem, {
                  backgroundColor: theme.background === '#111827' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                  borderColor: theme.background === '#111827' ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'
                }]}>
                  <Text style={[styles.listIcon, { color: theme.error }]}>•</Text>
                  <Text style={[styles.listText, { color: theme.error }]}>
                    {warning}
                  </Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                💡 Recommendations
              </Text>
              {recommendations.map((recommendation, index) => (
                <View key={index} style={[styles.listItem, {
                  backgroundColor: theme.background === '#111827' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                  borderColor: theme.background === '#111827' ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'
                }]}>
                  <Text style={[styles.listIcon, { color: theme.primary }]}>•</Text>
                  <Text style={[styles.listText, { color: theme.primary }]}>
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>

            {/* Acceptance */}
            <View style={styles.acceptanceContainer}>
              <View style={styles.acceptanceRow}>
                <Switch
                  value={hasAccepted}
                  onValueChange={setHasAccepted}
                  trackColor={{ 
                    false: theme.background === '#111827' ? '#374151' : '#E5E7EB', 
                    true: '#DC2626' 
                  }}
                  thumbColor={hasAccepted ? '#FFFFFF' : '#9CA3AF'}
                />
                <View style={styles.acceptanceTextContainer}>
                  <Text style={[styles.acceptanceText, { color: theme.textSecondary }]}>
                    <Text style={[styles.acceptanceBold, { color: theme.text }]}>
                      I understand the risks
                    </Text>
                    {' '}and accept full responsibility for continuing this extended fast
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.safeButton, {
                backgroundColor: theme.background === '#111827' ? '#374151' : '#F3F4F6'
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={20} color={theme.text} />
              <Text style={[styles.safeButtonText, { color: theme.text }]}>
                Break Fast Safely
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAccept}
              disabled={!hasAccepted}
              style={[styles.continueButton, {
                backgroundColor: hasAccepted ? '#DC2626' : (theme.background === '#111827' ? '#374151' : '#E5E7EB'),
                opacity: hasAccepted ? 1 : 0.5
              }]}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="warning-outline" 
                size={20} 
                color={hasAccepted ? '#FFFFFF' : theme.textSecondary} 
              />
              <Text style={[styles.continueButtonText, {
                color: hasAccepted ? '#FFFFFF' : theme.textSecondary
              }]}>
                Continue at Own Risk
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  listIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  listText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
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
  safeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  safeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ExtendedFastWarningModal;
