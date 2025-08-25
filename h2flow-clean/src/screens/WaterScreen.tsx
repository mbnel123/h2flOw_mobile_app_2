// src/screens/WaterScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Svg, { Circle } from 'react-native-svg';

// If you already have these in RN, keep the imports; otherwise stub or wire later
// import { onAuthStateChange } from '../firebase/authService';
// import { getCurrentFast, addWaterIntake, Fast } from '../firebase/databaseService';

// ---- Types (keep in sync with your Firebase layer) ----
interface WaterEntry { id?: string; amount: number; timestamp: number | Date; }
interface Fast { id: string; status: 'active' | 'paused' | 'completed'; waterIntake?: WaterEntry[]; }

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

// Configure how notifications behave when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const WATER_GOAL = 2500; // ml

const ring = {
  size: 200,
  stroke: 12,
  r: 80,
  cx: 100,
  cy: 100,
  circumference: 2 * Math.PI * 80,
};

const WaterScreen: React.FC<{
  navigation?: any; // optional react-navigation
}> = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  // ---- State ----
  const [userId, setUserId] = useState<string | null>(null);
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [dailyWaterIntake, setDailyWaterIntake] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Notifications
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>('undetermined');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState<number>(60); // minutes
  const scheduledIdRef = useRef<string | null>(null);
  const nextReminderRef = useRef<Date | null>(null);

  // ---- EFFECT: auth & initial load (replace with your own auth listener) ----
  useEffect(() => {
    // If you already have onAuthStateChange in RN, swap this block for it.
    // For now we simulate a signed-in session to let the screen work in isolation.
    const fakeUserId = 'demo-user';
    setUserId(fakeUserId);
    // Load fast from your backend. Replace with: const { fast } = await getCurrentFast(fakeUserId)
    const initialFast: Fast = { id: 'fast-1', status: 'active', waterIntake: [] };
    setCurrentFast(initialFast);
  }, []);

  // ---- EFFECT: check & request notification permissions on mount (optional lazy) ----
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

  // ---- Notification helpers ----
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
    // Cancel previous
    if (scheduledIdRef.current) {
      try { await Notifications.cancelScheduledNotificationAsync(scheduledIdRef.current); } catch {}
      scheduledIdRef.current = null;
    }

    // Expo supports repeating triggers via seconds + repeats
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Water Reminder',
        body: 'Tijd om water te drinken! Blijf gehydrateerd.',
        sound: false,
      },
      trigger: {
        channelId: Platform.OS === 'android' ? 'water' : undefined,
        seconds: minutes * 60,
        repeats: true,
      },
    });
    scheduledIdRef.current = id;
    nextReminderRef.current = new Date(Date.now() + minutes * 60 * 1000);
  }, []);

  const cancelReminder = useCallback(async () => {
    if (scheduledIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(scheduledIdRef.current);
      scheduledIdRef.current = null;
    }
    nextReminderRef.current = null;
  }, []);

  const sendImmediateHydrationCheck = useCallback(async () => {
    const deficit = getWaterDeficit();
    const isOnTrack = deficit <= 500;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isOnTrack ? '💧 Top hydratatie!' : '💧 Hydratatie check',
        body: isOnTrack
          ? `Lekker bezig! Vandaag al ${dailyWaterIntake}ml.`
          : `Je mist nog ${deficit}ml vandaag. ${isActive ? 'Blijf drinken tijdens je fast!' : 'Goed bezig, nog even volhouden!'}`,
      },
      trigger: null, // immediate
    });
  }, [dailyWaterIntake, currentFast]);

  // Handle responses (tap on notification)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      // Navigate to Water screen if you have a navigator
      if (navigation?.navigate) navigation.navigate('Water');
    });
    return () => sub.remove();
  }, [navigation]);

  // Toggle reminders + react to interval changes
  useEffect(() => {
    const update = async () => {
      if (!remindersEnabled) { await cancelReminder(); return; }
      if (permissionStatus !== 'granted') { await requestPermission(); return; }
      await scheduleRepeatingReminder(reminderInterval);
    };
    update();
  }, [remindersEnabled, reminderInterval, permissionStatus, requestPermission, scheduleRepeatingReminder, cancelReminder]);

  // ---- Derived helpers ----
  const isActive = currentFast?.status === 'active';
  const waterPercentage = useMemo(() => Math.min((dailyWaterIntake / WATER_GOAL) * 100, 100), [dailyWaterIntake]);

  const getRecommendedIntake = () => (isActive ? '2500-3000ml' : '2000-2500ml');
  const getWaterDeficit = () => {
    const target = isActive ? 2750 : 2250;
    const deficit = target - dailyWaterIntake;
    return deficit > 0 ? deficit : 0;
  };

  const hydrationStatus = useMemo(() => {
    const percentage = waterPercentage;
    const target = isActive ? 2750 : 2250;
    if (dailyWaterIntake >= target) return { status: 'excellent', color: '#10b981', label: 'Uitstekende hydratatie!' };
    if (percentage >= 75) return { status: 'good', color: '#3b82f6', label: 'Goed bezig' };
    if (percentage >= 50) return { status: 'moderate', color: '#f59e0b', label: 'Nog wat nodig' };
    return { status: 'low', color: '#ef4444', label: 'Te laag!' };
  }, [waterPercentage, dailyWaterIntake, isActive]);

  const timeUntilNext = () => {
    if (!nextReminderRef.current) return null;
    const diff = nextReminderRef.current.getTime() - Date.now();
    if (diff <= 0) return 'Zo';
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}u ${minutes % 60}m` : `${minutes}m`;
  };

  // ---- Actions ----
  const addWater = async (amount: number) => {
    setDailyWaterIntake((prev) => prev + amount);

    const newTotal = dailyWaterIntake + amount;
    const milestones = [500, 1000, 1500, 2000, 2500];
    const crossed = milestones.find((m) => dailyWaterIntake < m && newTotal >= m);
    if (crossed && permissionStatus === 'granted') {
      await Notifications.scheduleNotificationAsync({
        content: { title: '🎉 Hydratatie mijlpaal!', body: `Je hebt ${crossed}ml bereikt vandaag.` },
        trigger: null,
      });
    }

    if (!currentFast?.id) { setError('Start een fast om water in Firebase op te slaan'); return; }

    setLoading(true);
    try {
      // await addWaterIntake(currentFast.id, amount);
      // Simulate save success
      setTimeout(() => setLastSaved(new Date()), 300);
    } catch (e: any) {
      // revert on error
      setDailyWaterIntake((prev) => Math.max(0, prev - amount));
      setError('Opslaan mislukt');
    } finally {
      setLoading(false);
    }
  };

  const removeWater = (amount: number) => setDailyWaterIntake((prev) => Math.max(0, prev - amount));

  // ---- UI ----
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.gradient[0] }]}>    
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}> 
            <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
              <Text style={[styles.backIcon, { color: theme.text }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>💧 Water & Herinneringen</Text>
          </View>

          {/* Alerts */}
          {permissionStatus !== 'granted' && (
            <View style={[styles.banner, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}> 
              <Text style={[styles.bannerTitle, { color: '#92400E' }]}>Notificaties inschakelen</Text>
              <Text style={[styles.bannerText, { color: '#B45309' }]}>Krijg herinneringen om gehydrateerd te blijven</Text>
              <TouchableOpacity style={[styles.bannerBtn]} onPress={requestPermission}>
                <Text style={styles.bannerBtnText}>Inschakelen</Text>
              </TouchableOpacity>
            </View>
          )}

          {isActive && (
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1E3A8A22' : '#DBEAFE' }]}> 
              <Text style={[styles.infoTitle, { color: theme.text }]}>Fasting modus actief</Text>
              <Text style={{ color: theme.textSecondary }}>Tijdens het vasten: 2.5–3L per dag. Een snufje zeezout helpt elektrolyten.</Text>
            </View>
          )}

          {/* Progress Ring */}
          <View style={styles.center}>
            <View style={{ width: ring.size, height: ring.size }}>
              <Svg width={ring.size} height={ring.size} viewBox="0 0 200 200" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={ring.cx} cy={ring.cy} r={ring.r} stroke={isDark ? '#334155' : '#E5E7EB'} strokeWidth={ring.stroke} fill="transparent" />
                <Circle
                  cx={ring.cx}
                  cy={ring.cy}
                  r={ring.r}
                  stroke={hydrationStatus.color}
                  strokeWidth={ring.stroke}
                  fill="transparent"
                  strokeDasharray={ring.circumference}
                  strokeDashoffset={ring.circumference - (waterPercentage / 100) * ring.circumference}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.ringLabelWrap}>
                <Text style={[styles.mainValue, { color: theme.text }]}>{Math.round(dailyWaterIntake)}ml</Text>
                <Text style={[styles.subtle, { color: theme.textSecondary }]}>van {WATER_GOAL}ml</Text>
                <Text style={[styles.statusText, { color: hydrationStatus.color }]}>{hydrationStatus.label}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.row}> 
            <View style={[styles.card, { backgroundColor: theme.card }]}> 
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Aanbevolen</Text>
              <Text style={[styles.cardValue, { color: theme.text }]}>{getRecommendedIntake()}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.card }]}> 
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Nog nodig</Text>
              <Text style={[styles.cardValue, { color: theme.text }]}>{getWaterDeficit()}ml</Text>
            </View>
          </View>

          {/* Quick add */}
          <View style={styles.row}>
            {[250, 500, 750].map((amt) => (
              <TouchableOpacity key={amt} style={[styles.quickBtn, { backgroundColor: '#DBEAFE' }]} onPress={() => addWater(amt)} disabled={loading}>
                <Text style={[styles.quickBtnText, { color: '#1D4ED8' }]}>+{amt}ml</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom amount */}
          <View style={[styles.card, { backgroundColor: theme.card }]}> 
            <Text style={[styles.cardTitle, { color: theme.text }]}>Aangepaste hoeveelheid</Text>
            <View style={styles.customRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => addWater(100)} disabled={loading}><Text style={styles.stepTxt}>+100</Text></TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => removeWater(100)} disabled={loading}><Text style={styles.stepTxt}>-100</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.testBtn]} onPress={sendImmediateHydrationCheck}>
                <Text style={styles.testTxt}>Test notificatie</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reminders */}
          <View style={[styles.card, { backgroundColor: isDark ? '#0EA5E922' : '#EFF6FF', borderColor: isDark ? '#0EA5E955' : '#BFDBFE', borderWidth: 1 }]}> 
            <View style={styles.reminderHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Push notificaties</Text>
              <TouchableOpacity onPress={() => setRemindersEnabled((v) => !v)} style={[styles.toggle, { backgroundColor: remindersEnabled ? theme.primary : '#9CA3AF' }]}> 
                <View style={[styles.thumb, { left: remindersEnabled ? 22 : 2 }]} />
              </TouchableOpacity>
            </View>

            {permissionStatus === 'granted' && (
              <>
                <View style={styles.intervalRow}>
                  {([30, 60, 90, 120] as number[]).map((m) => (
                    <TouchableOpacity key={m} onPress={() => setReminderInterval(m)} style={[styles.intervalBtn, { borderColor: reminderInterval === m ? theme.primary : '#CBD5E1', backgroundColor: reminderInterval === m ? (isDark ? '#1E40AF33' : '#DBEAFE') : 'transparent' }]}>
                      <Text style={{ color: reminderInterval === m ? theme.primary : theme.text }}>{m === 30 ? 'Elke 30m' : m === 60 ? 'Elke 1u' : m === 90 ? 'Elke 1.5u' : 'Elke 2u'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {remindersEnabled && (
                  <Text style={[styles.subtle, { color: theme.textSecondary, marginTop: 6 }]}>Volgende herinnering: {timeUntilNext() ?? '—'}</Text>
                )}
              </>
            )}
          </View>

          {/* Tips */}
          <View style={[styles.card, { backgroundColor: isDark ? '#DCFCE733' : '#ECFDF5', borderColor: isDark ? '#22C55E55' : '#BBF7D0', borderWidth: 1 }]}> 
            <Text style={[styles.cardTitle, { color: theme.text }]}>💧 Hydratatietips</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 6 }}>• Drink gespreid over de dag</Text>
            <Text style={{ color: theme.textSecondary }}>• {isActive ? 'Elektrolyten (snufje zout) bij fasts 24h+' : 'Let op urinekleur'}</Text>
            <Text style={{ color: theme.textSecondary }}>• Kamertemperatuur drinkt vaak makkelijker</Text>
            <Text style={{ color: theme.textSecondary }}>• {isActive ? 'Stop met vasten bij ernstige dehydratie' : 'Meer drinken bij sporten/warmte'}</Text>
          </View>

          {!!error && (
            <View style={[styles.banner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}> 
              <Text style={[styles.bannerText, { color: '#991B1B' }]}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)} style={[styles.bannerBtn, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.bannerBtnText}>Sluiten</Text>
              </TouchableOpacity>
            </View>
          )}

          {!!lastSaved && (
            <Text style={[styles.subtle, { textAlign: 'center', marginTop: 8, color: theme.textSecondary }]}>Opgeslagen om {lastSaved.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</Text>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { paddingVertical: 6, paddingRight: 10, paddingLeft: 0 },
  backIcon: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '700', marginLeft: 4 },

  banner: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  bannerTitle: { fontWeight: '600', fontSize: 16, marginBottom: 2 },
  bannerText: { fontSize: 13, marginBottom: 8 },
  bannerBtn: { alignSelf: 'flex-start', backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  bannerBtnText: { color: 'white', fontWeight: '600' },

  infoCard: { borderRadius: 12, padding: 12, marginBottom: 12 },

  center: { alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  ringLabelWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  mainValue: { fontSize: 28, fontWeight: '800' },
  subtle: { fontSize: 12 },
  statusText: { marginTop: 4, fontWeight: '700' },

  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  card: { flex: 1, borderRadius: 14, padding: 14 },
  cardLabel: { fontSize: 12, marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  quickBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  quickBtnText: { fontWeight: '700', fontSize: 16 },

  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  stepBtn: { backgroundColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  stepTxt: { fontWeight: '700' },
  testBtn: { marginLeft: 'auto', backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  testTxt: { color: 'white', fontWeight: '700' },

  reminderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { width: 44, height: 24, borderRadius: 999, justifyContent: 'center' },
  thumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', top: 2 },

  intervalRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  intervalBtn: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderRadius: 10 },
});

export default WaterScreen;
