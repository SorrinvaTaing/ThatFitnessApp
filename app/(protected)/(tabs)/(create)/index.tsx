import { StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';

export default function CreateScreen() {
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Workout</Text>
      <Text style={styles.subtitle}>Craft a custom session to track your progress</Text>

      <Pressable style={styles.section} onPress={() => router.push('./createWorkout')}>
        <Text style={styles.sectionTitle}>Start A New Workout</Text>
        <Text style={styles.sectionDescription}>
          Build a personalised workout with custom exercises, sets, reps and notes.
        </Text>
      </Pressable>

      <Pressable style ={styles.section} onPress={() => router.push('./ownWorkouts')}>
        <Text style={styles.sectionTitle}>Start An Existing Workout</Text>
        <Text style={styles.sectionDescription}>
          Pick from any of your saved workouts to continue your routine.
        </Text>
      </Pressable>

      <Pressable style ={styles.section} onPress={() => router.push('./routine')}>
        <Text style={styles.sectionTitle}>Check Your Routine</Text>
        <Text style={styles.sectionDescription}>
          View and edit your current routine.
        </Text>
      </Pressable>

      <Pressable style={styles.section} onPress={() => router.push('./addExerciseDatabase')}>
        <Text style={styles.sectionTitle}>Add New Exercise</Text>
        <Text style={styles.sectionDescription}>
          Add a brand new exercise to try in your routine.
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
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6e6e6e',
    marginBottom: 10,
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
});
