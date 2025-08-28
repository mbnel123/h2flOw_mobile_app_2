// src/components/timer/TimerControls.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { FastTemplate } from '../services/templateService';

interface TimerControlsProps {
  isActive: boolean;
  startTime: number | null;
  loading: boolean;
  isOnline: boolean;
  recentTemplates: FastTemplate[];
  showCelebrations: boolean;
  showStopConfirmation: boolean;
  targetHours: number;
  onStartFast: () => void;
  onResumeFast: () => void;
  onPauseFast: () => void;
  onStopConfirmation: () => void;
  onConfirmStop: () => void;
  onCancelStop: () => void;
  onShowTemplateSelector: () => void;
  onSelectTemplate: (template: FastTemplate) => void;
  onToggleCelebrations: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isActive,
  startTime,
  loading,
  isOnline,
  targetHours,
  showCelebrations,
  showStopConfirmation,
  onStartFast,
  onResumeFast,
  onStopConfirmation,
  onConfirmStop,
  onCancelStop,
  onShowTemplateSelector,
  onToggleCelebrations,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = (screenWidth - 48) * 0.9;

  return (
    <View style={styles.container}>
      {/* Celebrations Toggle - Only show when active */}
      {isActive && (
        <View style={styles.settingsRow}>
          <TouchableOpacity
            onPress={onToggleCelebrations}
            style={[styles.toggleButton, showCelebrations && styles.toggleButtonActive]}
          >
            <Ionicons 
              name={showCelebrations ? "notifications" : "notifications-off"} 
              size={20} 
              color={showCelebrations ? "#7DD3FC" : "#6B7280"} 
            />
            <Text style={[
              styles.toggleText, 
              { color: showCelebrations ? "#7DD3FC" : "#6B7280" }
            ]}>
              Celebrations {showCelebrations ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Controls */}
      {!isActive ? (
        startTime ? (
          // Timer is paused - show Resume and Stop
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onResumeFast}
              disabled={loading || !isOnline}
              style={[styles.primaryBtn, { width: buttonWidth }]}
            >
              <Play size={24} color="white" />
              <Text style={styles.btnText}>Resume {targetHours}h Fast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onStopConfirmation}
              disabled={loading || !isOnline}
              style={[styles.dangerBtn, { width: buttonWidth }]}
            >
              <Square size={20} color="white" />
              <Text style={styles.btnText}>Stop Fast</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // No timer running - show Start and Templates
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onStartFast}
              disabled={loading || !isOnline}
              style={[styles.primaryBtn, { width: buttonWidth }]}
            >
              <Play size={24} color="white" />
              <Text style={styles.btnText}>Start {targetHours}h Fast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onShowTemplateSelector}
              style={[styles.secondaryBtn, { width: buttonWidth }]}
            >
              <Ionicons name="list" size={20} color="white" />
              <Text style={styles.btnText}>Templates</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        // Timer is active - show only Break Fast button
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onStopConfirmation}
            style={[styles.successBtn, { width: buttonWidth }]}
          >
            <Ionicons name="nutrition-outline" size={20} color="white" />
            <Text style={styles.btnText}>Break Fast</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stop confirmation modal */}
      <Modal visible={showStopConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>End your fast?</Text>
            <Text style={styles.modalText}>
              {isActive 
                ? "Are you sure you want to break your fast now? This will end your current fasting session."
                : "Are you sure you want to stop fasting now?"
              }
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={onCancelStop} style={styles.modalCancelBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirmStop} style={styles.modalConfirmBtn}>
                <Text style={styles.btnText}>{isActive ? "Break Fast" : "Stop Fast"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  settingsRow: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  toggleButtonActive: {
    backgroundColor: '#EBF8FF',
    borderColor: '#7DD3FC',
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: '#7DD3FC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
  },
  secondaryBtn: {
    backgroundColor: '#7DD3FC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  dangerBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
  },
  successBtn: {
    backgroundColor: '#34D399',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
  },
  btnText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center',
  },
  modalText: {
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalCancelBtn: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  modalConfirmBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
});

export default TimerControls;
