// src/components/timer/TimerControls.tsx - IMPROVED VERSION
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FastTemplate } from '../../services/templateService';

interface TimerControlsProps {
  isActive: boolean;
  startTime: number | null;
  loading: boolean;
  isOnline: boolean;
  theme: {
    primary: string;
    secondary?: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
    error?: string;
    warning?: string;
    success?: string;
  };
  recentTemplates: FastTemplate[];
  showCelebrations: boolean;
  onStartFast: () => void;
  onResumeFast: () => void;
  onPauseFast: () => void;
  onStopConfirmation: () => void;
  onShowTemplateSelector: () => void;
  onSelectTemplate: (template: FastTemplate) => void;
  onToggleCelebrations: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isActive,
  startTime,
  loading,
  isOnline,
  theme,
  recentTemplates,
  showCelebrations,
  onStartFast,
  onResumeFast,
  onPauseFast,
  onStopConfirmation,
  onShowTemplateSelector,
  onSelectTemplate,
  onToggleCelebrations,
}) => {
  const isPaused = startTime !== null && !isActive;

  return (
    <View style={styles.container}>
      {/* Recent Templates - Only when not active and not paused */}
      {!isActive && !isPaused && recentTemplates.length > 0 && (
        <View style={styles.templatesSection}>
          <Text style={[styles.templatesLabel, { color: theme.textSecondary }]}>
            Recent templates:
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.templatesScroll}
            contentContainerStyle={styles.templatesContent}
          >
            {recentTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => onSelectTemplate(template)}
                style={[styles.templateChip, { 
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border
                }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.templateDuration, { color: theme.text }]}>
                  {template.duration}h
                </Text>
                <Text style={[styles.templateName, { color: theme.textSecondary }]} numberOfLines={1}>
                  {template.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Control Buttons */}
      <View style={styles.mainControls}>
        {isActive ? (
          // Active state - Pause and Stop
          <View style={styles.controlRow}>
            <TouchableOpacity 
              onPress={onPauseFast} 
              disabled={loading || !isOnline}
              style={[styles.actionButton, styles.pauseButton, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="pause-outline" size={28} color="#F59E0B" />
              </View>
              <Text style={[styles.buttonText, { color: '#F59E0B' }]}>Pause</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onStopConfirmation} 
              disabled={loading || !isOnline}
              style={[styles.actionButton, styles.stopButton, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="stop-outline" size={28} color="#22C55E" />
              </View>
              <Text style={[styles.buttonText, { color: '#22C55E' }]}>Break Fast</Text>
            </TouchableOpacity>
          </View>
        ) : isPaused ? (
          // Paused state - Resume and Stop
          <View style={styles.controlRow}>
            <TouchableOpacity 
              onPress={onResumeFast} 
              disabled={loading || !isOnline}
              style={[styles.primaryButtonContainer, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary || theme.primary]}
                style={styles.primaryButton}
              >
                <Ionicons name="play-outline" size={24} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Resume Fast</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onStopConfirmation} 
              disabled={loading || !isOnline}
              style={[styles.actionButton, styles.dangerButton, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="square-outline" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.buttonText, { color: '#EF4444' }]}>Stop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Not started - Start and Templates
          <View style={styles.controlColumn}>
            <TouchableOpacity 
              onPress={onStartFast} 
              disabled={loading || !isOnline}
              style={[styles.primaryButtonContainer, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary || theme.primary]}
                style={styles.primaryButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="play-outline" size={24} color="#FFFFFF" />
                )}
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Starting...' : 'Start Fast'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onShowTemplateSelector} 
              disabled={loading || !isOnline}
              style={[styles.actionButton, styles.secondaryButton, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="library-outline" size={20} color={theme.text} />
              </View>
              <Text style={[styles.buttonText, { color: theme.text }]}>Templates</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Celebrations Toggle - Only when active */}
      {isActive && (
        <View style={styles.celebrationToggle}>
          <TouchableOpacity
            onPress={onToggleCelebrations}
            style={[styles.celebrationButton, { 
              backgroundColor: showCelebrations 
                ? theme.primary + '15' 
                : theme.backgroundSecondary,
              borderColor: showCelebrations 
                ? theme.primary 
                : theme.border
            }]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showCelebrations ? "notifications-outline" : "notifications-off-outline"} 
              size={16} 
              color={showCelebrations ? theme.primary : theme.textSecondary} 
            />
            <Text style={[styles.celebrationText, { 
              color: showCelebrations ? theme.primary : theme.textSecondary 
            }]}>
              Celebrations {showCelebrations ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <Ionicons name="cloud-offline-outline" size={16} color="#F97316" />
          <Text style={styles.offlineText}>
            Some features disabled while offline
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  templatesSection: {
    marginBottom: 4,
  },
  templatesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  templatesScroll: {
    flexDirection: 'row',
  },
  templatesContent: {
    gap: 10,
  },
  templateChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  templateDuration: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateName: {
    fontSize: 11,
    textAlign: 'center',
  },
  mainControls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  controlColumn: {
    gap: 16,
    width: '100%',
  },
  primaryButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7DD3FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
    minHeight: 80,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#E5E7EB',
  },
  pauseButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  stopButton: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  celebrationToggle: {
    alignItems: 'center',
    marginTop: 4,
  },
  celebrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  celebrationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  offlineText: {
    fontSize: 12,
    color: '#F97316',
  },
});

export default TimerControls;