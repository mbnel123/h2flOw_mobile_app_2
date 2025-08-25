import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Square } from 'lucide-react-native';
import { FastTemplate } from '../services/templateService';

interface TimerControlsProps {
  isActive: boolean;
  startTime: number | null;
  loading: boolean;
  isOnline: boolean;
  recentTemplates: FastTemplate[];
  showCelebrations: boolean;
  showStopConfirmation: boolean;
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
  recentTemplates,
  showCelebrations,
  showStopConfirmation,
  onStartFast,
  onResumeFast,
  onPauseFast,
  onStopConfirmation,
  onConfirmStop,
  onCancelStop,
  onShowTemplateSelector,
  onSelectTemplate,
  onToggleCelebrations,
}) => {
  return (
    <View style={{ padding: 16 }}>
      {/* Controls */}
      {!isActive ? (
        startTime ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={onResumeFast}
              disabled={loading || !isOnline}
              style={styles.primaryBtn}
            >
              <Play size={20} color="white" />
              <Text style={styles.btnText}>Resume Fast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onStopConfirmation}
              disabled={loading || !isOnline}
              style={styles.dangerBtn}
            >
              <Square size={18} color="white" />
              <Text style={styles.btnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={onStartFast}
              disabled={loading || !isOnline}
              style={styles.primaryBtn}
            >
              <Play size={20} color="white" />
              <Text style={styles.btnText}>Start Fast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onShowTemplateSelector}
              style={styles.secondaryBtn}
            >
              <Text style={styles.btnText}>📋 Templates</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={onPauseFast}
            style={styles.secondaryBtn}
          >
            <Pause size={18} color="white" />
            <Text style={styles.btnText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onStopConfirmation}
            style={styles.successBtn}
          >
            <Text style={styles.btnText}>🍎 Break Fast</Text>
          </TouchableOpacity>
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
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    margin: 6,
  },
  secondaryBtn: {
    backgroundColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    margin: 6,
  },
  dangerBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    margin: 6,
  },
  successBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    margin: 6,
  },
  btnText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008'
  },
  modalBox: {
    backgroundColor: 'white', padding: 24, borderRadius: 16, width: '80%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#111827' },
  modalText: { color: '#374151', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end' }
});

export default TimerControls;
