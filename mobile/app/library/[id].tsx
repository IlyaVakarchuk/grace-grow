import { useCallback, useMemo, useState } from "react";
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
import { speciesToDetailSections } from "@/lib/plantDisplay";
import { PlantInfoSections } from "@/components/PlantInfoSections";
import { SafePlantImage } from "@/components/SafePlantImage";
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

  const sections = useMemo(
    () => (item ? speciesToDetailSections(item) : []),
    [item]
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
      <View style={styles.hero}>
        <SafePlantImage
          uri={item.image_url}
          typeKey={item.type}
          style={styles.heroFill}
          emojiSize={64}
        />
      </View>

      <Text style={styles.title}>{item.name}</Text>
      {item.scientific_name ? (
        <Text style={styles.scientific}>{item.scientific_name}</Text>
      ) : null}

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{TYPE_LABELS[item.type]}</Text>
        </View>
        {item.source === "trefle" ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Trefle</Text>
          </View>
        ) : null}
        {item.family ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.family}</Text>
          </View>
        ) : null}
        {item.genus ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.genus}</Text>
          </View>
        ) : null}
      </View>

      <PlantInfoSections sections={sections} />

      {item.description ? (
        <View style={styles.descBox}>
          <Text style={styles.descTitle}>Описание</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
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
  content: { paddingBottom: spacing.xl },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  hero: {
    height: 220,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  heroFill: { width: "100%", height: "100%" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  scientific: {
    color: colors.textSecondary,
    fontStyle: "italic",
    paddingHorizontal: spacing.lg,
    marginTop: 4,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.chip,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  descBox: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  desc: { color: colors.textSecondary, lineHeight: 22 },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: spacing.lg,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.accentDark,
    borderRadius: radii.md,
    padding: 16,
    alignItems: "center",
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  btnText: { color: colors.text, fontWeight: "600" },
});
