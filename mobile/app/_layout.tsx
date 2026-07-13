import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="library/[id]" options={{ headerShown: true, title: "Растение" }} />
        <Stack.Screen name="plant/[id]" options={{ headerShown: true, title: "Мой сад" }} />
      </Stack>
    </>
  );
}
