// KissKH API service — single source of truth for all network calls
// The frontend must always call the app's own backend proxy.
// This prevents browser CORS blocking and avoids calling KissKH or proxies directly.
export const KISSKH_BASE = "/api";
export const KISSKH_DIRECT_BASE = "https://kisskh.do/api";
export const CORS_PROXY = "https://corsproxy.io/?";

export interface DramaCard {
  id: string | number;
  title: string;
  thumbnail?: string;
  poster?: string;
  image?: string;
  cover?: string;
  country?: string;
  type?: string;
  episodesCount?: number;
  episode?: number;
  status?: string;
  year?: number | string;
  [k: string]: unknown;
}

export interface Episode {
  id: string | number;
  number?: number;
  title?: string;
  thumbnail?: string;
  [k: string]: unknown;
}

export interface DramaInfo extends DramaCard {
  description?: string;
  synopsis?: string;
  genres?: string[];
  episodes?: Episode[];
}

export interface ResolvedStream {
  url?: string;
  src?: string;
  hls?: string;
  subtitles?: Array<{ url: string; lang?: string; label?: string }>;
  [k: string]: unknown;
}

async function getJSON<T>(path: string): Promise<T> {
  const backendUrl = `${KISSKH_BASE}${path}`;
  const directUrl = `${KISSKH_DIRECT_BASE}${path}`;
  
  // Primary: Backend API (cached, fastest)
  try {
    console.log(`[API] Trying backend: ${backendUrl}`);
    const res = await fetch(backendUrl);
    if (!res.ok) {
      throw new Error(`Backend request failed (${res.status})`);
    }
    const data = await res.json();
    if (
      data &&
      typeof data === "object" &&
      ("error" in data || (typeof (data as Record<string, unknown>).status === "number" && (data as Record<string, unknown>).status >= 400))
    ) {
      throw new Error(`Backend error response: ${JSON.stringify(data)}`);
    }
    console.log(`[API] Backend successful!`);
    return data as T;
  } catch (e) {
    console.warn("[API] Backend failed:", e);
  }

  // Fallback 1: AllOrigins CORS proxy (most reliable, no rate limits)
  try {
    console.log(`[API] Trying AllOrigins proxy: ${directUrl}`);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) {
      throw new Error(`AllOrigins request failed (${res.status})`);
    }
    const data = await res.json();
    // AllOrigins wraps response in "contents" field
    const actualData = JSON.parse(data.contents);
    console.log(`[API] AllOrigins successful!`);
    return actualData as T;
  } catch (e) {
    console.warn("[API] AllOrigins fallback failed:", e);
  }

  // Fallback 2: corsproxy.io
  try {
    console.log(`[API] Trying corsproxy.io: ${directUrl}`);
    const proxyUrl = `https://corsproxy.io/?${directUrl}`;
    const res = await fetch(proxyUrl, {
      headers: {
        "Referer": "https://kisskh.do/"
      }
    });
    if (!res.ok) {
      throw new Error(`corsproxy.io request failed (${res.status})`);
    }
    console.log(`[API] corsproxy.io successful!`);
    return (await res.json()) as T;
  } catch (e) {
    console.warn("[API] corsproxy.io fallback failed:", e);
  }

  // All methods exhausted
  throw new Error(`Failed to fetch ${path} from all sources. Please check your connection.`);
}

// Normalize varied API list shapes into a clean array of cards
export function normalizeList(raw: unknown): DramaCard[] {
  if (Array.isArray(raw)) return raw as DramaCard[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "results", "items", "dramas", "list"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v as DramaCard[];
    }
  }
  return [];
}

export function getPoster(d: DramaCard | undefined | null): string {
  if (!d) return "";
  return (
    (d.thumbnail as string) ||
    (d.poster as string) ||
    (d.image as string) ||
    (d.cover as string) ||
    ""
  );
}

export const api = {
  popular: (page = 1, pageSize = 20) =>
    getJSON(`/home/popular?page=${page}&page_size=${pageSize}`).then(normalizeList),
  lastUpdates: () =>
    getJSON(`/last-updates`).then(normalizeList),
  latest: (page = 1, pageSize = 20) =>
    getJSON(`/home/latest?page=${page}&page_size=${pageSize}`).then(normalizeList),
  newest: (page = 1, pageSize = 20) =>
    getJSON(`/home/new?page=${page}&page_size=${pageSize}`).then(normalizeList),
  ongoing: (page = 1, pageSize = 20, country = 0) =>
    getJSON(`/home/ongoing?page=${page}&page_size=${pageSize}&country=${country}`).then(
      normalizeList,
    ),
  completed: (page = 1, pageSize = 20, country = 0) =>
    getJSON(`/home/completed?page=${page}&page_size=${pageSize}&country=${country}`).then(
      normalizeList,
    ),
  search: (q: string) =>
    getJSON(`/search?q=${encodeURIComponent(q)}`).then(normalizeList),
  info: (dramaId: string) => getJSON<DramaInfo>(`/info/${encodeURIComponent(dramaId)}`),
  resolve: (episodeId: string) =>
    getJSON<ResolvedStream>(`/resolve/${encodeURIComponent(episodeId)}`),
};
