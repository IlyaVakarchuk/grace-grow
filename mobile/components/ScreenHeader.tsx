import { Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/lib/ThemeContext";
import { spacing, type ThemeColors } from "@/lib/theme";

type Props = { title: string };

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
  });

export function ScreenHeader({ title }: Props) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={styles.title}>{title}</Text>;
}
