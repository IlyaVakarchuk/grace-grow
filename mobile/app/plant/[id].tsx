import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";
import { addCareLog, getCareLogs, getPlant, CareLog, Plant } from "@/lib/api";

const ACTIONS = [
  { type: "water", label: "💧 Полить" },
  { type: "fertilize", label: "🌿 Удобрить" },
  { type: "harvest", label: "🍅 Собрать" },
  { type: "prune", label: "✂️ Обрезать" },
];

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [p, l] = await Promise.all([getPlant(id), getCareLogs(id)]);
      setPlant(p);
      setLogs(l);
    } catch (e: any) {
      Alert.alert("Ошибка", e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleAction(type: string) {
    if (!id) return;
    try {
      await addCareLog(id, type);
      await load();
    } catch (e: any) {
      Alert.alert("Ошибка", e.message);
    }
  }

  if (loading || !plant) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.meta}>
        {plant.species} · {plant.location ?? "без локации"}
      </Text>

      <View style={styles.actions}>
        {ACTIONS.map((a) => (
          <Pressable key={a.type} style={styles.actionBtn} onPress={() => handleAction(a.type)}>
            <Text>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Журнал ухода</Text>
      <FlatList
        data={logs}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={<Text style={styles.empty}>Пока пусто</Text>}
        renderItem={({ item }) => (
          <View style={styles.log}>
            <Text style={styles.logType}>{item.type}</Text>
            <Text style={styles.logDate}>
              {new Date(item.created_at).toLocaleString("ru-RU")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FFF8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 24, fontWeight: "700", color: "#1B4332" },
  meta: { color: "#666", marginBottom: 16 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  actionBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8F3DC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  section: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  empty: { color: "#888" },
  log: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  logType: { fontWeight: "600", textTransform: "capitalize" },
  logDate: { fontSize: 12, color: "#888", marginTop: 2 },
});
