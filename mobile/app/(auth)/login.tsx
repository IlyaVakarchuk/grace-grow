import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { login, register } from "@/lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Ошибка", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.logo}>🌱 Grace</Text>
      <Text style={styles.subtitle}>Мониторинг домашних растений</Text>

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Имя"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "..." : isRegister ? "Регистрация" : "Войти"}
        </Text>
      </Pressable>

      <Pressable onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.link}>
          {isRegister ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#F8FFF8" },
  logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 32 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8F3DC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: "#2D6A4F", marginTop: 16 },
});
