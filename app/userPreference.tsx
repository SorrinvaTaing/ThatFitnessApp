import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { supabase } from '../utils/supabase';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/utils/authContext';

export default function WelcomeScreen() {
  const [goals, setGoals] = useState<string[]>([]);
  const [goalType, setGoalType] = useState<'lose' | 'gain' | 'maintain' | null>(null);
  const [loading, setLoading] = useState(false);
  const { logIn } = useContext(AuthContext);
  
  const router = useRouter();

  const fitnessOptions = ['Weightlifting', 'Cardio', 'Yoga', 'Pilates'];

  const toggleGoal = (option: string) => {
    setGoals((prev) =>
      prev.includes(option) ? prev.filter((g) => g !== option) : [...prev, option]
    );
  };

  const submitProfile = async () => {
    if (goals.length === 0 || !goalType) {
      Alert.alert('Please complete all fields.');
      return;
    }
    setLoading(true);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      Alert.alert('Error retrieving user info.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        fitness_goals: goals,
        weight_goal: goalType,
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Failed to save profile', error.message);
    } else {
      logIn();
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Tell us a bit about your fitness goals.</Text>

      <Text style={styles.label}>What are you interested in?</Text>
      <View style={styles.options}>
        {fitnessOptions.map((option) => (
          <Button
            key={option}
            title={option}
            onPress={() => toggleGoal(option)}
            color={goals.includes(option) ? '#007AFF' : '#ccc'}
          />
        ))}
      </View>

      <Text style={styles.label}>Do you want to lose or gain weight?</Text>
      <View style={styles.options}>
        <Button
          title="Lose"
          onPress={() => setGoalType('lose')}
          color={goalType === 'lose' ? '#007AFF' : '#ccc'}
        />
        <Button
          title="Gain"
          onPress={() => setGoalType('gain')}
          color={goalType === 'gain' ? '#007AFF' : '#ccc'}
        />
        <Button
          title="Maintain"
          onPress={() => setGoalType('maintain')}
          color={goalType === 'maintain' ? '#007AFF' : '#ccc'}
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={submitProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    backgroundColor: 'white',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
