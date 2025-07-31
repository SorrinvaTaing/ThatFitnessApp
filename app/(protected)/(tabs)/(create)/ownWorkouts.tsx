import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Pressable, View, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

type Workout = {
  id: string;
  name: string;
  created_at: string;
  visibility: string;
};

type GroupedWorkouts = {
  [key: string]: Workout[];
};

export default function OwnWorkoutsScreen() {
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('workouts')
        .select('id, name, created_at, visibility')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        return;
      }

      const grouped: GroupedWorkouts = {};

      data?.forEach((workout) => {
        const date = new Date(workout.created_at);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }

        grouped[monthYear].push(workout);
      });

      setGroupedWorkouts(grouped);
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>

      {loading ? (
        <Text style={styles.loading}>Loading workouts...</Text>
      ) : Object.keys(groupedWorkouts).length === 0 ? (
        <Text style={styles.placeholder}>No workouts found.</Text>
      ) : (
        Object.entries(groupedWorkouts).map(([monthYear, workouts]) => (
          <View key={monthYear} style={styles.section}>
            <Text style={styles.sectionTitle}>{monthYear}</Text>
            {workouts.map((w) => {
              const date = new Date(w.created_at);
              const readableDate = date.toLocaleString(undefined, {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: 'numeric',
              });

              return (
                <Pressable
                  key={w.id}
                  style={styles.card}
                  onPress={() => router.push(`/newWorkout?id=${w.id}`)}
                >
                  <Text style={styles.workoutName}>{w.name}</Text>
                  <Text style={styles.meta}>
                    {readableDate} | {w.visibility}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  loading: { textAlign: 'center', fontSize: 16, marginTop: 20 },
  placeholder: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#666',
  },
});
