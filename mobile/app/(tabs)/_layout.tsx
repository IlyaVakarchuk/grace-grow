import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#2D6A4F" }}>
      <Tabs.Screen name="index" options={{ title: "Растения" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
    </Tabs>
  );
}
