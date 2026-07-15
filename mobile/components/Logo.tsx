import { Image, StyleSheet, View } from "react-native";

type Props = {
  width?: number;
  height?: number;
};

export function Logo({ width = 280, height = 140 }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require("../assets/logo.png")}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="GraceGrow Plant Monitoring"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginBottom: 8 },
});
