import { Pressable, Text, View, StyleSheet } from "react-native";
import { useThemedStyles } from "@/lib/ThemeContext";
import { radii, spacing, type ThemeColors } from "@/lib/theme";
import { PlantCardData } from "@/lib/plantDisplay";
import { SafePlantImage } from "@/components/SafePlantImage";

type Props = {
  data: PlantCardData;
  onPress: () => void;
  selected?: boolean;
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    cardSelected: { borderColor: colors.borderActive },
    imageWrap: {
      height: 160,
      backgroundColor: colors.cardHover,
      position: "relative",
    },
    imageFill: { width: "100%", height: "100%" },
    badge: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: colors.badgeOverlay,
      borderRadius: radii.pill,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: { color: colors.onAccent, fontSize: 11, fontWeight: "600" },
    body: { padding: spacing.lg, gap: spacing.sm },
    title: { fontSize: 20, fontWeight: "700", color: colors.text },
    scientific: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    tag: {
      backgroundColor: colors.chip,
      borderRadius: radii.pill,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: { color: colors.text, fontSize: 12 },
    facts: { gap: 6, marginTop: spacing.xs },
    factRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    factIcon: { width: 18, fontSize: 13 },
    factLabel: { width: 88, fontSize: 12, color: colors.textSecondary },
    factValue: {
      flex: 1,
      fontSize: 12,
      color: colors.text,
      fontWeight: "500",
    },
  });

export function PlantLibraryCard({ data, onPress, selected }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <SafePlantImage
          uri={data.imageUrl}
          typeKey={data.typeKey}
          style={styles.imageFill}
          emojiSize={48}
        />
        {data.footer ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.footer}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {data.name}
        </Text>
        {data.scientificName ? (
          <Text style={styles.scientific} numberOfLines={1}>
            {data.scientificName}
          </Text>
        ) : null}

        {data.tags.length > 0 ? (
          <View style={styles.tags}>
            {data.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.facts}>
          {data.facts.slice(0, 4).map((fact) => (
            <View key={`${fact.label}-${fact.value}`} style={styles.factRow}>
              <Text style={styles.factIcon}>{fact.icon}</Text>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue} numberOfLines={1}>
                {fact.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}
