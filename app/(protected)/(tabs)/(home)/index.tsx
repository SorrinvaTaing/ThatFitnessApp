import { Pressable, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [todayRoutine, setTodayRoutine] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('Failed to get user:', userError);
        return;
      }

      const userId = userData.user.id;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (profileData?.full_name) {
        setFullname(profileData.full_name);
      }

      const today = new Date().toLocaleDateString('en-AU', { weekday: 'long' });

      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select(`
          id,
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
        .eq('user_id', userId)
        .eq('day_of_week', today)
        .single();

      if (!routineError && routineData) {
        setTodayRoutine(routineData);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back, {fullname}</Text>
      <Text style={styles.subtitle}>Your fitness journey starts here</Text>

      {todayRoutine ? (
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>Today's Workout: {todayRoutine.workout.name}</Text>
          {todayRoutine.workout.workout_exercises.map((ex: any) => (
            <Text key={ex.id} style={styles.exerciseLine}>
              {ex.workout_sets.length} x {ex.exercise_name}
            </Text>
          ))}
        </View>
      ) : (
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>No workout scheduled today</Text>
        </View>
      )}

      <Pressable style={styles.section} onPress={() => router.push('./(create)')}>
        <Text style={styles.sectionTitle}>Start a Workout</Text>
        <Text style={styles.sectionDescription}>
          Jump into your routine and keep your streak alive!
        </Text>
      </Pressable>

      <Pressable style={styles.section} onPress={() => router.push('./(explore)')}>
        <Text style={styles.sectionTitle}>View All Workouts</Text>
        <Text style={styles.sectionDescription}>
          View all the public workouts by your friends and the community.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6e6e6e',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    width: '100%',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    lineHeight: 20,
  },
  todayCard: {
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  exerciseLine: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
