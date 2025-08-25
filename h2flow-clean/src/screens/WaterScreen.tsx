import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChange } from '../firebase/authService';
import { getCurrentFast, addWaterIntake, Fast } from '../firebase/databaseService';

interface WaterEntry { id?: string; amount: number; timestamp: number | Date; }

const colors = {
  light: {
    primary: '#7DD3FC', // Babyblauw zoals in TimerScreen
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    gradient: ['#F9FAFB', '#F3F4F6', '#F9FAFB'] as const,
  },
  dark: {
    primary: '#7DD3FC', // Babyblauw zoals in TimerScreen
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    gradient: ['#111827', '#1F2937', '#111827'] as const,
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const WATER_GOAL = 2500;

const ring = {
  size: 200,
  stroke: 12,
  r: 80,
  cx: 100,
  cy: 100,
  circumference: 2 * Math.PI * 80,
};

const WaterScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const [userId, setUserId] = useState<string | null>(null);
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [dailyWaterIntake, setDailyWaterIntake] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>('undetermined');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState<number>(60);
  const scheduledIdRef = useRef<string | null>(null);
  const nextReminderRef = useRef<Date | null>(null);

  // ✅ Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const fast = await getCurrentFast(user.uid);
          setCurrentFast(fast ?? null);
        } catch (e) {
          console.warn('Failed to fetch fast', e);
        }
      } else {
        setUserId(null);
        setCurrentFast(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const prepare = async () => {
      const settings = await Notifications.getPermissionsAsync();
      setPermissionStatus(settings.status);
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('water', {
          name: 'Hydration reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };
    prepare();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!Device.isDevice) {
      Alert.alert('Simulated device', 'Push notifications require a physical device to fully test.');
    }
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status !== 'granted') {
      Alert.alert('Machtiging vereist', 'Sta meldingen toe in de systeeminstellingen om herinneringen te gebruiken.');
      setRemindersEnabled(false);
    } else {
      setRemindersEnabled(true);
    }
  }, []);

  const scheduleRepeatingReminder = useCallback(async (minutes: number) => {
    if (scheduledIdRef.current) {
      try { await Notifications.cancelScheduledNotificationAsync(scheduledIdRef.current); } catch {}
      scheduledIdRef.current = null;
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: '💧 Tijd om water te drinken', body: 'Blijf gehydrateerd!' },
      trigger: { seconds: minutes * 60, repeats: true },
    });
    scheduledIdRef.current = id;
    nextReminderRef.current = new Date(Date.now() + minutes * 60 * 1000);
  }, []);

  useEffect(() => {
    if (remindersEnabled && permissionStatus === 'granted') {
      scheduleRepeatingReminder(reminderInterval);
    } else if (!remindersEnabled && scheduledIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(scheduledIdRef.current).catch(() => {});
      scheduledIdRef.current = null;
    }
  }, [remindersEnabled, reminderInterval, permissionStatus, scheduleRepeatingReminder]);

  const addWater = useCallback(async (amount: number) => {
    if (!userId || !currentFast) return;
    setLoading(true);
    try {
      await addWaterIntake(currentFast.id, amount);
      setDailyWaterIntake(prev => prev + amount);
      setLastSaved(new Date());
    } catch (e) {
      console.error('Error saving water intake', e);
      setError('Kon inname niet opslaan');
    } finally {
      setLoading(false);
    }
  }, [userId, currentFast]);

  const progress = useMemo(() => Math.min(dailyWaterIntake / WATER_GOAL, 1), [dailyWaterIntake]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="water" size={32} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Water Tracking</Text>
        </View>
        
        {error && <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error}</Text>}

        <View style={styles.progressContainer}>
          <Svg width={ring.size} height={ring.size}>
            <Circle cx={ring.cx} cy={ring.cy} r={ring.r} stroke={theme.backgroundSecondary} strokeWidth={ring.stroke} fill="none" />
            <Circle
              cx={ring.cx} cy={ring.cy} r={ring.r}
              stroke={theme.primary} strokeWidth={ring.stroke} fill="none"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.circumference * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 ${ring.cx} ${ring.cy})`}
            />
          </Svg>
          <Text style={[styles.waterAmount, { color: theme.text }]}>{dailyWaterIntake}ml</Text>
          <Text style={[styles.waterGoal, { color: theme.textSecondary }]}>van de {WATER_GOAL}ml doel</Text>
        </View>

        <View style={styles.buttonRow}>
          {[250, 500, 750].map(ml => (
            <TouchableOpacity 
              key={ml} 
              style={[styles.waterButton, { backgroundColor: theme.primary }]} 
              onPress={() => addWater(ml)} 
              disabled={loading}
            >
              <Text style={styles.waterButtonText}>+{ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {lastSaved && (
          <Text style={[styles.lastSaved, { color: theme.textSecondary }]}>
            Laatst opgeslagen: {lastSaved.toLocaleTimeString()}
          </Text>
        )}

        <View style={styles.remindersSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color={theme.text} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Herinneringen</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.reminderButton, { 
              backgroundColor: remindersEnabled ? theme.primary : 'transparent',
              borderColor: theme.primary,
              borderWidth: 1
            }]}
            onPress={remindersEnabled ? () => setRemindersEnabled(false) : requestPermission}
          >
            <Ionicons 
              name={remindersEnabled ? "notifications" : "notifications-off"} 
              size={20} 
              color={remindersEnabled ? 'white' : theme.primary} 
            />
            <Text style={[
              styles.reminderButtonText, 
              { color: remindersEnabled ? 'white' : theme.primary }
            ]}>
              {remindersEnabled ? 'Ingeschakeld' : 'Inschakelen'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginLeft: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  waterGoal: {
    fontSize: 16,
    marginTop: 4,
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 24,
  },
  waterButton: { 
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  waterButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  lastSaved: {
    fontSize: 14,
    marginBottom: 32,
  },
  remindersSection: {
    width: '100%',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  reminderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WaterScreen;
