import { Text, View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Sidebar, useShowSidebar } from "@/components/Sidebar";
import { colors } from "@/lib/theme";

function tabIcon(emoji: string) {
  return ({ color }: { color: string; size: number }) => (
    <Text style={{ fontSize: 20, color, opacity: color === colors.text ? 1 : 0.7 }}>
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  const showSidebar = useShowSidebar();

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
      {showSidebar && <Sidebar />}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.border,
              height: Platform.OS === "web" ? 64 : undefined,
              paddingBottom: Platform.OS === "web" ? 8 : undefined,
            },
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: { fontSize: 11 },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{ title: "Мой сад", tabBarIcon: tabIcon("🌿") }}
          />
          <Tabs.Screen
            name="library"
            options={{ title: "Библиотека", tabBarIcon: tabIcon("📚") }}
          />
          <Tabs.Screen
            name="calendar"
            options={{ title: "Календарь", tabBarIcon: tabIcon("📅") }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: "Профиль", tabBarIcon: tabIcon("👤") }}
          />
        </Tabs>
      </View>
    </View>
  );
}
