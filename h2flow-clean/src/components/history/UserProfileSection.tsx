// src/components/history/UserProfileSection.tsx
import React from 'react';
import { User } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { FastStreak } from '../../firebase/databaseService';

interface UserProfileSectionProps {
  user: FirebaseUser;
  fastingStreak: FastStreak | null;
  accountAgeDays: number;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ 
  user, 
  fastingStreak, 
  accountAgeDays 
}) => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.displayName || 'Faster'}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">Fasting for {accountAgeDays} days</p>
            {fastingStreak && (
              <p className="text-sm text-orange-600 font-medium mt-1">
                🔥 Current streak: {fastingStreak.currentStreak} days (Best: {fastingStreak.longestStreak})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSection;
