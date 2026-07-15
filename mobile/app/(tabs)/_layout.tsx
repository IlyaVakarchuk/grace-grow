import { Text, View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Sidebar, useShowSidebar } from "@/components/Sidebar";
import { useTheme } from "@/lib/ThemeContext";

function tabIcon(emoji: string, activeColor: string) {
  return ({ color }: { color: string; size: number }) => (
    <Text style={{ fontSize: 20, color, opacity: color === activeColor ? 1 : 0.7 }}>
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  const showSidebar = useShowSidebar();
  const { colors } = useTheme();

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
            options={{ title: "Мой сад", tabBarIcon: tabIcon("🌿", colors.text) }}
          />
          <Tabs.Screen
            name="library"
            options={{ title: "Библиотека", tabBarIcon: tabIcon("📚", colors.text) }}
          />
          <Tabs.Screen
            name="calendar"
            options={{ title: "Календарь", tabBarIcon: tabIcon("📅", colors.text) }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: "Профиль", tabBarIcon: tabIcon("👤", colors.text) }}
          />
        </Tabs>
      </View>
    </View>
  );
}
