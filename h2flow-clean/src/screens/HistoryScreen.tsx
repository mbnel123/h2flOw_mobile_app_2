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

// ... (rest of the code remains the same)

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
}: { 
  visible: boolean; 
  onClose: () => void; 
  fast: Fast | null; 
  onSave: (fastId: string, newDuration: number) => void;
  onDelete: (fastId: string) => void;
  colors: any;
}) => {
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

// Loading skeleton component
const HistoryLoadingSkeleton = ({ colors }: { colors: any }) => (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.headerContent}>
        <View style={[styles.skeletonCircle, { backgroundColor: colors.border }]} />
        <View style={[styles.skeletonText, { backgroundColor: colors.border }]} />
      </View>
      <View style={[styles.skeletonButton, { backgroundColor: colors.border }]} />
    </View>

    <ScrollView style={styles.content}>
      {/* User Profile Skeleton */}
      <Card colors={colors} style={styles.profileCard}>
        <View style={styles.profileSkeleton}>
          <View style={[styles.skeletonCircleLarge, { backgroundColor: colors.border }]} />
          <View>
            <View style={[styles.skeletonTextMedium, { backgroundColor: colors.border, marginBottom: 8 }]} />
            <View style={[styles.skeletonTextSmall, { backgroundColor: colors.border, marginBottom: 4 }]} />
            <View style={[styles.skeletonTextSmall, { backgroundColor: colors.border }]} />
          </View>
        </View>
      </Card>

      {/* Stats Skeleton */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <View key={i} style={[styles.statCardSkeleton, { backgroundColor: colors.border }]} />
        ))}
      </View>
    </ScrollView>
  </View>
);

// User Profile Section
const UserProfileSection = ({ 
  user, 
  fastingStreak, 
  accountAgeDays, 
  colors 
}: { 
  user: FirebaseUser; 
  fastingStreak: FastStreak | null; 
  accountAgeDays: number; 
  colors: any;
}) => (
  <Card colors={colors} style={styles.profileCard}>
    <View style={styles.profileContent}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Ionicons name="person" size={24} color="white" />
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: colors.text }]}>
          {user.displayName || 'Faster'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
          {user.email}
        </Text>
        <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>
          Fasting for {accountAgeDays} days
        </Text>
        {fastingStreak && (
          <Text style={[styles.streakText, { color: colors.warning }]}>
            <Ionicons name="flame" size={14} color={colors.warning} /> Current streak: {fastingStreak.currentStreak} days (Best: {fastingStreak.longestStreak})
          </Text>
        )}
      </View>
    </View>
  </Card>
);

// Fasting Patterns Section
const FastingPatternsSection = ({ stats, colors }: { stats: any; colors: any }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name="stats-chart" size={24} color={colors.text} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Fasting Patterns</Text>
    </View>
    
    <View style={styles.patternsGrid}>
      <Card colors={colors} style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Ionicons name="calendar" size={20} color={colors.success} />
          <Text style={[styles.patternTitle, { color: colors.success }]}>This Year</Text>
        </View>
        <Text style={[styles.patternValue, { color: colors.text }]}>{stats.fastsPerYear}</Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total fasts</Text>
        <Text style={[styles.patternValueSmall, { color: colors.text }]}>
          {Math.round(stats.hoursPerYear)}h
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total hours</Text>
      </Card>

      <Card colors={colors} style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.patternTitle, { color: colors.primary }]}>This Month</Text>
        </View>
        <Text style={[styles.patternValue, { color: colors.text }]}>{stats.fastsPerMonth}</Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total fasts</Text>
        <Text style={[styles.patternValueSmall, { color: colors.text }]}>
          {Math.round(stats.hoursPerMonth)}h
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total hours</Text>
      </Card>

      <Card colors={colors} style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Ionicons name="analytics" size={20} color={colors.info} />
          <Text style={[styles.patternTitle, { color: colors.info }]}>Averages</Text>
        </View>
        <Text style={[styles.patternValue, { color: colors.text }]}>
          {Math.round(stats.averageDuration)}h
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Avg duration</Text>
        <Text style={[styles.patternValueSmall, { color: colors.text }]}>
          {stats.completionRate}%
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Success rate</Text>
      </Card>
    </View>
  </View>
);

