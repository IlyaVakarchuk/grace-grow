import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const TOKEN_KEY = "grace_token";

export type User = {
  id: string;
  email: string;
  name: string;
};

export type PlantSpecies = {
  id: string;
  slug: string;
  name: string;
  type: string;
  light: string;
  humidity: string;
  water_days: number;
  fertilize_days: number | null;
  repot_days: number | null;
  description: string | null;
  trefle_id?: number | null;
  image_url?: string | null;
  scientific_name?: string | null;
  source?: string;
};

export type TrefleSearchHit = {
  trefle_id: number;
  slug: string;
  name: string;
  scientific_name: string;
  family: string;
  image_url?: string | null;
  imported: boolean;
  species_id?: string | null;
};

export type Plant = {
  id: string;
  species_id: string | null;
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

export type CalendarTask = {
  id: string;
  plant_id: string;
  plant_name: string;
  type: string;
  next_at: string;
  repeat_days: number | null;
  enabled: boolean;
};

export type Observation = {
  id: string;
  plant_id: string;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
};

export function photoUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

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

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Не удалось подключиться к API (${API_URL}). Запусти: cd api && go run ./cmd/server`
    );
  }

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

export async function getLibrary(type?: string) {
  const q = type ? `?type=${type}` : "";
  return request<PlantSpecies[]>(`/api/v1/library${q}`);
}

export async function getLibraryItem(id: string) {
  return request<PlantSpecies>(`/api/v1/library/${id}`);
}

export async function searchTrefle(query: string, page = 1) {
  return request<{ data: TrefleSearchHit[]; total: number }>(
    `/api/v1/library/search?q=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function importFromTrefle(slug: string) {
  return request<PlantSpecies>("/api/v1/library/import", {
    method: "POST",
    body: JSON.stringify({ slug }),
  });
}

export async function getPlants() {
  return request<Plant[]>("/api/v1/plants");
}

export async function createPlant(data: {
  name: string;
  species?: string;
  species_id?: string;
  location?: string;
  notes?: string;
  planted_at?: string;
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

export async function addCareLog(plantId: string, type: string, notes?: string) {
  return request<CareLog>(`/api/v1/plants/${plantId}/care-logs`, {
    method: "POST",
    body: JSON.stringify({ type, notes }),
  });
}

export async function getCalendar(days = 30) {
  return request<CalendarTask[]>(`/api/v1/calendar?days=${days}`);
}

export async function completeTask(taskId: string) {
  return request<void>(`/api/v1/calendar/${taskId}/complete`, { method: "POST" });
}

export async function getObservations(plantId: string) {
  return request<Observation[]>(`/api/v1/plants/${plantId}/observations`);
}

export async function addObservation(
  plantId: string,
  notes?: string,
  photoBase64?: string
) {
  return request<Observation>(`/api/v1/plants/${plantId}/observations`, {
    method: "POST",
    body: JSON.stringify({ notes, photo_base64: photoBase64 }),
  });
}

export async function hasToken() {
  return !!(await AsyncStorage.getItem(TOKEN_KEY));
}
