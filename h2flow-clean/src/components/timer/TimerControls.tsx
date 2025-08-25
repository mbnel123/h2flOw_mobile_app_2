import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Play, Pause, Square } from 'lucide-react-native';
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
  showStopConfirmation,
  onStartFast,
  onResumeFast,
  onPauseFast,
  onStopConfirmation,
  onConfirmStop,
  onCancelStop,
  onShowTemplateSelector,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = (screenWidth - 48) * 0.9; // 90% van schermbreedte

  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      {/* Controls */}
      {!isActive ? (
        startTime ? (
          // Timer is paused - show Resume and Stop
          <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
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
          <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
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
        // Timer is active - show Pause and Break Fast
        <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={onPauseFast}
              style={[styles.secondaryBtn, { flex: 1 }]}
            >
              <Pause size={20} color="white" />
              <Text style={styles.btnText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onStopConfirmation}
              style={[styles.successBtn, { flex: 1 }]}
            >
              <Ionicons name="nutrition" size={20} color="white" />
              <Text style={styles.btnText}>Break Fast</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stop confirmation modal */}
      <Modal visible={showStopConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>End your fast?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to stop fasting now?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={onCancelStop} style={styles.secondaryBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirmStop} style={styles.dangerBtn}>
                <Text style={styles.btnText}>Stop Fast</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: '#7DD3FC', // Licht babyblauw
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
  },
  secondaryBtn: {
    backgroundColor: '#7DD3FC', // Licht babyblauw
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
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  btnText: { 
    color: 'white', 
    marginLeft: 8, 
    fontWeight: '600',
    fontSize: 16 
  },
  modalOverlay: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0008'
  },
  modalBox: {
    backgroundColor: 'white', 
    padding: 24, 
    borderRadius: 16, 
    width: '80%'
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#111827' 
  },
  modalText: { 
    color: '#374151', 
    marginBottom: 16 
  },
  modalBtns: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    gap: 12
  }
});

export default TimerControls;
