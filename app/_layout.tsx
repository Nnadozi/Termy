import OfflineIndicator from '@/components/OfflineIndicator';
import { useThemeStore } from "@/stores/themeStore";
import useUserStore from "@/stores/userStore";
import notificationService from "@/utils/notificationService";
import { useNotificationNavigation } from "@/utils/useNotificationNavigation";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark, colors } = useThemeStore(); 
  const { notificationsEnabled, isOnboardingComplete, resetDailyCompletion } = useUserStore()
  const [loaded, error] = useFonts({
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMSans-Italic': require('../assets/fonts/DMSans-Italic.ttf'),
  });

  useNotificationNavigation();

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      if (isOnboardingComplete) {
        console.log('Onboarding complete - initializing notifications');
        console.log('DEBUG: Clearing all existing notifications');
        await notificationService.cancelAllNotifications();
        await notificationService.initialize();
        // Don't call updateNotificationSchedule here - it's already handled in completeOnboarding()
        console.log('DEBUG: Notifications will be scheduled by completeOnboarding() if enabled');
      } else {
        console.log('Onboarding not complete - cancelling all notifications');
        await notificationService.cancelAllNotifications();
      }
    };
    
    initNotifications();
  }, [isOnboardingComplete]);

  // Check daily reset
  useEffect(() => {
    const checkDailyReset = () => {
      const { lastQuizDate } = useUserStore.getState();
      const today = new Date().toISOString().split('T')[0];
      
      if (lastQuizDate && lastQuizDate !== today) {
        console.log('New day detected, resetting daily completion');
        resetDailyCompletion();
      }
    };
    
    checkDailyReset();
  }, [resetDailyCompletion]);

  // Handle splash screen
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        const { lastQuizDate, dailyWordsCompletedToday } = useUserStore.getState();
        const today = new Date().toISOString().split('T')[0];
        if (lastQuizDate && lastQuizDate !== today) {
          console.log('App state change - New day detected, resetting daily completion');
          resetDailyCompletion();
        }
        if (isOnboardingComplete && notificationsEnabled && !dailyWordsCompletedToday) {
          await notificationService.rescheduleStreakReminderForToday();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isOnboardingComplete, notificationsEnabled, resetDailyCompletion]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'}/>
      <SafeAreaProvider>  
        <ThemeProvider value={colors}> 
          <Stack screenOptions={{headerShown: false, gestureEnabled: false}}>
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(main)" />
            <Stack.Screen name="(list)" />
            <Stack.Screen name="Quiz" />
          </Stack>  
        </ThemeProvider>
        <OfflineIndicator />
      </SafeAreaProvider>
      <Toast />
    </>
  );
}
