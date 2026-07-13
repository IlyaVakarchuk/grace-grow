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
import { TYPE_LABELS } from "@/lib/labels";

export default function GardenScreen() {
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={plants}
        keyExtractor={(p) => p.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
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
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>
              {TYPE_LABELS[item.species] ?? item.species} · посажено{" "}
              {item.planted_at?.slice(0, 10)}
            </Text>
            {item.location ? (
              <Text style={styles.location}>📍 {item.location}</Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FFF8" },
  error: { color: "#B91C1C", padding: 12, textAlign: "center" },
  emptyBox: { marginTop: 80, alignItems: "center", paddingHorizontal: 24 },
  empty: { fontSize: 18, color: "#1B4332", fontWeight: "600" },
  emptyHint: { fontSize: 14, color: "#888", marginTop: 8, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8F3DC",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1B4332" },
  cardSub: { fontSize: 14, color: "#666", marginTop: 4 },
  location: { fontSize: 13, color: "#2D6A4F", marginTop: 4 },
});
