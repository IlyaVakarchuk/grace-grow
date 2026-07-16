import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { login, register } from "@/lib/api";
import { useTheme } from "@/lib/ThemeContext";
import {
  AppleIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
} from "@/components/AuthIcons";

const AUTH = {
  cream: "#F3F0E9",
  card: "#FFFFFF",
  border: "#D9D9D9",
  text: "#3A3A3A",
  muted: "#9A9A9A",
  accent: "#5A856D",
  button: "#36634D",
  icon: "#8A8A8A",
};

export default function LoginScreen() {
  const { colors } = useTheme();
  const { width: vpW, height: vpH } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

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
    <View style={[styles.root, { width: vpW, minHeight: vpH }]}>
      <Image
        source={require("../../assets/login-bg.png")}
        style={[styles.bgImage, { width: vpW, height: vpH }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { minHeight: vpH }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.card}>
            <View style={styles.logoBadge}>
              <View style={styles.logoInner}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.logoImg}
                  resizeMode="contain"
                  accessibilityLabel="GraceGrow"
                />
              </View>
            </View>

            <Image
              source={require("../../assets/login-hero.png")}
              style={styles.hero}
              resizeMode="contain"
              accessibilityLabel="GraceGrow mascot"
            />

            <Text style={styles.title}>Мониторинг домашних растений</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isRegister && (
              <View style={styles.field}>
                <View style={styles.fieldIconWrap}>
                  <LockIcon size={20} color={AUTH.icon} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Имя"
                  placeholderTextColor={AUTH.muted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.field}>
              <View style={styles.fieldIconWrap}>
                <MailIcon size={20} color={AUTH.icon} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={AUTH.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.fieldIconWrap}>
                <LockIcon size={20} color={AUTH.icon} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                placeholderTextColor={AUTH.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityLabel={
                  showPassword ? "Скрыть пароль" : "Показать пароль"
                }
              >
                {showPassword ? (
                  <EyeOffIcon size={20} color={AUTH.icon} />
                ) : (
                  <EyeIcon size={20} color={AUTH.icon} />
                )}
              </Pressable>
            </View>

            {!isRegister && (
              <View style={styles.row}>
                <Pressable
                  style={styles.remember}
                  onPress={() => setRemember((v) => !v)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      remember && styles.checkboxOn,
                    ]}
                  >
                    {remember ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : null}
                  </View>
                  <Text style={styles.rememberText}>Запомнить меня</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert("Скоро", "Восстановление пароля появится позже")
                  }
                >
                  <Text style={styles.forgot}>Забыли пароль?</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "..." : isRegister ? "Регистрация" : "Войти"}
              </Text>
            </Pressable>

            {!isRegister && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Или войдите с помощью</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  <Pressable
                    style={styles.socialBtn}
                    onPress={() =>
                      Alert.alert("Скоро", "Вход через Google появится позже")
                    }
                  >
                    <GoogleIcon size={22} />
                  </Pressable>
                  <Pressable
                    style={styles.socialBtn}
                    onPress={() =>
                      Alert.alert("Скоро", "Вход через Apple появится позже")
                    }
                  >
                    <AppleIcon size={22} />
                  </Pressable>
                </View>
              </>
            )}

            <Pressable
              onPress={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>
                {isRegister ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.cream,
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? ({ minHeight: "100vh", width: "100%" } as object)
      : null),
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  overlay: {
    flex: 1,
    zIndex: 1,
    width: "100%",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: AUTH.card,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 42,
    paddingBottom: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  logoBadge: {
    position: "absolute",
    top: -34,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#36634D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AUTH.cream,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImg: {
    width: 46,
    height: 52,
  },
  hero: { width: 160, height: 160, marginBottom: 8 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: AUTH.text,
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    width: "100%",
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    textAlign: "center",
    overflow: "hidden",
  },
  field: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AUTH.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#FFF",
    minHeight: 48,
  },
  fieldIconWrap: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: AUTH.text,
    paddingVertical: 12,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 2,
  },
  remember: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: AUTH.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxOn: {
    backgroundColor: AUTH.button,
    borderColor: AUTH.button,
  },
  checkMark: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  rememberText: { fontSize: 13, color: AUTH.text },
  forgot: {
    fontSize: 13,
    color: AUTH.accent,
    textDecorationLine: "underline",
  },
  btn: {
    width: "100%",
    backgroundColor: AUTH.button,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: AUTH.button,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  divider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: AUTH.border },
  dividerText: { fontSize: 12, color: AUTH.muted },
  socialRow: { flexDirection: "row", gap: 16, marginBottom: 18 },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AUTH.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  footerLink: {
    fontSize: 14,
    color: "#7A7A7A",
    marginTop: 4,
  },
});
