import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.initialize();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    // Configurar las notificaciones
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Solicitar permisos en iOS
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('No se obtuvieron permisos para las notificaciones');
        return;
      }
    }
  }

  async getExpoPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // Inmediato
      });
    } catch (error) {
      console.error('Error al programar notificación:', error);
    }
  }

  async schedulePlanReminder(planId: string, planTitle: string, date: Date) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Tu plan está por comenzar!',
          body: `${planTitle} comenzará en 1 hora`,
          data: { planId },
        },
        trigger: {
          date: new Date(date.getTime() - 60 * 60 * 1000), // 1 hora antes
        },
      });
    } catch (error) {
      console.error('Error al programar recordatorio:', error);
    }
  }

  onNotificationReceived(handler: (notification: Notifications.Notification) => void) {
    const subscription = Notifications.addNotificationReceivedListener(handler);
    return subscription;
  }

  onNotificationResponseReceived(
    handler: (response: Notifications.NotificationResponse) => void
  ) {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return subscription;
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async dismissAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export default NotificationService.getInstance();
