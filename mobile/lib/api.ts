import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const TOKEN_KEY = "grace_token";

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Plant = {
  id: string;
  name: string;
  species: string;
  location: string | null;
  planted_at: string;
  notes: string | null;
};

export type CareLog = {
  id: string;
  plant_id: string;
  type: string;
  notes: string | null;
  created_at: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function register(email: string, password: string, name: string) {
  const data = await request<{ user: User; token: string }>(
    "/api/v1/auth/register",
    { method: "POST", body: JSON.stringify({ email, password, name }) },
    false
  );
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await request<{ user: User; token: string }>(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getPlants() {
  return request<Plant[]>("/api/v1/plants");
}

export async function createPlant(data: {
  name: string;
  species: string;
  location?: string;
  notes?: string;
}) {
  return request<Plant>("/api/v1/plants", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPlant(id: string) {
  return request<Plant>(`/api/v1/plants/${id}`);
}

export async function getCareLogs(plantId: string) {
  return request<CareLog[]>(`/api/v1/plants/${plantId}/care-logs`);
}

export async function addCareLog(
  plantId: string,
  type: string,
  notes?: string
) {
  return request<CareLog>(`/api/v1/plants/${plantId}/care-logs`, {
    method: "POST",
    body: JSON.stringify({ type, notes }),
  });
}

export async function hasToken() {
  return !!(await AsyncStorage.getItem(TOKEN_KEY));
}
