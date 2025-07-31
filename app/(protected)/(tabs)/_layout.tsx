import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        
      }}
      initialRouteName="(home)" 
      >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({color, size}) => (
          <MaterialCommunityIcons 
          name="home" 
          size={size} 
          color={color} 
          />),
        }}
      />
      <Tabs.Screen
        name="(explore)"
        options={{
          headerShown: false, 
          title: 'Explore',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(create)"
        options={{
          headerShown: false, 
          title: 'Create',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="plus" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(social)"
        options={{
          headerShown: false, 
          title: 'Social',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(options)"
        options={{
          headerShown: false,
          title: 'View Options',
          tabBarIcon: ({color, size}) => (<MaterialCommunityIcons name="dots-horizontal" size={size} color={color} />),
        }}
      />
    </Tabs>
  );
}
