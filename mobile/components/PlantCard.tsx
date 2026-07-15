import { Pressable, Text, View, StyleSheet, Image } from "react-native";
import { colors, radii, spacing } from "@/lib/theme";
import { TYPE_EMOJI } from "@/lib/labels";

type Props = {
  name: string;
  type: string;
  waterDays?: number;
  light?: string;
  subtitle?: string;
  imageUrl?: string | null;
  badge?: string;
  onPress: () => void;
  selected?: boolean;
};

export function PlantCard({
  name,
  type,
  waterDays,
  light,
  subtitle,
  imageUrl,
  badge,
  onPress,
  selected,
}: Props) {
  return (
    <Pressable
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
    >
      <View style={styles.icon}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.emoji}>{TYPE_EMOJI[type] ?? "🌱"}</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <Text style={styles.sub} numberOfLines={2}>
          {subtitle ??
            `${type}${waterDays ? ` · полив каждые ${waterDays} дн.` : ""}`}
        </Text>
        {light ? (
          <Text style={styles.meta} numberOfLines={1}>☀️ {light}</Text>
        ) : badge ? (
          <Text style={styles.meta} numberOfLines={1}>{badge}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
    gap: spacing.md,
    minHeight: 90,
  },
  cardSelected: { borderColor: colors.borderActive },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.cardHover,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: 44, height: 44 },
  emoji: { fontSize: 22 },
  body: { flex: 1, justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "700", color: colors.text },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
