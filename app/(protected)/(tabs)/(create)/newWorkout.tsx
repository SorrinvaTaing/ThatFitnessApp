import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Pressable, Alert, Button
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

type SetEntry = {
  set_number: number;
  weight: string;
  reps: string;
  notes: string;
};

type ExerciseEntry = {
  exercise_id: string;
  exercise_name: string;
  position: number;
  notes: string;
  sets: SetEntry[];
};

type WorkoutEntry = {
  workoutName: string;
  visibility: string;
  startTime: string;
  exercises: ExerciseEntry[];
};

const STORAGE_KEY = 'draft_workout';

export default function NewWorkoutScreen() {
  const params = useLocalSearchParams();
  const [workoutName, setWorkoutName] = useState('');
  const [visibility, setVisibility] = useState('Private');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const navigation = useNavigation();
  
  //function to handle clearing async storage if the user decides to go back
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      });

      return () => unsubscribe();
    }, [navigation])
  );

  // Load draft on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: WorkoutEntry = JSON.parse(saved);
        setWorkoutName(parsed.workoutName);
        setVisibility(parsed.visibility);
        setStartTime(new Date(parsed.startTime));
        setExercises(parsed.exercises);
      } else {
        setWorkoutName((params.workoutName as string) || '');
        setVisibility((params.visibility as string) || 'Private');
        setStartTime(new Date());
      }
    })();
  }, []);
  
  
  // Timer logic
  useEffect(() => {
    let interval: any;
    if (timerActive && startTime instanceof Date && !isNaN(startTime.getTime())) {
      interval = setInterval(() => {
        const now = new Date();
        setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = () => {
    router.push({
      pathname: '/addExercise',
      params: {
        workoutName,
        visibility,
        startTime: startTime?.toISOString(),
        existingExercises: JSON.stringify(exercises),
      },
    });
  };
  

  // Save to AsyncStorage whenever any workout detail changes
  useEffect(() => {
    const save = async () => {
      const draft: WorkoutEntry = {
        workoutName,
        visibility,
        startTime: startTime?.toISOString() ?? new Date().toISOString(),
        exercises,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    };
    save();
  }, [workoutName, visibility, startTime, exercises]);
  
  // Add new exercise from params
  console.log('New exercise params:', params);
  useEffect(() => {
    if (params?.exercises) {
      try {
        const parsedExercises: ExerciseEntry[] = JSON.parse(params.exercises as string);
        setExercises(parsedExercises.map((ex, i) => ({ ...ex, position: i + 1 })));
  
        if (params.workoutName) setWorkoutName(params.workoutName as string);
        if (params.visibility) setVisibility(params.visibility as string);
        if (params.startTime) {
          const parsedStart = new Date(params.startTime as string);
          if (!isNaN(parsedStart.getTime())) setStartTime(parsedStart);
        }
  
        // Remove param so it doesn't loop
        router.replace('/newWorkout');
      } catch (err) {
        console.error('Error parsing exercises param', err);
      }
    }
  }, [params?.exercises]);
  
  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...exercises];
    const currentSets = updated[exerciseIndex].sets;
    const nextSetNumber = currentSets.length + 1;
  
    currentSets.push({
      set_number: nextSetNumber,
      weight: '',
      reps: '',
      notes: '',
    });
  
    setExercises(updated);
  };
  
  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetEntry, value: string) => {
    const updated = [...exercises];
    (updated[exerciseIndex].sets[setIndex] as any)[field] = value;
    setExercises(updated);
  };

  const finishWorkout = async () => {
    setTimerActive(false);
    const completedAt = new Date();

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw userError || new Error('User not found');

      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userData.user.id,
          name: workoutName,
          visibility: visibility,
          started_at: startTime?.toISOString(),
          completed_at: completedAt.toISOString(),
        })
        .select('id')
        .single();

      if (workoutError || !workoutData) throw workoutError;
      const workoutId = workoutData.id;

      const workoutExerciseInsert = exercises.map((ex, index) => ({
        workout_id: workoutId,
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        position: index + 1,
        notes: ex.notes || '',
      }));

      const { data: insertedWorkoutExercises, error: exerciseInsertError } = await supabase
        .from('workout_exercises')
        .insert(workoutExerciseInsert)
        .select('id');

      if (exerciseInsertError || !insertedWorkoutExercises) throw exerciseInsertError;

      const setsInsert = insertedWorkoutExercises.flatMap((we, i) =>
        exercises[i].sets.map((set) => ({
          workout_exercise_id: we.id,
          set_number: set.set_number,
          weight: parseFloat(set.weight),
          reps: parseInt(set.reps),
          notes: set.notes || '',
        }))
      );

      const { error: setsError } = await supabase.from('workout_sets').insert(setsInsert);
      if (setsError) throw setsError;

      await AsyncStorage.removeItem(STORAGE_KEY);
      Alert.alert('Workout Saved!');
      router.replace('./');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to save workout.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workoutName || 'Default'} Workout</Text>
      <Text style={styles.timer}>Elapsed: {formatTime(elapsedTime)}</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item, idx) => item.exercise_id + '-' + idx}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.exerciseName}>{item.exercise_name}</Text>
            {item.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setRowHorizontal}>
              <Text style={styles.setLabel}>Set {set.set_number}</Text>
              <TextInput
                style={styles.setInput}
                placeholder="Reps"
                keyboardType="numeric"
                value={set.reps}
                onChangeText={(text) => updateSet(index, setIndex, 'reps', text)}
              />
              <TextInput
                style={styles.setInput}
                placeholder="Weight"
                keyboardType="numeric"
                value={set.weight}
                onChangeText={(text) => updateSet(index, setIndex, 'weight', text)}
              />
              <TextInput
                style={[styles.setInput, { flex: 1 }]}
                placeholder="Notes"
                value={set.notes}
                onChangeText={(text) => updateSet(index, setIndex, 'notes', text)}
              />
            </View>
          ))}

          <Pressable
            style={styles.addSetButton}
            onPress={() => addSetToExercise(index)}
          >
            <Text style={styles.addSetButtonText}>+ Add Set</Text>
          </Pressable>

          </View>
        )}
        ListEmptyComponent={<Text style={styles.placeholder}>No exercises added yet.</Text>}
      />

      <Pressable style={styles.button} onPress={addExercise}>
        <Text style={styles.buttonText}>Add Exercise</Text>
      </Pressable>

      <Pressable style={styles.secButton} onPress={finishWorkout}>
        <Text style={styles.buttonText}>Finish Workout</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  timer: { fontSize: 16, marginBottom: 20 },
  card: { backgroundColor: '#f1f1f1', padding: 15, marginBottom: 15, borderRadius: 10 },
  exerciseName: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  setRow: { marginBottom: 10 },
  setLabel: { fontSize: 14, fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 4,
    padding: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  secButton:{
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  placeholder: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 40 },
  addSetButton: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  
  addSetButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  
  setRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  
  setInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    width: 60,
  },
  
});
