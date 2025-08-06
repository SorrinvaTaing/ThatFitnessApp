import { Button, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AuthContext } from '@/utils/authContext';
import { useContext } from 'react';

export default function ProfileScreen() {
  const authContext = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Default Profile/Settings Page </Text>
      
      <Button title="Logout" onPress={authContext.logOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
