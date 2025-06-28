import useUserStore from '@/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'daily_words' | 'reminder' | 'streak';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private STREAK_REMINDER_ID_KEY = 'streakReminderNotificationId';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted');
          return false;
        }
        
        // Get push token for remote notifications
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: '3f69e2d6-5620-4b05-a7c5-c9771c732a84', // Your EAS project ID
        });
        this.expoPushToken = token.data;
        console.log('Push token:', this.expoPushToken);
        
        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule daily word notification
  async scheduleDailyWordNotification(time: string): Promise<string | null> {
    try {
      // Cancel existing daily word notifications
      await this.cancelDailyWordNotifications();
      
      const [hour, minute] = time.split(':').map(Number);
      
      // Create trigger for daily notification (no type annotation)
      const trigger = {
        hour,
        minute,
        repeats: true,
      } as any;
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "📚 Your Daily Words Are Ready!",
          body: "Time to expand your vocabulary with today's new words.",
          data: { type: 'daily_words' },
          sound: 'default',
        },
        trigger,
      });
      
      console.log('Scheduled daily word notification for', time, 'with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily word notification:', error);
      return null;
    }
  }

  // Schedule a one-time streak reminder notification for today if daily words are not completed
  async scheduleStreakReminderNotificationOnce(): Promise<string | null> {
    try {
      // Cancel any existing streak reminder for today
      await this.cancelStreakReminderNotification();

      const { dailyWordNotificationTime, dailyWordsCompletedToday } = useUserStore.getState();
      if (dailyWordsCompletedToday) {
        console.log('No streak reminder needed: daily words already completed.');
        return null;
      }
      const [wordHour, wordMinute] = dailyWordNotificationTime.split(':').map(Number);
      let reminderHour = wordHour - 2;
      let reminderMinute = wordMinute;
      if (reminderHour < 0) {
        reminderHour += 24;
      }

      // Calculate the next reminder time (today)
      const now = new Date();
      let reminderTime = new Date();
      reminderTime.setHours(reminderHour, reminderMinute, 0, 0);
      if (reminderTime <= now) {
        // If the time has already passed today, do not schedule
        console.log('Streak reminder time for today has already passed.');
        return null;
      }

      const trigger = {
        date: reminderTime,
      } as any;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔥 Don't Break Your Streak!",
          body: "Complete today's words to keep your learning streak alive.",
          data: { type: 'streak' },
          sound: 'default',
        },
        trigger,
      });
      await AsyncStorage.setItem(this.STREAK_REMINDER_ID_KEY, notificationId);
      console.log('Scheduled one-time streak reminder for', reminderHour + ':' + reminderMinute, 'with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling one-time streak reminder notification:', error);
      return null;
    }
  }

  // Cancel the one-time streak reminder notification
  async cancelStreakReminderNotification(): Promise<void> {
    try {
      const notificationId = await AsyncStorage.getItem(this.STREAK_REMINDER_ID_KEY);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await AsyncStorage.removeItem(this.STREAK_REMINDER_ID_KEY);
        console.log('Cancelled one-time streak reminder notification:', notificationId);
      }
    } catch (error) {
      console.error('Error cancelling one-time streak reminder notification:', error);
    }
  }

  // Call this when daily words are completed
  async onDailyWordsCompleted(): Promise<void> {
    await this.cancelStreakReminderNotification();
  }

  // Call this at the start of each day to reschedule the streak reminder if needed
  async rescheduleStreakReminderForToday(): Promise<void> {
    await this.scheduleStreakReminderNotificationOnce();
  }

  // Send immediate notification
  async sendImmediateNotification(data: NotificationData): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
      
      console.log('Sent immediate notification with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return null;
    }
  }

  // Cancel all daily word notifications
  async cancelDailyWordNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const dailyWordNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'daily_words'
      );
      
      for (const notification of dailyWordNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      console.log('Cancelled', dailyWordNotifications.length, 'daily word notifications');
    } catch (error) {
      console.error('Error cancelling daily word notifications:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Setup notification listeners
  setupNotificationListeners(): (() => void) {
    // Handle notification received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Handle notification response (user tapped notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      
      const data = response.notification.request.content.data;
      
      // Handle different notification types
      if (data?.type === 'daily_words') {
        // Navigate to daily words screen
        // You can use router here if needed
        console.log('User tapped daily words notification');
      } else if (data?.type === 'streak') {
        // Navigate to daily words screen
        console.log('User tapped streak reminder notification');
      }
    });

    // Return cleanup function
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }

  // Initialize notification service
  async initialize(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (hasPermission) {
        this.setupNotificationListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  // Update notification schedule based on user preferences
  async updateNotificationSchedule(): Promise<void> {
    try {
      const { notificationsEnabled, dailyWordNotificationTime } = useUserStore.getState();
      
      if (notificationsEnabled) {
        // Schedule daily word notification
        await this.scheduleDailyWordNotification(dailyWordNotificationTime);
        
        // Schedule streak reminder
        await this.scheduleStreakReminderNotificationOnce();
      } else {
        // Cancel all notifications if disabled
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error updating notification schedule:', error);
    }
  }
}

export default NotificationService.getInstance(); 