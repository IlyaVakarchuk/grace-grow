import { ScrollView, Pressable, Text, StyleSheet, Platform } from "react-native";
import { useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";

type Chip = { key: string; label: string };

type Props = {
  chips: Chip[];
  value: string;
  onChange: (key: string) => void;
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scroll: { flexGrow: 0, flexShrink: 0 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    chip: {
      flexGrow: 0,
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radii.pill,
      backgroundColor: colors.chip,
    },
    chipActive: { backgroundColor: colors.chipActive },
    chipText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 18,
      ...(Platform.OS === "web" ? { whiteSpace: "nowrap" as const } : null),
    },
    chipTextActive: { color: colors.chipActiveText, fontWeight: "600" },
  });

export function FilterChips({ chips, value, onChange }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => {
        const active = value === chip.key;
        return (
          <Pressable
            key={chip.key || "all"}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(chip.key)}
          >
            <Text
              style={[styles.chipText, active && styles.chipTextActive]}
              numberOfLines={1}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
