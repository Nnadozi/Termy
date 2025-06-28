import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

export const useNotificationNavigation = () => {
  useEffect(() => {
    // Handle notification response (user tapped notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      
      const data = response.notification.request.content.data;
      
      // Handle different notification types
      if (data?.type === 'daily_words' || data?.type === 'streak') {
        // Navigate to daily words screen
        router.push('/(main)/Daily');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      responseSubscription.remove();
    };
  }, []);
}; 