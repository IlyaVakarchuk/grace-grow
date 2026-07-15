import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { login, register } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { colors, radii, spacing } from "@/lib/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Logo />
      <Text style={styles.subtitle}>Мониторинг домашних растений</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Имя"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor={colors.textMuted}
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
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: 32,
  },
  error: {
    backgroundColor: colors.errorBg,
    color: colors.error,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.accentDark,
    borderRadius: radii.md,
    padding: 16,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  btnText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: colors.accent, marginTop: spacing.lg },
});
