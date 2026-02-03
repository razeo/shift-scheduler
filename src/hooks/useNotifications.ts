// ===========================================
// useNotifications Hook
// RestoHub v2.0
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  requestFcmPermission,
  getFcmToken,
  registerFcmToken,
  isFcmConfigured,
  isTelegramConfigured,
  subscribeToNotifications,
  getUserSubscriptions,
  NotificationSector,
  NotificationType,
  NotificationChannel,
} from '../services/notifications';

// User ID storage key
const USER_ID_KEY = 'restohub_user_id';

// Generate or get user ID
const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

// Subscription state
interface SubscriptionState {
  sector: NotificationSector;
  notificationType: NotificationType;
  channel: NotificationChannel;
}

interface UseNotificationsReturn {
  // Permission state
  permission: NotificationPermission | 'unknown';
  hasPermission: boolean;
  isFcmReady: boolean;
  isTelegramReady: boolean;
  
  // Token
  fcmToken: string | null;
  
  // Subscriptions
  subscriptions: SubscriptionState[];
  
  // Actions
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  subscribeToSector: (sector: NotificationSector, types: NotificationType[], channel: NotificationChannel) => Promise<boolean>;
  unsubscribeFromSector: (sector: NotificationSector) => Promise<boolean>;
  
  // Utility
  refreshSubscriptions: () => Promise<void>;
  getUserId: () => string;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | 'unknown'>('unknown');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionState[]>([]);
  const [isFcmReady, setIsFcmReady] = useState(false);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  const userId = getOrCreateUserId();

  // Check initial permission state
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check service readiness
  useEffect(() => {
    setIsFcmReady(isFcmConfigured());
    setIsTelegramReady(isTelegramConfigured());
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const token = await requestFcmPermission();
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        toast.success('Notifications enabled!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, []);

  // Register FCM token with Supabase
  const registerToken = useCallback(async (): Promise<boolean> => {
    try {
      if (!fcmToken) {
        const newToken = await getFcmToken();
        if (!newToken) {
          toast.error('Failed to get FCM token');
          return false;
        }
        setFcmToken(newToken);
      }

      const result = await registerFcmToken(userId, fcmToken || '');
      if (result.success) {
        toast.success('Device registered for notifications');
        return true;
      } else {
        toast.error('Failed to register device');
        return false;
      }
    } catch (error) {
      console.error('Error registering token:', error);
      return false;
    }
  }, [fcmToken, userId]);

  // Subscribe to sector notifications
  const subscribeToSector = useCallback(async (
    sector: NotificationSector,
    types: NotificationType[],
    channel: NotificationChannel
  ): Promise<boolean> => {
    try {
      let success = true;

      for (const type of types) {
        const result = await subscribeToNotifications(
          userId,
          sector,
          type,
          channel
        );
        if (!result.success) {
          success = false;
          console.error(`Failed to subscribe to ${type}:`, result.error);
        }
      }

      if (success) {
        toast.success(`Subscribed to ${sector} notifications`);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await refreshSubscriptions();
      }

      return success;
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
      return false;
    }
  }, [userId]);

  // Unsubscribe from sector
  const unsubscribeFromSector = useCallback(async (
    sector: NotificationSector
  ): Promise<boolean> => {
    try {
      // For now, we just clear local subscription
      // In production, you'd call the API to remove subscriptions
      toast.success(`Unsubscribed from ${sector}`);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await refreshSubscriptions();
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }, []);

  // Refresh subscriptions from Supabase
  const refreshSubscriptions = useCallback(async () => {
    try {
      const subs = await getUserSubscriptions(userId);
      setSubscriptions(
        subs.map(s => ({
          sector: s.sector,
          notificationType: s.notification_type,
          channel: s.channel,
        }))
      );
    } catch (error) {
      console.error('Error refreshing subscriptions:', error);
    }
  }, [userId]);

  // Get user ID
  const getUserId = useCallback(() => userId, [userId]);

  return {
    permission,
    hasPermission: permission === 'granted',
    isFcmReady,
    isTelegramReady,
    fcmToken,
    subscriptions,
    requestPermission,
    registerToken,
    subscribeToSector,
    unsubscribeFromSector,
    refreshSubscriptions,
    getUserId,
  };
};

// Notification handler type
export type NotificationHandler = (payload: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) => void;

// Hook for handling incoming notifications
export const useNotificationHandler = (_handler: NotificationHandler) => {
  useEffect(() => {
    // Set up foreground message handler
    // This would be set up when Firebase is initialized
    // For now, this is a placeholder
    
    return () => {
      // Cleanup if needed
    };
  }, [_handler]);
};

// Hook for notification toasts
export const useNotificationToasts = () => {
  useEffect(() => {
    // Listen for incoming messages when app is in foreground
    // This requires Firebase foreground message handling
    
    // In production, register message listener here
    // messaging().onMessage(handleMessage);
    
    return () => {
      // Cleanup
    };
  }, []);
};

export default useNotifications;
