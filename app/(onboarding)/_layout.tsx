import { Stack } from "expo-router";


export default function OnboardingLayout(){
    return(
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="Intro" options={{headerShown: false}} />
            <Stack.Screen name="Preferences" options={{headerShown: false}} />
            <Stack.Screen name="NotificationsSetup" options={{headerShown: false}} />
            <Stack.Screen name="ProfileSetup" options={{headerShown: false}} />
            <Stack.Screen name="Finish" options={{headerShown: false}} />
        </Stack>
    )
}