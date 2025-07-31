import { StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';

export default function SocialScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with Others</Text>
      <Text style={styles.subtitle}>Add and manage your fitness friends</Text>

      <Pressable style={styles.section} onPress={() => router.push('./addFriends')}>
        <Text style={styles.sectionTitle}>Add Friends</Text>
        <Text style={styles.sectionDescription}>
          Search for users and send them a friend request to stay connected.
        </Text>
      </Pressable>

      <Pressable style={styles.section} onPress={() => router.push('./currentFriends')}>
        <Text style={styles.sectionTitle}>View Current Friends</Text>
        <Text style={styles.sectionDescription}>
          See a list of all your friends and their fitness activities.
        </Text>
      </Pressable>

      <Pressable style={styles.section} onPress={() => router.push('/viewRequests')}>
        <Text style={styles.sectionTitle}>Incoming Friend Requests</Text>
        <Text style={styles.sectionDescription}>See who wants to connect with you.</Text>
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
