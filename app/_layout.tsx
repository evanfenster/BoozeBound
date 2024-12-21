import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileProvider } from '@/context/ProfileContext';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const profile = await AsyncStorage.getItem('profile');
      setIsOnboarded(!!profile);
    })();
  }, []);

  if (isOnboarded === null) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        {/* You could add a loading indicator here */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileProvider>
        <StatusBar style="light" />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.dark.background
            },
            animation: 'fade', // Smooth transitions
          }}
        >
          {!isOnboarded && (
            <Stack.Screen 
              name="onboarding" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right',
              }} 
            />
          )}
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="+not-found" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
            }} 
          />
        </Stack>
      </ProfileProvider>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

