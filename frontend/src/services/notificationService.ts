import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationApi } from '../api/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register device and get Expo push token
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
  await notificationApi.post('/notifications/register-token', {
    token: tokenData.data,
  });
  return tokenData.data;
};

// GET /notifications?page=1&limit=20
export const getNotifications = async (page = 1, limit = 20) => {
  const response = await notificationApi.get('/notifications', {
    params: { page, limit },
  });
  return response.data;
};

// PUT /notifications/read-all
export const markAllNotificationsRead = async () => {
  const response = await notificationApi.put('/notifications/read-all');
  return response.data;
};

// Goal alert notification
export const sendGoalNotification = async (
  matchId: number,
  scorerName: string,
  teamName: string
): Promise<void> => {
  console.log(GPL Live: Goal notification pending for match ${matchId});
};

// MOTM poll reminder
export const sendMotmPollReminder = async (
  matchId: number
): Promise<void> => {
  console.log(GPL Live: MOTM reminder pending for match ${matchId});
};

// Fantasy points update
export const sendFantasyUpdateNotification = async (
  userId: number,
  pointsEarned: number
): Promise<void> => {
  console.log(GPL Live: Fantasy update pending for user ${userId});
};

// Setup notification listeners
export const setupNotificationListeners = () => {
  const receivedSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('GPL Live: Notification received', notification);
    }
  );

  const tappedSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      console.log('GPL Live: Notification tapped', data);
    }
  );

  return () => {
    receivedSub.remove();
    tappedSub.remove();
  };
};
