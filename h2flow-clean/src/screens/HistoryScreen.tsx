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
  ActivityIndicator,
  Alert,
  Share,
  Clipboard,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, LogOut, User, TrendingUp, Clock, Award, BarChart3, Zap, Shield, Trophy, Calendar, Share2, Copy } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, logout } from '../firebase/authService';
import { useHistoryData } from '../hooks/useHistoryData';
import { Fast, FastStreak } from '../firebase/databaseService';

// Define colors for light and dark mode
const colors = {
  light: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    card: '#F9FAFB',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    gradient: ['#F9FAFB', '#F3F4F6', '#F9FAFB']
  },
  dark: {
    primary: '#3B82F6',
    background: '#111827',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    card: '#1F2937',
    border: '#374151',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    gradient: ['#111827', '#1F2937', '#111827']
  }
};

// Icon mapping for React Native
const Icon = ({ name, size, color }: { name: string; size: number; color: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'arrow-left': <ArrowLeft size={size} color={color} />,
    'log-out': <LogOut size={size} color={color} />,
    'user': <User size={size} color={color} />,
    'trending-up': <TrendingUp size={size} color={color} />,
    'clock': <Clock size={size} color={color} />,
    'award': <Award size={size} color={color} />,
    'bar-chart-3': <BarChart3 size={size} color={color} />,
    'zap': <Zap size={size} color={color} />,
    'shield': <Shield size={size} color={color} />,
    'trophy': <Trophy size={size} color={color} />,
    'calendar': <Calendar size={size} color={color} />,
    'share-2': <Share2 size={size} color={color} />,
    'copy': <Copy size={size} color={color} />,
  };
  
  return <View>{icons[name] || <Text>?</Text>}</View>;
};

// Card component for consistent styling
const Card = ({ children, style, colors }: { children: React.ReactNode; style?: any; colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
    {children}
  </View>
);

// Stat card component
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  colors,
  colorScheme 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: string;
  colors: any;
  colorScheme: string;
}) => {
  const colorMap: Record<string, string> = {
    blue: colorScheme === 'dark' ? '#93C5FD' : '#1D4ED8',
    green: colorScheme === 'dark' ? '#6EE7B7' : '#065F46',
    red: colorScheme === 'dark' ? '#FCA5A5' : '#B91C1C',
    purple: colorScheme === 'dark' ? '#D8B4FE' : '#7E22CE',
    orange: colorScheme === 'dark' ? '#FDBA74' : '#C2410C',
    yellow: colorScheme === 'dark' ? '#FDE68A' : '#854D0E',
  };

  const color = colorMap[icon] || colors.text;

  return (
    <Card colors={colors} style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={16} color={color} />
        <Text style={[styles.statTitle, { color }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </Card>
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
      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}></Text>
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
        <Icon name="user" size={24} color="#FFFFFF" />
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
            🔥 Current streak: {fastingStreak.currentStreak} days (Best: {fastingStreak.longestStreak})
          </Text>
        )}
      </View>
    </View>
  </Card>
);

// Fasting Patterns Section
const FastingPatternsSection = ({ stats, colors }: { stats: any; colors: any }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 Your Fasting Patterns</Text>
    
    <View style={styles.patternsGrid}>
      <Card colors={colors} style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Icon name="calendar" size={16} color={colors.success} />
          <Text style={[styles.patternTitle, { color: colors.success }]}>This Year</Text>
        </View>
        <Text style={[styles.patternValue, { color: colors.text }]}>{stats.fastsPerYear}</Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total fasts</Text>
        <Text style={[styles.patternValueSmall, { color: colors.text }]}>
          {Math.round(stats.hoursPerYear)}h
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total hours</Text>
        <Text style={[styles.patternDetail, { color: colors.textSecondary }]}>
          Average: {stats.fastsPerYear > 0 ? Math.round(stats.hoursPerYear / stats.fastsPerYear) : 0}h per fast
        </Text>
      </Card>

      <Card colors={colors} style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Icon name="calendar" size={16} color={colors.info} />
          <Text style={[styles.patternTitle, { color: colors.info }]}>This Month</Text>
        </View>
        <Text style={[styles.patternValue, { color: colors.text }]}>{stats.fastsPerMonth}</Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total fasts</Text>
        <Text style={[styles.patternValueSmall, { color: colors.text }]}>
          {Math.round(stats.hoursPerMonth)}h
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Total hours</Text>
        <Text style={[styles.patternDetail, { color: colors.textSecondary }]}>
          Projected yearly: {Math.round(stats.fastsPerMonth * 12)} fasts
        </Text>
      </Card>

      <Card colors={colors} style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Icon name="bar-chart-3" size={16} color={colors.primary} />
          <Text style={[styles.patternTitle, { color: colors.primary }]}>All Time Averages</Text>
        </View>
        <Text style={[styles.patternValue, { color: colors.text }]}>
          {Math.round(stats.averageDuration)}h
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Average duration</Text>
        <Text style={[styles.patternValueSmall, { color: colors.text }]}>
          {stats.completionRate}%
        </Text>
        <Text style={[styles.patternSubtitle, { color: colors.textSecondary }]}>Success rate</Text>
        <Text style={[styles.patternDetail, { color: colors.textSecondary }]}>
          {stats.accountAgeDays > 0 ? Math.round((stats.totalFasts / stats.accountAgeDays) * 30) : 0} fasts/month avg
        </Text>
      </Card>
    </View>
  </View>
);

