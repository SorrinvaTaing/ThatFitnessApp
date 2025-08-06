import { Alert, AppState, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useContext, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'expo-router';

const router = useRouter();

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  async function signUpWithEmail() {
    if (!email || !password || !username) {
      Alert.alert('Missing required fields', 'Please fill in email, password, and username.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure your passwords are identical.');
      return;
    }    
  
    setLoading(true);
  
    const { data: existingUsername, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
  
    if (usernameError) {
      Alert.alert('Error checking username', usernameError.message);
      setLoading(false);
      return;
    }
  
    if (existingUsername) {
      Alert.alert('Username taken', 'Please choose a different username.');
      setLoading(false);
      return;
    }
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      if (error.message.includes('already registered')) {
        Alert.alert('Email already registered', 'Try logging in instead.');
      } else {
        Alert.alert('Sign up failed', error.message);
      }
      setLoading(false);
      return;
    }
  
    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        username,
        full_name: `${firstName} ${lastName}`,
        email,
        first_login: true,
        visibility: 'Private',
        updated_at: new Date(),
        created_at: new Date()
      });
  
      if (profileError) {
        Alert.alert('Profile creation failed', profileError.message);
        setLoading(false);
        return;
      }
    }
  
    Alert.alert('Signup successful', 'Check your inbox to verify your email.');
    router.push('/login');
    setLoading(false);
  }
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a new account</Text>
      
      <Text style={styles.label}>Enter your first name:</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Enter your last name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Enter your username:</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Enter your email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Enter password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Confirm password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Login to your account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginLeft: 10,
  },
  input: {
    width: '100%',
    height: 45,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: '80%',
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
