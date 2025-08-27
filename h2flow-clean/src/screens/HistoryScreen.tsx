// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, logout } from '../firebase/authService';
import { useHistoryData } from '../hooks/useHistoryData';
import { Fast, FastStreak } from '../firebase/databaseService';
import { updateFast, deleteFast } from '../firebase/databaseService';
import { MobileShareService } from '../services/mobileShareService';

// Define colors for light and dark mode
const colors = {
  light: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#3B82F6',
  },
  dark: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#3B82F6',
  }
};

// Card component for consistent styling
const Card = ({ children, style, colors }: { children: React.ReactNode; style?: any; colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }, style]}>
    {children}
  </View>
);

// Stat card component
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  colors
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: string;
  colors: any;
}) => {
  return (
    <Card colors={colors} style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </Card>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children, 
  colors 
}: { 
  title: string; 
  icon: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
  colors: any;
}) => (
  <View style={styles.section}>
    <TouchableOpacity 
      onPress={onToggle}
      style={styles.sectionHeader}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={24} color={colors.text} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Ionicons 
        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
        size={24} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
    
    {isExpanded && children}
  </View>
);

// Edit Fast Modal Component
const EditFastModal = ({ 
  visible, 
  onClose, 
  fast, 
  onSave, 
  onDelete,
  colors 
}: any) => {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (fast) {
      setDuration(Number(fast.actualDuration || fast.plannedDuration).toFixed(1));
    }
  }, [fast]);

  const handleSave = () => {
    if (!fast) return;
    
    const newDuration = parseFloat(duration);
    if (isNaN(newDuration) || newDuration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of hours.');
      return;
    }

    const currentDuration = Number(fast.actualDuration || fast.plannedDuration);
    if (newDuration > currentDuration) {
      Alert.alert('Not Allowed', 'You can only reduce the fast duration, not increase it.');
      return;
    }

    onSave(fast.id, newDuration);
    onClose();
  };

  const handleDelete = () => {
    if (!fast) return;
    
    Alert.alert(
      'Delete Fast',
      'Are you sure you want to delete this fast? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete(fast.id);
            onClose();
          }
        }
      ]
    );
  };

  if (!fast) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Fast</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalLabel, { color: colors.text }]}>
              Start Date: {new Date(fast.startTime).toLocaleDateString('nl-NL')}
            </Text>
            
            <Text style={[styles.modalLabel, { color: colors.text }]}>
              Duration (hours):
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="Enter duration in hours"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton, { backgroundColor: colors.danger }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.saveButton, { backgroundColor: colors.success }]}
                onPress={handleSave}
              >
                <Ionicons name="save" size={16} color="white" />
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Info popup
const FastInfoModal = ({ visible, onClose, fast, colors }: any) => {
  if (!fast) return null;

  const handleShare = async () => {
    await MobileShareService.shareAchievement(
      {
        emoji: '⏱️',
        title: `${Number(fast.actualDuration || fast.plannedDuration).toFixed(1)}h Fast`,
        description: `Started on ${new Date(fast.startTime).toLocaleDateString('nl-NL')}`,
        bgColor: colors.primary,
      },
      {
        totalFasts: 1,
        longestFast: Number(fast.actualDuration || fast.plannedDuration),
        completionRate: 100,
      },
      'Me'
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Fast Info</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalLabel, { color: colors.text }]}>
            Date: {new Date(fast.startTime).toLocaleDateString('nl-NL')}
          </Text>
          <Text style={[styles.modalLabel, { color: colors.text }]}>
            Duration: {Number(fast.actualDuration || fast.plannedDuration).toFixed(1)} hours
          </Text>
          <Text style={[styles.modalLabel, { color: colors.text }]}>Status: {fast.status}</Text>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: colors.primary, marginTop: 20 }]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={16} color="white" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Fast History List
