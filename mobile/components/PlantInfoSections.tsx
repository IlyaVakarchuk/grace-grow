import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";
import { DetailSection } from "@/lib/plantDisplay";

type Props = { sections: DetailSection[] };

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.md, paddingHorizontal: spacing.lg },
    section: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.md,
    },
    row: {
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rowFirst: { borderTopWidth: 0, paddingTop: 0 },
    label: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
    value: { fontSize: 15, color: colors.text, lineHeight: 21 },
  });

export function PlantInfoSections({ sections }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.wrap}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.rows.map((row, index) => (
            <View
              key={`${section.title}-${row.label}`}
              style={[styles.row, index === 0 && styles.rowFirst]}
            >
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
