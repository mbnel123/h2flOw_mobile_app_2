import React, { useState, useEffect, useRef } from 'react';
import SwipeNavigator from './SwipeNavigator';
import { ArrowLeft, Droplets, Plus, Minus, Bell, BellRing, Clock, BellOff, Smartphone } from 'lucide-react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/authService';
import { getCurrentFast, addWaterIntake, Fast } from '../firebase/databaseService';
import { notificationService } from '../services/notificationService.ts';

interface WaterViewProps {
  setCurrentView: (view: string) => void;
}

const WaterView: React.FC<WaterViewProps> = ({ setCurrentView }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentFast, setCurrentFast] = useState<Fast | null>(null);
  const [dailyWaterIntake, setDailyWaterIntake] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(60); // minutes
  const [lastReminderTime, setLastReminderTime] = useState<Date | null>(null);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [scheduledReminders, setScheduledReminders] = useState<string[]>([]);
  const [nextReminderTime, setNextReminderTime] = useState<Date | null>(null);

  // Refs for cleanup
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setCurrentView('auth');
      } else {
        loadCurrentFast(user.uid);
      }
    });

    return () => unsubscribe();
  }, [setCurrentView]);

  // Initialize notification service
  useEffect(() => {
    setNotificationPermission(notificationService.getPermissionStatus());
    
    // Listen for navigation events from notifications
    const handleNavigateToWater = () => {
      setCurrentView('water');
    };

    window.addEventListener('navigate_to_water', handleNavigateToWater);
    
    return () => {
      window.removeEventListener('navigate_to_water', handleNavigateToWater);
    };
  }, [setCurrentView]);

  // Setup reminder system when enabled
  useEffect(() => {
    if (remindersEnabled && notificationPermission === 'granted') {
      setupWaterReminders();
    } else {
      clearWaterReminders();
    }

    return () => clearWaterReminders();
  }, [remindersEnabled, reminderInterval, notificationPermission]);

  // Load current active fast
  const loadCurrentFast = async (userId: string) => {
    try {
      const { fast, error } = await getCurrentFast(userId);
      if (error) {
        console.error('Error loading fast:', error);
        setError(error);
      } else {
        setCurrentFast(fast);
        if (fast && fast.waterIntake) {
          const totalWater = fast.waterIntake.reduce((total, entry) => total + entry.amount, 0);
          setDailyWaterIntake(totalWater);
        }
      }
    } catch (err) {
      console.error('Error loading fast:', err);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setRemindersEnabled(true);
      } else {
        setRemindersEnabled(false);
        setError(permission === 'denied' 
          ? 'Notifications blocked. Enable in browser settings to use reminders.'
          : 'Notification permission needed for reminders.'
        );
      }
    } catch (err) {
      setError('Failed to request notification permission');
    }
  };

  // Setup recurring water reminders
  const setupWaterReminders = () => {
    clearWaterReminders();
    
    if (!remindersEnabled || notificationPermission !== 'granted') return;

    console.log('💧 Setting up water reminders every', reminderInterval, 'minutes');

    // Schedule first reminder
    const scheduleNextReminder = () => {
      const nextTime = new Date(Date.now() + reminderInterval * 60 * 1000);
      setNextReminderTime(nextTime);
      
      const reminderId = notificationService.scheduleWaterReminder(reminderInterval);
      setScheduledReminders(prev => [...prev, reminderId]);
      
      console.log('⏰ Next water reminder scheduled for:', nextTime.toLocaleTimeString());
    };

    // Set up recurring reminders
    scheduleNextReminder();
    
    reminderIntervalRef.current = setInterval(() => {
      scheduleNextReminder();
    }, reminderInterval * 60 * 1000);
  };

  // Clear all water reminders
  const clearWaterReminders = () => {
    console.log('🗑️ Clearing water reminders');
    
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }

    // Cancel all scheduled notifications
    scheduledReminders.forEach(id => {
      notificationService.cancelScheduledNotification(id);
    });
    
    setScheduledReminders([]);
    setNextReminderTime(null);
  };

  // Send immediate hydration check notification
  const sendHydrationCheck = () => {
    const deficit = getWaterDeficit();
    const isOnTrack = deficit <= 500;
    
    const success = notificationService.sendNotification({
      title: isOnTrack ? '💧 Great Hydration!' : '💧 Hydration Check',
      body: isOnTrack 
        ? `You're doing great! ${dailyWaterIntake}ml logged today.`
        : `You need ${deficit}ml more water today. ${isActive ? 'Stay hydrated during your fast!' : 'Keep up your hydration!'}`,
      icon: '/favicon.ico',
      tag: 'hydration_check',
      data: { 
        action: 'open_water_view',
        type: 'hydration_check'
      },
      requireInteraction: !isOnTrack
    });

    if (success) {
      setLastReminderTime(new Date());
    } else {
      setError('Failed to send notification. Check browser permissions.');
    }
  };

  const addWater = async (amount: number) => {
    // Optimistically update UI first
    setDailyWaterIntake(prev => prev + amount);
    
    // Send congratulatory notification for milestones
    const newTotal = dailyWaterIntake + amount;
    const milestones = [500, 1000, 1500, 2000, 2500];
    const crossedMilestone = milestones.find(milestone => 
      dailyWaterIntake < milestone && newTotal >= milestone
    );
    
    if (crossedMilestone && notificationPermission === 'granted') {
      notificationService.sendNotification({
        title: '🎉 Hydration Milestone!',
        body: `Great job! You've reached ${crossedMilestone}ml today.`,
        icon: '/favicon.ico',
        tag: `milestone_${crossedMilestone}`,
        requireInteraction: false
      });
    }
    
    if (!currentFast || !currentFast.id) {
      setError('Start a fast to track water intake in Firebase');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await addWaterIntake(currentFast.id, amount);
      if (error) {
        // Revert optimistic update on error
        setDailyWaterIntake(prev => prev - amount);
        setError(error);
      } else {
        setLastSaved(new Date());
        setTimeout(() => loadCurrentFast(user!.uid), 1000);
      }
    } catch (err) {
      setDailyWaterIntake(prev => prev - amount);
      setError('Failed to add water');
    }
    
    setLoading(false);
  };

  const removeWater = (amount: number) => {
    setDailyWaterIntake(prev => Math.max(0, prev - amount));
  };

  const toggleReminders = async () => {
    if (!remindersEnabled && notificationPermission !== 'granted') {
      await requestNotificationPermission();
    } else {
      setRemindersEnabled(!remindersEnabled);
    }
  };

  const isActive = currentFast?.status === 'active';
  const waterGoal = 2500;
  const getWaterPercentage = () => Math.min((dailyWaterIntake / waterGoal) * 100, 100);

  // Calculate recommended water intake based on fasting status
  const getRecommendedIntake = () => {
    if (isActive) {
      return "2500-3000ml";
    }
    return "2000-2500ml";
  };

  // Calculate water deficit
  const getWaterDeficit = () => {
    const target = isActive ? 2750 : 2250;
    const deficit = target - dailyWaterIntake;
    return deficit > 0 ? deficit : 0;
  };

  // Check if reminder is due (for UI display)
  const isReminderDue = () => {
    if (!remindersEnabled || !lastReminderTime) return false;
    const now = new Date();
    const minutesSinceLastReminder = (now.getTime() - lastReminderTime.getTime()) / (1000 * 60);
    return minutesSinceLastReminder >= reminderInterval;
  };

  // Get time until next reminder
  const getTimeUntilNextReminder = () => {
    if (!nextReminderTime) return null;
    
    const now = new Date();
    const diff = nextReminderTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Soon';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Hydration status
  const getHydrationStatus = () => {
    const percentage = getWaterPercentage();
    const target = isActive ? 2750 : 2250;
    
    if (dailyWaterIntake >= target) {
      return { status: 'excellent', color: 'green', message: 'Excellent hydration!' };
    } else if (percentage >= 75) {
      return { status: 'good', color: 'blue', message: 'Good hydration level' };
    } else if (percentage >= 50) {
      return { status: 'moderate', color: 'yellow', message: 'Need more water' };
    } else {
      return { status: 'low', color: 'red', message: 'Hydration too low!' };
    }
  };

  const hydrationStatus = getHydrationStatus();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-600">Please log in to track water intake</p>
        </div>
      </div>
    );
  }

  return (
    <SwipeNavigator
      onSwipeLeft={() => setCurrentView('settings')}
      onSwipeRight={() => setCurrentView('info')}
    >
      <div className="min-h-screen bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => setCurrentView('timer')} className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-medium text-gray-800">Water Intake & Reminders</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-800 hover:text-red-900 text-xs mt-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="p-6">
        {/* Notification Permission Banner */}
        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="font-medium text-yellow-800">Enable Notifications</h3>
                  <p className="text-yellow-700 text-sm">Get reminders to stay hydrated during your fast</p>
                </div>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
              >
                Enable
              </button>
            </div>
          </div>
        )}

        {/* Fasting Status Alert */}
        {isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <Droplets className="w-5 h-5 mr-2" />
              Fasting Mode Active
            </h3>
            <p className="text-blue-700 text-sm">
              During fasting, maintain 2.5-3L daily intake. Add a pinch of sea salt for electrolyte balance.
            </p>
          </div>
        )}

        {/* Water Progress Circle */}
        <div className="text-center mb-8">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" stroke="#e5e7eb" strokeWidth="12" fill="transparent" />
              <circle
                cx="100" cy="100" r="80" stroke={
                  hydrationStatus.color === 'green' ? '#10b981' :
                  hydrationStatus.color === 'blue' ? '#3b82f6' :
                  hydrationStatus.color === 'yellow' ? '#f59e0b' : '#ef4444'
                } strokeWidth="12" fill="transparent"
                strokeDasharray={502} strokeDashoffset={502 - (getWaterPercentage() / 100) * 502}
                strokeLinecap="round" className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Droplets className={`w-8 h-8 mx-auto mb-2 ${
                  hydrationStatus.color === 'green' ? 'text-green-600' :
                  hydrationStatus.color === 'blue' ? 'text-blue-600' :
                  hydrationStatus.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <div className="text-2xl font-bold text-gray-800">{Math.round(dailyWaterIntake)}ml</div>
                <div className="text-sm text-gray-600">of {waterGoal}ml</div>
                <div className={`text-xs font-medium mt-1 ${
                  hydrationStatus.color === 'green' ? 'text-green-600' :
                  hydrationStatus.color === 'blue' ? 'text-blue-600' :
                  hydrationStatus.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {hydrationStatus.message}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Recommended</div>
            <div className="text-lg font-semibold text-gray-800">{getRecommendedIntake()}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Still needed</div>
            <div className="text-lg font-semibold text-gray-800">{getWaterDeficit()}ml</div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[250, 500, 750].map(amount => (
            <button
              key={amount}
              onClick={() => addWater(amount)}
              disabled={loading}
              className="bg-blue-50 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              +{amount}ml
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-3">Add Custom Amount</h3>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => addWater(100)} 
              disabled={loading}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-lg font-medium">100ml</span>
            <button 
              onClick={() => removeWater(100)} 
              disabled={loading}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Reminder Settings */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-blue-800 flex items-center">
              {remindersEnabled ? (
                <Bell className="w-5 h-5 mr-2" />
              ) : (
                <BellOff className="w-5 h-5 mr-2" />
              )}
              Push Notifications
            </h3>
            <button
              onClick={() => setShowReminderSettings(!showReminderSettings)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showReminderSettings ? 'Hide' : 'Setup'}
            </button>
          </div>

          {/* Notification Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Status:</span>
              <div className="flex items-center">
                {notificationPermission === 'granted' ? (
                  <span className="text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Enabled
                  </span>
                ) : (
                  <span className="text-orange-600 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    {notificationPermission === 'denied' ? 'Blocked' : 'Disabled'}
                  </span>
                )}
              </div>
            </div>
            
            {remindersEnabled && nextReminderTime && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-blue-700">Next reminder:</span>
                <span className="text-blue-600">{getTimeUntilNextReminder()}</span>
              </div>
            )}
          </div>

          {showReminderSettings && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 text-sm">Enable reminders</span>
                <button
                  onClick={toggleReminders}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    remindersEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {notificationPermission === 'granted' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Reminder Interval
                    </label>
                    <select
                      value={reminderInterval}
                      onChange={(e) => setReminderInterval(Number(e.target.value))}
                      className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value={30}>Every 30 minutes</option>
                      <option value={60}>Every 1 hour</option>
                      <option value={90}>Every 1.5 hours</option>
                      <option value={120}>Every 2 hours</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={sendHydrationCheck}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Test Notification
                    </button>
                    
                    {lastReminderTime && (
                      <div className="flex-1 bg-gray-100 py-2 px-3 rounded-lg text-center">
                        <div className="text-xs text-gray-600 flex items-center justify-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Last: {lastReminderTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )}
                  </div>

                  {scheduledReminders.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-green-800 text-sm font-medium">
                        ✅ {scheduledReminders.length} reminder{scheduledReminders.length !== 1 ? 's' : ''} scheduled
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Current Fast Water Tracking */}
        {currentFast && currentFast.waterIntake && currentFast.waterIntake.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-green-800">Today's Water Log</h3>
              {lastSaved && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Saved {lastSaved.toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentFast.waterIntake.slice(-5).map((entry, index) => (
                <div key={entry.id || index} className="flex justify-between items-center text-sm">
                  <span className="text-green-700">
                    {new Date(entry.timestamp).toLocaleTimeString('nl-NL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="text-green-800 font-medium">{entry.amount}ml</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hydration Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">💧 Smart Hydration Tips</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Drink consistently throughout the day</li>
            <li>• {isActive ? 'Add electrolytes (pinch of salt) for fasts 24h+' : 'Monitor urine color for hydration status'}</li>
            <li>• Room temperature water is easier to digest</li>
            <li>• {isActive ? 'Stop fasting if severely dehydrated' : 'Increase intake during exercise or hot weather'}</li>
            {isActive && <li>• Break fast immediately if you cannot keep water down</li>}
          </ul>
        </div>
      </div>
    </div>
    </SwipeNavigator>
  );
};

export default WaterView;
