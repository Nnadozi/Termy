import { Stack } from "expo-router";

export default function MainLayout() {
    return (
        <Stack>
            <Stack.Screen name="Home" options={{headerShown: false}} />
        </Stack>
    )
}