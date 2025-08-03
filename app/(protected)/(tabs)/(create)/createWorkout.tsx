import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, Alert, Button, TextInputChangeEventData, NativeSyntheticEvent } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Dropdown } from 'react-native-element-dropdown';

const visibilities = {
    Private: "Private",
    Protected: 'Friends Only',
    Public: "Public"
}
export default function CreateWorkoutScreen() { 
    const [workoutName, setWorkoutName] = useState('');
    const [visibility, setVisibility] = useState<'Public' | 'Protected' |'Private'>('Private');
    const [startTime, setStartTime] = useState<Date | null>(null);

    const visibilityOptions = Object.keys(visibilities).map((key) => ({
        label: visibilities[key as keyof typeof visibilities],
        value: key as 'Public' | 'Protected' | 'Private'
    }))
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Creating A New Workout</Text>
            <Text style={styles.setLabel}>Enter in workout name:</Text>
            <TextInput
                style={styles.input}
                placeholder="Workout Name"
                value={workoutName}
                onChangeText={setWorkoutName}
            />
            <Text style={styles.setLabel}>Enter in the workout status to users:</Text>
            <Dropdown
                data={visibilityOptions}
                labelField="label"
                valueField="value"
                placeholder="Workout visibility to users"
                value={visibility}
                onChange={(item) => setVisibility(item.value as 'Public' | 'Protected' | 'Private')}
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

            <Pressable style={styles.button} onPress={() => {router.push(
                {
                    pathname: './newWorkout',
                    params: {
                        workoutName: workoutName,
                        visibility: visibility,
                        startTime: Date.now().toString() 
                    }
                })}}>
                <Text style={styles.buttonText}>Start Workout</Text>
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
    buttonText: { color: '#fff', fontWeight: '600' },
    placeholder: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 40 },
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
  });
  