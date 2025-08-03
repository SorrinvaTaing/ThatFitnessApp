import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/utils/supabase';

export default function IncomingRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      if (!currentUserId) return;

      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          status,
          profiles:user_id ( full_name )
        `)
        .eq('friend_id', currentUserId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }

      setRequests(data || []);
    };

    fetchIncomingRequests();
  }, [currentUserId]);

  const handleAccept = async (id: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', 'Failed to accept request.');
    } else {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', id);

    if (error) {
      Alert.alert('Error', 'Failed to reject request.');
    } else {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Friend Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <Text style={styles.name}>{item.profiles?.full_name}</Text>
            <View style={styles.buttons}>
              <Pressable style={styles.accept} onPress={() => handleAccept(item.id)}>
                <Text style={styles.btnText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.reject} onPress={() => handleReject(item.id)}>
                <Text style={styles.btnText}>Reject</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No incoming requests.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 40 },
  requestCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: { fontSize: 16, marginBottom: 8 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accept: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  reject: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#888' },
});
