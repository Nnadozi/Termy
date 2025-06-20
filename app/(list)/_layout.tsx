import { Stack } from "expo-router"

export default function ListLayout() {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="CreateList" />
            <Stack.Screen name="[id]" />
        </Stack>
    )
}

