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
  const { notificationsEnabled, dailyWordNotificationTime, isOnboardingComplete, resetDailyCompletion } = useUserStore()
  const [loaded, error] = useFonts({
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMSans-Italic': require('../assets/fonts/DMSans-Italic.ttf'),
  });

  useNotificationNavigation();

  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      if (isOnboardingComplete) {
        // Clear all existing notifications for debugging
        console.log('DEBUG: Clearing all existing notifications');
        await notificationService.cancelAllNotifications();
        
        await notificationService.initialize();
        // Temporarily disable all notification scheduling to debug
        console.log('DEBUG: Skipping notification scheduling to test unwanted notifications');
        // if (notificationsEnabled) {
        //   await notificationService.updateNotificationSchedule();
        //   // Debug: List all scheduled notifications
        //   await notificationService.debugScheduledNotifications();
        // }
      }
    };
    
    initNotifications();
  }, [isOnboardingComplete, notificationsEnabled, dailyWordNotificationTime]);

  // Check and reset daily completion if it's a new day
  useEffect(() => {
    const checkDailyReset = () => {
      const { lastQuizDate, resetDailyCompletion } = useUserStore.getState();
      const today = new Date().toISOString().split('T')[0];
      
      if (lastQuizDate && lastQuizDate !== today) {
        console.log('New day detected, resetting daily completion');
        resetDailyCompletion();
      }
    };
    
    checkDailyReset();
  }, [resetDailyCompletion]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // Listen for app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App has come to the foreground
        
        // Check if it's a new day and reset daily completion
        const { lastQuizDate, dailyWordsCompletedToday } = useUserStore.getState();
        const today = new Date().toISOString().split('T')[0];
        if (lastQuizDate && lastQuizDate !== today) {
          console.log('App state change - New day detected, resetting daily completion');
          resetDailyCompletion();
        }
        
        // Only reschedule notifications if onboarding is complete, notifications are enabled, and daily words are not completed
        // Temporarily disabled for debugging
        // if (isOnboardingComplete && notificationsEnabled && !dailyWordsCompletedToday) {
        //   await notificationService.rescheduleStreakReminderForToday();
        // }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isOnboardingComplete, notificationsEnabled, resetDailyCompletion]);

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
      </SafeAreaProvider>
      <Toast />
    </>
  );
}