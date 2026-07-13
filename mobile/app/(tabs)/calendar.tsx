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
import { completeTask, getCalendar, CalendarTask } from "@/lib/api";
import { TASK_LABELS } from "@/lib/labels";

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `Просрочено на ${-diff} дн.`;
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  return d.toLocaleDateString("ru-RU");
}

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setTasks(await getCalendar(30));
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleComplete(task: CalendarTask) {
    try {
      await completeTask(task.id);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
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
          <Text style={styles.empty}>Нет задач на ближайшие 30 дней ✅</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.task}>{TASK_LABELS[item.type] ?? item.type}</Text>
              <Text style={styles.plant}>{item.plant_name}</Text>
              <Text style={styles.date}>{formatDate(item.next_at)}</Text>
            </View>
            <Pressable style={styles.doneBtn} onPress={() => handleComplete(item)}>
              <Text style={styles.doneText}>✓</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FFF8" },
  error: { color: "#B91C1C", padding: 12, textAlign: "center" },
  empty: { textAlign: "center", marginTop: 80, color: "#888" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8F3DC",
    alignItems: "center",
  },
  cardBody: { flex: 1 },
  task: { fontSize: 16, fontWeight: "600", color: "#1B4332" },
  plant: { fontSize: 14, color: "#666", marginTop: 2 },
  date: { fontSize: 13, color: "#2D6A4F", marginTop: 4 },
  doneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D6A4F",
    justifyContent: "center",
    alignItems: "center",
  },
  doneText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
