import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getUnreadNotifications } from '../services/notificationService';
import { Notification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Refetches every time the screen holding the bell icon comes back into
  // focus - e.g. after visiting the inbox and marking things read, so the
  // header badge count doesn't sit stale until a full app reload (same
  // refetch-on-focus pattern as FantasySnapshotWidget).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getUnreadNotifications()
        .then((data) => { if (!cancelled) setNotifications(data); })
        .catch(() => { if (!cancelled) setNotifications([]); });
      return () => { cancelled = true; };
    }, [])
  );

  const unreadCount = notifications.length;

  return { notifications, unreadCount };
}
