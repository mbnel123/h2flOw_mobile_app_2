// src/components/timer/StopConfirmationModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface StopConfirmationModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  elapsedTime: number;
  loading: boolean;
  isOnline: boolean;
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
  };
}

const StopConfirmationModal: React.FC<StopConfirmationModalProps> = ({
  isVisible,
  onCancel,
  onConfirm,
  elapsedTime,
  loading,
  isOnline,
  theme
}) => {
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { 
          backgroundColor: theme.background,
          borderColor: theme.border,
          shadowColor: theme.text,
        }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Stop Your Fast?
          </Text>
          
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Are you sure you want to end your fast? You've been fasting for {formatElapsedTime()}.
          </Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity 
              onPress={onCancel} 
              disabled={loading}
              style={[styles.cancelButton, { 
                backgroundColor: theme.background === '#111827' ? '#374151' : '#F3F4F6',
                opacity: loading ? 0.5 : 1 
              }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelText, { 
                color: theme.text 
              }]}>
                Continue Fasting
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm} 
              disabled={loading || !isOnline}
              style={[styles.confirmButton, { 
                backgroundColor: theme.error,
                opacity: (loading || !isOnline) ? 0.5 : 1 
              }]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>
                {loading ? 'Stopping...' : 'Stop Fast'}
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
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StopConfirmationModal;
