import { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  Text,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  getLibrary,
  importFromTrefle,
  searchTrefle,
  PlantSpecies,
  TrefleSearchHit,
} from "@/lib/api";
import { FILTER_CHIPS } from "@/lib/labels";
import { FilterChips } from "@/components/FilterChips";
import { PlantLibraryCard } from "@/components/PlantLibraryCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { speciesToCard, trefleHitToCard } from "@/lib/plantDisplay";
import { useTheme, useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    search: {
      flex: 1,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.pill,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 15,
    },
    error: {
      color: colors.error,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    empty: {
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: 40,
    },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  });

export default function LibraryScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [items, setItems] = useState<PlantSpecies[]>([]);
  const [filter, setFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [trefleHits, setTrefleHits] = useState<TrefleSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [importingSlug, setImportingSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(await getLibrary(filter || undefined));
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setTrefleHits([]);
      setSearchError("");
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await searchTrefle(q);
        setTrefleHits(res.data);
      } catch (e: any) {
        setTrefleHits([]);
        setSearchError(e.message ?? "Поиск недоступен");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  async function handleTreflePress(hit: TrefleSearchHit) {
    if (hit.imported && hit.species_id) {
      router.push(`/library/${hit.species_id}`);
      return;
    }

    setImportingSlug(hit.slug);
    try {
      const item = await importFromTrefle(hit.slug);
      await load();
      router.push(`/library/${item.id}`);
    } catch (e: any) {
      setSearchError(e.message ?? "Не удалось импортировать");
    } finally {
      setImportingSlug(null);
    }
  }

  const showTrefle = search.trim().length >= 2;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Библиотека" />
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Поиск в Trefle..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {searching ? <ActivityIndicator color={colors.accent} /> : null}
      </View>
      {searchError ? <Text style={styles.error}>{searchError}</Text> : null}

      {!showTrefle && (
        <FilterChips chips={FILTER_CHIPS} value={filter} onChange={setFilter} />
      )}

      <FlatList
        data={showTrefle ? trefleHits : items}
        keyExtractor={(i) =>
          "trefle_id" in i ? `trefle-${i.trefle_id}` : i.id
        }
        contentContainerStyle={styles.list}
        refreshControl={
          !showTrefle ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor={colors.accent}
            />
          ) : undefined
        }
        ListEmptyComponent={
          showTrefle && !searching ? (
            <Text style={styles.empty}>Ничего не найдено в Trefle</Text>
          ) : null
        }
        renderItem={({ item }) => {
          if (showTrefle) {
            const hit = item as TrefleSearchHit;
            return (
              <PlantLibraryCard
                data={trefleHitToCard(hit, importingSlug === hit.slug)}
                onPress={() => handleTreflePress(hit)}
              />
            );
          }

          const plant = item as PlantSpecies;
          return (
            <PlantLibraryCard
              data={speciesToCard(plant)}
              onPress={() => router.push(`/library/${plant.id}`)}
            />
          );
        }}
      />
    </View>
  );
}
