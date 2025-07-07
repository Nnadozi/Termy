import { Stack } from "expo-router";


export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="Profile" />
      <Stack.Screen name="NotificationSettings" />
      <Stack.Screen name="PremiumSettings" />
    </Stack>
  )
}
