// src/firebase/databaseService.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from './config';
import { errorService } from '../services/errorService';

// Fast interface
export interface Fast {
  id?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  plannedDuration: number; // hours
  actualDuration?: number; // hours
  status: 'active' | 'completed' | 'stopped_early' | 'paused';
  waterIntake: WaterEntry[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaterEntry {
  id?: string;
  timestamp: Date;
  amount: number; // ml
  note?: string;
}

// Streak interface
export interface FastStreak {
  currentStreak: number;
  longestStreak: number;
  lastFastDate: Date | null;
  streakStartDate: Date | null;
}

// Real-time listener type
export type FastListener = (fast: Fast | null) => void;
export type UnsubscribeFunction = () => void;

// Start a new fast with error handling
export const startFast = async (userId: string, plannedDuration: number) => {
  return await errorService.retry(async () => {
    console.log('🚀 Database: Starting fast for user:', userId, 'duration:', plannedDuration);
    
    const fastData: Omit<Fast, 'id'> = {
      userId,
      startTime: new Date(),
      plannedDuration,
      status: 'active',
      waterIntake: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'fasts'), {
      ...fastData,
      startTime: Timestamp.fromDate(fastData.startTime),
      createdAt: Timestamp.fromDate(fastData.createdAt),
      updatedAt: Timestamp.fromDate(fastData.updatedAt)
    });

    console.log('✅ Database: Fast created with ID:', docRef.id);
    return { id: docRef.id, error: null };
  }, {
    maxAttempts: 3,
    baseDelay: 1000
  }).catch(async (error) => {
    const appError = await errorService.handleError(error, {
      operation: 'startFast',
      userId,
      plannedDuration
    });
    return { id: null, error: appError.userMessage };
  });
};

// Update fast status (pause/resume/etc)
export const updateFastStatus = async (fastId: string, status: Fast['status']) => {
  try {
    console.log('🔄 Database: Updating fast status to:', status);
    
    const fastRef = doc(db, 'fasts', fastId);
    await updateDoc(fastRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    });

    console.log('✅ Database: Fast status updated');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Database: Error updating fast status:', error);
    return { error: error.message };
  }
};

// End a fast
export const endFast = async (fastId: string) => {
  try {
    console.log('🛑 Database: Ending fast:', fastId);
    
    const fastRef = doc(db, 'fasts', fastId);
    const fastDoc = await getDoc(fastRef);
    
    if (!fastDoc.exists()) {
      return { error: 'Fast not found' };
    }

    const fastData = fastDoc.data();
    const startTime = fastData.startTime.toDate();
    const endTime = new Date();
    const actualDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours

    await updateDoc(fastRef, {
      endTime: Timestamp.fromDate(endTime),
      actualDuration,
      status: 'completed',
      updatedAt: Timestamp.fromDate(new Date())
    });

    console.log('✅ Database: Fast ended successfully');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Database: Error ending fast:', error);
    return { error: error.message };
  }
};

