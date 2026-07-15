import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getPlants, Plant } from "@/lib/api";
import { TYPE_LABELS, TYPE_EMOJI } from "@/lib/labels";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme, useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    error: { color: colors.error, padding: spacing.md, textAlign: "center" },
    emptyBox: { marginTop: 80, alignItems: "center", paddingHorizontal: 24 },
    empty: { fontSize: 18, color: colors.text, fontWeight: "600" },
    emptyHint: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
    },
    card: {
      flexDirection: "row",
      backgroundColor: colors.card,
      marginBottom: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.lg,
      gap: spacing.md,
      alignItems: "center",
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      backgroundColor: colors.cardHover,
      alignItems: "center",
      justifyContent: "center",
    },
    emoji: { fontSize: 24 },
    body: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: "600", color: colors.text },
    cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    location: { fontSize: 13, color: colors.accent, marginTop: 4 },
  });

export default function GardenScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setPlants(await getPlants());
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Мой сад" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={plants}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>Сад пуст 🌱</Text>
            <Text style={styles.emptyHint}>
              Добавьте растение из вкладки «Библиотека»
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/plant/${item.id}`)}
          >
            <View style={styles.icon}>
              <Text style={styles.emoji}>
                {TYPE_EMOJI[item.species] ?? "🌱"}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>
                {TYPE_LABELS[item.species] ?? item.species} · посажено{" "}
                {item.planted_at?.slice(0, 10)}
              </Text>
              {item.location ? (
                <Text style={styles.location}>📍 {item.location}</Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
