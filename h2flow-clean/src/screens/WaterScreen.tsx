import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Svg, { Circle } from 'react-native-svg';
import { onAuthStateChange } from '../firebase/authService';
import { getCurrentFast, addWaterIntake, Fast } from '../firebase/databaseService';

interface WaterEntry { id?: string; amount: number; timestamp: number | Date; }

const colors = {
  light: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    card: '#F3F4F6',
    gradient: ['#F9FAFB', '#F3F4F6', '#F9FAFB'] as const,
  },
  dark: {
    primary: '#3B82F6',
    background: '#111827',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    card: '#1F2937',
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.gradient[0] }]}>
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>💧 Water Tracking</Text>
          {error && <Text style={{ color: 'red' }}>{error}</Text>}

          <Svg width={ring.size} height={ring.size}>
            <Circle cx={ring.cx} cy={ring.cy} r={ring.r} stroke={theme.card} strokeWidth={ring.stroke} fill="none" />
            <Circle
              cx={ring.cx} cy={ring.cy} r={ring.r}
              stroke={theme.primary} strokeWidth={ring.stroke} fill="none"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.circumference * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 ${ring.cx} ${ring.cy})`}
            />
          </Svg>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{dailyWaterIntake} / {WATER_GOAL} ml</Text>

          <View style={styles.buttonRow}>
            {[250, 500, 750].map(ml => (
              <TouchableOpacity key={ml} style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => addWater(ml)} disabled={loading}>
                <Text style={styles.buttonText}>+{ml}ml</Text>
              </TouchableOpacity>
            ))}
          </View>

          {lastSaved && <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Laatst opgeslagen: {lastSaved.toLocaleTimeString()}</Text>}

          <View style={{ marginTop: 24 }}>
            <Text style={[styles.subtitle, { color: theme.text }]}>Herinneringen</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: remindersEnabled ? theme.primary : theme.card }]}
              onPress={remindersEnabled ? () => setRemindersEnabled(false) : requestPermission}
            >
              <Text style={styles.buttonText}>{remindersEnabled ? 'Herinneringen uitzetten' : 'Herinneringen aanzetten'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 18, textAlign: 'center', marginVertical: 8 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, minWidth: 100, alignItems: 'center', marginHorizontal: 4 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

export default WaterScreen;