// Add water intake - FIXED VERSION
export const addWaterIntake = async (fastId: string, amount: number, note: string = '') => {
  try {
    console.log('💧 Database: Adding water intake:', amount, 'ml to fast:', fastId);
    
    // Validate inputs
    if (!fastId || !amount || amount <= 0) {
      return { error: 'Invalid input: fastId and amount are required' };
    }
    
    const fastRef = doc(db, 'fasts', fastId);
    const fastDoc = await getDoc(fastRef);
    
    if (!fastDoc.exists()) {
      console.error('❌ Fast document not found:', fastId);
      return { error: 'Fast not found' };
    }

    const currentData = fastDoc.data();
    console.log('📄 Current fast data:', {
      id: fastId,
      status: currentData?.status,
      waterIntakeLength: currentData?.waterIntake?.length || 0
    });
    
    // Ensure waterIntake is always an array, handle undefined/null cases
    let currentWaterIntake: any[] = [];
    if (currentData?.waterIntake && Array.isArray(currentData.waterIntake)) {
      currentWaterIntake = currentData.waterIntake;
    } else if (currentData?.waterIntake) {
      console.warn('⚠️ waterIntake exists but is not an array:', typeof currentData.waterIntake);
      currentWaterIntake = [];
    }
    
    const newWaterEntry = {
      id: Date.now().toString(),
      timestamp: Timestamp.fromDate(new Date()),
      amount,
      note: note || null
    };

    const updatedWaterIntake = [...currentWaterIntake, newWaterEntry];

    await updateDoc(fastRef, {
      waterIntake: updatedWaterIntake,
      updatedAt: Timestamp.fromDate(new Date())
    });

    console.log('✅ Database: Water intake added successfully. New total:', updatedWaterIntake.length);
    return { error: null };
  } catch (error: any) {
    console.error('❌ Database: Error adding water intake:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return { error: `Failed to add water intake: ${error.message}` };
  }
};

// Get user's current active fast - SIMPLIFIED VERSION
export const getCurrentFast = async (userId: string) => {
  try {
    console.log('📥 Database: Getting current fast for user:', userId);
    
    // First try to get active fasts
    const activeQuery = query(
      collection(db, 'fasts'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('startTime', 'desc'),
      limit(1)
    );

    let querySnapshot = await getDocs(activeQuery);
    
    // If no active fast, try paused fasts
    if (querySnapshot.empty) {
      const pausedQuery = query(
        collection(db, 'fasts'),
        where('userId', '==', userId),
        where('status', '==', 'paused'),
        orderBy('startTime', 'desc'),
        limit(1)
      );
      querySnapshot = await getDocs(pausedQuery);
    }
    
    if (querySnapshot.empty) {
      console.log('🚫 Database: No active or paused fast found');
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const fast: Fast = {
      id: doc.id,
      userId: data.userId,
      startTime: data.startTime.toDate(),
      endTime: data.endTime ? data.endTime.toDate() : undefined,
      plannedDuration: data.plannedDuration,
      actualDuration: data.actualDuration,
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      waterIntake: data.waterIntake?.map((entry: any) => ({
        id: entry.id,
        timestamp: entry.timestamp.toDate(),
        amount: entry.amount,
        note: entry.note
      })) || []
    };

    console.log('✅ Database: Current fast loaded:', {
      id: fast.id,
      status: fast.status,
      waterCount: fast.waterIntake.length
    });
    return fast;
  } catch (error: any) {
    console.error('❌ Database: Error getting current fast:', error);
    return null;
  }
};

// Real-time subscription to current active fast - SIMPLIFIED VERSION
export const subscribeToCurrentFast = (userId: string, callback: FastListener): UnsubscribeFunction => {
  console.log('📡 Database: Setting up real-time listener for user:', userId);
  
  let unsubscribeActive: UnsubscribeFunction | null = null;
  let unsubscribePaused: UnsubscribeFunction | null = null;
  let lastFastFound: Fast | null = null;

  const setupActiveListener = () => {
    const activeQuery = query(
      collection(db, 'fasts'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('startTime', 'desc'),
      limit(1)
    );

    unsubscribeActive = onSnapshot(
      activeQuery,
      (querySnapshot: QuerySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          
          const fast: Fast = {
            id: doc.id,
            userId: data.userId,
            startTime: data.startTime.toDate(),
            endTime: data.endTime ? data.endTime.toDate() : undefined,
            plannedDuration: data.plannedDuration,
            actualDuration: data.actualDuration,
            status: data.status,
            notes: data.notes,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            waterIntake: data.waterIntake?.map((entry: any) => ({
              id: entry.id,
              timestamp: entry.timestamp.toDate(),
              amount: entry.amount,
              note: entry.note
            })) || []
          };

          console.log('📡 Database: Active fast found via real-time:', fast.id);
          lastFastFound = fast;
          callback(fast);
        } else if (!lastFastFound || lastFastFound.status === 'active') {
          // Only check paused if we don't have a fast or the last one was active
          setupPausedListener();
        }
      },
      (error) => {
        console.error('❌ Database: Active listener error:', error);
      }
    );
  };

  const setupPausedListener = () => {
    const pausedQuery = query(
      collection(db, 'fasts'),
      where('userId', '==', userId),
      where('status', '==', 'paused'),
      orderBy('startTime', 'desc'),
      limit(1)
    );

    unsubscribePaused = onSnapshot(
      pausedQuery,
      (querySnapshot: QuerySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          
          const fast: Fast = {
            id: doc.id,
            userId: data.userId,
            startTime: data.startTime.toDate(),
            endTime: data.endTime ? data.endTime.toDate() : undefined,
            plannedDuration: data.plannedDuration,
            actualDuration: data.actualDuration,
            status: data.status,
            notes: data.notes,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            waterIntake: data.waterIntake?.map((entry: any) => ({
              id: entry.id,
              timestamp: entry.timestamp.toDate(),
              amount: entry.amount,
              note: entry.note
            })) || []
          };

          console.log('📡 Database: Paused fast found via real-time:', fast.id);
          lastFastFound = fast;
          callback(fast);
        } else if (!lastFastFound) {
          console.log('📡 Database: No active or paused fast found');
          callback(null);
        }
      },
      (error) => {
        console.error('❌ Database: Paused listener error:', error);
      }
    );
  };

  // Start with active listener
  setupActiveListener();
  setupPausedListener();

  // Return cleanup function
  return () => {
    console.log('🧹 Database: Cleaning up real-time listeners');
    if (unsubscribeActive) unsubscribeActive();
    if (unsubscribePaused) unsubscribePaused();
  };
};

// Subscribe to specific fast by ID
export const subscribeToFast = (fastId: string, callback: FastListener): UnsubscribeFunction => {
  console.log('📡 Database: Setting up real-time listener for fast:', fastId);
  
  try {
    const fastRef = doc(db, 'fasts', fastId);
    
    const unsubscribe = onSnapshot(
      fastRef,
      (doc: DocumentSnapshot) => {
        console.log('📡 Database: Fast-specific real-time update received');
        
        if (!doc.exists()) {
          console.log('📡 Database: Fast no longer exists');
          callback(null);
          return;
        }

        const data = doc.data();
        if (!data) {
          callback(null);
          return;
        }

        const fast: Fast = {
          id: doc.id,
          userId: data.userId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime ? data.endTime.toDate() : undefined,
          plannedDuration: data.plannedDuration,
          actualDuration: data.actualDuration,
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          waterIntake: data.waterIntake?.map((entry: any) => ({
            id: entry.id,
            timestamp: entry.timestamp.toDate(),
            amount: entry.amount,
            note: entry.note
          })) || []
        };

        console.log('📡 Database: Fast-specific real-time data:', {
          id: fast.id,
          status: fast.status,
          lastUpdated: fast.updatedAt.toISOString()
        });
        
        callback(fast);
      },
      (error) => {
        console.error('❌ Database: Fast-specific real-time listener error:', error);
      }
    );

    console.log('✅ Database: Fast-specific real-time listener set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Database: Error setting up fast-specific real-time listener:', error);
    return () => {};
  }
};

// Get user's fast history
export const getFastHistory = async (userId: string) => {
  try {
    console.log('📚 Database: Getting fast history for user:', userId);
    
    const q = query(
      collection(db, 'fasts'),
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const fasts: Fast[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fasts.push({
        id: doc.id,
        userId: data.userId,
        startTime: data.startTime.toDate(),
        endTime: data.endTime ? data.endTime.toDate() : undefined,
        plannedDuration: data.plannedDuration,
        actualDuration: data.actualDuration,
        status: data.status,
        notes: data.notes,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        waterIntake: data.waterIntake?.map((entry: any) => ({
          id: entry.id,
          timestamp: entry.timestamp.toDate(),
          amount: entry.amount,
          note: entry.note
        })) || []
      });
    });

    console.log('✅ Database: Fast history loaded:', fasts.length, 'fasts');
    return { fasts, error: null };
  } catch (error: any) {
    console.error('❌ Database: Error getting fast history:', error);
    return { fasts: [], error: error.message };
  }
};

// Update fast duration - FIXED: Changed to named export
export const updateFast = async (fastId: string, newDuration: number) => {
  try {
    console.log('🔄 Database: Updating fast duration:', fastId, 'to', newDuration);
    
    const fastRef = doc(db, 'fasts', fastId);
    await updateDoc(fastRef, {
      actualDuration: newDuration,
      updatedAt: Timestamp.fromDate(new Date())
    });

    console.log('✅ Database: Fast duration updated');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Database: Error updating fast:', error);
    return { error: error.message };
  }
};

// Delete a fast - FIXED: Changed to named export
export const deleteFast = async (fastId: string) => {
  try {
    console.log('🗑️ Database: Deleting fast:', fastId);
    
    const fastRef = doc(db, 'fasts', fastId);
    await deleteDoc(fastRef);

    console.log('✅ Database: Fast deleted successfully');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Database: Error deleting fast:', error);
    return { error: error.message };
  }
};

// Calculate user's fasting streaks
export const calculateFastingStreak = async (userId: string): Promise<{ streak: FastStreak | null, error: string | null }> => {
  try {
    console.log('🔥 Database: Calculating fasting streak for user:', userId);
    
    // Get all completed fasts, ordered by end date
    const q = query(
      collection(db, 'fasts'),
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('endTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('🚫 Database: No completed fasts found');
      return { 
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastFastDate: null,
          streakStartDate: null
        }, 
        error: null 
      };
    }

    const completedFasts: Fast[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.endTime) {
        completedFasts.push({
          id: doc.id,
          userId: data.userId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          plannedDuration: data.plannedDuration,
          actualDuration: data.actualDuration,
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          waterIntake: []
        });
      }
    });

    // Group fasts by date (ignore time)
    const fastsByDate = new Map<string, Fast[]>();
    completedFasts.forEach(fast => {
      if (fast.endTime) {
        const dateKey = fast.endTime.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!fastsByDate.has(dateKey)) {
          fastsByDate.set(dateKey, []);
        }
        fastsByDate.get(dateKey)!.push(fast);
      }
    });

    // Sort dates descending
    const sortedDates = Array.from(fastsByDate.keys()).sort().reverse();
    
    if (sortedDates.length === 0) {
      return { 
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastFastDate: null,
          streakStartDate: null
        }, 
        error: null 
      };
    }

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streakStartDate: Date | null = null;
    let tempStreakLength = 0;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if current streak is active (fasted today or yesterday)
    let streakActive = sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr;
    
    if (streakActive) {
      let currentDate = new Date(sortedDates[0]);
      let streakIndex = 0;
      
      // Count consecutive days
      while (streakIndex < sortedDates.length) {
        const expectedDateStr = currentDate.toISOString().split('T')[0];
        
        if (sortedDates[streakIndex] === expectedDateStr) {
          currentStreak++;
          if (currentStreak === 1) {
            streakStartDate = new Date(currentDate);
          }
          streakIndex++;
        } else {
          break;
        }
        
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    // Calculate longest streak in history
    for (let i = 0; i < sortedDates.length; i++) {
      tempStreakLength = 1;
      let currentDate = new Date(sortedDates[i]);
      
      // Look for consecutive days
      for (let j = i + 1; j < sortedDates.length; j++) {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() - 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        
        if (sortedDates[j] === nextDayStr) {
          tempStreakLength++;
          currentDate = nextDay;
        } else {
          break;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreakLength);
    }

    const lastFastDate = completedFasts.length > 0 ? completedFasts[0].endTime! : null;

    const streak: FastStreak = {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastFastDate,
      streakStartDate
    };

    console.log('✅ Database: Streak calculated:', streak);
    return { streak, error: null };

  } catch (error: any) {
    console.error('❌ Database: Error calculating streak:', error);
    return { streak: null, error: error.message };
  }
};
