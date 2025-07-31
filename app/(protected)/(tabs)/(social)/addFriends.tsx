import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function AddFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id || null);
    };
    getCurrentUser();
  }, []);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', `%${searchQuery}%`)
      .neq('id', currentUserId); 

    if (error) {
      Alert.alert('Error', 'Could not fetch users.');
      return;
    }

    setResults(data || []);
  };

  const sendFriendRequest = async (friend_id: string) => {
    if (!currentUserId) return;
  
    const { error } = await supabase.from('friends').insert({
      user_id: currentUserId,
      friend_id,
      status: 'pending',
    });
  
    if (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send friend request.');
    } else {
      Alert.alert('Success', 'Friend request sent.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Friends</Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={searchUsers}
        returnKeyType="search"
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.full_name}</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => sendFriendRequest(item.id)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          searchQuery ? (
            <Text style={styles.emptyText}>No users found.</Text>
          ) : ( <Text style={styles.emptyText}>Search for new friends.</Text> )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  userName: { fontSize: 16 },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
});
