import { Platform } from "react-native";
import Constants from "expo-constants";

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Web: same host as the page (fixes WSL when opened via 172.x.x.x)
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:8080`;
  }

  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  const localhost = host === "localhost" ? "10.0.2.2" : host;
  return `http://${localhost}:8080`;
}

export const API_URL = resolveApiUrl();
