import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { logout } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";
import { colors, radii, spacing } from "@/lib/theme";

export default function ProfileScreen() {
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
        <Pressable style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btnText}>Выйти</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, alignItems: "center", justifyContent: "center" },
  sub: { color: colors.textSecondary, marginTop: 4, marginBottom: 32 },
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
