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
import { getLibrary, PlantSpecies } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/labels";

const FILTERS = ["", "vegetable", "herb", "spice", "indoor"];

export default function LibraryScreen() {
  const [items, setItems] = useState<PlantSpecies[]>([]);
  const [filter, setFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setItems(await getLibrary(filter || undefined));
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f || "all"}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={filter === f ? styles.chipTextActive : undefined}>
              {f ? TYPE_LABELS[f] : "Все"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
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
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/library/${item.id}`)}
          >
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.sub}>
              {TYPE_LABELS[item.type]} · полив каждые {item.water_days} дн.
            </Text>
            <Text style={styles.meta}>☀️ {item.light}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FFF8" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
  },
  chipActive: { backgroundColor: "#2D6A4F" },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8F3DC",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#1B4332" },
  sub: { fontSize: 14, color: "#666", marginTop: 4 },
  meta: { fontSize: 13, color: "#888", marginTop: 4 },
});
