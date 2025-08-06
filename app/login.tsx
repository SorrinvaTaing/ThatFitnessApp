import { Alert, AppState, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useContext, useState } from 'react';
import { AuthContext } from '@/utils/authContext';
import { supabase } from '../utils/supabase';
import { useRouter } from 'expo-router';


AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function LoginScreen() {
    const router = useRouter();
    const { logIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmailOrUsername() {
    setLoading(true);
  
    let userEmail = email;
  
    const isEmail = userEmail.includes('@');
  
    if (!isEmail) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', userEmail)
        .maybeSingle();
  
      if (error) {
        Alert.alert('Login Error', 'Error checking username.');
        setLoading(false);
        return;
      }
  
      if (!profile) {
        Alert.alert('Login Error', 'Username not found.');
        setLoading(false);
        return;
      }
  
      userEmail = profile.email;
    }
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });
  
    if (error) {
      Alert.alert('Login Error', error.message);
      setLoading(false);
      return;
    }
  
    const user = data.user;
    if (!user) {
      Alert.alert('Login Error', 'User not found');
      setLoading(false);
      return;
    }
  
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_login')
      .eq('id', user.id)
      .single();
  
    if (profileError) {
      Alert.alert('Profile Error', profileError.message);
      setLoading(false);
      return;
    }
  
    if (profile?.first_login) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('id', user.id);
  
      if (updateError) {
        Alert.alert('Update Error', updateError.message);
        setLoading(false);
        return;
      }
  
      router.push('/userPreference');
    } else {
      logIn();
    }

    setLoading(false);
  }  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in to your account</Text>
      
      <Text style={styles.label}>Enter username or email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={signInWithEmailOrUsername} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
          <Text style={styles.buttonText}>Sign Up Here</Text>
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
