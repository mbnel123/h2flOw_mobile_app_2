// src/services/serviceWorkerManager.ts

export interface BackgroundTimerData {
  userId: string;
  fastId: string;
  startTime: Date;
  targetHours: number;
  plannedDuration: number;
}

export interface TimerStatus {
  isRunning: boolean;
  elapsedHours?: number;
  targetHours?: number;
  startTime?: string;
  fastId?: string;
}

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private serviceWorker: ServiceWorker | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private messageChannel: MessageChannel | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: ((message: any) => void)[] = [];

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  constructor() {
    this.initializeServiceWorker();
  }

  // Initialize Service Worker
  async initializeServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('🚫 Service Worker not supported in this browser');
      return false;
    }

    try {
      console.log('🔧 Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', this.registration.scope);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        const newWorker = this.registration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New Service Worker available');
              // Could show update notification to user
            }
          });
        }
      });

      // Setup message channel
      this.setupMessageChannel();

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  // Setup message channel for communication
  private setupMessageChannel(): void {
    this.messageChannel = new MessageChannel();
    
    this.messageChannel.port1.onmessage = (event) => {
      this.handleServiceWorkerMessage(event.data);
    };

    // Send port to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SETUP_MESSAGE_CHANNEL'
      }, [this.messageChannel.port2]);
    }
  }

  // Handle messages from Service Worker
  private handleServiceWorkerMessage(message: any): void {
    console.log('📨 Message from Service Worker:', message);
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(message));

    // Handle specific message types
    switch (message.type) {
      case 'BACKGROUND_TIMER_STARTED':
        console.log('✅ Background timer started for fast:', message.fastId);
        break;
      case 'BACKGROUND_TIMER_STOPPED':
        console.log('🛑 Background timer stopped for user:', message.userId);
        break;
      case 'FAST_STOPPED_FROM_NOTIFICATION':
        console.log('🔔 Fast stopped from notification for user:', message.userId);
        // Could trigger app state update here
        break;
      case 'BACKGROUND_SYNC_UPDATE':
        console.log('🔄 Background sync update:', message.data);
        break;
    }
  }

  // Subscribe to Service Worker messages
  subscribe(listener: (message: any) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Start background timer
  async startBackgroundTimer(data: BackgroundTimerData): Promise<boolean> {
    if (!navigator.serviceWorker.controller) {
      console.warn('🚫 No Service Worker controller available');
      return false;
    }

    try {
      console.log('⏰ Starting background timer...', data);
      
      navigator.serviceWorker.controller.postMessage({
        type: 'START_BACKGROUND_TIMER',
        data: {
          ...data,
          startTime: data.startTime.toISOString()
        }
      });

      // Start sending heartbeats
      this.startHeartbeat(data.userId);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start background timer:', error);
      return false;
    }
  }

  // Stop background timer
  async stopBackgroundTimer(userId: string): Promise<boolean> {
    if (!navigator.serviceWorker.controller) {
      console.warn('🚫 No Service Worker controller available');
      return false;
    }

    try {
      console.log('🛑 Stopping background timer for user:', userId);
      
      navigator.serviceWorker.controller.postMessage({
        type: 'STOP_BACKGROUND_TIMER',
        data: { userId }
      });

      // Stop heartbeat
      this.stopHeartbeat();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop background timer:', error);
      return false;
    }
  }

  // Update fast data in Service Worker
  updateFastData(userId: string, data: { status?: string; waterIntake?: any[] }): void {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_FAST_DATA',
      data: { userId, ...data }
    });
  }

  // Get timer status from Service Worker
  async getTimerStatus(userId: string): Promise<TimerStatus> {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller || !this.messageChannel) {
        resolve({ isRunning: false });
        return;
      }

      // Create a message channel for this specific request
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'TIMER_STATUS') {
          resolve(event.data.data);
        }
      };

      navigator.serviceWorker.controller.postMessage({
        type: 'GET_TIMER_STATUS',
        data: { userId }
      }, [channel.port2]);

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({ isRunning: false });
      }, 5000);
    });
  }

  // Start sending heartbeats to Service Worker
  private startHeartbeat(userId: string): void {
    this.stopHeartbeat(); // Clear existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'HEARTBEAT',
          data: { userId }
        });
      }
    }, 30000); // Every 30 seconds
    
    console.log('💓 Started heartbeat for user:', userId);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💓 Stopped heartbeat');
    }
  }

  // Request persistent notification permission
  async requestPersistentNotifications(): Promise<boolean> {
    if (!this.registration) {
      console.warn('🚫 No Service Worker registration available');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error);
      return false;
    }
  }

  // Register for background sync
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      console.warn('🚫 Background Sync not supported');
      return false;
    }

    try {
      await this.registration.sync.register(tag);
      console.log('✅ Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('❌ Background sync registration failed:', error);
      return false;
    }
  }

  // Register for periodic background sync (experimental)
  async registerPeriodicSync(): Promise<boolean> {
    if (!this.registration || !('periodicSync' in this.registration)) {
      console.warn('🚫 Periodic Background Sync not supported');
      return false;
    }

    try {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' as any });
      
      if (status.state === 'granted') {
        await (this.registration as any).periodicSync.register('fast-timer-check', {
          minInterval: 60000 // 1 minute
        });
        console.log('✅ Periodic background sync registered');
        return true;
      } else {
        console.warn('🚫 Periodic background sync permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Periodic background sync registration failed:', error);
      return false;
    }
  }

  // Check if Service Worker is active
  isActive(): boolean {
    return !!navigator.serviceWorker.controller;
  }

  // Get registration state
  getRegistrationState(): string {
    if (!this.registration) return 'unregistered';
    if (this.registration.installing) return 'installing';
    if (this.registration.waiting) return 'waiting';
    if (this.registration.active) return 'active';
    return 'unknown';
  }

  // Update Service Worker
  async updateServiceWorker(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      console.log('🔄 Service Worker update check completed');
      return true;
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
      return false;
    }
  }

  // Unregister Service Worker (for debugging)
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregister failed:', error);
      return false;
    }
  }
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
