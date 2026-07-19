// ================================================
// notificationService.ts
// GPL Live - Group 73
// Integration & Notifications Lead
// ================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ------------------------------------------------
// Register device and get Expo push token
// Sends token to notification-service (port 8086)
// ------------------------------------------------
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('GPL Live: Push notifications require a real device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('GPL Live: Notification permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'GPL Live',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  // TODO: send to POST /notifications/register-token on port 8086
  // await api.post('/notifications/register-token', { token: tokenData.data });
  return tokenData.data;
};

// ------------------------------------------------
// GET /notifications?page=1&limit=20
// Fetch all notifications for the current user
// Consumer: NotificationInboxScreen
// ------------------------------------------------
export const getNotifications = async (page = 1, limit = 20) => {
  // TODO: implement when notification-service (port 8086) is running
  // const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  // return response.data;
  console.log('GPL Live: getNotifications pending - service not running');
  return [];
};

// ------------------------------------------------
// PUT /notifications/read-all
// Mark all notifications as read
// Consumer: NotificationInboxScreen "Mark all read" button
// ------------------------------------------------
export const markAllNotificationsRead = async () => {
  // TODO: implement when notification-service (port 8086) is running
  // const response = await api.put('/notifications/read-all');
  // return response.data;
  console.log('GPL Live: markAllRead pending - service not running');
};

// ------------------------------------------------
// Goal alert notification
// Triggered when match-service reports a goal
// ------------------------------------------------
export const sendGoalNotification = async (
  matchId: number,
  scorerName: string,
  teamName: string
): Promise<void> => {
  // TODO: implement when match-service (port 8082) is connected
  console.log(`GPL Live: Goal notification pending for match ${matchId}`);
};

// ------------------------------------------------
// MOTM poll reminder
// Triggered after a match ends
// ------------------------------------------------
export const sendMotmPollReminder = async (
  matchId: number
): Promise<void> => {
  // TODO: implement when vote-service (port 8084) is ready
  console.log(`GPL Live: MOTM reminder pending for match ${matchId}`);
};

// ------------------------------------------------
// Fantasy points update
// Triggered after admin updates player stats
// ------------------------------------------------
export const sendFantasyUpdateNotification = async (
  userId: number,
  pointsEarned: number
): Promise<void> => {
  // TODO: implement when fantasy-service (port 8083) is connected
  console.log(`GPL Live: Fantasy update pending for user ${userId}`);
};

// ------------------------------------------------
// Setup notification listeners
// Call this in App.tsx on first load
// Handles navigation when user taps a notification
// ------------------------------------------------
export const setupNotificationListeners = () => {
  const receivedSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('GPL Live: Notification received', notification);
    }
  );

  const tappedSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      // TODO: add navigation when RootNavigator is ready
      // if (data.type === 'GOAL') navigate to MatchDetails
      // if (data.type === 'MOTM') navigate to MatchDetails voting
      // if (data.type === 'FANTASY') navigate to Fantasy tab
      console.log('GPL Live: Notification tapped', data);
    }
  );

  return () => {
    receivedSub.remove();
    tappedSub.remove();
  };
};