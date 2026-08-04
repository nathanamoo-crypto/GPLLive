import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { getApiErrorMessage } from '../../services/api';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Notification } from '../../types';

// Backend only ever sends a single `message` string (no separate title), so
// this is what stands in for a title/icon per notification type.
const TYPE_META: Record<Notification['type'], { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  DEADLINE: { label: 'Deadline Reminder', icon: 'alarm-outline' },
  RANK: { label: 'Rank Update', icon: 'trophy-outline' },
  GOAL: { label: 'Goal Alert', icon: 'football-outline' },
  CAPTAIN: { label: 'Captain Pick', icon: 'star-outline' },
};

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationInboxScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    const data = await getNotifications(signal);
    // Newest first.
    return [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    load(controller.signal)
      .then((data) => { if (!cancelled) setNotifications(data); })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load notifications.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await load();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load notifications.'));
    }
    setRefreshing(false);
  }, [load]);

  const handlePress = useCallback(async (item: Notification) => {
    if (item.read) return;
    // Optimistic - flip it locally immediately, revert if the real PATCH
    // call fails so the UI never lies about server state.
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(item.id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: false } : n)));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const hasUnread = notifications.some((n) => !n.read);
    if (!hasUnread) return;
    // Optimistic, same as a single mark-as-read - revert everyone back to
    // their real state if the bulk call fails so the UI never lies.
    const previous = notifications;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markButton}>
            <Text style={styles.markButtonText}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : error ? (
        <Text style={styles.emptyText}>{error}</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          removeClippedSubviews
          renderItem={({ item }) => {
            const meta = TYPE_META[item.type] ?? TYPE_META.GOAL;
            return (
              <TouchableOpacity
                activeOpacity={item.read ? 1 : 0.7}
                onPress={() => handlePress(item)}
                style={[styles.notificationItem, !item.read && styles.unreadItem]}
              >
                {!item.read ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
                <Ionicons name={meta.icon} size={20} color={colors.primary} style={styles.typeIcon} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{meta.label}</Text>
                  <Text style={styles.notificationBody}>{item.message}</Text>
                  <Text style={styles.notificationTime}>{relativeTime(item.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet.</Text>}
        />
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingBottom: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
    loading: { marginTop: 40 },
    markButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    markButtonText: { color: colors.primary, fontWeight: '700' },
    notificationItem: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
    },
    unreadItem: { borderColor: colors.primary, borderWidth: 1 },
    indicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginRight: 10,
    },
    indicatorSpacer: { width: 10, marginRight: 10 },
    typeIcon: { marginRight: 12 },
    notificationContent: { flex: 1 },
    notificationTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    notificationBody: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    notificationTime: { fontSize: 11, color: colors.textTertiary, marginTop: 6 },
    emptyText: { textAlign: 'center', marginTop: 32, color: colors.textTertiary },
  });
}
