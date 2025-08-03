import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabase';

export default function CurrentFriends() {
  const [friends, setFriends] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUserId) return;

      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          user_profile: user_id (full_name),
          friend_profile: friend_id (full_name)
        `)
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      setFriends(data || []);
    };

    fetchFriends();
  }, [currentUserId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Friends</Text>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSender = item.user_id === currentUserId;
          const friendName = isSender
            ? item.friend_profile?.full_name
            : item.user_profile?.full_name;

          return (
            <View style={styles.friendCard}>
              <Text style={styles.friendName}>{friendName}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no friends yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 30 },
  friendCard: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 10,
  },
  friendName: { fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
});
