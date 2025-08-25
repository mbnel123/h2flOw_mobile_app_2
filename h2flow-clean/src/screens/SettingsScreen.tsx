// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsScreenProps {
  navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const isDark = resolvedTheme === 'dark';
  const colors = {
    primary: '#7DD3FC',
    background: isDark ? '#000000' : '#FFFFFF',
    backgroundSecondary: isDark ? '#1F1F1F' : '#F8F9FA',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    card: isDark ? '#1F1F1F' : '#FFFFFF',
  };

  const testNotification = () => {
    Alert.alert(
      'Test Notification',
      'Push notifications would be triggered here. This is a simulated notification.',
      [{ text: 'OK' }]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourwebsite.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://yourwebsite.com/terms-of-service');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Theme Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
            </View>
            
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.themeOption}>
                <Text style={[styles.themeLabel, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                  Choose your preferred color scheme
                </Text>
              </View>
              
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    theme === 'light' && { borderColor: colors.primary }
                  ]}
                  onPress={() => setTheme('light')}
                >
                  <Ionicons 
                    name="sunny" 
                    size={24} 
                    color={theme === 'light' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'light' ? colors.primary : colors.text }
                  ]}>
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    theme === 'dark' && { borderColor: colors.primary }
                  ]}
                  onPress={() => setTheme('dark')}
                >
                  <Ionicons 
                    name="moon" 
                    size={24} 
                    color={theme === 'dark' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'dark' ? colors.primary : colors.text }
                  ]}>
                    Dark
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    theme === 'system' && { borderColor: colors.primary }
                  ]}
                  onPress={() => setTheme('system')}
                >
                  <Ionicons 
                    name="desktop" 
                    size={24} 
                    color={theme === 'system' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'system' ? colors.primary : colors.text }
                  ]}>
                    System
                  </Text>
                </TouchableOpacity>
              </View>

              {theme === 'system' && (
                <View style={[styles.systemInfo, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.systemInfoText, { color: colors.textSecondary }]}>
                    Currently using {resolvedTheme} mode based on your system preference
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.primary }]}
              onPress={testNotification}
            >
              <Text style={styles.testButtonText}>Test Notification</Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Push Notifications</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Get notified about phase transitions and milestones
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Sound</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Play sound for notifications
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={soundEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Vibration</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Vibrate on mobile devices
                  </Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={vibrationEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            </View>
            
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.appInfo}>
                <View style={[styles.appIcon, { backgroundColor: colors.primary }]}>
                  <Text style={styles.appIconText}>H₂F</Text>
                </View>
                <View>
                  <Text style={[styles.appName, { color: colors.text }]}>H2Flow</Text>
                  <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
                    Extended Water Fasting Tracker
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Theme</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {theme} {theme === 'system' && `(${resolvedTheme})`}
                </Text>
              </View>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.section}>
            <View style={[styles.legalLinks, { borderTopColor: colors.border }]}>
              <TouchableOpacity onPress={openPrivacyPolicy}>
                <Text style={[styles.legalLink, { color: colors.primary }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openTermsOfService}>
                <Text style={[styles.legalLink, { color: colors.primary }]}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  themeOption: {
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  systemInfo: {
    padding: 12,
    borderRadius: 8,
  },
  systemInfoText: {
    fontSize: 12,
  },
  testButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  appDescription: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  legalLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsScreen;