// Fast History List
const FastHistoryList = ({ fastHistory, colors }: { fastHistory: Fast[]; colors: any }) => {
  if (fastHistory.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Recent Fasts</Text>
        <Card colors={colors} style={styles.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 16 }}>📊</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No fasting history yet. Start your first fast to see your progress!
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Recent Fasts</Text>
      <View style={styles.fastList}>
        {fastHistory.slice(0, 10).map(fast => (
          <Card key={fast.id} colors={colors} style={styles.fastCard}>
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
                    `${colors.info}20`
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { 
                    color: fast.status === 'completed' ? 
                      colors.success : 
                      fast.status === 'stopped_early' ? 
                      colors.warning : 
                      colors.info
                  }
                ]}>
                  {fast.status === 'completed' ? '✓ Completed' : 
                   fast.status === 'stopped_early' ? '⏱️ Stopped Early' : '🔄 Active'}
                </Text>
              </View>
            </View>
            
            <View style={styles.fastDetails}>
              <View style={styles.fastDetail}>
                <Text style={[styles.fastDetailLabel, { color: colors.textSecondary }]}>Date:</Text>
                <Text style={[styles.fastDetailValue, { color: colors.text }]}>
                  {new Date(fast.startTime).toLocaleDateString('nl-NL')}
                </Text>
              </View>
              <View style={styles.fastDetail}>
                <Text style={[styles.fastDetailLabel, { color: colors.textSecondary }]}>Duration:</Text>
                <Text style={[styles.fastDetailValue, { color: colors.text }]}>
                  {Number(fast.actualDuration || fast.plannedDuration).toFixed(2)} hours
                </Text>
              </View>
            </View>
            
            {/* Enhanced phase information */}
            <View style={styles.fastBenefits}>
              <Text style={[styles.benefitsTitle, { color: colors.textSecondary }]}>
                Biological benefits achieved:
              </Text>
              <View style={styles.benefitsList}>
                {Number(fast.actualDuration || fast.plannedDuration) >= 12 && (
                  <View style={[styles.benefitBadge, { backgroundColor: `${colors.info}20` }]}>
                    <Text style={[styles.benefitText, { color: colors.info }]}>
                      Ketosis ({Number(Math.max(0, Number(fast.actualDuration || fast.plannedDuration) - 12)).toFixed(2)}h)
                    </Text>
                  </View>
                )}
                {Number(fast.actualDuration || fast.plannedDuration) >= 24 && (
                  <View style={[styles.benefitBadge, { backgroundColor: `${colors.success}20` }]}>
                    <Text style={[styles.benefitText, { color: colors.success }]}>
                      Autophagy ({Number(Math.max(0, Number(fast.actualDuration || fast.plannedDuration) - 24)).toFixed(2)}h)
                    </Text>
                  </View>
                )}
                {Number(fast.actualDuration || fast.plannedDuration) >= 48 && (
                  <View style={[styles.benefitBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.benefitText, { color: colors.primary }]}>
                      Deep Autophagy
                    </Text>
                  </View>
                )}
                {Number(fast.actualDuration || fast.plannedDuration) >= 72 && (
                  <View style={[styles.benefitBadge, { backgroundColor: `${colors.warning}20` }]}>
                    <Text style={[styles.benefitText, { color: colors.warning }]}>
                      Immune Reset
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
};

// Main History Screen Component
const HistoryScreen: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Use custom hook for history data
  const {
    fastHistory,
    fastingStreak,
    loading,
    error,
    stats,
    setError
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

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.authContainer}>
          <Text style={{ fontSize: 32, marginBottom: 16 }}>🔒</Text>
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: `${theme.danger}20` }]}
        >
          <Icon name="log-out" size={16} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: `${theme.danger}20`, borderBottomColor: theme.border }]}>
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

        {/* Fasting Patterns */}
        <FastingPatternsSection 
          stats={stats} 
          colors={theme}
        />

        {/* Fast History */}
        <FastHistoryList 
          fastHistory={fastHistory} 
          colors={theme}
        />
      </ScrollView>
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
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  errorContainer: {
    padding: 12,
    borderBottomWidth: 1,
  },
  errorText: {
    fontSize: 14,
  },
  dismissText: {
    fontSize: 12,
    marginTop: 4,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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
  patternDetail: {
    fontSize: 11,
    marginTop: 8,
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
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    flex: 1,
  },
  fastDetailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  fastDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  fastBenefits: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  benefitsTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
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
    height: 32,
    borderRadius: 8,
  },
  profileSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardSkeleton: {
    width: Dimensions.get('window').width / 2 - 24,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
});

export default HistoryScreen;