// Fast History List
const FastHistoryList = ({ 
  fastHistory, 
  colors, 
  onEditFast 
}: { 
  fastHistory: Fast[]; 
  colors: any;
  onEditFast: (fast: Fast) => void;
}) => {
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
      {fastHistory.slice(0, 10).map(fast => (
        <TouchableOpacity 
          key={fast.id} 
          onPress={() => onEditFast(fast)}
          activeOpacity={0.7}
        >
          <Card colors={colors} style={styles.fastCard}>
            <View style={styles.fastHeader}>
              <Text style={[styles.fastTitle, { color: colors.text }]}>
                {Number(fast.plannedDuration).toFixed(2)}h Fast
              </Text>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: fast.status === 'completed' ? 
                    `${colors.success}20` : 
                    fast.status === 'stopped_early' ? 
                    `${colors.warning}20` : 
                    `${colors.primary}20`
                }
              ]}>
                <Ionicons 
                  name={fast.status === 'completed' ? 'checkmark-circle' : 
                         fast.status === 'stopped_early' ? 'time' : 'refresh-circle'} 
                  size={14} 
                  color={fast.status === 'completed' ? colors.success : 
                         fast.status === 'stopped_early' ? colors.warning : colors.primary} 
                />
                <Text style={[
                  styles.statusText,
                  { 
                    color: fast.status === 'completed' ? colors.success : 
                           fast.status === 'stopped_early' ? colors.warning : colors.primary
                  }
                ]}>
                  {fast.status === 'completed' ? 'Completed' : 
                   fast.status === 'stopped_early' ? 'Stopped Early' : 'Active'}
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
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => onEditFast(fast)}
              >
                <Ionicons name="create" size={14} color={colors.textSecondary} />
                <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>
                  Edit
                </Text>
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    recentFasts: true,
    fastingPatterns: true,
    lifetimeStats: true
  });

  // Use custom hook for history data
  const {
    fastHistory,
    fastingStreak,
    loading,
    error,
    stats,
    setError,
    refreshData
  } = useHistoryData(user);

  // Listen to auth state
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

  const handleSaveFast = async (fastId: string, newDuration: number) => {
    try {
      await updateFast(fastId, newDuration);
      refreshData(); // Refresh data to show updated values
      Alert.alert('Success', 'Fast duration updated successfully!');
    } catch (error) {
      console.error('Error updating fast:', error);
      Alert.alert('Error', 'Failed to update fast duration. Please try again.');
    }
  };

  const handleDeleteFast = async (fastId: string) => {
    try {
      await deleteFast(fastId);
      refreshData(); // Refresh data to show updated values
      Alert.alert('Success', 'Fast deleted successfully!');
    } catch (error) {
      console.error('Error deleting fast:', error);
      Alert.alert('Error', 'Failed to delete fast. Please try again.');
    }
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingFast(null);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  // Show loading skeleton
  if (loading) {
    return <HistoryLoadingSkeleton colors={theme} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Ionicons name="person-circle" size={24} color={theme.text} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: theme.danger }]}
        >
          <Ionicons name="log-out" size={16} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: `${theme.danger}20`, borderBottomColor: theme.border }]}>
          <Ionicons name="warning" size={16} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={[styles.dismissText, { color: theme.danger }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <UserProfileSection 
          user={user}
          fastingStreak={fastingStreak}
          accountAgeDays={stats.accountAgeDays}
          colors={theme}
        />

        {/* Recent Fasts Section - Now at the top and collapsible */}
        <CollapsibleSection
          title="Recent Fasts"
          icon="list"
          isExpanded={expandedSections.recentFasts}
          onToggle={() => toggleSection('recentFasts')}
          colors={theme}
        >
          <FastHistoryList 
            fastHistory={fastHistory} 
            colors={theme}
            onEditFast={handleEditFast}
          />
        </CollapsibleSection>

        {/* Fasting Patterns - Now collapsible */}
        <CollapsibleSection
          title="Your Fasting Patterns"
          icon="stats-chart"
          isExpanded={expandedSections.fastingPatterns}
          onToggle={() => toggleSection('fastingPatterns')}
          colors={theme}
        >
          <View style={styles.patternsGrid}>
            <Card colors={theme} style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <Ionicons name="calendar" size={20} color={theme.success} />
                <Text style={[styles.patternTitle, { color: theme.success }]}>This Year</Text>
              </View>
              <Text style={[styles.patternValue, { color: theme.text }]}>{stats.fastsPerYear}</Text>
              <Text style={[styles.patternSubtitle, { color: theme.textSecondary }]}>Total fasts</Text>
              <Text style={[styles.patternValueSmall, { color: theme.text }]}>
                {Math.round(stats.hoursPerYear)}h
              </Text>
              <Text style={[styles.patternSubtitle, { color: theme.textSecondary }]}>Total hours</Text>
            </Card>

            <Card colors={theme} style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <Ionicons name="calendar" size={20} color={theme.primary} />
                <Text style={[styles.patternTitle, { color: theme.primary }]}>This Month</Text>
              </View>
              <Text style={[styles.patternValue, { color: theme.text }]}>{stats.fastsPerMonth}</Text>
              <Text style={[styles.patternSubtitle, { color: theme.textSecondary }]}>Total fasts</Text>
              <Text style={[styles.patternValueSmall, { color: theme.text }]}>
                {Math.round(stats.hoursPerMonth)}h
              </Text>
              <Text style={[styles.patternSubtitle, { color: theme.textSecondary }]}>Total hours</Text>
            </Card>

            <Card colors={theme} style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <Ionicons name="analytics" size={20} color={theme.info} />
                <Text style={[styles.patternTitle, { color: theme.info }]}>Averages</Text>
              </View>
              <Text style={[styles.patternValue, { color: theme.text }]}>
                {Math.round(stats.averageDuration)}h
              </Text>
              <Text style={[styles.patternSubtitle, { color: theme.textSecondary }]}>Avg duration</Text>
              <Text style={[styles.patternValueSmall, { color: theme.text }]}>
                {stats.completionRate}%
              </Text>
              <Text style={[styles.patternSubtitle, { color: theme.textSecondary }]}>Success rate</Text>
            </Card>
          </View>
        </CollapsibleSection>

        {/* Lifetime Stats - Now collapsible */}
        <CollapsibleSection
          title="Lifetime Stats"
          icon="trophy"
          isExpanded={expandedSections.lifetimeStats}
          onToggle={() => toggleSection('lifetimeStats')}
          colors={theme}
        >
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Fasts"
              value={stats.totalFasts.toString()}
              subtitle={`${stats.thisWeekFasts} this week`}
              icon="bar-chart"
              colors={theme}
            />
            <StatCard
              title="Total Hours"
              value={Number(stats.totalHours).toFixed(0)}
              subtitle={`${Number(stats.totalHours / 24).toFixed(1)} days`}
              icon="time"
              colors={theme}
            />
            <StatCard
              title="Average Duration"
              value={Number(stats.averageDuration).toFixed(1)}
              subtitle="hours per fast"
              icon="analytics"
              colors={theme}
            />
            <StatCard
              title="Longest Fast"
              value={Number(stats.longestFast).toFixed(1)}
              subtitle="hours"
              icon="trophy"
              colors={theme}
            />
            <StatCard
              title="Success Rate"
              value={`${stats.completionRate}%`}
              subtitle="completed fasts"
              icon="checkmark-circle"
              colors={theme}
            />
            <StatCard
              title="Ketosis Hours"
              value={Number(stats.ketosisHours).toFixed(0)}
              subtitle="12+ hour fasts"
              icon="flash"
              colors={theme}
            />
          </View>
        </CollapsibleSection>
      </ScrollView>

      {/* Edit Fast Modal */}
      <EditFastModal
        visible={isEditModalVisible}
        onClose={closeEditModal}
        fast={editingFast}
        onSave={handleSaveFast}
        onDelete={handleDeleteFast}
        colors={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  dismissText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 12,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  patternsGrid: {
    gap: 12,
  },
  patternCard: {
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  patternValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  patternValueSmall: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  patternSubtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: Dimensions.get('window').width / 2 - 24,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
  },
  fastList: {
    gap: 12,
  },
  fastCard: {
    marginBottom: 12,
  },
  fastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fastTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fastDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fastDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fastDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  fastActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    gap: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Skeleton styles
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  skeletonCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  skeletonText: {
    height: 20,
    width: 120,
    borderRadius: 4,
  },
  skeletonTextMedium: {
    height: 24,
    width: 160,
    borderRadius: 4,
  },
  skeletonTextSmall: {
    height: 16,
    width: 100,
    borderRadius: 4,
  },
  skeletonButton: {
    width: 80,
    height: 36,
    borderRadius: 8,
  },
  statCardSkeleton: {
    width: Dimensions.get('window').width / 2 - 24,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HistoryScreen;
