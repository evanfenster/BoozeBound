import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ 
      flex: 1, 
      paddingTop: insets.top, 
      backgroundColor: Colors.dark.background 
    }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: Colors.dark.backgroundSecondary,
            borderTopColor: Colors.dark.separator,
            borderTopWidth: 0.5,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: Colors.dark.tint,
          tabBarInactiveTintColor: Colors.dark.tabIconDefault,
          tabBarLabelStyle: {
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'beer' : 'beer-outline'} color={color} size={24}/>
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24}/>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24}/>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
