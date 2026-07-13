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
        <ActivityIndicator color="#2D6A4F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.badge}>{TYPE_LABELS[item.type]}</Text>

      <View style={styles.info}>
        <Text style={styles.label}>☀️ Свет</Text>
        <Text>{item.light}</Text>
        <Text style={styles.label}>💧 Влажность</Text>
        <Text>{item.humidity}</Text>
        <Text style={styles.label}>🚿 Полив</Text>
        <Text>каждые {item.water_days} дн.</Text>
        {item.fertilize_days ? (
          <>
            <Text style={styles.label}>🌿 Удобрение</Text>
            <Text>каждые {item.fertilize_days} дн.</Text>
          </>
        ) : null}
        {item.repot_days ? (
          <>
            <Text style={styles.label}>🪴 Пересадка</Text>
            <Text>каждые {item.repot_days} дн.</Text>
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
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Локация (подоконник, балкон...)"
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
  container: { flex: 1, backgroundColor: "#F8FFF8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", color: "#1B4332" },
  badge: { color: "#2D6A4F", marginTop: 4, marginBottom: 16 },
  info: { backgroundColor: "#fff", borderRadius: 12, padding: 16, gap: 4 },
  label: { fontWeight: "600", marginTop: 8, color: "#1B4332" },
  desc: { marginTop: 16, color: "#555", lineHeight: 22 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 24, marginBottom: 12 },
  error: { color: "#B91C1C", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8F3DC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
