import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { logout } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme, useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    body: {
      flex: 1,
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    sub: { color: colors.textSecondary, marginTop: 4, marginBottom: 24 },
    themeRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: 32,
      alignSelf: "stretch",
    },
    themeBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.card,
    },
    themeBtnActive: {
      backgroundColor: colors.accentDark,
      borderColor: colors.accentDark,
    },
    themeBtnText: { color: colors.text, fontWeight: "600" },
    themeBtnTextActive: { color: colors.onAccent, fontWeight: "600" },
    btn: {
      backgroundColor: colors.errorBg,
      borderRadius: radii.md,
      padding: 14,
      alignItems: "center",
      alignSelf: "stretch",
      borderWidth: 1,
      borderColor: colors.error,
    },
    btnText: { color: colors.error, fontWeight: "600" },
  });

export default function ProfileScreen() {
  const { mode, setMode } = useTheme();
  const styles = useThemedStyles(makeStyles);

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Профиль" />
      <View style={styles.body}>
        <Logo width={200} height={80} />
        <Text style={styles.sub}>Версия 0.1.0</Text>

        <View style={styles.themeRow}>
          <Pressable
            style={[styles.themeBtn, mode === "light" && styles.themeBtnActive]}
            onPress={() => setMode("light")}
          >
            <Text
              style={[
                styles.themeBtnText,
                mode === "light" && styles.themeBtnTextActive,
              ]}
            >
              ☀️ Светлая
            </Text>
          </Pressable>
          <Pressable
            style={[styles.themeBtn, mode === "dark" && styles.themeBtnActive]}
            onPress={() => setMode("dark")}
          >
            <Text
              style={[
                styles.themeBtnText,
                mode === "dark" && styles.themeBtnTextActive,
              ]}
            >
              🌙 Тёмная
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btnText}>Выйти</Text>
        </Pressable>
      </View>
    </View>
  );
}
