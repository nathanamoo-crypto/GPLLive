import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DUMMY_NOTIFICATIONS } from '../../constants/homeDummyData';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { Notification } from '../../types';

export default function NotificationInboxScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead} style={styles.markButton}>
          <Text style={styles.markButtonText}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={[styles.notificationItem, !item.read && styles.unreadItem]}>
            {!item.read ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
              <Text style={styles.notificationTime}>Just now</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white, fontFamily: fonts.display, textTransform: 'uppercase' },
  markButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  markButtonText: { color: Colors.yellow, fontWeight: '700' },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadItem: { borderColor: Colors.yellow, borderWidth: 1 },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.yellow,
    marginRight: 14,
  },
  indicatorSpacer: { width: 10, marginRight: 14 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  notificationBody: { fontSize: 13, color: Colors.grey1, marginTop: 4 },
  notificationTime: { fontSize: 11, color: Colors.grey2, marginTop: 6 },
  emptyText: { textAlign: 'center', marginTop: 32, color: Colors.grey2 },
});
