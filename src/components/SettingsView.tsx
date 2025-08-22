import React, { useState } from 'react';
import SwipeNavigator from './SwipeNavigator';
import { ArrowLeft, Bell, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { ThemeToggle, useTheme } from '../contexts/ThemeContext';

interface SettingsViewProps {
  setCurrentView: (view: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ setCurrentView }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  return (
    <SwipeNavigator
      onSwipeLeft={() => setCurrentView('info')}
      onSwipeRight={() => setCurrentView('water')}
    >
      <div className={`min-h-screen transition-theme ${
        resolvedTheme === 'dark' 
          ? 'bg-gray-900' 
          : 'bg-white'
      }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-theme ${
        resolvedTheme === 'dark'
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center">
          <button 
            onClick={() => setCurrentView('timer')} 
            className={`p-2 rounded-full transition-colors mr-3 ${
              resolvedTheme === 'dark'
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>
          <h1 className={`text-xl font-medium ${
            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Settings
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Theme Settings */}
        <div>
          <h2 className={`text-lg font-semibold mb-6 flex items-center ${
            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <Palette className="w-5 h-5 mr-2" />
            Appearance
          </h2>
          
          {/* Theme Selection */}
          <div className={`rounded-xl p-6 border transition-theme ${
            resolvedTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Theme
                </h3>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Choose your preferred color scheme
                </p>
              </div>
              <ThemeToggle variant="dropdown" size="md" />
            </div>
            
            {/* Theme Options */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : resolvedTheme === 'dark'
                    ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Sun className={`w-6 h-6 mx-auto mb-2 ${
                  theme === 'light' 
                    ? 'text-blue-600' 
                    : resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'light' 
                    ? 'text-blue-600' 
                    : resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Light
                </span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : resolvedTheme === 'dark'
                    ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Moon className={`w-6 h-6 mx-auto mb-2 ${
                  theme === 'dark' 
                    ? 'text-blue-600' 
                    : resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'dark' 
                    ? 'text-blue-600' 
                    : resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Dark
                </span>
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : resolvedTheme === 'dark'
                    ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Monitor className={`w-6 h-6 mx-auto mb-2 ${
                  theme === 'system' 
                    ? 'text-blue-600' 
                    : resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'system' 
                    ? 'text-blue-600' 
                    : resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  System
                </span>
              </button>
            </div>
            
            {theme === 'system' && (
              <div className={`mt-3 p-3 rounded-lg ${
                resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-xs ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Currently using <strong>{resolvedTheme}</strong> mode based on your system preference
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h2 className={`text-lg font-semibold mb-6 flex items-center ${
            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            {/* Test Push Notification Button */}
            <button
              onClick={async () => {
                if ('Notification' in window && Notification.permission !== 'granted') {
                  await Notification.requestPermission();
                }
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('🔔 H2Flow Test Notification', {
                    body: 'Push notifications are working! 🎉',
                    icon: '/favicon.ico',
                  });
                } else {
                  alert('Notifications are not enabled in your browser.');
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors mb-2"
            >
              Test Push Notification
            </button>
            {/* Push Notifications */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-theme ${
              resolvedTheme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <h3 className={`font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Push Notifications
                </h3>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Get notified about phase transitions and milestones
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'transform translate-x-5' : ''
                  } absolute top-0.5 left-0.5`}></div>
                </div>
              </label>
            </div>

            {/* Sound */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-theme ${
              resolvedTheme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <h3 className={`font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Sound
                </h3>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Play sound for notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-blue-600' : resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    soundEnabled ? 'transform translate-x-5' : ''
                  } absolute top-0.5 left-0.5`}></div>
                </div>
              </label>
            </div>

            {/* Vibration */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-theme ${
              resolvedTheme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <h3 className={`font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Vibration
                </h3>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Vibrate on mobile devices
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={vibrationEnabled}
                  onChange={(e) => setVibrationEnabled(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  vibrationEnabled ? 'bg-blue-600' : resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    vibrationEnabled ? 'transform translate-x-5' : ''
                  } absolute top-0.5 left-0.5`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div>
          <h2 className={`text-lg font-semibold mb-6 ${
            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            About
          </h2>
          
          <div className={`rounded-xl p-6 border transition-theme ${
            resolvedTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-md" 
                style={{background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)'}}
              >
                <span className="text-sm font-bold text-white">H₂F</span>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  H2Flow
                </h3>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Extended Water Fasting Tracker
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Version
                </span>
                <span className={`text-sm font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  1.0.0
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Theme
                </span>
                <span className={`text-sm font-medium capitalize ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {theme} {theme === 'system' && `(${resolvedTheme})`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SwipeNavigator>
  );
}


export default SettingsView;

