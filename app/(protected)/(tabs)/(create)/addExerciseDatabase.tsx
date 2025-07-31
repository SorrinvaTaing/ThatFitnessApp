import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const muscleGroups = {
  Chest: ['Upper Chest', 'Middle Chest', 'Lower Chest'],
  Back: ['Lats', 'Traps', 'Lower Back', 'Upper Back'],
  Legs: ['Quads', 'Hamstrings', 'Calves', 'Adductors', 'Abductors'],
  Triceps: ['Long Head', 'Lateral Head', 'Medial Head'],
  Biceps: ['Short Head', 'Long Head'],
  Shoulders: ['Front Delts', 'Side Delts', 'Rear Delts'],
  Core: ['Abs', 'Obliques', 'Lower Abs'],
};

type MuscleGroup = keyof typeof muscleGroups;
type SubCategory = (typeof muscleGroups)[MuscleGroup][number];

export default function AddExerciseDatabaseScreen() {
  const [name, setName] = useState('');
  const [muscleCategory, setMuscleCategory] = useState<MuscleGroup | ''>('');
  const [subCategory, setSubCategory] = useState<SubCategory | ''>('');

  const handleAddExercise = async () => {
    if (!name || !muscleCategory) {
      Alert.alert('Missing Fields', 'Name and Muscle Category are required.');
      return;
    }
    try {
      const { error } = await supabase.from('exercises').insert([
        {
          name: name.trim(),
          muscle_category: muscleCategory.trim(),
          sub_category: subCategory.trim() || null,
        },
      ]);
      if (error) {
        Alert.alert('Database Error', error.message);
      } else {
        Alert.alert('Success', 'Exercise added successfully!');
        router.back();
      }
    } catch (err: any) {
      console.error('Unexpected error inserting exercise:', err);
      Alert.alert('Unexpected Error', 'Something went wrong while adding the exercise.');
    }
  };

  const muscleCategoryOptions = Object.keys(muscleGroups).map((key) => ({
    label: key,
    value: key,
  }));

  const subCategoryOptions =
    muscleCategory !== ''
      ? muscleGroups[muscleCategory].map((sub) => ({ label: sub, value: sub }))
      : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add A New Exercise</Text>

      <Text style={styles.label}>Enter in exercise name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Enter in muscle category:</Text>
      <Dropdown
        data={muscleCategoryOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Muscle Category"
        value={muscleCategory}
        onChange={(item) => {
          setMuscleCategory(item.value as MuscleGroup);
          setSubCategory('');
        }}
        style={styles.dropdown}
        placeholderStyle={styles.dropdownPlaceholder}
        selectedTextStyle={styles.dropdownText}
        renderItem={(item) => (
            <View>
              <Text style={styles.dropdownItem}>{item.label}</Text>
              <View style={styles.separator} />
            </View>
          )}
      />

      {muscleCategory !== '' && (
        <>
          <Text style={styles.label}>Enter in muscle sub-category:</Text>
          <Dropdown
            data={subCategoryOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Sub Category"
            value={subCategory}
            onChange={(item) => setSubCategory(item.value as SubCategory)}
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            renderItem={(item) => (
                <View>
                  <Text style={styles.dropdownItem}>{item.label}</Text>
                  <View style={styles.separator} />
                </View>
              )}
          />
        </>
      )}

      <Pressable style={styles.button} onPress={handleAddExercise}>
        <Text style={styles.buttonText}>Add New Exercise</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },  
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
