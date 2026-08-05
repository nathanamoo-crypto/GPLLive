import api from './api';
import { NOTIFICATION_URL, NotificationEndpoints } from '../constants/apiUrls';
import type { Notification } from '../types';

function mapNotification(data: any): Notification {
  return {
    id: data.id,
    type: data.type ?? 'GOAL',
    message: data.message ?? '',
    read: data.isRead ?? false,
    createdAt: data.createdAt,
  };
}

export async function getNotifications(signal?: AbortSignal): Promise<Notification[]> {
  const { data } = await api.get<any[]>(NotificationEndpoints.LIST, {
    baseURL: NOTIFICATION_URL,
    signal,
  });
  return (data ?? []).map(mapNotification);
}

export async function getUnreadNotifications(signal?: AbortSignal): Promise<Notification[]> {
  const { data } = await api.get<any[]>(NotificationEndpoints.UNREAD, {
    baseURL: NOTIFICATION_URL,
    signal,
  });
  return (data ?? []).map(mapNotification);
}

// NotificationController returns the saved/updated NotificationResponse, not
// a {success} shape - a 2xx response is itself the success signal, same
// pattern as submitMotmVote.
export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`${NotificationEndpoints.MARK_READ}/${id}`, null, {
    baseURL: NOTIFICATION_URL,
  });
}

// Real bulk mark-read - one request instead of firing markNotificationRead
// per unread id. Returns how many were actually flipped (not needed by
// callers today, but harmless to hand back).
export async function markAllNotificationsRead(): Promise<number> {
  const { data } = await api.patch<number>(NotificationEndpoints.MARK_ALL_READ, null, {
    baseURL: NOTIFICATION_URL,
  });
  return data;
}
