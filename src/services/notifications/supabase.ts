// ===========================================
// Supabase Notification Service
// RestoHub v2.0
// ===========================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationSubscription, NotificationLog, NotificationSector } from './types';

let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase client
export const initSupabase = (): SupabaseClient => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};

// Get Supabase client (lazy initialization)
export const getSupabaseClient = (): SupabaseClient | null => {
  try {
    return initSupabase();
  } catch {
    console.warn('Supabase not configured');
    return null;
  }
};

// Register FCM token
export const registerFcmToken = async (
  userId: string,
  fcmToken: string,
  sector?: NotificationSector
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    const { error } = await client
      .from('notification_subscriptions')
      .upsert({
        user_id: userId,
        fcm_token: fcmToken,
        sector: sector || 'all',
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,fcm_token',
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return { success: false, error: String(error) };
  }
};

// Unregister FCM token
export const unregisterFcmToken = async (
  userId: string,
  fcmToken: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    const { error } = await client
      .from('notification_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('fcm_token', fcmToken);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
    return { success: false, error: String(error) };
  }
};

// Subscribe to notifications
export const subscribeToNotifications = async (
  userId: string,
  sector: NotificationSector,
  notificationType: string,
  channel: 'fcm' | 'telegram' | 'both' = 'both'
): Promise<{ success: boolean; subscription?: NotificationSubscription; error?: string }> => {
  try {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    const { data, error } = await client
      .from('notification_subscriptions')
      .insert({
        user_id: userId,
        sector,
        notification_type: notificationType,
        channel,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, subscription: data };
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return { success: false, error: String(error) };
  }
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async (
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    const { error } = await client
      .from('notification_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', subscriptionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return { success: false, error: String(error) };
  }
};

// Get user subscriptions
export const getUserSubscriptions = async (
  userId: string
): Promise<NotificationSubscription[]> => {
  try {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Get FCM tokens by sector
export const getFcmTokensBySector = async (
  sector: NotificationSector
): Promise<string[]> => {
  try {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('notification_subscriptions')
      .select('fcm_token')
      .eq('is_active', true)
      .eq('channel', 'fcm')
      .neq('fcm_token', null);

    if (sector !== 'all') {
      query = query.in('sector', [sector, 'all']);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data?.map(d => d.fcm_token).filter(Boolean) as string[] || [];
  } catch (error) {
    console.error('Error getting FCM tokens by sector:', error);
    return [];
  }
};

// Log notification
export const logNotification = async (
  notificationType: string,
  sector: NotificationSector,
  priority: string,
  channel: string,
  recipientCount: number,
  title: string,
  body: string,
  status: 'pending' | 'sent' | 'failed' = 'pending',
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase not configured' };

    const { error } = await client
      .from('notification_logs')
      .insert({
        notification_type: notificationType,
        sector,
        priority,
        channel,
        recipient_count: recipientCount,
        message_title: title,
        message_body: body,
        status,
        error_message: errorMessage,
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error logging notification:', error);
    return { success: false, error: String(error) };
  }
};

// Get notification logs
export const getNotificationLogs = async (
  limit: number = 50
): Promise<NotificationLog[]> => {
  try {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting notification logs:', error);
    return [];
  }
};

// Real-time subscription to notifications
interface NotificationPayload {
  new?: { id: string; message: string; created_at: string };
  old?: { id: string };
}

export const subscribeToRealTimeNotifications = (
  userId: string,
  callback: (payload: NotificationPayload) => void
): (() => void) => {
  try {
    const client = getSupabaseClient();
    if (!client) return () => {};

    const subscription = client
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes' as const,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_logs',
          filter: `user_id=eq.${userId}`,
        },
        callback as (payload: unknown) => void
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Error setting up real-time subscription:', error);
    return () => {};
  }
};
