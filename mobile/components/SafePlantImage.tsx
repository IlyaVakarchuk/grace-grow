import { createElement, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { colors } from "@/lib/theme";
import { TYPE_EMOJI } from "@/lib/labels";
import { plantImageUrl } from "@/lib/api";

type Props = {
  uri?: string | null;
  typeKey?: string;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  emojiSize?: number;
  alt?: string;
};

export function SafePlantImage({
  uri,
  typeKey = "other",
  style,
  imageStyle,
  emojiSize = 48,
  alt = "Plant photo",
}: Props) {
  const src = useMemo(() => plantImageUrl(uri), [uri]);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed || !src) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={{ fontSize: emojiSize }}>
          {TYPE_EMOJI[typeKey] ?? "🌱"}
        </Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={[styles.wrap, style]}>
        {createElement("img", {
          key: src,
          src,
          alt,
          onError: () => setFailed(true),
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            ...(imageStyle as object),
          },
        })}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <Image
        key={src}
        source={{ uri: src }}
        style={[styles.image, imageStyle]}
        onError={() => setFailed(true)}
        accessibilityLabel={alt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: colors.cardHover,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  placeholder: {
    backgroundColor: colors.cardHover,
    alignItems: "center",
    justifyContent: "center",
  },
});
