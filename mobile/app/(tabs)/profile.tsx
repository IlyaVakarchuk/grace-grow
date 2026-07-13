import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { logout } from "@/lib/api";

export default function ProfileScreen() {
  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grace</Text>
      <Text style={styles.sub}>Версия 0.1.0</Text>
      <Pressable style={styles.btn} onPress={handleLogout}>
        <Text style={styles.btnText}>Выйти</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F8FFF8" },
  title: { fontSize: 28, fontWeight: "700", color: "#1B4332" },
  sub: { color: "#666", marginTop: 4, marginBottom: 32 },
  btn: { backgroundColor: "#E63946", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
