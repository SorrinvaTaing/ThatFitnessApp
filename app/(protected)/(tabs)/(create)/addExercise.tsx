import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function AddExerciseScreen() {
  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const params = useLocalSearchParams();

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase.from('exercises').select('*');
      if (error) Alert.alert('Error', error.message);
      else setExercisesList(data || []);
    };
    fetchExercises();
  }, []);

  const handleSelectExercise = (exercise: { id: any; name: any }) => {
    const newExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      position: 0, 
      notes: '',
      sets: [{ set_number: 1, weight: '', reps: '', notes: '' }],
    };

    let currentExercises = [];
    try {
      currentExercises = params.existingExercises
        ? JSON.parse(params.existingExercises as string)
        : [];
    } catch (e) {
      console.error('Failed to parse existingExercises', e);
    }

    const updatedExercises = [...currentExercises, newExercise];

    // Navigate back with updated data
    router.replace({
      pathname: '/newWorkout',
      params: {
        workoutName: params.workoutName,
        visibility: params.visibility,
        startTime: params.startTime,
        exercises: JSON.stringify(updatedExercises),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Exercise</Text>
      <FlatList
        data={exercisesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleSelectExercise(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{item.muscle_category}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, backgroundColor: '#f1f1f1', borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 14, color: '#666' },
});
