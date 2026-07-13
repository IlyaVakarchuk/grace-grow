import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { createPlant, getPlants, Plant } from "@/lib/api";

const SPECIES = ["tomato", "basil", "mint", "pepper", "other"];

export default function PlantsScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("other");

  const load = useCallback(async () => {
    try {
      setPlants(await getPlants());
    } catch (e: any) {
      Alert.alert("Ошибка", e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createPlant({ name: name.trim(), species });
      setModal(false);
      setName("");
      setSpecies("other");
      await load();
    } catch (e: any) {
      Alert.alert("Ошибка", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(p) => p.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Добавьте первое растение 🌿</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/plant/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>
              {item.species} · посажено {item.planted_at}
            </Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => setModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Новое растение</Text>
            <TextInput
              style={styles.input}
              placeholder="Название"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.chips}>
              {SPECIES.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, species === s && styles.chipActive]}
                  onPress={() => setSpecies(s)}
                >
                  <Text style={species === s ? styles.chipTextActive : undefined}>{s}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.btn} onPress={handleCreate}>
              <Text style={styles.btnText}>Сохранить</Text>
            </Pressable>
            <Pressable onPress={() => setModal(false)}>
              <Text style={styles.cancel}>Отмена</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FFF8" },
  empty: { textAlign: "center", marginTop: 80, color: "#888", fontSize: 16 },
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
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2D6A4F",
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#D8F3DC", borderRadius: 12, padding: 14, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#E8F5E9" },
  chipActive: { backgroundColor: "#2D6A4F" },
  chipTextActive: { color: "#fff" },
  btn: { backgroundColor: "#2D6A4F", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  cancel: { textAlign: "center", marginTop: 12, color: "#666" },
});
