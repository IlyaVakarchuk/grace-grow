import { Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = { title: string };

export function ScreenHeader({ title }: Props) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
