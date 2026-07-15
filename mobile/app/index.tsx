import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { hasToken } from "@/lib/api";
import { useTheme } from "@/lib/ThemeContext";

export default function Index() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    hasToken().then((ok) => {
      setAuthed(ok);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return <Redirect href={authed ? "/(tabs)" : "/(auth)/login"} />;
}
