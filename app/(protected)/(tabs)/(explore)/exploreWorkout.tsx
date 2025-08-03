import React, { useEffect, useState } from 'react';
import { FlatList, TextInput, Pressable, StyleSheet, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';

type WorkoutSet = {
  id: string;
};

type WorkoutExercise = {
  id: string;
  exercise_name: string;
  workout_sets: WorkoutSet[];
};

type PublicWorkout = {
  id: string;
  name: string;
  category: string;
  visibility: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
  workout_exercises: WorkoutExercise[];
};

export default function ExploreWorkoutsScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<PublicWorkout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<PublicWorkout[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPublicWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          name,
          visibility,
          user_id,
          profiles (
            username,
            full_name
          ),
          workout_exercises (
            id,
            exercise_name,
            workout_sets (
              id
            )
          )
        `)
        .eq('visibility', 'Public');

      if (error) {
        console.error('Error fetching public workouts:', error);
      } else {
        setWorkouts(data as unknown as PublicWorkout[]); 
        setFilteredWorkouts(data as unknown as PublicWorkout[]);
      }
    };

    fetchPublicWorkouts();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);

    const filtered = workouts.filter((w) => {
      const workoutNameMatch = w.name.toLowerCase().includes(text.toLowerCase());
      const usernameMatch = w.profiles?.username?.toLowerCase().includes(text.toLowerCase());
      const categoryMatch = w.category?.toLowerCase().includes(text.toLowerCase());
      return workoutNameMatch || usernameMatch || categoryMatch;
    });

    setFilteredWorkouts(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Public Workouts</Text>

      <TextInput
        placeholder="Search by workout, username or category"
        value={search}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.workoutCard}
            onPress={() => router.push(`/newWorkout?id=${item.id}`)}
            >
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text style={styles.meta}>
              By {item.profiles?.full_name}
            </Text>
            {item.workout_exercises.map((ex) => (
              <RNView key={ex.id} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>
                {ex.workout_sets.length} x {ex.exercise_name}
                </Text>
              </RNView>
            ))}
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.placeholder}>No public workouts found.</Text>
        }
      />

      <Pressable
        style={styles.section}
        onPress={() => router.push('/allExercises')}
      >
        <Text style={styles.sectionTitle}>View all exercises</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  workoutCard: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseRow: {
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 15,
    color: '#333',
  },
  section: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
