import { Stack } from "expo-router"

export default function ListLayout() {
    return (
        <Stack screenOptions={{headerShown: false, gestureEnabled: false}}>
            <Stack.Screen name="CreateList" />
            <Stack.Screen name="[id]" />
        </Stack>
    )
}

