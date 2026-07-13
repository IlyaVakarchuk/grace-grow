import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#2D6A4F" }}>
      <Tabs.Screen name="index" options={{ title: "Мой сад" }} />
      <Tabs.Screen name="library" options={{ title: "Библиотека" }} />
      <Tabs.Screen name="calendar" options={{ title: "Календарь" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
    </Tabs>
  );
}
