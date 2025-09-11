import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../providers/auth-provider";
import { DataProvider } from "@/providers/data-provider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="auth/phone" options={{ headerShown: false }} />
      <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
      <Stack.Screen name="signup/farmer" options={{ title: "Farmer Registration", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="signup/collector" options={{ title: "Collector Registration", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="signup/facility" options={{ title: "Processing Facility Registration", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="signup/laboratory" options={{ title: "Laboratory Registration", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="signup/manufacturer" options={{ title: "Manufacturer Registration", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="farmer/record-planting" options={{ title: "Record Planting", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="farmer/daily-care" options={{ title: "Daily Care", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="farmer/record-harvest" options={{ title: "Record Harvest", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="farmer/view-payments" options={{ title: "View Payments", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="collector/farmer-details" options={{ title: "Farmer Details", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="collector/create-aggregation" options={{ title: "Create Aggregation", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="collector/track-transport" options={{ title: "Track Transport", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="collector/confirm-delivery" options={{ title: "Confirm Delivery", headerStyle: { backgroundColor: '#22c55e' }, headerTintColor: 'white' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <AuthProvider>
          <DataProvider>
            <RootLayoutNav />
          </DataProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
  },
});