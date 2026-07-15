import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { createPlant, getLibraryItem, PlantSpecies } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/labels";
import { colors, radii, spacing } from "@/lib/theme";

export default function LibraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<PlantSpecies | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    const data = await getLibraryItem(id);
    setItem(data);
    setName(data.name);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleAdd() {
    if (!id || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const plant = await createPlant({
        name: name.trim(),
        species_id: id,
        location: location.trim() || undefined,
      });
      router.replace(`/plant/${plant.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.badge}>
        {TYPE_LABELS[item.type]}
        {item.source === "trefle" ? " · Trefle" : ""}
      </Text>
      {item.scientific_name ? (
        <Text style={styles.scientific}>{item.scientific_name}</Text>
      ) : null}

      <View style={styles.info}>
        <Text style={styles.label}>☀️ Свет</Text>
        <Text style={styles.value}>{item.light}</Text>
        <Text style={styles.label}>💧 Влажность</Text>
        <Text style={styles.value}>{item.humidity}</Text>
        <Text style={styles.label}>🚿 Полив</Text>
        <Text style={styles.value}>каждые {item.water_days} дн.</Text>
        {item.fertilize_days ? (
          <>
            <Text style={styles.label}>🌿 Удобрение</Text>
            <Text style={styles.value}>каждые {item.fertilize_days} дн.</Text>
          </>
        ) : null}
        {item.repot_days ? (
          <>
            <Text style={styles.label}>🪴 Пересадка</Text>
            <Text style={styles.value}>каждые {item.repot_days} дн.</Text>
          </>
        ) : null}
      </View>

      {item.description ? (
        <Text style={styles.desc}>{item.description}</Text>
      ) : null}

      <Text style={styles.section}>Добавить в мой сад</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Название"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Локация (подоконник, балкон...)"
        placeholderTextColor={colors.textMuted}
        value={location}
        onChangeText={setLocation}
      />
      <Pressable style={styles.btn} onPress={handleAdd} disabled={saving}>
        <Text style={styles.btnText}>
          {saving ? "..." : "Добавить и создать напоминания"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  badge: { color: colors.accent, marginTop: 4, marginBottom: spacing.sm },
  scientific: { color: colors.textSecondary, marginBottom: spacing.lg },
  info: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, gap: 4 },
  label: { fontWeight: "600", marginTop: spacing.sm, color: colors.text },
  value: { color: colors.textSecondary },
  desc: { marginTop: spacing.lg, color: colors.textSecondary, lineHeight: 22 },
  section: { fontSize: 18, fontWeight: "600", marginTop: spacing.xl, marginBottom: spacing.md, color: colors.text },
  error: { color: colors.error, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.accentDark,
    borderRadius: radii.md,
    padding: 16,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  btnText: { color: colors.text, fontWeight: "600" },
});
