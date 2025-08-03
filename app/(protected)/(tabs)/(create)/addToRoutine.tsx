// app/routine/AddToRoutine.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function AddToRoutineScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const router = useRouter();
  const [myWorkouts, setMyWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyWorkouts = async () => {
      console.log('Day param:', day);
      const userId = (await supabase.auth.getUser()).data.user?.id;

      console.log('User ID:', userId);
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          name,
          workout_exercises (
            id,
            exercise_name,
            workout_sets (
              id
            )
          )
        `)
        .eq('user_id', userId);

      if (!error) {
        console.log('Fetched workouts:', data);
        setMyWorkouts(data || []);
      }
      
      setLoading(false);
    };

    fetchMyWorkouts();
  }, [day]);

  const assignWorkout = async (workout_id: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase.from('routines').insert({
      user_id: userId,
      workout_id,
      day_of_week: day,
    });

    if (error) Alert.alert('Error', 'Could not assign workout.');
    else {
      Alert.alert('Success', 'Workout added to routine.');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Workout to {day}</Text>

      <FlatList
        data={myWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => assignWorkout(item.id)}
            style={styles.workoutCard}
          >
            <Text style={styles.workoutName}>{item.name}</Text>
            {item.workout_exercises.map((ex: any) => (
              <Text key={ex.id} style={styles.workoutName}>
                {ex.workout_sets.length} x {ex.exercise_name}
              </Text>
            ))}
          </Pressable>

        )}
        ListEmptyComponent={<Text style={styles.noWorkout}>No workouts available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  workoutCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  workoutName: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 14, color: '#555' },
  noWorkout: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 20 },
});
