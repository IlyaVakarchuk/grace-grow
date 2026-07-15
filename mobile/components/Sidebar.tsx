import { View, Pressable, StyleSheet, Platform, useWindowDimensions, Image, Text } from "react-native";
import { router, usePathname } from "expo-router";
import { useThemedStyles } from "@/lib/ThemeContext";
import { type ThemeColors } from "@/lib/theme";

const NAV = [
  { href: "/(tabs)", icon: "🏠", match: "/index" },
  { href: "/(tabs)/library", icon: "📚", match: "/library" },
  { href: "/(tabs)/calendar", icon: "📅", match: "/calendar" },
  { href: "/(tabs)/profile", icon: "👤", match: "/profile" },
];

export function useShowSidebar() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 768;
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sidebar: {
      width: 64,
      backgroundColor: colors.sidebar,
      alignItems: "center",
      paddingTop: 16,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    logo: { width: 36, height: 36, marginBottom: 24 },
    nav: { gap: 8 },
    navItem: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    navItemActive: { backgroundColor: colors.card },
    icon: { fontSize: 20 },
    iconInactive: { opacity: 0.55 },
  });

export function Sidebar() {
  const pathname = usePathname();
  const styles = useThemedStyles(makeStyles);

  function isActive(match: string) {
    if (match === "/index") {
      return pathname === "/" || pathname.endsWith("/index") || pathname === "/(tabs)";
    }
    return pathname.includes(match);
  }

  return (
    <View style={styles.sidebar}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Grace"
      />
      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = isActive(item.match);
          return (
            <Pressable
              key={item.href}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href as any)}
            >
              <Text style={[styles.icon, !active && styles.iconInactive]}>
                {item.icon}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
