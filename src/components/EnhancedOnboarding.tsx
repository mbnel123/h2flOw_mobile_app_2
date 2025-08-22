// src/components/EnhancedOnboarding.tsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Bell, Droplets, Timer, Shield, Star, Zap } from 'lucide-react';
import { notificationService } from '../services/notificationService.ts';

interface OnboardingProps {
  onComplete: (userData: OnboardingData) => void;
}

interface OnboardingData {
  name: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  notifications: boolean;
  preferredDuration: number;
  waterReminders: boolean;
}

const EnhancedOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<OnboardingData>({
    name: '',
    experience: 'beginner',
    goals: [],
    notifications: false,
    preferredDuration: 16,
    waterReminders: false
  });

  const totalSteps = 6;

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to H2Flow',
      subtitle: 'Your personal water fasting companion',
      icon: '💧'
    },
    {
      id: 'name',
      title: 'What should we call you?',
      subtitle: 'Personalize your fasting journey',
      icon: '👋'
    },
    {
      id: 'experience',
      title: 'Your fasting experience?',
      subtitle: 'Help us customize your experience',
      icon: '🎯'
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      subtitle: 'Select all that apply',
      icon: '⭐'
    },
    {
      id: 'preferences',
      title: 'Set your preferences',
      subtitle: 'Customize your default settings',
      icon: '⚙️'
    },
    {
      id: 'permissions',
      title: 'Enable notifications',
      subtitle: 'Stay motivated with reminders',
      icon: '🔔'
    }
  ];

  const experienceOptions = [
    {
      value: 'beginner',
      title: 'Beginner',
      description: 'New to fasting or just getting started',
      icon: '🌱',
      recommended: '12-16 hours'
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: 'Some fasting experience, ready for longer fasts',
      icon: '⚡',
      recommended: '16-24 hours'
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: 'Experienced faster, comfortable with extended fasts',
      icon: '🔥',
      recommended: '24+ hours'
    }
  ];

  const goalOptions = [
    { id: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
    { id: 'mental_clarity', label: 'Mental Clarity', icon: '🧠' },
    { id: 'autophagy', label: 'Cellular Health', icon: '🔄' },
    { id: 'discipline', label: 'Self Discipline', icon: '💪' },
    { id: 'spiritual', label: 'Spiritual Growth', icon: '🧘' },
    { id: 'health', label: 'General Health', icon: '❤️' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Request notifications if user opted in
    if (userData.notifications) {
      await notificationService.requestPermission();
    }

    // Save onboarding completion
    localStorage.setItem('h2flow_onboarding_completed', 'true');
    localStorage.setItem('h2flow_user_data', JSON.stringify(userData));

    onComplete(userData);
  };

  const updateUserData = (updates: Partial<OnboardingData>) => {
    setUserData(prev => ({ ...prev, ...updates }));
  };

  const toggleGoal = (goalId: string) => {
    updateUserData({
      goals: userData.goals.includes(goalId)
        ? userData.goals.filter(g => g !== goalId)
        : [...userData.goals, goalId]
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return userData.name.trim().length > 0;
      case 2: return userData.experience !== undefined;
      case 3: return userData.goals.length > 0;
      case 4: return userData.preferredDuration > 0;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-6xl text-white shadow-2xl">
              💧
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to H2Flow</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Your intelligent companion for water fasting, designed to support your health and wellness journey.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800 font-medium">Smart Timer</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Droplets className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800 font-medium">Hydration Tracking</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-800 font-medium">Smart Reminders</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-orange-800 font-medium">Safety Features</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What should we call you?</h2>
            <p className="text-gray-600 mb-8">This helps us personalize your experience</p>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => updateUserData({ name: e.target.value })}
              placeholder="Enter your name"
              className="w-full max-w-md mx-auto px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your fasting experience?</h2>
            <p className="text-gray-600 mb-8">This helps us recommend appropriate fasting durations</p>
            <div className="space-y-4 max-w-lg mx-auto">
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateUserData({ experience: option.value as any })}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    userData.experience === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{option.icon}</span>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        Recommended: {option.recommended}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">⭐</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What are your goals?</h2>
            <p className="text-gray-600 mb-8">Select all that apply - we'll track your progress</p>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userData.goals.includes(goal.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">{goal.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{goal.label}</span>
                  {userData.goals.includes(goal.id) && (
                    <Check className="w-5 h-5 text-blue-600 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">⚙️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Set your preferences</h2>
            <p className="text-gray-600 mb-8">Customize your default fasting settings</p>
            
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-left text-lg font-medium text-gray-900 mb-3">
                  Preferred fasting duration
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="1"
                    value={userData.preferredDuration}
                    onChange={(e) => updateUserData({ preferredDuration: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>12h</span>
                    <span className="font-semibold text-blue-600">{userData.preferredDuration}h</span>
                    <span>72h</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="w-6 h-6 text-blue-500 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Water Reminders</h3>
                      <p className="text-sm text-gray-600">Get notified to stay hydrated</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateUserData({ waterReminders: !userData.waterReminders })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userData.waterReminders ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userData.waterReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🔔</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enable notifications</h2>
            <p className="text-gray-600 mb-8">
              Get helpful reminders and celebrate your progress
            </p>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-4">Notifications include:</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Phase transition alerts (Ketosis, Autophagy)</span>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Hydration reminders</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Milestone celebrations</span>
                  </div>
                  <div className="flex items-center">
                    <Timer className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Fast completion alerts</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Enable Notifications</h3>
                    <p className="text-sm text-gray-600">Recommended for best experience</p>
                  </div>
                  <button
                    onClick={() => updateUserData({ notifications: !userData.notifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userData.notifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userData.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Progress Bar */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboarding;