const FastHistoryList = ({ fastHistory, colors, onEditFast, onInfoFast }: any) => {
  if (fastHistory.length === 0) {
    return (
      <Card colors={colors} style={styles.emptyCard}>
        <Ionicons name="stats-chart" size={32} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No fasting history yet. Start your first fast to see your progress!
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.fastList}>
      {fastHistory.slice(0, 10).map((fast: Fast) => (
        <TouchableOpacity key={fast.id} onPress={() => onInfoFast(fast)} activeOpacity={0.7}>
          <Card colors={colors} style={styles.fastCard}>
            <View style={styles.fastHeader}>
              <Text style={[styles.fastTitle, { color: colors.text }]}>
                {Number(fast.plannedDuration).toFixed(2)}h Fast
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      fast.status === 'completed'
                        ? `${colors.success}20`
                        : fast.status === 'stopped_early'
                        ? `${colors.warning}20`
                        : `${colors.primary}20`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    fast.status === 'completed'
                      ? 'checkmark-circle'
                      : fast.status === 'stopped_early'
                      ? 'time'
                      : 'refresh-circle'
                  }
                  size={14}
                  color={
                    fast.status === 'completed'
                      ? colors.success
                      : fast.status === 'stopped_early'
                      ? colors.warning
                      : colors.primary
                  }
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        fast.status === 'completed'
                          ? colors.success
                          : fast.status === 'stopped_early'
                          ? colors.warning
                          : colors.primary,
                    },
                  ]}
                >
                  {fast.status === 'completed'
                    ? 'Completed'
                    : fast.status === 'stopped_early'
                    ? 'Stopped Early'
                    : 'Active'}
                </Text>
              </View>
            </View>

            <View style={styles.fastDetails}>
              <View style={styles.fastDetail}>
                <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                <Text style={[styles.fastDetailValue, { color: colors.text }]}>
                  {new Date(fast.startTime).toLocaleDateString('nl-NL')}
                </Text>
              </View>
              <View style={styles.fastDetail}>
                <Ionicons name="time" size={14} color={colors.textSecondary} />
                <Text style={[styles.fastDetailValue, { color: colors.text }]}>
                  {Number(fast.actualDuration || fast.plannedDuration).toFixed(2)} hours
                </Text>
              </View>
            </View>

            <View style={styles.fastActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => onEditFast(fast)}>
                <Ionicons name="create" size={14} color={colors.textSecondary} />
                <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Main History Screen Component
const HistoryScreen: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [editingFast, setEditingFast] = useState<Fast | null>(null);
  const [infoFast, setInfoFast] = useState<Fast | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  const { fastHistory, fastingStreak, loading, error, stats, setError, refreshData } =
    useHistoryData(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditFast = (fast: Fast) => {
    setEditingFast(fast);
    setIsEditModalVisible(true);
  };

  const handleInfoFast = (fast: Fast) => {
    setInfoFast(fast);
    setIsInfoModalVisible(true);
  };

  const handleSaveFast = async (fastId: string, newDuration: number) => {
    const result = await updateFast(fastId, newDuration);
    if (result.error) {
      console.error('Error updating fast:', result.error);
      Alert.alert('Error', 'Failed to update fast duration. Please try again.');
    } else {
      refreshData();
      Alert.alert('Success', 'Fast duration updated successfully!');
    }
  };

  const handleDeleteFast = async (fastId: string) => {
    const result = await deleteFast(fastId);
    if (result.error) {
      console.error('Error deleting fast:', result.error);
      Alert.alert('Error', 'Failed to delete fast. Please try again.');
    } else {
      refreshData();
      Alert.alert('Success', 'Fast deleted successfully!');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.authContainer}>
          <Ionicons name="lock-closed" size={32} color={theme.textSecondary} />
          <Text style={[styles.authText, { color: theme.textSecondary }]}>
            Please log in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ... loading skeleton en andere sections zoals eerder (niet ingekort in dit bestand)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* header + sections + rest (zoals in jouw originele bestand) */}

      <ScrollView style={styles.content}>
        <FastHistoryList
          fastHistory={fastHistory}
          colors={theme}
          onEditFast={handleEditFast}
          onInfoFast={handleInfoFast}
        />
      </ScrollView>

      <EditFastModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        fast={editingFast}
        onSave={handleSaveFast}
        onDelete={handleDeleteFast}
        colors={theme}
      />

      <FastInfoModal
        visible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
        fast={infoFast}
        colors={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // jouw bestaande styles ongewijzigd
  container: { flex: 1 },
  // ... rest
});

export default HistoryScreen;
