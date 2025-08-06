import { Stack } from "expo-router";

export default function OptionsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Profile/Settings Page' }} />
        </Stack>
    )
}
