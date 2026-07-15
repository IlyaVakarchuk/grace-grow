import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  addCareLog,
  addObservation,
  getCareLogs,
  getObservations,
  getPlant,
  CareLog,
  Observation,
  Plant,
  photoUrl,
} from "@/lib/api";
import { TASK_LABELS } from "@/lib/labels";
import { colors, radii, spacing } from "@/lib/theme";

const ACTIONS = ["water", "fertilize", "repot", "harvest", "prune"];

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError("");
      const [p, l, o] = await Promise.all([
        getPlant(id),
        getCareLogs(id),
        getObservations(id),
      ]);
      setPlant(p);
      setLogs(l);
      setObservations(o);
    } catch (e: any) {
      setError(e.message);
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
      setError(e.message);
    }
  }

  async function handleAddObservation() {
    if (!id) return;
    try {
      await addObservation(id, note.trim() || undefined);
      setNote("");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handlePickPhoto() {
    if (!id) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Нужен доступ к галерее");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled || !result.assets[0]?.base64) return;
    try {
      await addObservation(
        id,
        note.trim() || undefined,
        `data:image/jpeg;base64,${result.assets[0].base64}`
      );
      setNote("");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading || !plant) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.meta}>
        {plant.species} · {plant.location ?? "без локации"} · посажено{" "}
        {plant.planted_at?.slice(0, 10)}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.section}>Быстрые действия</Text>
      <View style={styles.actions}>
        {ACTIONS.map((a) => (
          <Pressable key={a} style={styles.actionBtn} onPress={() => handleAction(a)}>
            <Text style={styles.actionText}>{TASK_LABELS[a]}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Лог наблюдений</Text>
      <TextInput
        style={styles.input}
        placeholder="Заметка о росте..."
        placeholderTextColor={colors.textMuted}
        value={note}
        onChangeText={setNote}
        multiline
      />
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={handleAddObservation}>
          <Text style={styles.btnText}>Сохранить заметку</Text>
        </Pressable>
        <Pressable style={styles.photoBtn} onPress={handlePickPhoto}>
          <Text style={styles.actionText}>📷 Фото</Text>
        </Pressable>
      </View>

      {observations.map((o) => (
        <View key={o.id} style={styles.obsCard}>
          {o.photo_url ? (
            <Image
              source={{ uri: photoUrl(o.photo_url)! }}
              style={styles.photo}
            />
          ) : null}
          {o.notes ? <Text style={styles.obsNote}>{o.notes}</Text> : null}
          <Text style={styles.obsDate}>
            {new Date(o.created_at).toLocaleString("ru-RU")}
          </Text>
        </View>
      ))}

      <Text style={styles.section}>Журнал ухода</Text>
      {logs.length === 0 ? (
        <Text style={styles.empty}>Пока пусто</Text>
      ) : (
        logs.map((item) => (
          <View key={item.id} style={styles.log}>
            <Text style={styles.logType}>
              {TASK_LABELS[item.type] ?? item.type}
            </Text>
            <Text style={styles.logDate}>
              {new Date(item.created_at).toLocaleString("ru-RU")}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  meta: { color: colors.textSecondary, marginBottom: spacing.md },
  error: { color: colors.error, marginBottom: spacing.sm },
  section: { fontSize: 16, fontWeight: "600", marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actionBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: { color: colors.text },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    minHeight: 60,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  row: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  btn: {
    flex: 1,
    backgroundColor: colors.accentDark,
    borderRadius: radii.sm,
    padding: spacing.md,
    alignItems: "center",
  },
  btnText: { color: colors.text, fontWeight: "600" },
  photoBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    justifyContent: "center",
  },
  obsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: { width: "100%", height: 180, borderRadius: radii.sm, marginBottom: spacing.sm },
  obsNote: { fontSize: 15, color: colors.text },
  obsDate: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  empty: { color: colors.textSecondary },
  log: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logType: { fontWeight: "600", color: colors.text },
  logDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
