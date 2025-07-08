import { useThemeStore } from "@/stores/themeStore";
import useUserStore from "@/stores/userStore";
import { useNotificationNavigation } from "@/utils/useNotificationNavigation";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
});

export default function RootLayout() {
  const { isDark, colors } = useThemeStore(); 
  const { isPremium, setPremium } = useUserStore()
  const [loaded, error] = useFonts({
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMSans-Italic': require('../assets/fonts/DMSans-Italic.ttf'),
  });

  useNotificationNavigation();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  useEffect(() =>{
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === 'ios') {
      Purchases.configure({apiKey: "goog_FSBsUShdAwKnxRNIbhpbyAZfvGq"});
    } else if (Platform.OS === 'android') {
        Purchases.configure({apiKey: "goog_FSBsUShdAwKnxRNIbhpbyAZfvGq"});
    }
   // keys are safe to expose :)
  },[])

  useEffect(() => {
    const fetchProducts = async () => {
      try{
        const customerInfo = await Purchases.getCustomerInfo();
        console.log('Customer info:', customerInfo);
        if(typeof customerInfo.entitlements.active["premium"] !== "undefined") {
          setPremium(true)
        } else {
          setPremium(false)
        }
    } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  },[])

  // Listen for app state changes to refresh subscription status
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App has come to the foreground, refresh subscription status
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          console.log('App state change - Customer info:', customerInfo);
          if(typeof customerInfo.entitlements.active["premium"] !== "undefined") {
            setPremium(true)
          } else {
            setPremium(false)
          }
        } catch (error) {
          console.error('Error refreshing subscription status:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [setPremium]);

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