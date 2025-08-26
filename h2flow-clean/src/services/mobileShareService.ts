// src/services/mobileShareService.ts
import { Alert, Share, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

interface Achievement {
  emoji: string;
  title: string;
  description: string;
  bgColor: string;
}

interface ShareData {
  achievement: Achievement;
  stats: {
    totalFasts: number;
    longestFast: number;
    completionRate: number;
    currentStreak?: number;
  };
  userName?: string;
}

export class MobileShareService {
  static async shareAchievement(
    achievement: Achievement,
    stats: any,
    userName?: string
  ): Promise<boolean> {
    try {
      const shareText = `🎉 Just unlocked "${achievement.title}" on H2Flow! ${achievement.description} #FastingJourney #H2Flow`;

      // Voor nu gebruiken we de native share dialog zonder afbeelding
      // In de toekomst kunnen we view capture toevoegen voor afbeeldingen
      const result = await Share.share({
        message: shareText,
        title: `H2Flow Achievement: ${achievement.title}`,
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing achievement:', error);
      Alert.alert('Error', 'Failed to share achievement');
      return false;
    }
  }

  static async saveAchievementImage(viewRef: any, achievement: Achievement): Promise<boolean> {
    try {
      // Vraag toestemming voor media library toegang
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to save images');
        return false;
      }

      // Capture de view als afbeelding
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9,
      });

      // Sla de afbeelding op
      await MediaLibrary.saveToLibraryAsync(uri);
      
      Alert.alert('Success', 'Achievement image saved to your gallery!');
      return true;
    } catch (error) {
      console.error('Error saving achievement image:', error);
      Alert.alert('Error', 'Failed to save achievement image');
      return false;
    }
  }

  static async copyAchievementText(achievement: Achievement, stats: any): Promise<boolean> {
    try {
      const text = `🎉 Just unlocked "${achievement.title}" on H2Flow! ${achievement.description} #FastingJourney #H2Flow`;
      
      // Gebruik React Native's clipboard API
      // @ts-ignore - Expo clipboard is beschikbaar
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Voor native, gebruik React Native clipboard
        const { default: Clipboard } = await import('@react-native-clipboard/clipboard');
        Clipboard.setString(text);
      }
      
      Alert.alert('Copied!', 'Achievement text copied to clipboard');
      return true;
    } catch (error) {
      console.error('Error copying text:', error);
      Alert.alert('Error', 'Failed to copy text to clipboard');
      return false;
    }
  }
}
