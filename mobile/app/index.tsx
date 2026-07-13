import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { hasToken } from "@/lib/api";

export default function Index() {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return <Redirect href={authed ? "/(tabs)" : "/(auth)/login"} />;
}
