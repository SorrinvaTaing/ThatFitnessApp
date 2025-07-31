import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RoutineScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutine = async () => {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        id,
        day_of_week,
        workout:workouts (
          id,
          name,
          workout_exercises (
            id,
            exercise_name,
            workout_sets (
              id
            )
          )
        )
      `)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (!error) setRoutines(data || []);
    setLoading(false);
  };

  const deleteWorkout = async (routineId: string) => {
    const { error } = await supabase.from('routines').delete().eq('id', routineId);

    if (error) {
      console.error('Error deleting routine:', error);
      return;
    }

    fetchRoutine();
  };

  useEffect(() => {
    fetchRoutine();
  }, []);

  const grouped = days.map((day) => ({
    day,
    workouts: routines.filter((r) => r.day_of_week === day),
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Weekly Routine</Text>

      {grouped.map(({ day, workouts }) => (
        <View key={day} style={styles.dayBlock}>
          <Text style={styles.dayTitle}>{day}</Text>
          {workouts.length === 0 ? (
            <Text style={styles.noWorkout}>No workouts assigned.</Text>
          ) : (
            workouts.map((entry) => (
              <View key={entry.id} style={styles.workoutRow}>
                <View style={styles.workoutCard}>
                  <Text style={styles.workoutName}>{entry.workout.name}</Text>
                  {entry.workout.workout_exercises.map((ex: any) => (
                    <Text key={ex.id} style={styles.exerciseLine}>
                      {ex.workout_sets.length} x {ex.exercise_name}
                    </Text>
                  ))}
                </View>
                <Pressable onPress={() => deleteWorkout(entry.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
          <Pressable
            style={styles.addButton}
            onPress={() => router.push({ pathname: '/addToRoutine', params: { day } })}
          >
            <Text style={styles.addButtonText}>+ Add Workout</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  dayBlock: { marginBottom: 24 },
  dayTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  
  workoutName: { fontSize: 16, fontWeight: '500' },
  exerciseLine: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  category: { fontSize: 14, color: '#666' },
  noWorkout: { color: '#999', fontStyle: 'italic', marginBottom: 4 },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  workoutRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  
  workoutCard: {
    flex: 1, 
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
  },
  
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch', 
  },
  
});
