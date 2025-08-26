// src/components/achievement/AchievementShareSheet.tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileShareService } from '../../services/mobileShareService';

interface AchievementShareSheetProps {
  achievement: {
    emoji: string;
    title: string;
    description: string;
    bgColor: string;
  };
  stats: {
    totalFasts: number;
    longestFast: number;
    completionRate: number;
    currentStreak?: number;
  };
  userName?: string;
  onClose: () => void;
  theme: any;
}

const AchievementShareSheet: React.FC<AchievementShareSheetProps> = ({
  achievement,
  stats,
  userName,
  onClose,
  theme
}) => {
  const viewRef = useRef(null);

  const handleShare = async () => {
    const success = await MobileShareService.shareAchievement(achievement, stats, userName);
    if (success) {
      onClose();
    }
  };

  const handleCopyText = async () => {
    const success = await MobileShareService.copyAchievementText(achievement, stats);
    if (success) {
      onClose();
    }
  };

  const handleSaveImage = async () => {
    if (viewRef.current) {
      const success = await MobileShareService.saveAchievementImage(viewRef.current, achievement);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Share Achievement</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View ref={viewRef} style={[styles.achievementCard, { backgroundColor: theme.card }]}>
        <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
        <Text style={[styles.achievementTitle, { color: theme.text }]}>
          {achievement.title}
        </Text>
        <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>
          {achievement.description}
        </Text>
        
        <View style={styles.statsRow}>
          <Text style={[styles.statsText, { color: theme.textSecondary }]}>
            {stats.totalFasts} fasts • {stats.longestFast}h longest • {stats.completionRate}% success
          </Text>
        </View>
      </View>

      <View style={styles.shareOptions}>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: theme.primary }]}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={handleCopyText}
        >
          <Ionicons name="copy" size={20} color={theme.text} />
          <Text style={[styles.shareButtonText, { color: theme.text }]}>Copy Text</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={handleSaveImage}
        >
          <Ionicons name="download" size={20} color={theme.text} />
          <Text style={[styles.shareButtonText, { color: theme.text }]}>Save Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  achievementEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: 12,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AchievementShareSheet;
