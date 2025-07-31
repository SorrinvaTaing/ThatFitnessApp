import { Stack } from "expo-router";

export default function SocialLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Social' }} />
            <Stack.Screen name="addFriends" options={{ title: 'Add Friends' }} />
            <Stack.Screen name="currentFriends" options={{ title: 'Your Friends' }} />
            <Stack.Screen name="viewRequests" options={{ title: 'Friend Requests' }} />
        </Stack>
    )
}
