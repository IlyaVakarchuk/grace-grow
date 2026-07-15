import { useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getLibrary, PlantSpecies } from "@/lib/api";
import { TYPE_LABELS, FILTER_CHIPS } from "@/lib/labels";
import { FilterChips } from "@/components/FilterChips";
import { PlantCard } from "@/components/PlantCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { colors, spacing } from "@/lib/theme";

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
      <ScreenHeader title="Библиотека" />
      <FilterChips chips={FILTER_CHIPS} value={filter} onChange={setFilter} />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
        renderItem={({ item, index }) => (
          <PlantCard
            name={item.name}
            type={TYPE_LABELS[item.type] ?? item.type}
            waterDays={item.water_days}
            light={item.light}
            selected={index === 0}
            onPress={() => router.push(`/library/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { paddingBottom: spacing.xl, gap: spacing.md },
  row: { gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
