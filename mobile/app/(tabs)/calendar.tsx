import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { completeTask, getCalendar, CalendarTask } from "@/lib/api";
import { TASK_LABELS } from "@/lib/labels";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme, useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `Просрочено на ${-diff} дн.`;
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  return d.toLocaleDateString("ru-RU");
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    error: { color: colors.error, padding: spacing.md, textAlign: "center" },
    empty: { textAlign: "center", marginTop: 80, color: colors.textSecondary },
    card: {
      flexDirection: "row",
      backgroundColor: colors.card,
      marginBottom: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.lg,
      alignItems: "center",
    },
    cardBody: { flex: 1 },
    task: { fontSize: 16, fontWeight: "600", color: colors.text },
    plant: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    date: { fontSize: 13, color: colors.accent, marginTop: 4 },
    doneBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentDark,
      justifyContent: "center",
      alignItems: "center",
    },
    doneText: { color: colors.onAccent, fontSize: 18, fontWeight: "700" },
  });

export default function CalendarScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
      <ScreenHeader title="Календарь" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
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
