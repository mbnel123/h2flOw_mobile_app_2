// src/components/timer/TimerHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock icons - replace with actual icon library when available
const WifiIcon = ({ color }: { color: string }) => <Text style={{ color }}>📶</Text>;
const WifiOffIcon = ({ color }: { color: string }) => <Text style={{ color }}>📵</Text>;
const SmartphoneIcon = ({ color }: { color: string }) => <Text style={{ color }}>📱</Text>;

interface TimerHeaderProps {
  theme: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
  };
  setCurrentView: (view: string) => void;
  syncStatus: 'connected' | 'connecting' | 'offline' | 'error';
  isOnline: boolean;
  lastSyncTime: Date | null;
  multiDeviceActivity: string | null;
  getProgress: () => number;
}

// Connection Status Component
const ConnectionStatus: React.FC<{
  syncStatus: 'connected' | 'connecting' | 'offline' | 'error';
  isOnline: boolean;
  lastSyncTime: Date | null;
  theme: any;
}> = ({ syncStatus, isOnline, lastSyncTime, theme }) => {
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return '#10B981';
      case 'connecting': return '#F59E0B';
      case 'offline': return '#F97316';
      case 'error': return '#EF4444';
      default: return theme.textSecondary;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    switch (syncStatus) {
      case 'connected': return 'Synced';
      case 'connecting': return 'Syncing...';
      case 'error': return 'Sync Error';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.connectionStatus}>
      <View style={[styles.statusIcon, { color: getStatusColor() }]}>
        {isOnline ? <WifiIcon color={getStatusColor()} /> : <WifiOffIcon color={getStatusColor()} />}
      </View>
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      {lastSyncTime && syncStatus === 'connected' && (
        <Text style={[styles.syncTime, { color: theme.textSecondary }]}>
          {lastSyncTime.toLocaleTimeString('nl-NL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      )}
    </View>
  );
};

// Multi-device Activity Component
const MultiDeviceActivity: React.FC<{
  activity: string;
  theme: any;
}> = ({ activity, theme }) => {
  return (
    <View style={[styles.multiDeviceContainer, { 
      backgroundColor: theme.primary + '20',
    }]}>
      <SmartphoneIcon color={theme.primary} />
      <Text style={[styles.multiDeviceText, { color: theme.primary }]}>
        {activity}
      </Text>
    </View>
  );
};

const TimerHeader: React.FC<TimerHeaderProps> = ({
  theme,
  setCurrentView,
  syncStatus,
  isOnline,
  lastSyncTime,
  multiDeviceActivity,
  getProgress
}) => {
  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background,
      borderBottomColor: theme.border 
    }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.appIcon}
          >
            <Text style={styles.appIconText}>H₂F</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>H2Flow</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Extended Water Fasting
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setCurrentView('water')} 
            style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonIcon}>💧</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setCurrentView('info')} 
            style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonIcon}>ℹ️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setCurrentView('history')} 
            style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonIcon}>📊</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setCurrentView('settings')} 
            style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonIcon}>⚙️</Text>
          </TouchableOpacity>

          <View style={[styles.syncIndicator, { backgroundColor: theme.success }]}>
            <Text style={styles.syncText}>●</Text>
          </View>
        </View>
      </View>
      
      {/* Connection status and multi-device activity */}
      <View style={styles.statusRow}>
        <ConnectionStatus 
          syncStatus={syncStatus}
          isOnline={isOnline}
          lastSyncTime={lastSyncTime}
          theme={theme}
        />
        {multiDeviceActivity && (
          <MultiDeviceActivity 
            activity={multiDeviceActivity} 
            theme={theme}
          />
        )}
      </View>
      
      {/* Progress bar */}
      <View style={[styles.progressBarContainer, { 
        backgroundColor: theme.border 
      }]}>
        <LinearGradient
          colors={['#38BDF8', '#0EA5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { 
            width: `${getProgress()}%` 
          }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appIconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: 20,
  },
  syncIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {
    fontSize: 8,
    color: 'white',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
  },
  syncTime: {
    fontSize: 12,
  },
  multiDeviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  multiDeviceText: {
    fontSize: 12,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  progressBar: {
    height: '100%',
  },
});

export default TimerHeader;
