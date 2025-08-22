// src/components/timer/IntegratedStatsDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Mock icons - replace with actual icon library when available
const FlameIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>🔥</Text>;
const TrendingUpIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>📈</Text>;
const ClockIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>⏰</Text>;
const TargetIcon = ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>🎯</Text>;

interface FastStreak {
  currentStreak: number;
  longestStreak: number;
  lastFastDate: Date | null;
  streakStartDate: Date | null;
}

interface IntegratedStatsDisplayProps {
  streak: FastStreak;
  loading: boolean;
  theme: {
    primary: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  isActive: boolean;
  elapsedTime: number;
  targetHours: number;
}

const IntegratedStatsDisplay: React.FC<IntegratedStatsDisplayProps> = ({ 
  streak, 
  loading, 
  theme, 
  isActive, 
  elapsedTime, 
  targetHours 
}) => {
  const getStreakEmoji = (streakDays: number) => {
    if (streakDays >= 100) return '🔥💎';
    if (streakDays >= 50) return '🔥⭐';
    if (streakDays >= 30) return '🔥🚀';
    if (streakDays >= 14) return '🔥💪';
    if (streakDays >= 7) return '🔥✨';
    if (streakDays >= 3) return '🔥🌟';
    if (streakDays >= 1) return '🔥';
    return '💭';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, { 
          backgroundColor: theme.backgroundSecondary + '80', 
          borderColor: theme.border 
        }]}>
          <View style={styles.grid}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.statItem}>
                <View style={[styles.loadingIcon, { backgroundColor: theme.border }]} />
                <View style={[styles.loadingText, { backgroundColor: theme.border }]} />
                <View style={[styles.loadingLabel, { backgroundColor: theme.border }]} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { 
        backgroundColor: theme.backgroundSecondary + '70', 
        borderColor: theme.border 
      }]}>
        <View style={styles.grid}>
          {/* Streak */}
          <View style={styles.statItem}>
            <View style={[styles.iconContainer, {
              backgroundColor: streak.currentStreak > 0 
                ? '#F97316' 
                : (theme.background === '#111827' ? '#374151' : '#F3F4F6')
            }]}>
              <Text style={styles.iconText}>
                {streak.currentStreak > 0 ? getStreakEmoji(streak.currentStreak) : '💭'}
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Current streak
            </Text>
          </View>

          {/* Current Fast / Best Streak */}
          <View style={styles.statItem}>
            {isActive ? (
              <>
                <View style={[styles.iconContainer, {
                  backgroundColor: theme.background === '#111827' ? '#1E3A8A' : '#DBEAFE'
                }]}>
                  <ClockIcon color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatTime(elapsedTime)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Current fast
                </Text>
              </>
            ) : (
              <>
                <View style={[styles.iconContainer, {
                  backgroundColor: theme.background === '#111827' ? '#581C87' : '#F3E8FF'
                }]}>
                  <TrendingUpIcon color="#8B5CF6" />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Best streak
                </Text>
              </>
            )}
          </View>

          {/* Target / Progress */}
          <View style={styles.statItem}>
            <View style={[styles.iconContainer, {
              backgroundColor: theme.background === '#111827' ? '#064E3B' : '#D1FAE5'
            }]}>
              <TargetIcon color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {isActive ? `${Math.round((elapsedTime / (targetHours * 3600)) * 100)}%` : `${targetHours}h`}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {isActive ? 'Progress' : 'Next target'}
            </Text>
          </View>
        </View>

        {/* Next milestone for active streaks */}
        {streak.currentStreak > 0 && (
          <View style={[styles.milestoneSection, { borderTopColor: theme.border }]}>
            {(() => {
              const milestones = [7, 14, 21, 30, 50, 100, 365];
              const nextMilestone = milestones.find(m => m > streak.currentStreak);
              if (!nextMilestone) return null;
              
              const daysToGo = nextMilestone - streak.currentStreak;
              const progress = (streak.currentStreak / nextMilestone) * 100;
              
              return (
                <View>
                  <View style={styles.milestoneHeader}>
                    <Text style={[styles.milestoneLabel, { color: theme.textSecondary }]}>
                      Next: {nextMilestone} days
                    </Text>
                    <Text style={[styles.milestoneProgress, { color: '#F97316' }]}>
                      {daysToGo} to go!
                    </Text>
                  </View>
                  <View style={[styles.progressBarContainer, { 
                    backgroundColor: theme.background === '#111827' ? '#374151' : '#E5E7EB' 
                  }]}>
                    <View 
                      style={[styles.progressBar, { 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: '#F97316'
                      }]}
                    />
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* Motivational message for beginners */}
        {streak.currentStreak === 0 && (
          <View style={[styles.motivationSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.motivationText, { color: theme.textSecondary }]}>
              🎯 Complete your first fast to start your streak!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  loadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  loadingText: {
    width: 24,
    height: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingLabel: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  milestoneSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 12,
  },
  milestoneProgress: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  motivationSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  motivationText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default IntegratedStatsDisplay;
