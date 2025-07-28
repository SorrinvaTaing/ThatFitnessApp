import { Stack } from "expo-router";

export default function ExploreLayout() {
    return (
        <Stack>
            <Stack.Screen name="exploreWorkout" options={{ title: 'Explore Workouts' }} />
            <Stack.Screen name="allExercises" options={{ title: 'View All Exercises' }} />
        </Stack>
    )
}
