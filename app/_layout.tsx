import { useThemeStore } from "@/stores/themeStore";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import Toast from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
});

export default function RootLayout() {
  const { isDark, colors } = useThemeStore(); 
  const [loaded, error] = useFonts({
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMSans-Italic': require('../assets/fonts/DMSans-Italic.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'}/>
      <ThemeProvider value={colors}> 
        <Stack screenOptions={{headerShown: false, gestureEnabled: false}}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="Quiz" />
          <Stack.Screen name="PlacementTest" />
        </Stack>  
      </ThemeProvider>
      <Toast />
    </>
  );
}