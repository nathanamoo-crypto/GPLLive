import { useMemo } from 'react';

import { DUMMY_NOTIFICATIONS } from '../constants/homeDummyData';
import { Notification } from '../types';

export function useNotifications() {
  const notifications = useMemo<Notification[]>(() => DUMMY_NOTIFICATIONS, []);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return { notifications, unreadCount };
}
