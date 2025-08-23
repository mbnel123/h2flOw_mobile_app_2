// src/components/timer/TimerControls.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock icons - replace with actual icon library when available
const PlayIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>▶️</Text>;
const PauseIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>⏸️</Text>;
const SquareIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>⏹️</Text>;

interface FastTemplate {
  id: string;
  name: string;
  duration: number;
  icon: string;
  category: string;
  description?: string;
}

interface TimerControlsProps {
  isActive: boolean;
  startTime: number | null;
  loading: boolean;
  isOnline: boolean;
  theme: {
    primary: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    warning: string;
    error: string;
    success: string;
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
  onToggleCelebrations
}) => {
  return (
    <View style={styles.container}>
      {/* Quick Template Access */}
      {!isActive && recentTemplates.length > 0 && (
        <View style={styles.templatesSection}>
          <Text style={[styles.templatesLabel, { color: theme.textSecondary }]}>
            Recent templates:
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.templatesScroll}
          >
            {recentTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => onSelectTemplate(template)}
                style={[styles.templateButton, { 
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.primary + '30'
                }]}
                activeOpacity={0.7}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <Text style={[styles.templateName, { color: theme.text }]}>
                  {template.name}
                </Text>
                <Text style={[styles.templateDuration, { color: theme.textSecondary }]}>
                  {template.duration}h
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Control Buttons */}
      <View style={styles.mainControls}>
        {!isActive ? (
          startTime ? (
            // Paused state - show Resume and Stop
            <View style={styles.controlRow}>
              <TouchableOpacity 
                onPress={onResumeFast} 
                disabled={loading || !isOnline}
                activeOpacity={0.8}
                style={[styles.resumeButtonContainer, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  style={styles.resumeButton}
                >
                  <PlayIcon color="white" />
                  <Text style={styles.resumeButtonText}>Resume Fast</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onStopConfirmation} 
                disabled={loading || !isOnline}
                style={[styles.stopButton, { 
                  backgroundColor: theme.error,
                  opacity: (loading || !isOnline) ? 0.5 : 1 
                }]}
                activeOpacity={0.8}
              >
                <SquareIcon color="white" />
                <Text style={styles.stopButtonText}>Stop Fast</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Not started - show Start and Templates
            <View style={styles.controlRow}>
              <TouchableOpacity 
                onPress={onStartFast} 
                disabled={loading || !isOnline}
                activeOpacity={0.8}
                style={[styles.startButtonContainer, { opacity: (loading || !isOnline) ? 0.5 : 1 }]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  style={styles.startButton}
                >
                  <PlayIcon color="white" />
                  <Text style={styles.startButtonText}>
                    {loading ? 'Starting...' : 'Start Fast'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onShowTemplateSelector} 
                disabled={loading || !isOnline}
                style={[styles.templatesButton, { 
                  backgroundColor: '#8B5CF6',
                  opacity: (loading || !isOnline) ? 0.5 : 1 
                }]}
                activeOpacity={0.8}
              >
                <Text style={styles.templatesButtonIcon}>📋</Text>
                <Text style={styles.templatesButtonText}>Templates</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          // Active state - show Pause and Break Fast
          <View style={styles.controlRow}>
            <TouchableOpacity 
              onPress={onPauseFast} 
              disabled={loading || !isOnline}
              style={[styles.pauseButton, { 
                backgroundColor: theme.warning,
                opacity: (loading || !isOnline) ? 0.5 : 1 
              }]}
              activeOpacity={0.8}
            >
              <PauseIcon color="white" />
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onStopConfirmation} 
              disabled={loading || !isOnline}
              style={[styles.breakFastButton, { 
                backgroundColor: theme.success,
                opacity: (loading || !isOnline) ? 0.5 : 1 
              }]}
              activeOpacity={0.8}
            >
              <Text style={styles.breakFastIcon}>🍎</Text>
              <Text style={styles.breakFastText}>Break Fast</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Offline Warning */}
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <Text style={styles.offlineText}>
            Some features disabled while offline
          </Text>
        </View>
      )}

      {/* Celebration Toggle */}
      {isActive && (
        <View style={styles.celebrationToggle}>
          <TouchableOpacity
            onPress={onToggleCelebrations}
            style={[styles.celebrationButton, { 
              backgroundColor: showCelebrations 
                ? theme.primary + '20' 
                : theme.backgroundSecondary
            }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.celebrationText, { 
              color: showCelebrations ? theme.primary : theme.textSecondary 
            }]}>
              {showCelebrations ? '🎉 Celebrations ON' : '🔇 Celebrations OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  templatesSection: {
    marginBottom: 16,
  },
  templatesLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  templatesScroll: {
    flexDirection: 'row',
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    gap: 8,
  },
  templateIcon: {
    fontSize: 18,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateDuration: {
    fontSize: 12,
  },
  mainControls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  startButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumeButtonContainer: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  resumeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  templatesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  templatesButtonIcon: {
    fontSize: 20,
  },
  templatesButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  breakFastButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  breakFastIcon: {
    fontSize: 18,
  },
  breakFastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineWarning: {
    alignItems: 'center',
    marginTop: 12,
  },
  offlineText: {
    fontSize: 12,
    color: '#F97316',
  },
  celebrationToggle: {
    alignItems: 'center',
    marginTop: 16,
  },
  celebrationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  celebrationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TimerControls;
