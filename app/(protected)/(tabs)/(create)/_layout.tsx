import { Stack } from "expo-router";

export default function CreateLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Create A Workout' }} />
            <Stack.Screen name="newWorkout" options={{ title: 'Starting A Workout' }} />
            <Stack.Screen name="addExercise" options={{ title: 'View All Exercises' }} />
            <Stack.Screen name="addExerciseDatabase" options={{ title: 'Add New Exercise' }} />
            <Stack.Screen name="ownWorkouts" options={{ title: 'Your Workouts' }} />
            <Stack.Screen name="createWorkout" options={{ title: 'Make A Workout' }} />
            <Stack.Screen name="addToRoutine" options={{ title: 'Add To Routine' }} />
            <Stack.Screen name="routine" options={{ title: 'My Routine' }} />
        </Stack>
    )
}
