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
import AchievementShareSheet from '../components/achievement/AchievementShareSheet';
import { MobileShareService } from '../services/mobileShareService';

// ... (colors, Card, StatCard, CollapsibleSection blijven hetzelfde)

// Edit Fast Modal
const EditFastModal = ({ visible, onClose, fast, onSave, onDelete, colors }: any) => {
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
          },
        },
      ]
    );
  };

  if (!fast) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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

            <Text style={[styles.modalLabel, { color: colors.text }]}>Duration (hours):</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
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

// NEW: Fast Info Modal
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

// FastHistoryList aangepast: click = info, edit = apart
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

// Main
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
    try {
      await updateFast(fastId, newDuration);
      refreshData();
      Alert.alert('Success', 'Fast duration updated successfully!');
    } catch (error) {
      console.error('Error updating fast:', error);
      Alert.alert('Error', 'Failed to update fast duration. Please try again.');
    }
  };

  const handleDeleteFast = async (fastId: string) => {
    try {
      await deleteFast(fastId);
      refreshData();
      Alert.alert('Success', 'Fast deleted successfully!');
    } catch (error) {
      console.error('Error deleting fast:', error);
      Alert.alert('Error', 'Failed to delete fast. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ... header, skeleton, rest unchanged ... */}

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

export default HistoryScreen;
