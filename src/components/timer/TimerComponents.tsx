import React from 'react';
import { Wifi, WifiOff, Smartphone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.tsx';

// Enhanced Loading Skeleton Component with Dark Mode
export const TimerLoadingSkeleton = () => {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col transition-theme ${
      resolvedTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100'
    }`}>
      {/* Header Skeleton */}
      <div className={`relative p-6 border-b shadow-sm transition-theme ${
        resolvedTheme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-2xl animate-pulse mr-4 ${
              resolvedTheme === 'dark' 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300'
            }`}></div>
            <div>
              <div className={`h-6 w-20 animate-pulse rounded mb-1 ${
                resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className={`h-4 w-32 animate-pulse rounded ${
                resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
          <div className="flex space-x-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-10 h-10 animate-pulse rounded-xl ${
                resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            ))}
          </div>
        </div>
        
        {/* Connection status skeleton */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 animate-pulse rounded ${
              resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`w-12 h-3 animate-pulse rounded ${
              resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
        
        {/* Progress bar skeleton */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
          resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className={`h-full w-1/3 animate-pulse ${
            resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
        </div>
      </div>

      {/* Main Timer Area Skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* Circular progress skeleton */}
        <div className="relative mb-6">
          <div className={`w-80 h-80 animate-pulse rounded-full flex items-center justify-center ${
            resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div className={`w-64 h-64 animate-pulse rounded-full flex items-center justify-center ${
              resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}>
              <div className={`text-center rounded-3xl p-6 shadow-xl border transition-theme ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`h-12 w-24 animate-pulse rounded mb-2 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-8 w-32 animate-pulse rounded mb-2 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-4 w-20 animate-pulse rounded ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
              </div>
            </div>
          </div>
          {/* Progress indicator skeleton */}
          <div className={`absolute top-4 right-4 rounded-full px-3 py-1 shadow-lg border transition-theme ${
            resolvedTheme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-8 h-4 animate-pulse rounded ${
              resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>

        {/* Phase info skeleton */}
        <div className="text-center max-w-lg space-y-4 w-full">
          <div className={`rounded-2xl p-6 shadow-lg border transition-theme ${
            resolvedTheme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`h-6 w-32 animate-pulse rounded mb-3 mx-auto ${
              resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-4 w-48 animate-pulse rounded mb-4 mx-auto ${
              resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className={`h-6 w-12 animate-pulse rounded mb-1 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-3 w-16 animate-pulse rounded ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
              </div>
              <div className="text-center">
                <div className={`h-6 w-8 animate-pulse rounded mb-1 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-3 w-12 animate-pulse rounded ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Next phase skeleton */}
          <div className={`rounded-2xl p-5 border transition-theme ${
            resolvedTheme === 'dark'
              ? 'bg-gradient-to-r from-blue-900/20 to-sky-900/20 border-blue-800'
              : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200'
          }`}>
            <div className={`h-5 w-40 animate-pulse rounded mb-3 mx-auto ${
              resolvedTheme === 'dark' ? 'bg-blue-800' : 'bg-sky-200'
            }`}></div>
            <div className={`h-6 w-32 animate-pulse rounded mb-3 mx-auto ${
              resolvedTheme === 'dark' ? 'bg-blue-800' : 'bg-sky-200'
            }`}></div>
            <div className={`h-4 w-56 animate-pulse rounded mx-auto ${
              resolvedTheme === 'dark' ? 'bg-blue-800' : 'bg-sky-200'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Control Buttons Skeleton */}
      <div className="p-6">
        <div className="flex justify-center space-x-4">
          <div className={`w-48 h-14 animate-pulse rounded-2xl ${
            resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
          <div className={`w-32 h-14 animate-pulse rounded-2xl ${
            resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

// Circular Progress Component
interface CircularProgressProps {
  progress: number;
  elapsedTime: number;
  targetHours: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ progress, elapsedTime, targetHours }) => {
  const { resolvedTheme } = useTheme();
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: remainingSeconds.toString().padStart(2, '0')
    };
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-80 h-80">
      <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 320 320">
        <circle 
          cx="160" 
          cy="160" 
          r={radius} 
          stroke={resolvedTheme === 'dark' ? '#374151' : '#E5E7EB'} 
          strokeWidth="20" 
          fill="transparent" 
        />
        <circle
          cx="160" cy="160" r={radius} stroke="url(#waterGradient)" strokeWidth="20" fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: resolvedTheme === 'dark' ? '#60A5FA' : '#7DD3FC'}} />
            <stop offset="50%" style={{stopColor: resolvedTheme === 'dark' ? '#3B82F6' : '#38BDF8'}} />
            <stop offset="100%" style={{stopColor: resolvedTheme === 'dark' ? '#2563EB' : '#0EA5E9'}} />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center rounded-3xl p-6 shadow-xl border transition-theme ${
          resolvedTheme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`text-5xl font-light mb-2 transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {formatTime(elapsedTime).hours}<span className={`text-3xl ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>h</span>
          </div>
          <div className={`text-2xl font-light mb-2 transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {formatTime(elapsedTime).minutes}<span className={`text-lg ${
              resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>m</span>
            {' '}
            {formatTime(elapsedTime).seconds}<span className={`text-lg ${
              resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>s</span>
          </div>
          <div className={`text-sm font-medium transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Target: {targetHours} hours
          </div>
        </div>
      </div>
    </div>
  );
};

// Connection Status Component
interface ConnectionStatusProps {
  syncStatus: 'connected' | 'connecting' | 'offline' | 'error';
  isOnline: boolean;
  lastSyncTime: Date | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ syncStatus, isOnline, lastSyncTime }) => {
  const { resolvedTheme } = useTheme();
  
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'offline': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    switch (syncStatus) {
      case 'connected': return 'Synced';
      case 'connecting': return 'Syncing...';
      case 'error': return 'Sync Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs ml-1">{getStatusText()}</span>
      </div>
      {lastSyncTime && syncStatus === 'connected' && (
        <div className={`text-xs transition-theme ${
          resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {lastSyncTime.toLocaleTimeString('nl-NL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
    </div>
  );
};

// Multi-device Activity Component
interface MultiDeviceActivityProps {
  activity: string;
}

export const MultiDeviceActivity: React.FC<MultiDeviceActivityProps> = ({ activity }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`flex items-center px-3 py-1 rounded-full transition-theme ${
      resolvedTheme === 'dark'
        ? 'text-blue-400 bg-blue-900/20'
        : 'text-blue-600 bg-blue-50'
    }`}>
      <Smartphone className="w-3 h-3 mr-1" />
      <span className="text-xs">{activity}</span>
    </div>
  );
};

// Template Info Component
interface TemplateInfoProps {
  template: {
    icon: string;
    name: string;
    duration: number;
    category: string;
    description?: string;
  };
  onRemove: () => void;
}

export const TemplateInfo: React.FC<TemplateInfoProps> = ({ template, onRemove }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`mb-4 border rounded-xl p-4 max-w-lg w-full transition-theme ${
      resolvedTheme === 'dark'
        ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-800'
        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{template.icon}</span>
          <div>
            <h3 className={`font-semibold transition-theme ${
              resolvedTheme === 'dark' ? 'text-purple-300' : 'text-purple-800'
            }`}>
              {template.name}
            </h3>
            <p className={`text-sm transition-theme ${
              resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {template.duration}h • {template.category}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className={`transition-theme ${
            resolvedTheme === 'dark' 
              ? 'text-purple-500 hover:text-purple-400' 
              : 'text-purple-400 hover:text-purple-600'
          }`}
        >
          ✕
        </button>
      </div>
      {template.description && (
        <p className={`text-sm mt-2 transition-theme ${
          resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-700'
        }`}>
          {template.description}
        </p>
      )}
    </div>
  );
};

// Phase Info Component
interface PhaseInfoProps {
  currentPhase: {
    title: string;
    description: string;
  };
  dailyWaterIntake: number;
  elapsedTime: number;
}

export const PhaseInfo: React.FC<PhaseInfoProps> = ({ currentPhase, dailyWaterIntake, elapsedTime }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`rounded-2xl p-6 shadow-lg border transition-theme ${
      resolvedTheme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-center mb-3">
        <h3 className={`font-semibold transition-theme ${
          resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {currentPhase.title}
        </h3>
      </div>
      <p className={`text-sm mb-4 transition-theme ${
        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {currentPhase.description}
      </p>
      
      <div className="flex justify-center space-x-6">
        <div className="text-center">
          <div className={`text-lg font-bold transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {Math.round(dailyWaterIntake)}ml
          </div>
          <div className={`text-xs transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Water today
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {Math.floor(elapsedTime / 3600)}h
          </div>
          <div className={`text-xs transition-theme ${
            resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Elapsed
          </div>
        </div>
      </div>
    </div>
  );
};

// Next Phase Info Component
interface NextPhaseInfoProps {
  nextPhase: {
    hours: number;
    minutes: number;
    nextPhase: {
      title: string;
      description: string;
    };
  };
}

export const NextPhaseInfo: React.FC<NextPhaseInfoProps> = ({ nextPhase }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`rounded-2xl p-5 border transition-theme ${
      resolvedTheme === 'dark'
        ? 'bg-gradient-to-r from-sky-900/20 to-blue-900/20 border-sky-800'
        : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200'
    }`}>
      <div className="flex items-center justify-center mb-3">
        <h4 className={`font-medium transition-theme ${
          resolvedTheme === 'dark' ? 'text-sky-300' : 'text-sky-800'
        }`}>
          Next: {nextPhase.nextPhase.title}
        </h4>
      </div>
      
      <div className="text-center mb-3">
        <div className={`text-lg font-semibold transition-theme ${
          resolvedTheme === 'dark' ? 'text-sky-200' : 'text-sky-700'
        }`}>
          {nextPhase.hours > 0 && `${nextPhase.hours}h `}
          {nextPhase.minutes}m remaining
        </div>
        <div className={`text-xs transition-theme ${
          resolvedTheme === 'dark' ? 'text-sky-400' : 'text-sky-600'
        }`}>
          until next phase
        </div>
      </div>
      
      <p className={`text-sm text-center transition-theme ${
        resolvedTheme === 'dark' ? 'text-sky-300' : 'text-sky-700'
      }`}>
        {nextPhase.nextPhase.description}
      </p>
    </div>
  );
};
