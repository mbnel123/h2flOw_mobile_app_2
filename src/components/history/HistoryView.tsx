// src/components/history/HistoryView.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, logout } from '../../firebase/authService';
import { useHistoryData } from '../../hooks/useHistoryData';
import UserProfileSection from './UserProfileSection';
import FastingPatternsSection from './FastingPatternsSection';
import LifetimeAnalytics from './LifetimeAnalytics';
import FastHistoryList from './FastHistoryList';
import AchievementsSection from './AchievementsSection';

interface HistoryViewProps {
  setCurrentView: (view: string) => void;
}

// Enhanced Loading Skeleton Component
const HistoryLoadingSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Header Skeleton */}
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-full mr-3"></div>
          <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="w-20 h-8 bg-red-100 animate-pulse rounded-lg"></div>
      </div>
    </div>

    <div className="p-6">
      {/* User Profile Skeleton */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse rounded-full mr-4"></div>
            <div>
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns Skeleton */}
      <div className="mb-8">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded mr-2"></div>
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded mb-1"></div>
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mb-1"></div>
                <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const HistoryView: React.FC<HistoryViewProps> = ({ setCurrentView }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Use custom hook for history data
  const {
    fastHistory,
    fastingStreak,
    loading,
    error,
    stats,
    setError
  } = useHistoryData(user);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setCurrentView('auth');
      }
    });

    return () => unsubscribe();
  }, [setCurrentView]);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentView('welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  // Show enhanced loading skeleton instead of basic loading
  if (loading) {
    return <HistoryLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setCurrentView('timer')} className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-medium text-gray-800">Personal Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs mt-1 underline text-red-800 hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="p-6">
        {/* User Profile Section */}
        <UserProfileSection 
          user={user}
          fastingStreak={fastingStreak}
          accountAgeDays={stats.accountAgeDays}
        />

        {/* Fasting Patterns */}
        <FastingPatternsSection 
          stats={stats} 
          fastingStreak={fastingStreak}
          fastHistory={fastHistory}
        />

        {/* Lifetime Analytics */}
        <LifetimeAnalytics 
          stats={stats}
          fastingStreak={fastingStreak}
          fastHistory={fastHistory}
        />

        {/* Fast History */}
        <FastHistoryList fastHistory={fastHistory} />

        {/* Achievements */}
        <AchievementsSection 
          stats={stats}
          fastingStreak={fastingStreak}
        />
      </div>
    </div>
  );
};

export default HistoryView;
