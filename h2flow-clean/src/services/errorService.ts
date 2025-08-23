// src/services/errorService.ts

export interface AppError {
  id: string;
  type: 'network' | 'firebase' | 'validation' | 'permission' | 'unknown';
  code?: string;
  message: string;
  userMessage: string;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;
  recoverable: boolean;
  retryCount: number;
  actions: ErrorAction[];
}

export interface ErrorAction {
  id: string;
  label: string;
  action: () => Promise<void> | void;
  primary?: boolean;
  icon?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

class ErrorService {
  private static instance: ErrorService;
  private errors: Map<string, AppError> = new Map();
  private listeners: ((error: AppError) => void)[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryCondition: (error) => this.isRetryableError(error)
  };

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  // Subscribe to error events
  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Create and handle error
  async handleError(
    error: any,
    context?: Record<string, any>,
    customActions?: ErrorAction[]
  ): Promise<AppError> {
    const appError = this.createAppError(error, context, customActions);
    
    this.errors.set(appError.id, appError);
    this.notifyListeners(appError);
    this.logError(appError);

    // Auto-retry if it's a recoverable error
    if (appError.recoverable && appError.retryCount === 0) {
      setTimeout(() => {
        this.suggestRetry(appError.id);
      }, 2000);
    }

    return appError;
  }

  // Create AppError from various error types
  private createAppError(
    error: any,
    context?: Record<string, any>,
    customActions?: ErrorAction[]
  ): AppError {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    
    let type: AppError['type'] = 'unknown';
    let code: string | undefined;
    let message = 'An unknown error occurred';
    let userMessage = 'Something went wrong. Please try again.';
    let recoverable = true;
    let actions: ErrorAction[] = [];

    // Determine error type and details
    if (this.isNetworkError(error)) {
      type = 'network';
      ({ message, userMessage, recoverable } = this.handleNetworkError(error));
    } else if (this.isFirebaseError(error)) {
      type = 'firebase';
      code = error.code;
      ({ message, userMessage, recoverable } = this.handleFirebaseError(error));
    } else if (this.isValidationError(error)) {
      type = 'validation';
      ({ message, userMessage, recoverable } = this.handleValidationError(error));
    } else if (this.isPermissionError(error)) {
      type = 'permission';
      ({ message, userMessage, recoverable } = this.handlePermissionError(error));
    } else {
      message = error.message || String(error);
      userMessage = 'An unexpected error occurred. Please try again.';
    }

    // Generate default actions
    actions = customActions || this.generateDefaultActions(type, recoverable, id);

    return {
      id,
      type,
      code,
      message,
      userMessage,
      originalError: error,
      timestamp,
      context,
      recoverable,
      retryCount: 0,
      actions
    };
  }

  // Check error types
  private isNetworkError(error: any): boolean {
    return !navigator.onLine || 
           error.message?.includes('fetch') ||
           error.message?.includes('network') ||
           error.code === 'NETWORK_ERROR';
  }

  private isFirebaseError(error: any): boolean {
    return error.code && (
      error.code.startsWith('auth/') || 
      error.code.startsWith('firestore/') ||
      error.code.startsWith('storage/')
    );
  }

  private isValidationError(error: any): boolean {
    return error.type === 'validation' || error.name === 'ValidationError';
  }

  private isPermissionError(error: any): boolean {
    return error.code === 'permission-denied' || 
           error.message?.includes('permission');
  }

  private isRetryableError(error: any): boolean {
    if (this.isNetworkError(error)) return true;
    if (this.isFirebaseError(error)) {
      const nonRetryableCodes = ['permission-denied', 'unauthenticated', 'invalid-argument'];
      return !nonRetryableCodes.includes(error.code);
    }
    return true;
  }

  // Handle specific error types
  private handleNetworkError(error: any) {
    const isOffline = !navigator.onLine;
    return {
      message: isOffline ? 'Device is offline' : 'Network request failed',
      userMessage: isOffline 
        ? 'You\'re offline. Check your connection and try again.'
        : 'Connection failed. Please check your internet and try again.',
      recoverable: true
    };
  }

  private handleFirebaseError(error: any) {
    const errorMappings: Record<string, { message: string; userMessage: string; recoverable: boolean }> = {
      'permission-denied': {
        message: 'Permission denied',
        userMessage: 'You don\'t have permission to perform this action.',
        recoverable: false
      },
      'unauthenticated': {
        message: 'User not authenticated',
        userMessage: 'Please log in again to continue.',
        recoverable: true
      },
      'unavailable': {
        message: 'Service unavailable',
        userMessage: 'Service is temporarily unavailable. Please try again later.',
        recoverable: true
      },
      'quota-exceeded': {
        message: 'Quota exceeded',
        userMessage: 'Service temporarily overloaded. Please try again in a few minutes.',
        recoverable: true
      },
      'network-request-failed': {
        message: 'Network request failed',
        userMessage: 'Connection failed. Check your internet and try again.',
        recoverable: true
      }
    };

    return errorMappings[error.code] || {
      message: error.message || 'Firebase error',
      userMessage: 'Something went wrong with the server. Please try again.',
      recoverable: true
    };
  }

