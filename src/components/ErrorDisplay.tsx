// src/components/ErrorDisplay.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, X, Shield, AlertCircle } from 'lucide-react';
import { AppError, errorService } from '../services/errorService.ts';

interface ErrorDisplayProps {
  maxVisible?: number;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  hideDelay?: number;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  maxVisible = 3,
  position = 'top',
  autoHide = true,
  hideDelay = 5000
}) => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Subscribe to error service
    const unsubscribe = errorService.subscribe((error) => {
      setErrors(prev => {
        // Remove existing error with same id
        const filtered = prev.filter(e => e.id !== error.id);
        // Add new error at the beginning
        const updated = [error, ...filtered];
        // Limit to maxVisible
        return updated.slice(0, maxVisible);
      });

      // Auto-hide non-critical errors
      if (autoHide && error.type !== 'permission' && error.recoverable) {
        setTimeout(() => {
          setErrors(prev => prev.filter(e => e.id !== error.id));
        }, hideDelay);
      }
    });

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [maxVisible, autoHide, hideDelay]);

  const getErrorIcon = (type: AppError['type']) => {
    switch (type) {
      case 'network':
        return isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />;
      case 'permission':
        return <Shield className="w-5 h-5" />;
      case 'firebase':
        return <AlertTriangle className="w-5 h-5" />;
      case 'validation':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorColor = (type: AppError['type'], recoverable: boolean) => {
    if (!recoverable) return 'red';
    
    switch (type) {
      case 'network':
        return isOnline ? 'yellow' : 'orange';
      case 'permission':
        return 'red';
      case 'firebase':
        return 'orange';
      case 'validation':
        return 'yellow';
      default:
        return 'red';
    }
  };

  const handleActionClick = async (action: any, errorId: string) => {
    try {
      await action.action();
      
      // Remove error if it was a dismiss action
      if (action.id === 'dismiss') {
        setErrors(prev => prev.filter(e => e.id !== errorId));
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const dismissError = (errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    errorService.clearError(errorId);
  };

  if (errors.length === 0) return null;

  const containerClass = position === 'top' 
    ? 'fixed top-4 left-4 right-4 z-50'
    : 'fixed bottom-4 left-4 right-4 z-50';

  return (
    <div className={containerClass}>
      <div className="space-y-3 max-w-md mx-auto">
        {errors.map((error) => {
          const color = getErrorColor(error.type, error.recoverable);
          const colorClasses = {
            red: 'bg-red-50 border-red-200 text-red-800',
            orange: 'bg-orange-50 border-orange-200 text-orange-800',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
          };

          return (
            <div
              key={error.id}
              className={`${colorClasses[color]} border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {getErrorIcon(error.type)}
                  <span className="ml-2 font-medium text-sm">
                    {error.type === 'network' && !isOnline && 'Offline'}
                    {error.type === 'network' && isOnline && 'Connection Error'}
                    {error.type === 'firebase' && 'Server Error'}
                    {error.type === 'permission' && 'Permission Required'}
                    {error.type === 'validation' && 'Invalid Input'}
                    {error.type === 'unknown' && 'Error'}
                  </span>
                </div>
                
                <button
                  onClick={() => dismissError(error.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message */}
              <p className="text-sm mb-3 leading-relaxed">
                {error.userMessage}
              </p>

              {/* Retry count indicator */}
              {error.retryCount > 0 && (
                <div className="mb-3">
                  <span className="text-xs opacity-75">
                    Retry attempt: {error.retryCount}
                  </span>
                </div>
              )}

              {/* Actions */}
              {error.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {error.actions.map((action) => {
                    const primaryClasses = color === 'red' 
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : color === 'orange'
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700';
                    
                    const secondaryClasses = color === 'red'
                      ? 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                      : color === 'orange'
                      ? 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-50'
                      : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50';

                    return (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action, error.id)}
                        className={`
                          inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                          ${action.primary ? primaryClasses : secondaryClasses}
                        `}
                      >
                        {action.icon && <span className="mr-1">{action.icon}</span>}
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Technical details (collapsible in development) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-3">
                  <summary className="text-xs cursor-pointer opacity-50 hover:opacity-75">
                    Technical Details
                  </summary>
                  <div className="mt-2 text-xs opacity-75 font-mono">
                    <div>ID: {error.id}</div>
                    <div>Type: {error.type}</div>
                    {error.code && <div>Code: {error.code}</div>}
                    <div>Time: {error.timestamp.toLocaleTimeString()}</div>
                    {error.context && (
                      <div>Context: {JSON.stringify(error.context, null, 2)}</div>
                    )}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          <WifiOff className="w-4 h-4 inline mr-2" />
          You're offline
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
