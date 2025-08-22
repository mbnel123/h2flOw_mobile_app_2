// src/services/notificationService.ts

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface ScheduledNotification {
  id: string;
  scheduledTime: Date;
  options: NotificationOptions;
  type: 'water_reminder' | 'phase_transition' | 'fast_complete' | 'custom';
}

class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private permission: NotificationPermission = 'default';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.permission = this.getPermissionStatus();
    this.setupMessageListener();
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('🔔 Notifications not supported in this browser');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        this.sendTestNotification();
      } else if (permission === 'denied') {
        console.log('❌ Notification permission denied');
      } else {
        console.log('⏳ Notification permission dismissed');
      }
      
      return permission;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Send test notification
  private sendTestNotification(): void {
    this.sendNotification({
      title: '🎉 H2Flow Notifications Enabled!',
      body: 'You\'ll now receive water reminders and fasting phase updates.',
      icon: '/favicon.ico',
      tag: 'setup_complete',
      requireInteraction: false
    });
  }

  // Send immediate notification (browser or native)
  sendNotification(options: NotificationOptions): boolean {
    // TODO: Detect platform (web, iOS, Android) and delegate to correct implementation
    // For web: use browser Notification API
    // For native: integrate with FCM via Capacitor/React Native
    // Example:
    // if (window.Capacitor) {
    //   // Call native push implementation
    //   // window.Capacitor.Plugins.PushNotifications.schedule(...)
    //   return true;
    // }

    if (!this.isSupported() || this.permission !== 'granted') {
      console.warn('🔔 Cannot send notification - no permission or not supported');
      return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Add click handler
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle specific notification types
        if (options.data?.action) {
          this.handleNotificationClick(options.data.action, options.data);
        }
      };

      console.log('✅ Notification sent:', options.title);
      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  }

  // Schedule a notification
  scheduleNotification(notification: ScheduledNotification): string {
    const now = new Date();
    const delay = notification.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Send immediately if scheduled time is in the past
      this.sendNotification(notification.options);
      return notification.id;
    }

    const timeoutId = setTimeout(() => {
      this.sendNotification(notification.options);
      this.scheduledNotifications.delete(notification.id);
      console.log('⏰ Scheduled notification sent:', notification.id);
    }, delay);

    this.scheduledNotifications.set(notification.id, timeoutId);
    console.log(`⏰ Notification scheduled for ${notification.scheduledTime.toLocaleString()}`);
    
    return notification.id;
  }

  // Cancel scheduled notification
  cancelScheduledNotification(id: string): boolean {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
      console.log('🗑️ Cancelled scheduled notification:', id);
      return true;
    }
    return false;
  }

  // Cancel all scheduled notifications
  cancelAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId, id) => {
      clearTimeout(timeoutId);
      console.log('🗑️ Cancelled notification:', id);
    });
    this.scheduledNotifications.clear();
  }

  // Get scheduled notifications count
  getScheduledCount(): number {
    return this.scheduledNotifications.size;
  }

  // Water reminder notifications
  scheduleWaterReminder(intervalMinutes: number): string {
    const id = `water_reminder_${Date.now()}`;
    const scheduledTime = new Date(Date.now() + intervalMinutes * 60 * 1000);

    const notification: ScheduledNotification = {
      id,
      scheduledTime,
      type: 'water_reminder',
      options: {
        title: '💧 Water Reminder',
        body: 'Time to drink some water! Stay hydrated during your fast.',
        icon: '/favicon.ico',
        tag: 'water_reminder',
        data: { 
          action: 'open_water_view',
          type: 'water_reminder'
        },
        requireInteraction: false
      }
    };

    return this.scheduleNotification(notification);
  }

  // Phase transition notifications
  schedulePhaseTransition(phaseName: string, minutesUntil: number, description: string): string {
    const id = `phase_${phaseName}_${Date.now()}`;
    const scheduledTime = new Date(Date.now() + minutesUntil * 60 * 1000);

    const phaseEmojis = {
      'Ketosis Start': '⚡',
      'Deep Ketosis': '🧠',
      'Autophagy': '🔄',
      'Deep Autophagy': '✨',
      'Immune Reset': '🛡️'
    };

    const emoji = phaseEmojis[phaseName as keyof typeof phaseEmojis] || '🎯';

    const notification: ScheduledNotification = {
      id,
      scheduledTime,
      type: 'phase_transition',
      options: {
        title: `${emoji} ${phaseName} Reached!`,
        body: `Great progress! ${description}`,
        icon: '/favicon.ico',
        tag: `phase_${phaseName}`,
        data: { 
          action: 'open_timer',
          type: 'phase_transition',
          phase: phaseName
        },
        requireInteraction: true
      }
    };

    return this.scheduleNotification(notification);
  }

  // Fast completion notification
  scheduleFastCompletion(targetHours: number, minutesUntil: number): string {
    const id = `fast_complete_${Date.now()}`;
    const scheduledTime = new Date(Date.now() + minutesUntil * 60 * 1000);

    const notification: ScheduledNotification = {
      id,
      scheduledTime,
      type: 'fast_complete',
      options: {
        title: '🎉 Fast Complete!',
        body: `Congratulations! You've completed your ${targetHours}h fast. Time to break your fast!`,
        icon: '/favicon.ico',
        tag: 'fast_complete',
        data: { 
          action: 'open_timer',
          type: 'fast_complete'
        },
        requireInteraction: true
      }
    };

    return this.scheduleNotification(notification);
  }

  // Handle notification clicks
  private handleNotificationClick(action: string, data: any): void {
    console.log('🔔 Notification clicked:', action, data);
    
    switch (action) {
      case 'open_water_view':
        // Dispatch custom event to navigate to water view
        window.dispatchEvent(new CustomEvent('navigate_to_water'));
        break;
      case 'open_timer':
        // Dispatch custom event to navigate to timer
        window.dispatchEvent(new CustomEvent('navigate_to_timer'));
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  // Setup message listener for future Service Worker integration
  private setupMessageListener(): void {
    // Future: Listen for messages from Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from Service Worker:', event.data);
        // Handle background notification actions
      });
    }
  }

  // Utility: Format time until next notification
  getTimeUntilNext(): string | null {
    if (this.scheduledNotifications.size === 0) return null;

    // Find the earliest scheduled notification
    let earliest: Date | null = null;
    this.scheduledNotifications.forEach((_, id) => {
      // Parse timestamp from ID (rough approximation)
      const timestamp = parseInt(id.split('_').pop() || '0');
      const scheduledTime = new Date(timestamp);
      
      if (!earliest || scheduledTime < earliest) {
        earliest = scheduledTime;
      }
    });

    if (!earliest) return null;

    const now = new Date();
    const diff = earliest.getTime() - now.getTime();
    
    if (diff <= 0) return 'Soon';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

export const notificationService = NotificationService.getInstance();