  private handleValidationError(error: any) {
    return {
      message: error.message || 'Validation failed',
      userMessage: error.message || 'Please check your input and try again.',
      recoverable: true
    };
  }

  private handlePermissionError(error: any) {
    return {
      message: 'Permission denied',
      userMessage: 'You don\'t have permission to perform this action.',
      recoverable: false
    };
  }

  // Generate default actions based on error type
  private generateDefaultActions(type: AppError['type'], recoverable: boolean, errorId: string): ErrorAction[] {
    const actions: ErrorAction[] = [];

    // Dismiss action (always available)
    actions.push({
      id: 'dismiss',
      label: 'Dismiss',
      action: () => this.dismissError(errorId),
      icon: '✕'
    });

    if (recoverable) {
      // Retry action
      actions.push({
        id: 'retry',
        label: 'Retry',
        action: () => this.retryLastAction(errorId),
        primary: true,
        icon: '🔄'
      });
    }

    // Type-specific actions
    switch (type) {
      case 'network':
        if (!navigator.onLine) {
          actions.push({
            id: 'check_connection',
            label: 'Check Connection',
            action: () => this.checkConnection(),
            icon: '📶'
          });
        }
        break;

      case 'permission':
        actions.push({
          id: 'request_permission',
          label: 'Request Permission',
          action: () => this.requestPermissions(),
          icon: '🔓'
        });
        break;

      case 'firebase':
        actions.push({
          id: 'reload_data',
          label: 'Reload Data',
          action: () => this.reloadData(),
          icon: '🔄'
        });
        break;
    }

    return actions;
  }

  // Retry mechanism with exponential backoff
  async retry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultRetryConfig, ...config };
    const operationId = `op_${Date.now()}`;
    
    let lastError: any;
    
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        this.retryAttempts.delete(operationId);
        return result;
      } catch (error) {
        lastError = error;
        this.retryAttempts.set(operationId, attempt);
        
        console.log(`🔄 Retry attempt ${attempt}/${finalConfig.maxAttempts} failed:`, error);
        
        // Check if we should retry
        if (attempt === finalConfig.maxAttempts || 
            (finalConfig.retryCondition && !finalConfig.retryCondition(error))) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        );
        
        console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries failed
    this.retryAttempts.delete(operationId);
    throw lastError;
  }

  // Action implementations
  private async retryLastAction(errorId: string): Promise<void> {
    const error = this.errors.get(errorId);
    if (!error) return;

    console.log('🔄 Retrying last action for error:', errorId);
    
    // Increment retry count
    error.retryCount++;
    this.errors.set(errorId, error);
    
    // Emit retry event
    this.notifyListeners({
      ...error,
      type: 'unknown', // Special type for retry events
      userMessage: 'Retrying...'
    });
  }

  private async checkConnection(): Promise<void> {
    console.log('📶 Checking connection...');
    
    try {
      const response = await fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        console.log('✅ Connection restored');
        // Could emit a success event here
      }
    } catch (error) {
      console.log('❌ Still offline');
    }
  }

  private async requestPermissions(): Promise<void> {
    console.log('🔓 Requesting permissions...');
    // Implementation depends on what permissions are needed
  }

  private async reloadData(): Promise<void> {
    console.log('🔄 Reloading data...');
    // Emit reload event that components can listen to
    window.dispatchEvent(new CustomEvent('reload_app_data'));
  }

  private dismissError(errorId: string): void {
    this.errors.delete(errorId);
    console.log('✕ Error dismissed:', errorId);
  }

  private suggestRetry(errorId: string): void {
    const error = this.errors.get(errorId);
    if (!error || !error.recoverable) return;

    console.log('💡 Suggesting retry for error:', errorId);
    // Could show a subtle notification suggesting retry
  }

  // Utility methods
  private notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  private logError(error: AppError): void {
    const logData = {
      id: error.id,
      type: error.type,
      code: error.code,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
      recoverable: error.recoverable,
      retryCount: error.retryCount
    };

    if (error.type === 'network' || error.type === 'firebase') {
      console.warn('⚠️ App Error:', logData);
    } else {
      console.error('❌ App Error:', logData);
    }

    // In production, you might send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }

  // Public utility methods
  getAllErrors(): AppError[] {
    return Array.from(this.errors.values());
  }

  getError(id: string): AppError | undefined {
    return this.errors.get(id);
  }

  clearAllErrors(): void {
    this.errors.clear();
    console.log('🧹 All errors cleared');
  }

  clearError(id: string): void {
    this.errors.delete(id);
  }

  getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }
}

export const errorService = ErrorService.getInstance();
