import Constants from "expo-constants";

const host = Constants.expoConfig?.hostUri?.split(":")[0];
const localhost = host === "localhost" ? "10.0.2.2" : host;

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${localhost}:8080`;
