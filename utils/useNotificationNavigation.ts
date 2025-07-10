import useUserStore from '@/stores/userStore';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

export const useNotificationNavigation = () => {
  const { isOnboardingComplete } = useUserStore();

  useEffect(() => {
    // Handle notification response (user tapped notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      
      const data = response.notification.request.content.data;
      
      // Check if onboarding is complete before handling navigation
      if (!isOnboardingComplete) {
        console.log('Onboarding not complete - ignoring notification tap');
        return;
      }
      
      // Handle different notification types
      if (data?.type === 'daily_words' || data?.type === 'streak') {
        // Navigate to daily words screen only if onboarding is complete
        console.log('Navigating to Daily screen from notification');
        router.push('/(main)/Daily');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      responseSubscription.remove();
    };
  }, [isOnboardingComplete]);
}; 